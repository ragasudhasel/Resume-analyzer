import React from 'react';
import useStore from '../store/useStore';
import { Trash2, Download, RefreshCw, Shield, Database } from 'lucide-react';

export default function SettingsView() {
  const { resumes, clearResumes, jobTitles } = useStore();

  const exportData = () => {
    const data = { resumes, jobTitles, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `hireiq-export-${Date.now()}.json`; a.click();
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage data, export, and application preferences</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Data */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Database size={18} color="var(--accent)" /> Data Management</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>All data is stored locally in your browser.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={exportData}><Download size={16} /> Export All Data</button>
            <button className="btn btn-danger" onClick={() => { if (window.confirm('Delete all resumes? This cannot be undone.')) clearResumes(); }}><Trash2 size={16} /> Clear All Resumes</button>
          </div>
          <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            📊 <strong style={{ color: 'var(--text-primary)' }}>{resumes.length}</strong> resumes · <strong style={{ color: 'var(--text-primary)' }}>{jobTitles.length}</strong> job positions stored
          </div>
        </div>

        {/* Privacy */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} color="var(--success)" /> Privacy & Security</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            All resume processing happens <strong style={{ color: 'var(--success)' }}>100% locally</strong> in your browser. No data is sent to external servers. Resume text extraction and AI scoring run entirely on-device.
          </p>
        </div>

        {/* About */}
        <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(168,85,247,0.05))' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>⚡ HireIQ — AI Resume Screener</h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div>✅ Bulk resume upload (drag-drop, file, drive links)</div>
            <div>✅ Auto-categorize by experience level & type</div>
            <div>✅ Manage multiple job positions</div>
            <div>✅ Custom screening criteria per job</div>
            <div>✅ AI scoring with skill, education & keyword matching</div>
            <div>✅ Ranked results with detailed score breakdown</div>
            <div>✅ Advanced filters & search</div>
          </div>
        </div>
      </div>
    </div>
  );
}
