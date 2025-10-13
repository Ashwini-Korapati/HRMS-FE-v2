// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { httpPostService } from "../../config/httphandler";
// import { selectAuthCompany } from "./authSlice";

// // Async thunk to onboard a new employee
// export const onboardEmployee = createAsyncThunk(
//   "onboardingUser/onboardEmployee",
//   async (userData, { getState, rejectWithValue }) => {
//     const company = selectAuthCompany(getState());
//     if (!company?.id) {
//       return rejectWithValue("Company ID not found in auth state.");
//     }

//     try {
//       const response = await httpPostService(
//         `companies/${company.id}/employees`,
//         userData
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const onboardingUserSlice = createSlice({
//   name: "onboardingUser",
//   initialState: {
//     onboardedEmployee: null,
//     status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
//     error: null,
//   },
//   reducers: {
//     clearOnboardingState: (state) => {
//       state.onboardedEmployee = null;
//       state.status = "idle";
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(onboardEmployee.pending, (state) => {
//         state.status = "loading";
//         state.error = null;
//       })
//       .addCase(onboardEmployee.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.onboardedEmployee = action.payload;
//       })
//       .addCase(onboardEmployee.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearOnboardingState } = onboardingUserSlice.actions;

// export const selectOnboardedEmployee = (state) =>
//   state.onboardingUser.onboardedEmployee;
// export const selectOnboardingStatus = (state) => state.onboardingUser.status;
// export const selectOnboardingError = (state) => state.onboardingUser.error;

// export default onboardingUserSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { httpPostService, httpGetService } from "../../config/httphandler";
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

// Async thunk to fetch employees
export const fetchEmployees = createAsyncThunk(
  "onboardingUser/fetchEmployees",
  async (_, { getState, rejectWithValue }) => {
    const company = selectAuthCompany(getState());
    if (!company?.id) {
      return rejectWithValue("Company ID not found in auth state.");
    }

    try {
      const response = await httpGetService(
        `companies/${company.id}/employees`
      );
      // Extract the items array from the nested response
      return response.data?.data?.items || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const onboardingUserSlice = createSlice({
  name: "onboardingUser",
  initialState: {
    onboardedEmployee: null,
    employees: [], // Array to store fetched employees
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    fetchStatus: "idle", // Separate status for fetch operations
    error: null,
  },
  reducers: {
    clearOnboardingState: (state) => {
      state.onboardedEmployee = null;
      state.status = "idle";
      state.error = null;
    },
    clearEmployees: (state) => {
      state.employees = [];
      state.fetchStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Onboard Employee cases
      .addCase(onboardEmployee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(onboardEmployee.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.onboardedEmployee = action.payload;
        // Add the new employee to the employees list if it has the expected structure
        if (action.payload && typeof action.payload === 'object') {
          state.employees.unshift(action.payload); // Add to beginning of list
        }
      })
      .addCase(onboardEmployee.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch Employees cases
      .addCase(fetchEmployees.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.employees = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
        state.employees = []; // Clear employees on error
      });
  },
});

export const { clearOnboardingState, clearEmployees } = onboardingUserSlice.actions;

export const selectOnboardedEmployee = (state) =>
  state.onboardingUser.onboardedEmployee;
export const selectOnboardingStatus = (state) => state.onboardingUser.status;
export const selectOnboardingError = (state) => state.onboardingUser.error;

// New selectors for employees
export const selectEmployees = (state) => state.onboardingUser.employees;
export const selectEmployeesStatus = (state) => state.onboardingUser.fetchStatus;
export const selectEmployeesError = (state) => state.onboardingUser.error;

export default onboardingUserSlice.reducer;