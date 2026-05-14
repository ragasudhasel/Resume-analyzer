import React from 'react';
import useStore from '../store/useStore';
import { Users, Briefcase, Zap, TrendingUp, Award, FileText, Target, CheckCircle } from 'lucide-react';
import { getScoreColor, getScoreLabel } from '../utils/resumeUtils';

export default function Dashboard() {
  const { setActiveView } = useStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg,var(--accent),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, boxShadow: '0 20px 40px rgba(99,102,241,0.3)' }}>
        <Zap size={40} color="white" />
      </div>
      
      <h1 style={{ fontSize: 56, fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
        Welcome to <span className="gradient-text">HireIQ</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 48, lineHeight: 1.6 }}>
        The ultimate AI-powered resume screening platform. Upload candidate profiles, set your criteria, and let the AI find the perfect match.
      </p>

      <button 
        className="btn btn-primary" 
        onClick={() => setActiveView('upload')} 
        style={{ padding: '18px 48px', fontSize: 18, borderRadius: 100, background: 'linear-gradient(135deg,#a855f7,#6366f1)', boxShadow: '0 10px 25px rgba(99,102,241,0.4)' }}
      >
        Get Started →
      </button>
    </div>
  );
}
