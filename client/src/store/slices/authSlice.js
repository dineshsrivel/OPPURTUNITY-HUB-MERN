import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Load persisted auth from localStorage ─────────────────────────────────────
const loadPersistedAuth = () => {
  try {
    const token = localStorage.getItem('oh2_token');
    const user  = localStorage.getItem('oh2_user');
    if (token && user) return { token, user: JSON.parse(user) };
  } catch (_) {}
  return { token: null, user: null };
};
const { token: savedToken, user: savedUser } = loadPersistedAuth();

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

// ── Helper to persist auth ────────────────────────────────────────────────────
const persistAuth = (token, user) => {
  localStorage.setItem('oh2_token', token);
  localStorage.setItem('oh2_user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('oh2_token');
  localStorage.removeItem('oh2_user');
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            savedUser,
    token:           savedToken,
    isAuthenticated: !!savedToken,
    loading:         false,
    error:           null,
  },
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null; state.isAuthenticated = false;
      clearAuth();
      toast.success('Logged out successfully');
    },
    clearError: (state) => { state.error = null; },
    setUser:    (state, { payload }) => {
      state.user = payload;
      localStorage.setItem('oh2_user', JSON.stringify(payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled,(state, { payload }) => {
        state.loading = false; state.user = payload.user;
        state.token = payload.token; state.isAuthenticated = true;
        persistAuth(payload.token, payload.user);
        toast.success(`Welcome back, ${payload.user.name}! 👋`);
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload;
        toast.error(payload);
      })
      // Register
      .addCase(registerUser.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled,(state, { payload }) => {
        state.loading = false; state.user = payload.user;
        state.token = payload.token; state.isAuthenticated = true;
        persistAuth(payload.token, payload.user);
        toast.success('Account created! Please verify your email. 📧');
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload;
        toast.error(payload);
      })
      // getMe
      .addCase(getMe.fulfilled, (state, { payload }) => {
        state.user = payload;
        localStorage.setItem('oh2_user', JSON.stringify(payload));
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null; state.token = null; state.isAuthenticated = false;
        clearAuth();
      })
      // Update profile
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.user = { ...state.user, ...payload };
        localStorage.setItem('oh2_user', JSON.stringify(state.user));
        toast.success('Profile updated successfully!');
      })
      .addCase(updateProfile.rejected, (state, { payload }) => { toast.error(payload); });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
