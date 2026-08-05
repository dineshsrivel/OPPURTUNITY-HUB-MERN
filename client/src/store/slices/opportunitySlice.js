import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOpportunities = createAsyncThunk('opportunities/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/opportunities', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOpportunityById = createAsyncThunk('opportunities/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/opportunities/${id}`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const opportunitySlice = createSlice({
  name: 'opportunities',
  initialState: {
    list:        [],
    total:       0,
    pages:       1,
    currentPage: 1,
    selected:    null,
    loading:     false,
    error:       null,
    filters: { type: '', category: '', locationType: '', search: '' },
  },
  reducers: {
    setFilters: (state, { payload }) => { state.filters = { ...state.filters, ...payload }; },
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpportunities.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOpportunities.fulfilled, (state, { payload }) => {
        state.loading     = false;
        state.list        = payload.opportunities;
        state.total       = payload.total;
        state.pages       = payload.pages;
        state.currentPage = payload.currentPage;
      })
      .addCase(fetchOpportunities.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchOpportunityById.pending,   (state) => { state.loading = true; })
      .addCase(fetchOpportunityById.fulfilled, (state, { payload }) => { state.loading = false; state.selected = payload; })
      .addCase(fetchOpportunityById.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export const { setFilters, clearSelected } = opportunitySlice.actions;
export default opportunitySlice.reducer;
