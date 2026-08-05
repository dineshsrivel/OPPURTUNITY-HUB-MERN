import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import opportunityReducer  from './slices/opportunitySlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer           from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    opportunities:opportunityReducer,
    notifications:notificationReducer,
    ui:           uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
