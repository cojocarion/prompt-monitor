/**
 * History tab component
 */
import { History, Trash2, Inbox } from 'lucide-react';
import { EmailCard } from './EmailCard';
import { Button } from './ui';
import { useAppSelector, useAppDispatch, dismissEmailAsync, clearHistoryAsync } from '@/store';

export function HistoryTab() {
  const dispatch = useAppDispatch();
  const { issues, dismissedEmails } = useAppSelector((state) => state.issues);
  
  const handleDismiss = (email: string) => {
    dispatch(dismissEmailAsync(email));
  };
  
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      dispatch(clearHistoryAsync());
    }
  };
  
  // Create a map of dismissed emails for quick lookup
  const dismissedMap = new Map(
    dismissedEmails.map((d) => [d.email.toLowerCase(), d])
  );

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No History Yet
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Detected email addresses will appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-600">
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">
            {issues.length} detected email{issues.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
      
      {/* Email list */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {issues.map((issue) => {
          const dismissedInfo = dismissedMap.get(issue.email.toLowerCase());
          return (
            <EmailCard
              key={issue.id}
              issue={issue}
              dismissedInfo={dismissedInfo}
              onDismiss={handleDismiss}
              showDismiss={!dismissedInfo}
            />
          );
        })}
      </div>
    </div>
  );
}

