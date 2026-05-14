import React, { useState, useMemo, useCallback } from 'react';
import useStore from '../store/useStore';
import { buildHierarchy, groupAlphabetically, getScoreColor, getScoreLabel, stringToColor, EXP_ORDER } from '../utils/resumeUtils';
import { Search, ChevronRight, ChevronDown, Trash2, Eye, Users, Briefcase, Star } from 'lucide-react';

const IMPACT_COLORS = { High:'#10b981', Medium:'#f59e0b', Low:'#ef4444' };
const EXP_COLORS = { Intern:'#06b6d4', Fresher:'#a855f7', Junior:'#10b981', 'Mid-Level':'#f59e0b', Senior:'#6366f1', 'Lead / Principal':'#ec4899' };
const BRANCH_COLORS = ['#6366f1','#a855f7','#06b6d4','#ec4899','#10b981','#f59e0b','#ef4444','#f97316','#14b8a6','#8b5cf6'];

export default function LibraryView() {
  const { resumes, deleteResume } = useStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('branches');
  const [selected, setSelected] = useState(null);
  const [openBranches, setOpenBranches] = useState({});
  const [openLevels, setOpenLevels] = useState({});
  const [activeJobTitle, setActiveJobTitle] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);

  const filtered = useMemo(() => {
    if(!search) return resumes;
    const q=search.toLowerCase();
    return resumes.filter(r=>(r.name||'').toLowerCase().includes(q)||(r.jobTitle||'').toLowerCase().includes(q)||(r.skills||[]).some(s=>s.includes(q))||(r.email||'').toLowerCase().includes(q));
  }, [resumes, search]);

  const hierarchy = useMemo(() => buildHierarchy(filtered), [filtered]);
  const alphaGroups = useMemo(() => groupAlphabetically(filtered), [filtered]);
  const jobTitles = Object.keys(hierarchy).sort();

  const toggleBranch = k => setOpenBranches(o=>({...o,[k]:!o[k]}));
  const toggleLevel = k => setOpenLevels(o=>({...o,[k]:!o[k]}));

  // Active list: what to show in main panel
  const activeList = useMemo(() => {
    if(!activeJobTitle) return filtered;
    const branch = hierarchy[activeJobTitle]||{};
    if(!activeLevel) return Object.values(branch).flat();
    return branch[activeLevel]||[];
  }, [filtered, hierarchy, activeJobTitle, activeLevel]);

  return (
    <div style={{display:'flex',gap:0,minHeight:'80vh'}}>
      {/* ── Left Tree Sidebar ── */}
      <div style={{width:260,flexShrink:0,borderRight:'1px solid var(--border)',paddingRight:0,overflowY:'auto',maxHeight:'calc(100vh - 160px)',position:'sticky',top:0}}>
        <div style={{padding:'0 16px 16px'}}>
          <div style={{fontSize:11,color:'var(--text-muted)',fontWeight:700,letterSpacing:'0.5px',marginBottom:12,paddingTop:4}}>JOB TITLE BRANCHES</div>

          {/* All */}
          <div onClick={()=>{setActiveJobTitle(null);setActiveLevel(null);}} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,cursor:'pointer',background:!activeJobTitle?'rgba(99,102,241,0.15)':'transparent',marginBottom:4}}>
            <Users size={14} color="var(--accent-light)"/>
            <span style={{fontSize:13,fontWeight:!activeJobTitle?700:400,color:!activeJobTitle?'var(--accent-light)':'var(--text-secondary)'}}>All Resumes</span>
            <span style={{marginLeft:'auto',fontSize:11,fontWeight:700,color:'var(--text-muted)'}}>{resumes.length}</span>
          </div>

          {jobTitles.map((jt,ti) => {
            const color=BRANCH_COLORS[ti%BRANCH_COLORS.length];
            const branch=hierarchy[jt];
            const total=Object.values(branch).flat().length;
            const isOpen=openBranches[jt]!==false;
            const isActive=activeJobTitle===jt;
            const levels=EXP_ORDER.filter(l=>branch[l]?.length>0);

            return (
              <div key={jt} style={{marginBottom:2}}>
                <div onClick={()=>{toggleBranch(jt);setActiveJobTitle(jt);setActiveLevel(null);}} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,cursor:'pointer',background:isActive&&!activeLevel?`${color}15`:'transparent',borderLeft:isActive?`3px solid ${color}`:'3px solid transparent'}}>
                  <Briefcase size={13} color={color}/>
                  <span style={{fontSize:12,fontWeight:isActive?700:400,color:isActive?color:'var(--text-secondary)',flex:1,lineHeight:1.3}}>{jt}</span>
                  <span style={{fontSize:10,fontWeight:700,color:'var(--text-muted)'}}>{total}</span>
                  {isOpen?<ChevronDown size={11} color="var(--text-muted)"/>:<ChevronRight size={11} color="var(--text-muted)"/>}
                </div>
                {isOpen && levels.map(lv=>(
                  <div key={lv} onClick={()=>{setActiveJobTitle(jt);setActiveLevel(lv);}} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px 6px 28px',cursor:'pointer',borderRadius:8,background:activeJobTitle===jt&&activeLevel===lv?`${EXP_COLORS[lv]||'#6366f1'}15`:'transparent'}}>
                    <div style={{width:6,height:6,borderRadius:3,background:EXP_COLORS[lv]||'#6366f1',flexShrink:0}}/>
                    <span style={{fontSize:11,color:activeJobTitle===jt&&activeLevel===lv?(EXP_COLORS[lv]||'var(--accent-light)'):'var(--text-muted)',fontWeight:activeJobTitle===jt&&activeLevel===lv?700:400}}>{lv}</span>
                    <span style={{marginLeft:'auto',fontSize:10,color:'var(--text-muted)'}}>{branch[lv]?.length||0}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div style={{flex:1,paddingLeft:24,minWidth:0}}>
        {/* Header */}
        <div style={{display:'flex',gap:10,marginBottom:18,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:200}}>
            <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, job title, skills…" style={{paddingLeft:38,paddingRight:12,paddingTop:9,paddingBottom:9}}/>
          </div>
          <div style={{display:'flex',gap:4,background:'var(--bg-secondary)',borderRadius:'var(--radius)',padding:4,border:'1px solid var(--border)'}}>
            {[['branches','🌿 Branches'],['alpha','🔤 A–Z']].map(([id,label])=>(
              <button key={id} onClick={()=>setViewMode(id)} style={{padding:'6px 12px',borderRadius:7,border:'none',background:viewMode===id?'var(--accent)':'transparent',color:viewMode===id?'white':'var(--text-secondary)',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:500}}>{label}</button>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:14}}>
          <span style={{cursor:'pointer',color:'var(--accent-light)'}} onClick={()=>{setActiveJobTitle(null);setActiveLevel(null);}}>All</span>
          {activeJobTitle&&<><span style={{margin:'0 6px'}}>›</span><span style={{cursor:'pointer',color:'var(--text-primary)',fontWeight:600}} onClick={()=>setActiveLevel(null)}>{activeJobTitle}</span></>}
          {activeLevel&&<><span style={{margin:'0 6px'}}>›</span><span style={{color:EXP_COLORS[activeLevel]||'var(--accent-light)',fontWeight:700}}>{activeLevel}</span></>}
          <span style={{marginLeft:8,color:'var(--text-muted)'}}>{activeList.length} resume{activeList.length!==1?'s':''}</span>
        </div>

        {viewMode==='branches'&&<BranchContent list={activeList} onSelect={setSelected} onDelete={deleteResume} hierarchy={hierarchy} activeJobTitle={activeJobTitle} activeLevel={activeLevel}/>}
        {viewMode==='alpha'&&<AlphaContent list={activeList} onSelect={setSelected} onDelete={deleteResume}/>}

      </div>

      {/* Detail Drawer */}
      {selected&&<DetailDrawer resume={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

function BranchContent({ list, onSelect, onDelete, hierarchy, activeJobTitle, activeLevel }) {
  if(list.length===0) return <EmptyMsg/>;
  
  if (activeLevel) {
    return (
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {list.map((r,i)=><ResumeCard key={r.id} resume={r} rank={i+1} onSelect={onSelect} onDelete={onDelete}/>)}
      </div>
    );
  }

  if (activeJobTitle) {
    const branch = hierarchy[activeJobTitle] || {};
    return (
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        {EXP_ORDER.filter(lv=>branch[lv]?.length>0).map(lv => (
          <div key={lv}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,paddingLeft:4}}>
              <div style={{width:8,height:8,borderRadius:4,background:EXP_COLORS[lv]||'#6366f1'}}/>
              <h3 style={{fontSize:14,fontWeight:800,color:EXP_COLORS[lv]||'var(--accent-light)'}}>{lv}</h3>
              <span style={{fontSize:11,color:'var(--text-muted)'}}>{branch[lv].length} resumes</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {branch[lv].map((r,i)=><ResumeCard key={r.id} resume={r} rank={i+1} onSelect={onSelect} onDelete={onDelete}/>)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:32}}>
      {Object.keys(hierarchy).sort().map(jt => {
        const branch = hierarchy[jt];
        if (Object.values(branch).flat().length === 0) return null;
        return (
          <div key={jt}>
            <div style={{marginBottom:16,paddingBottom:8,borderBottom:'1px solid var(--border)'}}>
              <h2 style={{fontSize:18,fontWeight:900,color:'var(--text-primary)'}}>{jt}</h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              {EXP_ORDER.filter(lv=>branch[lv]?.length>0).map(lv => (
                <div key={lv}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,paddingLeft:4}}>
                    <div style={{width:8,height:8,borderRadius:4,background:EXP_COLORS[lv]||'#6366f1'}}/>
                    <h3 style={{fontSize:13,fontWeight:700,color:EXP_COLORS[lv]||'var(--accent-light)'}}>{lv}</h3>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {branch[lv].map((r,i)=><ResumeCard key={r.id} resume={r} rank={i+1} onSelect={onSelect} onDelete={onDelete}/>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AlphaContent({ list, onSelect, onDelete }) {
  if (list.length === 0) return <EmptyMsg/>;
  const sorted = [...list].sort((a, b) => (a.name || a.fileName).localeCompare(b.name || b.fileName));
  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {sorted.map((r,i)=><ResumeCard key={r.id} resume={r} rank={i+1} onSelect={onSelect} onDelete={onDelete}/>)}
    </div>
  );
}

function ResumeCard({ resume:r, onSelect, onDelete }) {
  const col=stringToColor(r.name||'');
  const expCol=EXP_COLORS[r.experienceLevel]||'#6366f1';
  const isFreshOrIntern=['Intern','Fresher'].includes(r.experienceLevel);
  return (
    <div className="card" style={{padding:'14px 18px',display:'flex',alignItems:'flex-start',gap:14,cursor:'pointer',marginTop:4}} onClick={()=>onSelect(r)}>
      <div style={{width:42,height:42,borderRadius:11,background:`linear-gradient(135deg,${col}44,${col}22)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <span style={{color:col,fontWeight:800,fontSize:16}}>{(r.name||'?')[0].toUpperCase()}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
          <span style={{fontWeight:700,fontSize:14}}>{r.name||r.fileName}</span>
          {isFreshOrIntern&&r.impact&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:`${IMPACT_COLORS[r.impact]}20`,color:IMPACT_COLORS[r.impact],fontWeight:700,border:`1px solid ${IMPACT_COLORS[r.impact]}33`}}>{r.impact} Impact</span>}
          {r.score!==undefined&&<span style={{fontSize:11,fontWeight:800,color:getScoreColor(r.score),marginLeft:'auto'}}>{r.score}%</span>}
        </div>
        <div style={{display:'flex',gap:6,marginBottom:6,flexWrap:'wrap'}}>
          <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:`${expCol}22`,color:expCol,fontWeight:600}}>{r.experienceLevel}</span>
          <span style={{fontSize:11,color:'var(--text-muted)'}}>{r.jobTitle}</span>
          {r.email&&<span style={{fontSize:11,color:'var(--text-muted)'}}>{r.email}</span>}
        </div>
        {r.skills?.length>0&&<div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{r.skills.slice(0,6).map(s=><span key={s} className="tag" style={{fontSize:10}}>{s}</span>)}{r.skills.length>6&&<span className="tag" style={{fontSize:10}}>+{r.skills.length-6}</span>}</div>}
      </div>
      <button className="btn btn-danger" style={{padding:7,minWidth:0,flexShrink:0}} onClick={e=>{e.stopPropagation();onDelete(r.id);}}><Trash2 size={13}/></button>
    </div>
  );
}

function DetailDrawer({ resume:r, onClose }) {
  const col=stringToColor(r.name||'');
  const expCol=EXP_COLORS[r.experienceLevel]||'#6366f1';
  return (
    <div style={{position:'fixed',right:0,top:0,bottom:0,width:380,background:'var(--bg-card)',borderLeft:'1px solid var(--border)',padding:28,overflowY:'auto',zIndex:200,boxShadow:'-20px 0 60px rgba(0,0,0,0.4)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 style={{fontWeight:700}}>Resume Detail</h3>
        <button className="btn btn-ghost" style={{padding:8,minWidth:0}} onClick={onClose}>✕</button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
        <div style={{width:56,height:56,borderRadius:16,background:`linear-gradient(135deg,${col},${col}88)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:'white',fontWeight:900,fontSize:22}}>{(r.name||'?')[0].toUpperCase()}</span>
        </div>
        <div>
          <h2 style={{fontWeight:800,fontSize:17}}>{r.name||r.fileName}</h2>
          <p style={{color:'var(--text-secondary)',fontSize:13}}>{r.jobTitle}</p>
        </div>
      </div>
      {r.summary&&<div style={{padding:12,background:'var(--bg-secondary)',borderRadius:10,marginBottom:16,fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,fontStyle:'italic'}}>"{r.summary.slice(0,200)}{r.summary.length>200?'…':''}"</div>}
      {[['Experience Level',r.experienceLevel],['Education',r.education],['Years Exp',`${r.expYears||0} yrs`],['Email',r.email||'—'],['Phone',r.phone||'—'],['Impact',r.impact||'N/A']].map(([k,v])=>(
        <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
          <span style={{color:'var(--text-muted)',fontSize:13}}>{k}</span>
          <span style={{fontWeight:600,fontSize:13}}>{v}</span>
        </div>
      ))}
      {r.score!==undefined&&<div style={{marginTop:16,padding:14,borderRadius:'var(--radius)',background:`${getScoreColor(r.score)}14`,border:`1px solid ${getScoreColor(r.score)}33`}}>
        <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>MATCH SCORE</div>
        <div style={{fontSize:30,fontWeight:900,color:getScoreColor(r.score)}}>{r.score}%</div>
        <div style={{fontSize:13,color:'var(--text-secondary)'}}>{getScoreLabel(r.score)}</div>
      </div>}
      {r.skills?.length>0&&<div style={{marginTop:16}}>
        <div style={{fontSize:11,color:'var(--text-muted)',fontWeight:600,marginBottom:8,textTransform:'uppercase'}}>Skills ({r.skills.length})</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{r.skills.map(s=><span key={s} className="tag" style={{fontSize:11}}>{s}</span>)}</div>
      </div>}
    </div>
  );
}

function EmptyMsg() {
  return <div style={{textAlign:'center',padding:80}}><div style={{fontSize:48,marginBottom:12}}>📂</div><h3 style={{fontWeight:700,marginBottom:6}}>No resumes yet</h3><p style={{color:'var(--text-secondary)'}}>Upload resumes — they'll be auto-organized into job branches</p></div>;
}
