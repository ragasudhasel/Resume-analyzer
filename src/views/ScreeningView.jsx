import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { scoreResume, getScoreColor, getScoreLabel, getScoreTier, EXP_ORDER } from '../utils/resumeUtils';
import { generateReport } from '../utils/reportEngine';
import { Zap, Filter, ChevronDown, ChevronUp, Trophy, Download, AlertTriangle, BarChart3, FileText } from 'lucide-react';

const TIER_STYLE = { strong:'rgba(16,185,129,0.1)', good:'rgba(245,158,11,0.1)', partial:'rgba(249,115,22,0.1)', weak:'rgba(239,68,68,0.1)' };
const TIER_BORDER = { strong:'rgba(16,185,129,0.3)', good:'rgba(245,158,11,0.3)', partial:'rgba(249,115,22,0.3)', weak:'rgba(239,68,68,0.3)' };

export default function ScreeningView() {
  const { resumes, jobTitles, activeCriteria, screeningResults, setScreeningResults, saveRunToHistory, setActiveView, saveReport } = useStore();
  const [selJobId, setSelJobId] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamIdx, setStreamIdx] = useState(0);
  const [expandId, setExpandId] = useState(null);
  const [showTop3, setShowTop3] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [filters, setFilters] = useState({ level:'all', minScore:0, skill:'', impact:'all' });

  const job = jobTitles.find(j=>j.id===selJobId);
  const results = screeningResults[selJobId]||[];

  const runScreening = async () => {
    if(!selJobId){alert('Select a job position');return;}
    if(!activeCriteria){alert('Go to Job Criteria and define + confirm criteria first.');return;}
    setStreaming(true); setStreamIdx(0);
    const scored = resumes.map(r=>{const{percentage,breakdown}=scoreResume(r,activeCriteria);return{...r,score:percentage,breakdown};}).sort((a,b)=>b.score-a.score);
    // Stream results progressively
    for(let i=0;i<scored.length;i++){
      await new Promise(r=>setTimeout(r,120));
      setStreamIdx(i+1);
    }
    setScreeningResults(selJobId, scored);
    saveRunToHistory({ id:Date.now().toString(), name:job?.title||'Run', date:new Date().toISOString(), jobTitle:job?.title, count:scored.length, topScore:scored[0]?.score||0 });
    setStreaming(false);
  };

  const filtered = useMemo(()=>{
    let list=[...results];
    if(filters.level!=='all') list=list.filter(r=>r.experienceLevel===filters.level);
    if(filters.minScore>0) list=list.filter(r=>r.score>=filters.minScore);
    if(filters.skill) list=list.filter(r=>(r.skills||[]).some(s=>s.includes(filters.skill.toLowerCase())));
    if(filters.impact!=='all') list=list.filter(r=>r.impact===filters.impact);
    if(sortBy==='name') list.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    else if(sortBy==='level') list.sort((a,b)=>EXP_ORDER.indexOf(b.experienceLevel)-EXP_ORDER.indexOf(a.experienceLevel));
    else list.sort((a,b)=>b.score-a.score);
    return list;
  },[results,filters,sortBy]);

  const top3 = filtered.slice(0,3);
  const top10pct = filtered.length>0?filtered[Math.floor(filtered.length*0.1)]?.score||0:0;
  const top25pct = filtered.length>0?filtered[Math.floor(filtered.length*0.25)]?.score||0:0;

  const handleReport = () => {
    if(!results.length){alert('Run screening first.');return;}
    const report = generateReport(results, activeCriteria||{}, job?.title||'Position');
    saveReport(selJobId||'default', report);
    setActiveView('report');
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <div><h1 style={{fontSize:28,fontWeight:800,marginBottom:6}}><span className="gradient-text">AI Screening Engine</span></h1><p style={{color:'var(--text-secondary)'}}>Score & rank every resume against your confirmed criteria</p></div>
        {results.length>0&&<button className="btn btn-primary" onClick={handleReport} style={{background:'linear-gradient(135deg,#a855f7,#6366f1)'}}><FileText size={15}/> AI Report</button>}
      </div>

      {/* Setup Panel */}
      <div className="card" style={{padding:24,marginBottom:20,background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(168,85,247,0.04))'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:16,alignItems:'end'}}>
          <div>
            <label style={{fontSize:11,color:'var(--text-muted)',fontWeight:700,letterSpacing:'0.5px',display:'block',marginBottom:6}}>HIRING POSITION</label>
            <select value={selJobId} onChange={e=>setSelJobId(e.target.value)} style={{padding:'12px 16px'}}>
              <option value="">— Choose a position —</option>
              {jobTitles.map(j=><option key={j.id} value={j.id}>{j.title} · {j.department}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={runScreening} disabled={!selJobId||streaming} style={{padding:'13px 28px',fontSize:14}}>
            {streaming?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⏳</span> Scoring {streamIdx}/{resumes.length}…</>:<><Zap size={16}/> Run AI Screening</>}
          </button>
        </div>

        {/* Criteria status */}
        <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)',display:'flex',gap:16,flexWrap:'wrap',fontSize:12}}>
          {activeCriteria
            ? <><span>✅ Criteria: <strong style={{color:'var(--success)'}}>Confirmed</strong></span><span>👤 Level: <strong>{activeCriteria.experienceLevel}</strong></span><span>🛠 Skills: <strong>{activeCriteria.requiredSkills?.length||0}</strong></span><span>📋 Resumes: <strong>{resumes.length}</strong></span></>
            : <span style={{color:'var(--warning)'}}>⚠️ No confirmed criteria — go to <strong>Job Criteria</strong> tab and confirm first</span>
          }
        </div>
      </div>

      {/* Streaming bar */}
      {streaming&&(
        <div style={{marginBottom:16,padding:'12px 18px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13}}><span>Scoring resumes…</span><strong>{streamIdx}/{resumes.length}</strong></div>
          <div style={{height:6,background:'var(--bg-secondary)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',background:'linear-gradient(90deg,var(--accent),var(--purple))',borderRadius:3,width:`${resumes.length>0?streamIdx/resumes.length*100:0}%`,transition:'width 0.15s'}}/></div>
        </div>
      )}

      {results.length>0&&(
        <>
          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
            {[['Strong 80+',results.filter(r=>r.score>=80).length,'#10b981'],['Good 60+',results.filter(r=>r.score>=60&&r.score<80).length,'#f59e0b'],['Partial 40+',results.filter(r=>r.score>=40&&r.score<60).length,'#f97316'],['Weak <40',results.filter(r=>r.score<40).length,'#ef4444']].map(([l,v,c])=>(
              <div key={l} className="card" style={{padding:'14px 16px',borderLeft:`3px solid ${c}`}}><div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:11,color:'var(--text-muted)',fontWeight:600}}>{l}</div></div>
            ))}
          </div>

          {/* Filters */}
          <div className="card" style={{padding:'12px 18px',marginBottom:16,display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
            <Filter size={14} color="var(--text-muted)"/>
            <select value={filters.level} onChange={e=>setFilters(f=>({...f,level:e.target.value}))} style={{padding:'7px 10px',width:'auto'}}>
              <option value="all">All Levels</option>
              {EXP_ORDER.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
            <select value={filters.impact} onChange={e=>setFilters(f=>({...f,impact:e.target.value}))} style={{padding:'7px 10px',width:'auto'}}>
              <option value="all">All Impact</option>
              {['High','Medium','Low'].map(x=><option key={x} value={x}>{x} Impact</option>)}
            </select>
            <input value={filters.skill} onChange={e=>setFilters(f=>({...f,skill:e.target.value}))} placeholder="Filter by skill…" style={{padding:'7px 10px',width:150}}/>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12,color:'var(--text-muted)'}}>Min:</span>
              <input type="range" min={0} max={100} value={filters.minScore} onChange={e=>setFilters(f=>({...f,minScore:Number(e.target.value)}))} style={{width:90,accentColor:'var(--accent)'}}/>
              <span style={{fontSize:12,fontWeight:700,color:'var(--accent-light)',minWidth:28}}>{filters.minScore}%</span>
            </div>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:'7px 10px',width:'auto',marginLeft:'auto'}}>
              <option value="score">Sort: Score</option>
              <option value="name">Sort: Name</option>
              <option value="level">Sort: Level</option>
            </select>
            {top3.length>=2&&<button className="btn btn-primary" style={{padding:'7px 14px',fontSize:12,background:'linear-gradient(135deg,#f59e0b,#ef4444)'}} onClick={()=>setShowTop3(true)}><Trophy size={13}/> Compare Top {Math.min(3,top3.length)}</button>}
          </div>

          {/* Percentile markers */}
          {top10pct>0&&<div style={{marginBottom:10,fontSize:12,color:'var(--text-muted)'}}>🏅 Top 10%: <strong style={{color:'var(--success)'}}>{top10pct}+</strong> · Top 25%: <strong style={{color:'var(--accent-light)'}}>{top25pct}+</strong> · Showing <strong>{filtered.length}</strong>/{results.length}</div>}

          {/* Ranked list */}
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {filtered.map((r,i)=>(
              <ScoreCard key={r.id} resume={r} rank={i+1} expanded={expandId===r.id} onToggle={()=>setExpandId(expandId===r.id?null:r.id)} isTop10={r.score>=top10pct&&top10pct>0} isTop25={r.score>=top25pct&&top25pct>0}/>
            ))}
          </div>

          {/* Export CSV */}
          <div style={{marginTop:20,display:'flex',gap:10}}>
            <button className="btn btn-ghost" onClick={()=>exportCSV(filtered,job?.title||'results')}>⬇ Export CSV</button>
            <button className="btn btn-primary" onClick={handleReport} style={{background:'linear-gradient(135deg,#a855f7,#6366f1)'}}><FileText size={14}/> Generate AI Report</button>
          </div>
        </>
      )}

      {!results.length&&!streaming&&<EmptyState/>}
      {showTop3&&<CompareModal resumes={top3} onClose={()=>setShowTop3(false)} job={job} criteria={activeCriteria}/>}
    </div>
  );
}

function ScoreCard({resume:r,rank,expanded,onToggle,isTop10,isTop25}){
  const col=getScoreColor(r.score);
  const tier=getScoreTier(r.score);
  const medals={1:'🥇',2:'🥈',3:'🥉'};
  return(
    <div style={{border:`1px solid ${isTop10?'rgba(16,185,129,0.4)':TIER_BORDER[tier]}`,borderRadius:'var(--radius-lg)',overflow:'hidden',borderLeft:`4px solid ${col}`}}>
      <div style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',background:isTop10?TIER_STYLE.strong:TIER_STYLE[tier]}} onClick={onToggle}>
        <div style={{minWidth:32,textAlign:'center'}}>{rank<=3?<span style={{fontSize:20}}>{medals[rank]}</span>:<span style={{fontSize:14,fontWeight:800,color:'var(--text-muted)'}}>#{rank}</span>}</div>
        {isTop10&&<span title="Top 10%" style={{fontSize:14}}>⭐</span>}
        <div style={{width:40,height:40,borderRadius:10,background:`${col}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{color:col,fontWeight:900,fontSize:16}}>{(r.name||'?')[0].toUpperCase()}</span></div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{r.name||r.fileName}</div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            <span className="badge badge-accent">{r.experienceLevel}</span>
            <span style={{fontSize:11,color:'var(--text-muted)'}}>{r.jobTitle}</span>
            {r.impact&&['Intern','Fresher'].includes(r.experienceLevel)&&<span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:r.impact==='High'?'rgba(16,185,129,0.15)':r.impact==='Medium'?'rgba(245,158,11,0.15)':'rgba(239,68,68,0.15)',color:r.impact==='High'?'#10b981':r.impact==='Medium'?'#f59e0b':'#ef4444',fontWeight:700}}>{r.impact} Impact</span>}
          </div>
        </div>
        <div style={{textAlign:'center',minWidth:80,flexShrink:0}}>
          <div style={{fontSize:26,fontWeight:900,color:col,lineHeight:1}}>{r.score}%</div>
          <div style={{fontSize:10,color:'var(--text-muted)'}}>{getScoreLabel(r.score)}</div>
          <div className="score-bar" style={{marginTop:4}}><div className="score-bar-fill" style={{width:`${r.score}%`,background:col}}/></div>
        </div>
        {expanded?<ChevronUp size={15} color="var(--text-muted)"/>:<ChevronDown size={15} color="var(--text-muted)"/>}
      </div>
      {expanded&&r.breakdown&&(
        <div style={{padding:'0 18px 18px',background:'var(--bg-secondary)',borderTop:'1px solid var(--border)'}}>
          <div style={{paddingTop:14,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {Object.entries(r.breakdown).filter(([k])=>k!=='keywords').map(([key,bd])=>{
              const labels={skills:'🛠 Skills',experience:'💼 Experience',education:'🎓 Education',titleRelevance:'🎯 Title',projectImpact:'🚀 Projects'};
              return(
                <div key={key} style={{padding:12,background:'var(--bg-card)',borderRadius:'var(--radius)',border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:11,color:'var(--text-muted)',fontWeight:600}}>{labels[key]||key}</span>
                    <span style={{fontSize:12,fontWeight:700,color:getScoreColor(bd.pct||0)}}>{bd.score}/{bd.max}</span>
                  </div>
                  <div className="score-bar"><div className="score-bar-fill" style={{width:`${bd.pct||0}%`,background:getScoreColor(bd.pct||0)}}/></div>
                  {bd.matched?.length>0&&<div style={{marginTop:6,display:'flex',flexWrap:'wrap',gap:3}}>{bd.matched.slice(0,4).map(m=><span key={m} className="tag" style={{fontSize:9,color:'var(--success)'}}>✓{m}</span>)}</div>}
                  {bd.missing?.length>0&&<div style={{marginTop:2,display:'flex',flexWrap:'wrap',gap:3}}>{bd.missing.slice(0,3).map(m=><span key={m} className="tag" style={{fontSize:9,color:'var(--danger)'}}>✗{m}</span>)}</div>}
                </div>
              );
            })}
          </div>
          {r.summary&&<div style={{marginTop:10,padding:10,background:'var(--bg-card)',borderRadius:'var(--radius)',fontSize:12,color:'var(--text-secondary)',fontStyle:'italic',lineHeight:1.6}}>"{r.summary.slice(0,180)}{r.summary.length>180?'…':''}"</div>}
        </div>
      )}
    </div>
  );
}

function CompareModal({resumes,onClose,job,criteria}){
  const medals=['🥇','🥈','🥉'];
  const rows=[['Match Score',r=>`${r.score}%`,true],['Job Title',r=>r.jobTitle||'—'],['Level',r=>r.experienceLevel],['Education',r=>r.education],['Skills Match',r=>`${r.breakdown?.skills?.pct||0}%`],['Exp Fit',r=>`${r.breakdown?.experience?.pct||0}%`],['Impact',r=>r.impact||'N/A'],['Skills',r=>(r.skills||[]).slice(0,4).join(', ')||'—']];
  return(
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-xl)',width:'95%',maxWidth:820,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 32px 100px rgba(0,0,0,0.6)'}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.05))'}}>
          <h2 style={{fontWeight:800,fontSize:18}}><Trophy size={18} color="#f59e0b" style={{display:'inline',marginRight:8}}/>Top {resumes.length} Comparison</h2>
          <button className="btn btn-ghost" style={{padding:8,minWidth:0}} onClick={onClose}>✕</button>
        </div>
        <div style={{overflowY:'auto',flex:1}}>
          <div style={{display:'grid',gridTemplateColumns:`160px repeat(${resumes.length},1fr)`,position:'sticky',top:0,background:'var(--bg-secondary)',borderBottom:'1px solid var(--border)'}}>
            <div style={{padding:'14px 16px',fontSize:11,color:'var(--text-muted)',fontWeight:700}}>CRITERIA</div>
            {resumes.map((r,i)=><div key={r.id} style={{padding:'14px 16px',borderLeft:'1px solid var(--border)',textAlign:'center'}}><div style={{fontSize:20,marginBottom:4}}>{medals[i]}</div><div style={{fontWeight:800,fontSize:13}}>{r.name||r.fileName}</div><div style={{fontSize:22,fontWeight:900,color:getScoreColor(r.score)}}>{r.score}%</div></div>)}
          </div>
          {rows.map(([label,fn,hi])=>(
            <div key={label} style={{display:'grid',gridTemplateColumns:`160px repeat(${resumes.length},1fr)`,borderBottom:'1px solid var(--border)',background:hi?'rgba(99,102,241,0.04)':'transparent'}}>
              <div style={{padding:'11px 16px',fontSize:12,color:'var(--text-muted)'}}>{label}</div>
              {resumes.map(r=><div key={r.id} style={{padding:'11px 16px',borderLeft:'1px solid var(--border)',textAlign:'center',fontSize:13,fontWeight:hi?800:500,color:hi?getScoreColor(r.score):'var(--text-primary)'}}>{fn(r)}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState(){return(<div style={{textAlign:'center',padding:80}}><div style={{fontSize:56,marginBottom:12}}>🎯</div><h3 style={{fontSize:20,fontWeight:700,marginBottom:8}}>Ready to Screen</h3><p style={{color:'var(--text-secondary)'}}>1. Define criteria in <strong>Job Criteria</strong> → 2. Confirm → 3. Select position → 4. Run</p></div>);}

function exportCSV(results, jobTitle){
  const hdr='Rank,Name,Email,Score,Level,JobTitle,Education,Skills,Impact';
  const rows=results.map((r,i)=>[i+1,r.name||r.fileName,r.email||'',r.score,r.experienceLevel,r.jobTitle,r.education,(r.skills||[]).slice(0,6).join(';'),r.impact||''].join(','));
  const blob=new Blob([[hdr,...rows].join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`HireIQ_${jobTitle}_${Date.now()}.csv`;a.click();
}
