/**
 * Header component for the popup
 */
import { Shield } from 'lucide-react';
import { Badge } from './ui';
import { useAppSelector } from '@/store';

export function Header() {
  const { recentIssues, dismissedEmails } = useAppSelector((state) => state.issues);
  
  // Count active (non-dismissed) recent issues
  const dismissedSet = new Set(dismissedEmails.map((d) => d.email.toLowerCase()));
  const activeCount = recentIssues.filter(
    (issue) => !dismissedSet.has(issue.email.toLowerCase())
  ).length;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Prompt Monitor</h1>
            <p className="text-blue-100 text-xs">Protecting your privacy</p>
          </div>
        </div>
        
        {activeCount > 0 && (
          <Badge variant="danger" className="animate-pulse">
            {activeCount} new
          </Badge>
        )}
      </div>
    </div>
  );
}

