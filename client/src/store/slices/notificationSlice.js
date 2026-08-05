import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications');
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id) => {
  await api.put(`/notifications/${id}/read`);
  return id;
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.put('/notifications/read-all');
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, { payload }) => {
      state.list.unshift(payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.list        = payload.notifications;
        state.unreadCount = payload.unreadCount;
        state.loading     = false;
      })
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(markNotificationRead.fulfilled, (state, { payload }) => {
        const n = state.list.find(n => n._id === payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
