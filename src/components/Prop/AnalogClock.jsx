import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkIn, checkOut } from "../../Redux/Public/attendanceSlice";
import { requestDesignationSnapshot } from "../../Redux/Public/notificationsSocket";

export default function AnalogClock() {
  const dispatch = useDispatch();
  const [time, setTime] = useState(new Date());
  // Attendance state
  const auth = useSelector((s) => s.auth);
  const companyId = auth?.company?.id;
  const userId = auth?.user?.id;
  const designationId =
    auth?.user?.designationId ||
    auth?.user?.designation?.id ||
    auth?.user?.designationParentId;
  const role = (auth?.user?.role || "").toUpperCase();
  const todayKey = useMemo(() => {
    const d = new Date();
    const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
    return `${companyId || "c"}:${userId || "u"}:${iso}:attendance`;
  }, [companyId, userId]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState("");
  const [checkInAt, setCheckInAt] = useState(null);
  const [checkOutAt, setCheckOutAt] = useState(null);
  const [attendanceId, setAttendanceId] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Restore local status for quick UX when no status endpoint exists
  useEffect(() => {
    try {
      const raw = localStorage.getItem(todayKey);
      if (raw) {
        const obj = JSON.parse(raw);
        setCheckedIn(!!obj.checkedIn);
        setCheckInAt(obj.checkInAt ? new Date(obj.checkInAt) : null);
        setCheckOutAt(obj.checkOutAt ? new Date(obj.checkOutAt) : null);
        if (obj.lastAttendanceId) setAttendanceId(obj.lastAttendanceId);
      }
    } catch {}
  }, [todayKey]);

  const persist = (state) => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(state));
    } catch {}
  };

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  // Calculate angles for each hand
  const secondAngle = seconds * 6 - 90; // 6 degrees per second
  const minuteAngle = minutes * 6 + seconds * 0.1 - 90; // 6 degrees per minute + smooth seconds
  const hourAngle = hours * 30 + minutes * 0.5 - 90; // 30 degrees per hour + smooth minutes

  // Format digital time
  const digitalTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Get day of week
  const dayOfWeek = time
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();

  const tickMarks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const x = 50 + 42 * Math.cos(((angle - 90) * Math.PI) / 180);
    const y = 50 + 42 * Math.sin(((angle - 90) * Math.PI) / 180);

    const isMajorTick = i % 3 === 0;
    const tickHeight = isMajorTick ? "h-6" : "h-4";
    const tickWidth = isMajorTick ? "w-0.5" : "w-px";

    return (
      <div
        key={i}
        className={`absolute ${tickWidth} ${tickHeight} bg-black dark:bg-white transition-colors`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        }}
      />
    );
  });

  return (
    <div className="bg-white dark:bg-black p-4 rounded-2xl border border-orange-500/20 dark:border-orange-500/40 hover:border-orange-500/60 dark:hover:border-orange-500/80 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] dark:hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] transition-all duration-300">
      <div className="w-64 h-64 bg-white dark:bg-black rounded-2xl border border-orange-500/20 dark:border-orange-500/40 p-6 flex flex-col items-center justify-center transition-colors">
        {/* Clock Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-48 h-48">
            {/* Tick Marks */}
            <div className="absolute inset-0">{tickMarks}</div>

            {/* Clock Center Dot */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-black dark:bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 transition-colors" />

            {/* Hour Hand */}
            <div
              className="absolute top-1/2 left-1/2 w-1 bg-black dark:bg-white rounded-full origin-bottom z-20 transition-transform duration-1000 ease-in-out"
              style={{
                height: "60px",
                transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
              }}
            />

            {/* Minute Hand */}
            <div
              className="absolute top-1/2 left-1/2 w-0.5 bg-black dark:bg-white rounded-full origin-bottom z-20 transition-transform duration-1000 ease-in-out"
              style={{
                height: "80px",
                transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
              }}
            />

            {/* Second Hand */}
            <div
              className="absolute top-1/2 left-1/2 w-0.5 bg-black dark:bg-white rounded-full origin-bottom z-20 transition-transform duration-75 ease-out"
              style={{
                height: "85px",
                transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
              }}
            />

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <div className="bg-white dark:bg-black px-3 py-1 rounded-md border border-orange-500/20 dark:border-orange-500/40">
                <div className="text-sm font-normal tracking-wide" style={{ color: 'var(--text-strong)' }}>
                  {dayOfWeek} {digitalTime}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle container moved below the clock */}
        </div>
      </div>
      <div className="mt-4 w-full flex flex-col items-center gap-2">
        <button
          disabled={isSubmitting || !companyId}
          onClick={async () => {
            if (!companyId) return;
            setIsSubmitting(true);
            setLastError("");
            try {
              if (!checkedIn) {
                // Determine if this is the first check-in of the day
                const isFirstCheckIn = !attendanceId || !checkInAt;
                const res = await dispatch(
                  checkIn({
                    companyId,
                    userId,
                    role,
                    attendanceId,
                    isFirstCheckIn,
                  })
                );
                if (res.error) throw new Error(res.error.message);
                const payload = res.payload || {};
                const ts = payload.checkInTime
                  ? new Date(payload.checkInTime)
                  : new Date();
                setCheckedIn(true);
                setCheckInAt(ts);
                setCheckOutAt(null);
                const newAttendanceId =
                  payload.attendanceId || payload.id || attendanceId;
                setAttendanceId(newAttendanceId);
                persist({
                  checkedIn: true,
                  checkInAt: ts,
                  checkOutAt: null,
                  lastAttendanceId: newAttendanceId,
                });
                // Ask gateway to publish live snapshot for this designation
                if (designationId)
                  requestDesignationSnapshot({ designationId, companyId });
              } else {
                // Determine if this is the first check-out of the day
                const isFirstCheckOut = !checkOutAt && !!checkInAt;
                const res = await dispatch(
                  checkOut({
                    companyId,
                    userId,
                    role,
                    attendanceId,
                    isFirstCheckOut,
                  })
                );
                if (res.error) throw new Error(res.error.message);
                const payload = res.payload || {};
                const ts = payload.checkOutTime
                  ? new Date(payload.checkOutTime)
                  : new Date();
                setCheckedIn(false);
                setCheckOutAt(ts);
                const keepAttendanceId =
                  payload.attendanceId || payload.id || attendanceId;
                persist({
                  checkedIn: false,
                  checkInAt,
                  checkOutAt: ts,
                  lastAttendanceId: keepAttendanceId,
                });
                // Ask gateway to publish live snapshot for this designation
                if (designationId)
                  requestDesignationSnapshot({ designationId, companyId });
              }
            } catch (e) {
              setLastError(e?.message || "Request failed");
            } finally {
              setIsSubmitting(false);
            }
          }}
          className={
            `relative w-40 h-10 rounded-full border transition-all duration-300 hover:shadow-[0_0_18px_rgba(249,115,22,0.2)] ` +
            (checkedIn
              ? "bg-green-600/90 border-green-500 hover:border-green-400"
              : "bg-orange-600/90 border-orange-500 hover:border-orange-400")
          }
        >
          <span
            className={`absolute inset-0 flex items-center justify-${
              checkedIn ? "end" : "start"
            } px-1.5 z-10`}
          >
            <span
              className={`w-8 h-8 rounded-full bg-white dark:bg-black border border-orange-500/30 shadow transition-transform duration-300 ${
                isSubmitting ? "scale-95" : "scale-100"
              }`}
            />
          </span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white opacity-80 select-none z-0">
            {checkedIn ? "Checked In" : "Check In"}
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white opacity-80 select-none z-0">
            {checkedIn ? "Check Out" : ""}
          </span>
          {isSubmitting && (
            <span className="absolute inset-0 rounded-full animate-ping bg-white/10" />
          )}
        </button>

        <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        <div className="text-[11px] text-neutral-700 dark:text-neutral-200 mt-3 text-center">
          {checkedIn && checkInAt ? (
            <span>
              In:{" "}
              {checkInAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : checkOutAt ? (
            <span>
              Out:{" "}
              {checkOutAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : (
            <span>Ready</span>
          )}
        </div>
        {lastError && (
          <div className="text-[10px] text-rose-600 dark:text-rose-300">
            {lastError}
          </div>
        )}
      </div>
    </div>
  );
}
