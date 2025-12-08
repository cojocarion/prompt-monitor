/**
 * Redux store configuration
 */
import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import issuesReducer from "./issuesSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    issues: issuesReducer,
    ui: uiReducer,
  },
  devTools: import.meta.env.DEV,
});

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export actions
export {
  fetchState,
  dismissEmailAsync,
  clearHistoryAsync,
  updateFromBackground,
  setRecentIssues,
} from "./issuesSlice";

export { setActiveTab, toggleModal, openModal, closeModal } from "./uiSlice";
