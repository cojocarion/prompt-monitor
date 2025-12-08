/**
 * Redux slice for issues and dismissed emails
 */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import browser from 'webextension-polyfill';
import type { EmailIssue, DismissedEmail, StateResponse } from '@/shared/types';
import { MessageType } from '@/shared/types';

interface IssuesState {
  issues: EmailIssue[];
  recentIssues: EmailIssue[];
  dismissedEmails: DismissedEmail[];
  loading: boolean;
  error: string | null;
}

const initialState: IssuesState = {
  issues: [],
  recentIssues: [],
  dismissedEmails: [],
  loading: false,
  error: null,
};

// Async thunk to fetch state from background
export const fetchState = createAsyncThunk(
  'issues/fetchState',
  async (): Promise<StateResponse> => {
    const response = await browser.runtime.sendMessage({
      type: MessageType.GET_STATE,
    });
    return response as StateResponse;
  }
);

// Async thunk to dismiss an email
export const dismissEmailAsync = createAsyncThunk(
  'issues/dismissEmail',
  async (email: string): Promise<string> => {
    await browser.runtime.sendMessage({
      type: MessageType.DISMISS_EMAIL,
      payload: { email },
    });
    return email;
  }
);

// Async thunk to clear history
export const clearHistoryAsync = createAsyncThunk(
  'issues/clearHistory',
  async (): Promise<void> => {
    await browser.runtime.sendMessage({
      type: MessageType.CLEAR_HISTORY,
    });
  }
);

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    // Update state from background message
    updateFromBackground: (
      state,
      action: PayloadAction<{ issues: EmailIssue[]; dismissedEmails: DismissedEmail[] }>
    ) => {
      state.issues = action.payload.issues;
      state.dismissedEmails = action.payload.dismissedEmails;
    },
    
    // Set recent issues
    setRecentIssues: (state, action: PayloadAction<EmailIssue[]>) => {
      state.recentIssues = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch state
      .addCase(fetchState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchState.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload.issues;
        state.dismissedEmails = action.payload.dismissedEmails;
        state.recentIssues = action.payload.recentIssues;
      })
      .addCase(fetchState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch state';
      })
      
      // Dismiss email
      .addCase(dismissEmailAsync.fulfilled, (state, action) => {
        const email = action.payload.toLowerCase();
        const now = Date.now();
        const expiresAt = now + 24 * 60 * 60 * 1000;
        
        // Add to dismissed list
        state.dismissedEmails = [
          { email, dismissedAt: now, expiresAt },
          ...state.dismissedEmails.filter(d => d.email.toLowerCase() !== email),
        ];
        
        // Remove from recent issues
        state.recentIssues = state.recentIssues.filter(
          issue => issue.email.toLowerCase() !== email
        );
      })
      
      // Clear history
      .addCase(clearHistoryAsync.fulfilled, (state) => {
        state.issues = [];
        state.recentIssues = [];
      });
  },
});

export const { updateFromBackground, setRecentIssues, clearError } = issuesSlice.actions;
export default issuesSlice.reducer;

