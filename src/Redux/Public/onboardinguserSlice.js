import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { httpPostService } from "../../config/httphandler";
import { selectAuthCompany } from "./authSlice";

// Async thunk to onboard a new employee
export const onboardEmployee = createAsyncThunk(
  "onboardingUser/onboardEmployee",
  async (userData, { getState, rejectWithValue }) => {
    const company = selectAuthCompany(getState());
    if (!company?.id) {
      return rejectWithValue("Company ID not found in auth state.");
    }

    try {
      const response = await httpPostService(
        `companies/${company.id}/employees`,
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const onboardingUserSlice = createSlice({
  name: "onboardingUser",
  initialState: {
    onboardedEmployee: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearOnboardingState: (state) => {
      state.onboardedEmployee = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(onboardEmployee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(onboardEmployee.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.onboardedEmployee = action.payload;
      })
      .addCase(onboardEmployee.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearOnboardingState } = onboardingUserSlice.actions;

export const selectOnboardedEmployee = (state) =>
  state.onboardingUser.onboardedEmployee;
export const selectOnboardingStatus = (state) => state.onboardingUser.status;
export const selectOnboardingError = (state) => state.onboardingUser.error;

export default onboardingUserSlice.reducer;
