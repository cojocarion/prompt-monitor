/**
 * Tabs component
 */
import { createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ children, activeTab, onTabChange, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeTab, onTabChange }}>
      <div className={cn('flex flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex border-b border-gray-200 bg-gray-50 rounded-t-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { activeTab, onTabChange } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => onTabChange(value)}
      className={cn(
        'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200',
        'border-b-2 -mb-px',
        'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
        {
          'border-blue-600 text-blue-600 bg-white': isActive,
          'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': !isActive,
        },
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div className={cn('flex-1 overflow-auto', className)}>
      {children}
    </div>
  );
}

