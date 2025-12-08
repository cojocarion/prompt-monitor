/**
 * Main App component for the popup
 */
import {
  Header,
  IssuesTab,
  HistoryTab,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./components";
import { useAppSelector, useAppDispatch, setActiveTab } from "./store";
import { useExtensionSync, useExtensionVersion } from "./hooks";
import { TABS } from "./shared/constants";

function App() {
  const dispatch = useAppDispatch();
  const { activeTab } = useAppSelector((state) => state.ui);
  const { loading } = useAppSelector((state) => state.issues);
  const version = useExtensionVersion();

  // Sync with extension background
  useExtensionSync();

  const handleTabChange = (tab: string) => {
    dispatch(
      setActiveTab(tab as typeof TABS.ISSUES_FOUND | typeof TABS.HISTORY)
    );
  };

  return (
    <div className="w-[400px] h-[500px] flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden">
      <Header />

      <Tabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList>
          <TabsTrigger value={TABS.ISSUES_FOUND}>🛡️ Issues Found</TabsTrigger>
          <TabsTrigger value={TABS.HISTORY}>📋 History</TabsTrigger>
        </TabsList>

        <TabsContent value={TABS.ISSUES_FOUND} className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <IssuesTab />
          )}
        </TabsContent>

        <TabsContent value={TABS.HISTORY} className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <HistoryTab />
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
        <p className="text-xs text-gray-400">
          Prompt Monitor v{version} • Protecting your data
        </p>
      </div>
    </div>
  );
}

export default App;
