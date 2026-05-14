import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import UploadView from './views/UploadView';
import LibraryView from './views/LibraryView';
import JobsView from './views/JobsView';
import CriteriaView from './views/CriteriaView';
import ScreeningView from './views/ScreeningView';
import ReportView from './views/ReportView';
import SettingsView from './views/SettingsView';
import useStore from './store/useStore';
import './index.css';

const VIEWS = {
  dashboard: Dashboard,
  upload: UploadView,
  library: LibraryView,
  criteria: CriteriaView,
  jobs: JobsView,
  screening: ScreeningView,
  report: ReportView,
  settings: SettingsView,
};

const SIDEBAR_W = 240;

export default function App() {
  const { activeView } = useStore();
  const View = VIEWS[activeView] || Dashboard;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-primary)' }}>
      {/* Fixed sidebar */}
      <div style={{ position:'fixed', top:0, left:0, bottom:0, width:SIDEBAR_W, background:'var(--bg-card)', borderRight:'1px solid var(--border)', zIndex:100, overflowY:'auto' }}>
        <Sidebar/>
      </div>

      {/* Main content */}
      <main style={{ flex:1, marginLeft:SIDEBAR_W, padding:'36px 44px', minHeight:'100vh', maxWidth:`calc(100vw - ${SIDEBAR_W}px)` }}>
        <div style={{ maxWidth:1160 }}>
          <View/>
        </div>
      </main>
    </div>
  );
}
