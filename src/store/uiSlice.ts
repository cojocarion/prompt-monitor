/**
 * Redux slice for UI state
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { TABS, type TabId } from '@/shared/constants';

interface UIState {
  activeTab: TabId;
  isModalOpen: boolean;
}

const initialState: UIState = {
  activeTab: TABS.ISSUES_FOUND,
  isModalOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<TabId>) => {
      state.activeTab = action.payload;
    },
    
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
    
    openModal: (state) => {
      state.isModalOpen = true;
    },
    
    closeModal: (state) => {
      state.isModalOpen = false;
    },
  },
});

export const { setActiveTab, toggleModal, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;

