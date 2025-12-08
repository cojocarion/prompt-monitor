/**
 * Email card component for displaying detected emails
 */
import { Mail, Clock, ExternalLink, X } from 'lucide-react';
import { Button, Badge } from './ui';
import { formatRelativeTime, formatTimeRemaining, truncate } from '@/lib/utils';
import type { EmailIssue, DismissedEmail } from '@/shared/types';

interface EmailCardProps {
  issue: EmailIssue;
  dismissedInfo?: DismissedEmail;
  onDismiss?: (email: string) => void;
  showDismiss?: boolean;
}

export function EmailCard({ issue, dismissedInfo, onDismiss, showDismiss = true }: EmailCardProps) {
  const isDismissed = !!dismissedInfo;
  
  return (
    <div className={`
      relative p-4 rounded-lg border transition-all duration-200
      ${isDismissed 
        ? 'bg-gray-50 border-gray-200 opacity-75' 
        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
      }
    `}>
      {/* Email header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${isDismissed ? 'bg-gray-200' : 'bg-red-100'}
          `}>
            <Mail className={`w-5 h-5 ${isDismissed ? 'text-gray-500' : 'text-red-600'}`} />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`
                font-mono text-sm font-medium truncate
                ${isDismissed ? 'text-gray-500' : 'text-gray-900'}
              `}>
                {issue.email}
              </span>
              
              {isDismissed && dismissedInfo && (
                <Badge variant="warning">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeRemaining(dismissedInfo.expiresAt)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(issue.detectedAt)}</span>
            </div>
          </div>
        </div>
        
        {/* Dismiss button */}
        {showDismiss && !isDismissed && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(issue.email)}
            className="flex-shrink-0"
            title="Dismiss for 24 hours"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Context preview */}
      {issue.promptPreview && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
          "{truncate(issue.promptPreview, 80)}"
        </div>
      )}
      
      {/* URL */}
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
        <ExternalLink className="w-3 h-3" />
        <span className="truncate">{truncate(issue.url, 40)}</span>
      </div>
    </div>
  );
}

