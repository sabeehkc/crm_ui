import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiManagerState {
  selectedWebsiteId: string | null;
}

const initialState: UiManagerState = {
  selectedWebsiteId: null,
};

export const uiManagerSlice = createSlice({
  name: 'uiManager',
  initialState,
  reducers: {
    setSelectedWebsiteId: (state, action: PayloadAction<string | null>) => {
      state.selectedWebsiteId = action.payload;
    },
  },
});

export const { setSelectedWebsiteId } = uiManagerSlice.actions;

export default uiManagerSlice.reducer;
