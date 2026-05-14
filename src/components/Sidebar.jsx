import React from 'react';
import useStore from '../store/useStore';
import { LayoutDashboard, Upload, Library, Briefcase, Zap, ClipboardList, FileBarChart, Settings, X } from 'lucide-react';

const NAV = [
  { id:'dashboard',   label:'Dashboard',        icon:LayoutDashboard },
  { id:'upload',      label:'Upload Resumes',   icon:Upload },
  { id:'library',     label:'Resume Library',   icon:Library },
  { id:'criteria',    label:'Job Criteria',     icon:ClipboardList },
  { id:'screening',   label:'AI Screening',     icon:Zap },
  { id:'report',      label:'AI Report',        icon:FileBarChart },
  { id:'settings',    label:'Settings',         icon:Settings },
];

export default function Sidebar({ onClose }) {
  const { activeView, setActiveView, resumes, jobTitles, activeCriteria, screeningResults } = useStore();

  const totalScreeed = Object.values(screeningResults).flat().length;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'20px 0' }}>
      {/* Logo */}
      <div style={{ padding:'0 20px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={18} color="white"/>
          </div>
          <div>
            <div style={{ fontWeight:900, fontSize:16, background:'linear-gradient(135deg,var(--accent-light),var(--purple))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>HireIQ</div>
            <div style={{ fontSize:10, color:'var(--text-muted)' }}>AI Resume Screener</div>
          </div>
        </div>
        {onClose && <button className="btn btn-ghost" style={{padding:6,minWidth:0}} onClick={onClose}><X size={16}/></button>}
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8, padding:'14px 14px 0' }}>
        {[
          [resumes.length,'Resumes','var(--accent-light)'],
        ].map(([v,l,c])=>(
          <div key={l} style={{ textAlign:'center', padding:'8px 4px', background:'var(--bg-secondary)', borderRadius:'var(--radius)' }}>
            <div style={{ fontSize:20, fontWeight:900, color:c }}>{v}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Criteria status pill */}
      <div style={{ padding:'10px 14px' }}>
        <div style={{ padding:'6px 12px', borderRadius:8, background:activeCriteria?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)', border:`1px solid ${activeCriteria?'rgba(16,185,129,0.3)':'rgba(245,158,11,0.3)'}`, fontSize:11, fontWeight:600, color:activeCriteria?'var(--success)':'var(--warning)', textAlign:'center' }}>
          {activeCriteria?'✅ Criteria Confirmed':'⚠️ No Criteria Set'}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'4px 8px', overflowY:'auto' }}>
        {NAV.map(({ id, label, icon:Icon }) => {
          const active = activeView === id;
          return (
            <button key={id} onClick={() => setActiveView(id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:'var(--radius)', border:'none',
              background:active?'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.1))':'transparent',
              color:active?'var(--accent-light)':'var(--text-secondary)',
              cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:13,
              fontWeight:active?700:400, marginBottom:2,
              borderLeft:active?'3px solid var(--accent)':'3px solid transparent',
              transition:'all 0.15s',
            }}>
              <Icon size={16}/>
              <span style={{flex:1,textAlign:'left'}}>{label}</span>
              {id==='library'&&resumes.length>0&&<span style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',background:'var(--bg-secondary)',padding:'2px 6px',borderRadius:20}}>{resumes.length}</span>}
              {id==='report'&&Object.keys(useStore.getState().savedReports).length>0&&<span style={{width:7,height:7,borderRadius:4,background:'var(--accent)',display:'inline-block'}}/>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', fontSize:11, color:'var(--text-muted)' }}>HireIQ v3.0 · AI-Powered Screening</div>
    </div>
  );
}
