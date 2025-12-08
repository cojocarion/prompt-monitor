/**
 * Issues Found tab component
 */
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { EmailCard } from './EmailCard';
import { useAppSelector, useAppDispatch, dismissEmailAsync } from '@/store';

export function IssuesTab() {
  const dispatch = useAppDispatch();
  const { recentIssues, dismissedEmails } = useAppSelector((state) => state.issues);
  
  const handleDismiss = (email: string) => {
    dispatch(dismissEmailAsync(email));
  };
  
  // Create a map of dismissed emails for quick lookup
  const dismissedMap = new Map(
    dismissedEmails.map((d) => [d.email.toLowerCase(), d])
  );
  
  // Filter out already dismissed issues from recent
  const activeIssues = recentIssues.filter(
    (issue) => !dismissedMap.has(issue.email.toLowerCase())
  );

  if (activeIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          All Clear!
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          No email addresses were detected in your recent prompts. Your data is protected.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-800">
            {activeIssues.length} Email{activeIssues.length > 1 ? 's' : ''} Detected
          </h4>
          <p className="text-sm text-amber-700 mt-1">
            These email addresses were found and anonymized before being sent to ChatGPT.
          </p>
        </div>
      </div>
      
      {/* Email list */}
      <div className="space-y-3">
        {activeIssues.map((issue) => (
          <EmailCard
            key={issue.id}
            issue={issue}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
}

