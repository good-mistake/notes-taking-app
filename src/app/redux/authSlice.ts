import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "./store";

interface AuthState {
  token: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
}
const initialState: AuthState = {
  token: null,
  userId: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  { token: string; userId: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async ({ email, password }, thunkAPI) => {
  try {
    const { data } = await axios.post("/api/login", { email, password });
    return { token: data.token, userId: data.userId };
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err) && err.response?.data?.error
        ? String(err.response?.data?.error)
        : err instanceof Error
        ? err.message
        : "Login failed";
    return thunkAPI.rejectWithValue(message);
  }
});
export const registerUser = createAsyncThunk<
  { userId: string; token?: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/registerUser", async ({ email, password }, thunkAPI) => {
  try {
    const { data } = await axios.post("/api/signup", { email, password });
    return data;
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err) && err.response?.data?.error
        ? String(err.response?.data?.error)
        : err instanceof Error
        ? err.message
        : "Signup failed";
    return thunkAPI.rejectWithValue(message);
  }
});
export const forgotPassword = createAsyncThunk<
  { message?: string },
  string,
  { rejectValue: string }
>("auth/forgotPassword", async (email, thunkAPI) => {
  try {
    const { data } = await axios.post("/api/forgot-password", { email });
    return data;
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err) && err.response?.data?.error
        ? String(err.response?.data?.error)
        : err instanceof Error
        ? err.message
        : "Failed to send reset";
    return thunkAPI.rejectWithValue(message);
  }
});
export const resetPassword = createAsyncThunk<
  { message?: string; error?: string },
  { token: string; newPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, newPassword }, thunkAPI) => {
  try {
    const { data } = await axios.post("/api/reset-password", {
      token,
      newPassword,
    });
    return data;
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err) && err.response?.data?.error
        ? String(err.response?.data?.error)
        : err instanceof Error
        ? err.message
        : "Failed to reset";
    return thunkAPI.rejectWithValue(message);
  }
});

export const changePassword = createAsyncThunk<
  { message: string },
  { oldPassword: string; newPassword: string },
  { rejectValue: string; state: RootState }
>("auth/changePassword", async ({ oldPassword, newPassword }, thunkAPI) => {
  const state = thunkAPI.getState();
  const tokenFromState = state.auth.token;
  const token =
    tokenFromState ??
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  if (!oldPassword || !newPassword) {
    return thunkAPI.rejectWithValue("Old and new passwords are required");
  }
  if (newPassword.length < 8) {
    return thunkAPI.rejectWithValue("Password must be at least 8 characters");
  }

  try {
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      return thunkAPI.rejectWithValue(
        data.error || "Failed to change password"
      );
    }
    return { message: data.message || "Password changed successfully" };
  } catch {
    return thunkAPI.rejectWithValue("Network error");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.userId = null;
      localStorage.removeItem("token");
    },
    setAuth(state, action: PayloadAction<{ token: string; userId: string }>) {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      localStorage.setItem("token", action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      });
  },
});

export const { logout, setAuth } = authSlice.actions;

export default authSlice.reducer;
