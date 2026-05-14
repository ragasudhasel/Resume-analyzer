import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { reportToPlainText } from '../utils/reportEngine';
import { Download, ArrowLeft, FileText } from 'lucide-react';

// Simple markdown renderer
function MD({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let tableBuffer = [];
  let inTable = false;

  const flush = () => {
    if (tableBuffer.length >= 2) {
      const headers = tableBuffer[0].split('|').map(c=>c.trim()).filter(Boolean);
      const rows = tableBuffer.slice(2).map(row=>row.split('|').map(c=>c.trim()).filter(Boolean));
      elements.push(
        <div key={elements.length} style={{overflowX:'auto',marginBottom:16}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr>{headers.map((h,i)=><th key={i} style={{padding:'8px 12px',background:'var(--bg-secondary)',borderBottom:'2px solid var(--border)',textAlign:'left',fontWeight:700,color:'var(--text-secondary)',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((row,ri)=><tr key={ri} style={{background:ri===0?'rgba(99,102,241,0.05)':ri%2?'var(--bg-secondary)':'transparent'}}>{row.map((cell,ci)=><td key={ci} style={{padding:'8px 12px',borderBottom:'1px solid var(--border)',fontSize:12}}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    }
    tableBuffer = []; inTable = false;
  };

  lines.forEach((line, i) => {
    if (line.startsWith('|')) { inTable = true; tableBuffer.push(line); return; }
    if (inTable) flush();

    if (line.startsWith('# ')) elements.push(<h1 key={i} style={{fontSize:24,fontWeight:900,marginBottom:8,marginTop:20}}>{renderInline(line.slice(2))}</h1>);
    else if (line.startsWith('## ')) elements.push(<h2 key={i} style={{fontSize:18,fontWeight:800,marginBottom:8,marginTop:20,color:'var(--accent-light)'}}>{renderInline(line.slice(3))}</h2>);
    else if (line.startsWith('### ')) elements.push(<h3 key={i} style={{fontSize:15,fontWeight:700,marginBottom:6,marginTop:16}}>{renderInline(line.slice(4))}</h3>);
    else if (line.startsWith('---')) elements.push(<hr key={i} style={{border:'none',borderTop:'1px solid var(--border)',margin:'20px 0'}}/>);
    else if (line.startsWith('> ')) elements.push(<blockquote key={i} style={{borderLeft:'3px solid var(--accent)',paddingLeft:12,margin:'10px 0',color:'var(--accent-light)',fontStyle:'italic',fontSize:13}}>{renderInline(line.slice(2))}</blockquote>);
    else if (line.startsWith('- ')) elements.push(<div key={i} style={{display:'flex',gap:8,marginBottom:4,fontSize:13,color:'var(--text-secondary)'}}><span style={{color:'var(--accent)',flexShrink:0}}>•</span><span>{renderInline(line.slice(2))}</span></div>);
    else if (line.trim()==='') elements.push(<div key={i} style={{height:8}}/>);
    else elements.push(<p key={i} style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:6}}>{renderInline(line)}</p>);
  });
  if (inTable) flush();
  return <>{elements}</>;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p,i)=>{
    if (p.startsWith('**')&&p.endsWith('**')) return <strong key={i}>{p.slice(2,-2)}</strong>;
    if (p.startsWith('*')&&p.endsWith('*')) return <em key={i}>{p.slice(1,-1)}</em>;
    return p;
  });
}

export default function ReportView() {
  const { savedReports, screeningResults, jobTitles, activeCriteria, setActiveView } = useStore();
  const [streaming, setStreaming] = useState(false);
  const [visibleLen, setVisibleLen] = useState(0);

  // Find latest report
  const jobId = Object.keys(savedReports).slice(-1)[0];
  const fullReport = savedReports[jobId]||'';
  const job = jobTitles.find(j=>j.id===jobId);

  useEffect(()=>{
    if(fullReport&&visibleLen<fullReport.length){
      setStreaming(true);
      const step = Math.ceil(fullReport.length/60);
      const t = setInterval(()=>{
        setVisibleLen(v=>{
          if(v+step>=fullReport.length){clearInterval(t);setStreaming(false);return fullReport.length;}
          return v+step;
        });
      },40);
      return ()=>clearInterval(t);
    }
  },[fullReport]);

  const downloadTxt = () => {
    const plain = reportToPlainText(fullReport);
    const blob = new Blob([plain],{type:'text/plain'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`HireIQ_Report_${Date.now()}.txt`;a.click();
  };

  const downloadMD = () => {
    const blob = new Blob([fullReport],{type:'text/markdown'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`HireIQ_Report_${Date.now()}.md`;a.click();
  };

  if(!fullReport) return (
    <div style={{textAlign:'center',padding:80}}>
      <div style={{fontSize:56,marginBottom:12}}>📊</div>
      <h2 style={{fontWeight:700,marginBottom:8}}>No Report Generated Yet</h2>
      <p style={{color:'var(--text-secondary)',marginBottom:20}}>Run AI Screening first, then click "Generate AI Report"</p>
      <button className="btn btn-primary" onClick={()=>setActiveView('screening')}><ArrowLeft size={15}/> Go to Screening</button>
    </div>
  );

  const displayed = fullReport.slice(0, visibleLen||fullReport.length);

  return (
    <div style={{maxWidth:900,margin:'0 auto'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <button className="btn btn-ghost" style={{fontSize:12,marginBottom:10}} onClick={()=>setActiveView('screening')}><ArrowLeft size={13}/> Back to Screening</button>
          <h1 style={{fontSize:26,fontWeight:900,marginBottom:4}}>🧠 AI Intelligence Report</h1>
          <p style={{color:'var(--text-secondary)',fontSize:13}}>{job?.title||'Position'} · {new Date().toLocaleDateString()}{streaming&&<span style={{marginLeft:8,color:'var(--accent-light)',animation:'pulse 1s ease-in-out infinite'}}>⏳ Generating…</span>}</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost" onClick={downloadMD}><Download size={14}/> .md</button>
          <button className="btn btn-primary" onClick={downloadTxt} style={{background:'linear-gradient(135deg,#10b981,#059669)'}}><Download size={14}/> Download Report</button>
        </div>
      </div>

      {/* Report body */}
      <div className="card" style={{padding:'28px 32px',lineHeight:1.7}}>
        <MD text={displayed}/>
        {streaming&&<div style={{display:'inline-block',width:2,height:16,background:'var(--accent)',animation:'blink 0.7s step-end infinite',verticalAlign:'text-bottom',marginLeft:2}}/>}
      </div>

      {/* Actions */}
      {!streaming&&(
        <div style={{marginTop:16,display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-ghost" onClick={downloadMD}><FileText size={14}/> Save as Markdown</button>
          <button className="btn btn-primary" onClick={downloadTxt} style={{background:'linear-gradient(135deg,#10b981,#059669)'}}><Download size={14}/> Download Plain Text</button>
          <button className="btn btn-ghost" onClick={()=>setActiveView('screening')}><ArrowLeft size={14}/> Back to Results</button>
        </div>
      )}

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
