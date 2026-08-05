import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen:    true,
    sidebarMobile:  false,
    theme:          'light',
  },
  reducers: {
    toggleSidebar:       (state) => { state.sidebarOpen   = !state.sidebarOpen; },
    toggleSidebarMobile: (state) => { state.sidebarMobile = !state.sidebarMobile; },
    setSidebarMobile:    (state, { payload }) => { state.sidebarMobile = payload; },
    toggleTheme:         (state) => { state.theme = state.theme === 'light' ? 'dark' : 'light'; },
  },
});

export const { toggleSidebar, toggleSidebarMobile, setSidebarMobile, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
