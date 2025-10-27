import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { httpGetService, httpPatchService } from "../../config/httphandler";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  requestDesignationSnapshot,
} from "./notificationsSocket";
import { applyLeaveEvent } from "./UserleaveSlice";
import {
  upsertItems as upsertDesignationItems,
  setConnected as setDesignationConnected,
} from "./designationMonitoringSlice";

// Notification event union (kept as JSDoc for JS projects)
/**
 * @typedef {Object} NotificationEvent
 * @property {string} type
 * @property {string} [companyId]
 * @property {string} [leaveId]
 * @property {string} [userId]
 * @property {string} [designationParentId]
 * @property {string} [avatar]
 * @property {string} [by]
 * @property {string} [reason]
 * @property {string} [at]
 */

const initialState = {
  connecting: false,
  connected: false,
  lastError: null,
  items: [],
  unread: 0,
};

export const startNotifications = createAsyncThunk(
  "notifications/start",
  async ({ companyId, userId, designationId } = {}, { dispatch, getState }) => {
    // mark connecting state for UI
    dispatch(connectingStarted());
    const state = getState();
    const token = state?.auth?.accessToken || undefined;
    const s = connectSocket({ token, companyId, userId, designationId });

    // Normalizer to keep a consistent shape for UI regardless of backend payload
    const normalizeNotification = (evt) => {
      try {
        const raw = evt?.data || evt || {};
        const meta = raw.metadata || {};
        const nowIso = new Date().toISOString();
        const stateNow = getState();
        const myCompanyId = stateNow?.auth?.company?.id || companyId;
        const myUserId = stateNow?.auth?.user?.id || userId;
        const myDesigId =
          stateNow?.auth?.user?.designationId ||
          stateNow?.auth?.user?.designation?.id ||
          designationId || null;

        // Prefer server-provided ids
        const nCompanyId = raw.companyId || meta.companyId || myCompanyId || undefined;
        const nUserId = raw.userId || meta.userId || undefined;
        const nDesigId = raw.designationId || meta.designationId || undefined;
        const nParentDesigId = raw.parentDesignationId || meta.designationParentId || undefined;

        // Channel tags to help client-side filtering (company/designation)
        const channels = Array.isArray(raw.channels) ? [...raw.channels] : [];
        if (nCompanyId) channels.push(`company:${nCompanyId}`);
        if (nDesigId) channels.push(`designation:${nDesigId}`);
        if (nParentDesigId) channels.push(`designation:${nParentDesigId}`);
        // For direct-to-user events that lack designation metadata, map them to the user's designation
        if (!nDesigId && !nParentDesigId && nUserId && myUserId && nUserId === myUserId && myDesigId) {
          channels.push(`designation:${myDesigId}`);
        }

        // Build a stable-ish id when server doesn't provide one
        const when = raw.at || raw.createdAt || raw.timestamp || nowIso;
        const minuteKey = new Date(when).toISOString().slice(0, 16);
        const id =
          raw.id ||
          raw.notificationId ||
          evt?.id ||
          `${raw.type || 'INFO'}:${nCompanyId || '-'}:${nDesigId || nParentDesigId || '-'}:${nUserId || '-'}:${minuteKey}`;

        return {
          id,
          type: raw.type || 'INFO',
          title: raw.title || evt?.title || 'Notification',
          message: raw.message || evt?.message || raw.reason || '',
          createdAt: when,
          isRead: !!raw.isRead,
          companyId: nCompanyId,
          userId: nUserId,
          designationId: nDesigId,
          parentDesignationId: nParentDesigId,
          metadata: meta,
          channels,
        };
      } catch {
        return evt;
      }
    };

    s.on("connect", () => {
      dispatch(connected());
      if (designationId) {
        // Reflect live status immediately and request a fresh snapshot
        dispatch(setDesignationConnected({ designationId, connected: true }));
        try { requestDesignationSnapshot({ designationId, companyId }); } catch {}
      }
    });

    s.on("disconnect", () => {
      dispatch(disconnected());
      if (designationId) dispatch(setDesignationConnected({ designationId, connected: false }));
    });

    s.on("connect_error", (err) => {
      dispatch(connectionFailed(err?.message || "connect_error"));
    });

    const onNotification = (evt) => {
      // Persist immediately for UI without reload
      const normalized = normalizeNotification(evt);
      dispatch(eventReceived(normalized));
      try {
        const t = evt?.type;
        // Unify payload extraction for both raw and wrapped messages
        const payload = evt?.data || evt || {};
        const targetDesignationId =
          payload.designationId || payload.rootDesignationId;

        // Live attendance snapshot integration for designation dashboards
        if (t === "attendance.monitoring.snapshot") {
          const items = Array.isArray(payload.items) ? payload.items : null;
          const tree = payload.tree;
          const suggestedLayout = payload.suggestedLayout;
          const timestamp = payload.timestamp || evt?.timestamp;
          if (targetDesignationId && Array.isArray(items)) {
            dispatch(
              setDesignationConnected({
                designationId: targetDesignationId,
                connected: true,
              })
            );
            dispatch(
              upsertDesignationItems({
                designationId: targetDesignationId,
                items,
                tree,
                suggestedLayout,
                timestamp,
              })
            );
          }
        }

        // Incremental updates (check-in/out or small row patches)
        if (t === "attendance.monitoring.update") {
          const items = Array.isArray(payload.items) ? payload.items : [];
          if (targetDesignationId && items.length) {
            dispatch(
              setDesignationConnected({
                designationId: targetDesignationId,
                connected: true,
              })
            );
            dispatch(
              upsertDesignationItems({
                designationId: targetDesignationId,
                items,
                timestamp: payload.timestamp || evt?.timestamp,
              })
            );
          }
        }

        // Optional: also reflect basic check-in/out into the live table if gateway only emits these
        if (t === "attendance.check_in" || t === "attendance.check_out") {
          const userId = payload.userId || evt.userId;
          const designationId = targetDesignationId;
          if (userId && designationId) {
            const patch =
              t === "attendance.check_in"
                ? {
                    userId,
                    checkInTime: payload.timestamp || new Date().toISOString(),
                    status: "PRESENT",
                  }
                : {
                    userId,
                    checkOutTime: payload.timestamp || new Date().toISOString(),
                    totalHours: payload.totalHours,
                    overtimeHours: payload.overtimeHours,
                  };
            dispatch(
              setDesignationConnected({ designationId, connected: true })
            );
            dispatch(
              upsertDesignationItems({
                designationId,
                items: [patch],
                timestamp: payload.timestamp || evt?.timestamp,
              })
            );
          }
        }

        if (
          t &&
          ["leave.created", "leave.approved", "leave.rejected"].includes(t) &&
          evt.leaveId
        ) {
          const status =
            t === "leave.created"
              ? "PENDING"
              : t === "leave.approved"
              ? "APPROVED"
              : "REJECTED";
          dispatch(
            applyLeaveEvent({
              leaveId: evt.leaveId,
              status,
              at: evt.at || evt.timestamp,
              patch: { userId: evt.userId },
            })
          );
        }
      } catch {}
    };

    // Support multiple event names that backend may use
    s.on("notification", onNotification);
    s.on("app.notification", onNotification);
    s.on("notify", onNotification);

    // Also fetch current unread count and feed snapshot from REST if available
    if (companyId && userId) {
      dispatch(fetchUnreadCount({ companyId, userId }));
      dispatch(fetchFeed({ companyId, userId }));
    }
  }
);

export const stopNotifications = createAsyncThunk(
  "notifications/stop",
  async () => {
    const s = getSocket();
    if (s) {
      try {
        s.removeAllListeners("notification");
        s.removeAllListeners("app.notification");
        s.removeAllListeners("notify");
        s.removeAllListeners("connect");
        s.removeAllListeners("disconnect");
        s.removeAllListeners("connect_error");
      } catch {}
    }
    disconnectSocket();
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    connectingStarted(state) {
      state.connecting = true;
      state.connected = false;
      state.lastError = null;
    },
    connected(state) {
      state.connecting = false;
      state.connected = true;
      state.lastError = null;
    },
    connectionFailed(state, action) {
      state.connecting = false;
      state.connected = false;
      state.lastError = action.payload;
    },
    disconnected(state) {
      state.connecting = false;
      state.connected = false;
    },
    eventReceived(state, action) {
      const evt = action.payload || {};
      // Avoid duplicates by id if present
      if (evt.id) {
        const idx = state.items.findIndex((i) => i.id === evt.id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...evt };
        } else {
          state.items.unshift(evt);
          if (!evt.isRead) state.unread = (state.unread || 0) + 1;
        }
      } else {
        state.items.unshift(evt);
        if (!evt.isRead) state.unread = (state.unread || 0) + 1;
      }
      if (state.items.length > 200) state.items.pop();
    },
    clearAll(state) {
      state.items = [];
      state.lastError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unread = action.payload ?? 0;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          // merge without duplicates by id
          const existing = new Set(state.items.map((i) => i.id));
          const fresh = action.payload.filter((i) => !existing.has(i.id));
          state.items = [...fresh, ...state.items].slice(0, 200);
        }
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        // use meta.arg to find the notification ID
        const { notificationId } = action.meta?.arg || {};
        if (!notificationId) return;
        const idx = state.items.findIndex((i) => i.id === notificationId);
        if (idx !== -1 && state.items[idx].isRead !== true) {
          state.items[idx] = {
            ...state.items[idx],
            isRead: true,
            readAt: state.items[idx].readAt || new Date().toISOString(),
          };
          if (state.unread > 0) state.unread -= 1;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state, _action) => {
        state.items = state.items.map((it) => {
          if (it && it.isRead !== true) {
            return {
              ...it,
              isRead: true,
              readAt: it.readAt || new Date().toISOString(),
            };
          }
          return it;
        });
        state.unread = 0;
      });
  },
});

export const {
  connectingStarted,
  connected,
  connectionFailed,
  disconnected,
  eventReceived,
  clearAll,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

// REST helpers using existing base URL config
export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnread",
  async ({ companyId, userId }, { getState }) => {
    const role = getState()?.auth?.user?.role;
    const isAdmin = role === "ADMIN";
    const path = isAdmin
      ? `${companyId}/notifications/unread-count`
      : `${companyId}/auth/${userId}/profile/notifications/unread-count`;
    const res = await httpGetService(path);
    if (res.status >= 200 && res.status < 300)
      return res.data?.data?.count ?? 0;
    return 0;
  }
);

export const fetchFeed = createAsyncThunk(
  "notifications/fetchFeed",
  async ({ companyId, userId }, { getState }) => {
    const role = getState()?.auth?.user?.role;
    const isAdmin = role === "ADMIN";
    const path = isAdmin
      ? `${companyId}/notifications`
      : `${companyId}/auth/${userId}/profile/notifications/feed`;
    const res = await httpGetService(path);
    if (res.status >= 200 && res.status < 300)
      return res.data?.data?.items ?? [];
    return [];
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async ({ companyId, userId, notificationId }, { getState }) => {
    const role = getState()?.auth?.user?.role;
    const isAdmin = role === "ADMIN";
    const path = isAdmin
      ? `${companyId}/notifications/${notificationId}/read`
      : `${companyId}/auth/${userId}/profile/notifications/${notificationId}/read`;
    const res = await httpPatchService(path, {});
    return res.status >= 200 && res.status < 300;
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async ({ companyId, userId }, { getState }) => {
    const role = getState()?.auth?.user?.role;
    const isAdmin = role === "ADMIN";
    const path = isAdmin
      ? `${companyId}/notifications/read-all`
      : `${companyId}/auth/${userId}/profile/notifications/read-all`;
    const res = await httpPatchService(path, {});
    return res.status >= 200 && res.status < 300;
  }
);
