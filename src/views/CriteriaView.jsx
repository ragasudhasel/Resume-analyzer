import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { parseCriteriaText, generateId } from '../utils/resumeUtils';
import { FileText, Mic, Image, Upload, Type, PenLine, Wand2, Check, Edit3, ChevronDown, ChevronUp, X } from 'lucide-react';

const EXAMPLES = [
  "Looking for a Senior Full Stack Developer with 5+ years in React and Node.js. Must have experience with PostgreSQL, Docker, and AWS. Bachelor's degree required. Keywords: microservices, REST API, CI/CD. Remote work preferred.",
  "Need a Mid-level Data Scientist with 3+ years. Required skills: Python, TensorFlow, Pandas, SQL. Machine learning and NLP experience essential. Masters degree preferred.",
  "Hiring Junior Frontend Developer, 1-2 years experience. Skills: React, TypeScript, CSS, Figma. Bachelors degree. Nice to have: Next.js, Tailwind CSS. Onsite in Chennai.",
];

export default function CriteriaView() {
  const { setActiveCriteria, activeCriteria, jobTitles, setCriteria, setActiveView } = useStore();
  const [inputMode, setInputMode] = useState('type');
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const fileRef = useRef();
  const imgRef = useRef();
  const audioRef = useRef();
  const [editParsed, setEditParsed] = useState(false);
  const [editSkillText, setEditSkillText] = useState('');

  const handleParse = () => {
    if(!rawText.trim()){alert('Please enter job criteria text.');return;}
    const c = parseCriteriaText(rawText);
    setParsed(c);
    setEditSkillText(c.requiredSkills.join(', '));
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if(!parsed){alert('Parse the criteria first.');return;}
    const finalCriteria = {...parsed, requiredSkills: editSkillText.split(/[,;]+/).map(s=>s.trim()).filter(Boolean)};
    setActiveCriteria(finalCriteria);
    if(selectedJobId) setCriteria(selectedJobId, finalCriteria);
    setConfirmed(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setRawText(ev.target.result||''); };
    reader.readAsText(file);
  };

  const handleAudio = () => {
    if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){alert('Speech recognition not supported. Use Chrome.');return;}
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec = new SR(); rec.continuous=false; rec.interimResults=false;
    setRecording(true);
    rec.onresult = (e) => { setRawText(t=>t+' '+e.results[0][0].transcript); setRecording(false); };
    rec.onerror = ()=>setRecording(false);
    rec.start();
  };

  const MODES = [
    { id:'type', icon:<Type size={14}/>, label:'Type / Paste' },
    { id:'file', icon:<Upload size={14}/>, label:'Upload File' },
    { id:'image', icon:<Image size={14}/>, label:'Image (OCR)' },
    { id:'audio', icon:<Mic size={14}/>, label:'Audio / Speech' },
    { id:'notepad', icon:<PenLine size={14}/>, label:'Notepad' },
  ];

  return (
    <div style={{maxWidth:820,margin:'0 auto'}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:8}}>Job Criteria Definition</h1>
        <p style={{color:'var(--text-secondary)'}}>Define screening requirements in any format — the AI extracts a structured criteria card · You must confirm before matching begins</p>
      </div>

      {/* Input Mode Selector */}
      <div className="card" style={{padding:24,marginBottom:20}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
          {MODES.map(m=>(
            <button key={m.id} onClick={()=>setInputMode(m.id)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:10,border:'1px solid',borderColor:inputMode===m.id?'var(--accent)':'var(--border)',background:inputMode===m.id?'rgba(99,102,241,0.15)':'var(--bg-glass)',color:inputMode===m.id?'var(--accent-light)':'var(--text-secondary)',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:500}}>
              {m.icon}{m.label}
            </button>
          ))}
        </div>

        {/* Type / Paste / Notepad */}
        {(inputMode==='type'||inputMode==='notepad') && (
          <div>
            <label style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.5px',display:'block',marginBottom:8}}>ENTER JOB DESCRIPTION OR CRITERIA</label>
            <textarea value={rawText} onChange={e=>setRawText(e.target.value)} rows={8} placeholder={"Example:\n\"Need a Senior React Developer with 5+ years experience. Skills: React, TypeScript, Node.js, PostgreSQL. Must have AWS experience. Remote work. Bachelor's degree required. Keywords: microservices, REST API.\""} style={{padding:'14px 16px',resize:'vertical',lineHeight:1.7,fontSize:13}}/>
            <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
              {EXAMPLES.map((ex,i)=>(
                <button key={i} onClick={()=>setRawText(ex)} style={{padding:'6px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-glass)',color:'var(--text-muted)',cursor:'pointer',fontSize:11,fontFamily:'Inter,sans-serif',textAlign:'left'}}>
                  💡 Example {i+1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File Upload */}
        {inputMode==='file' && (
          <div>
            <label style={{display:'flex',alignItems:'center',gap:12,padding:20,border:'1px dashed var(--border)',borderRadius:'var(--radius)',cursor:'pointer',marginBottom:12}}>
              <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} style={{display:'none'}}/>
              <Upload size={22} color="var(--accent)"/>
              <div><div style={{fontWeight:600,fontSize:14}}>Upload Job Description File</div><div style={{fontSize:12,color:'var(--text-muted)'}}>PDF, DOCX, TXT supported</div></div>
            </label>
            {rawText&&<textarea value={rawText} onChange={e=>setRawText(e.target.value)} rows={6} style={{padding:'12px 14px',resize:'vertical',lineHeight:1.6,fontSize:13}}/>}
          </div>
        )}

        {/* Image OCR */}
        {inputMode==='image' && (
          <div>
            <label style={{display:'flex',alignItems:'center',gap:12,padding:20,border:'1px dashed var(--border)',borderRadius:'var(--radius)',cursor:'pointer',marginBottom:12}}>
              <input ref={imgRef} type="file" accept="image/*" onChange={()=>alert('OCR: In production, this uses Google Vision API or Tesseract.js to extract text from the JD image.')} style={{display:'none'}}/>
              <Image size={22} color="var(--purple)"/>
              <div><div style={{fontWeight:600,fontSize:14}}>Upload JD Image</div><div style={{fontSize:12,color:'var(--text-muted)'}}>OCR extracts requirements from the image</div></div>
            </label>
            <textarea value={rawText} onChange={e=>setRawText(e.target.value)} rows={5} placeholder="Or manually paste the extracted text here…" style={{padding:'12px 14px',resize:'vertical',fontSize:13}}/>
          </div>
        )}

        {/* Audio */}
        {inputMode==='audio' && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <button className="btn btn-primary" onClick={handleAudio} style={{background:recording?'#ef4444':'linear-gradient(135deg,#a855f7,#6366f1)',minWidth:130}}>
                <Mic size={15}/> {recording?'🔴 Listening…':'Speak JD'}
              </button>
              <div style={{fontSize:13,color:'var(--text-secondary)'}}>Click and speak your job description aloud</div>
            </div>
            <textarea value={rawText} onChange={e=>setRawText(e.target.value)} rows={5} placeholder="Spoken text will appear here — edit if needed…" style={{padding:'12px 14px',resize:'vertical',fontSize:13}}/>
          </div>
        )}

        {/* Link to Job Position */}
        <div style={{display:'flex',gap:12,alignItems:'center',marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)'}}>
          <label style={{fontSize:13,color:'var(--text-muted)',whiteSpace:'nowrap'}}>Link to Hiring Position (optional):</label>
          <select value={selectedJobId} onChange={e=>setSelectedJobId(e.target.value)} style={{padding:'8px 12px',width:'auto',flex:1}}>
            <option value="">— Select position to save criteria —</option>
            {jobTitles.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleParse} style={{marginTop:16,padding:'13px 28px',fontSize:14}}>
          <Wand2 size={16}/> Extract Criteria Card
        </button>
      </div>

      {/* ── Criteria Card ── */}
      {parsed && (
        <div className="card" style={{padding:28,marginBottom:20,border:`1px solid ${confirmed?'rgba(16,185,129,0.4)':'rgba(99,102,241,0.4)'}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
            <div>
              <h3 style={{fontWeight:800,fontSize:18,marginBottom:4}}>📋 Criteria Card</h3>
              <p style={{fontSize:13,color:'var(--text-secondary)'}}>Review and edit before confirming. Matching cannot begin until confirmed.</p>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setEditParsed(!editParsed)} className="btn btn-ghost" style={{fontSize:12}}><Edit3 size={13}/> Edit</button>
              {confirmed&&<span className="badge badge-success" style={{padding:'8px 14px',fontSize:12}}>✅ Confirmed</span>}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16,marginBottom:20}}>
            {[
              ['🎯 Extracted Title', parsed.extractedTitle||'(not detected)', 'var(--accent-light)'],
              ['👤 Experience Level', parsed.experienceLevel, 'var(--purple)'],
              ['🎓 Education', parsed.education, 'var(--info)'],
              ['📅 Min Years', `${parsed.minYears}+ years`, 'var(--success)'],
              ['💼 Work Type', parsed.workType||'Any', 'var(--warning)'],
              ['🔑 Keywords', `${parsed.keywords?.length||0} found`, 'var(--text-secondary)'],
            ].map(([label,value,color])=>(
              <div key={label} style={{padding:14,background:'var(--bg-secondary)',borderRadius:10,border:'1px solid var(--border)'}}>
                <div style={{fontSize:11,color:'var(--text-muted)',fontWeight:600,marginBottom:6}}>{label}</div>
                <div style={{fontWeight:700,fontSize:15,color}}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',marginBottom:8}}>REQUIRED SKILLS</div>
            {editParsed
              ? <textarea value={editSkillText} onChange={e=>setEditSkillText(e.target.value)} rows={2} style={{padding:'8px 12px',fontSize:13,resize:'vertical'}} placeholder="React, Node.js, Python…"/>
              : <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{parsed.requiredSkills.map(s=><span key={s} className="badge badge-accent">{s}</span>)}{parsed.requiredSkills.length===0&&<span style={{color:'var(--text-muted)',fontSize:13}}>None detected — type them above and re-parse</span>}</div>
            }
          </div>

          {parsed.niceSkills?.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',marginBottom:8}}>NICE-TO-HAVE SKILLS</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{parsed.niceSkills.map(s=><span key={s} className="badge badge-success">{s}</span>)}</div>
            </div>
          )}

          {parsed.keywords?.length>0&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',marginBottom:8}}>KEYWORDS</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{parsed.keywords.map(k=><span key={k} className="badge badge-info">{k}</span>)}</div>
            </div>
          )}

          {/* Mandatory Confirmation Gate */}
          {!confirmed
            ? (
              <div style={{padding:20,background:'rgba(99,102,241,0.08)',border:'2px solid rgba(99,102,241,0.3)',borderRadius:'var(--radius-lg)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700,marginBottom:4}}>⚠️ Confirmation Required</div>
                  <div style={{fontSize:13,color:'var(--text-secondary)'}}>AI matching cannot begin until you confirm the criteria above.</div>
                </div>
                <button className="btn btn-primary" onClick={handleConfirm} style={{padding:'13px 28px',fontSize:14,background:'linear-gradient(135deg,#10b981,#059669)'}}>
                  <Check size={16}/> Confirm Criteria
                </button>
              </div>
            ) : (
              <div style={{padding:20,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'var(--radius-lg)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700,color:'var(--success)',marginBottom:4}}>✅ Criteria confirmed</div>
                  <div style={{fontSize:13,color:'var(--text-secondary)'}}>You can now run the AI engine against these requirements.</div>
                </div>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <button className="btn btn-ghost" onClick={()=>setConfirmed(false)} style={{fontSize:13}}><X size={14}/> Revise</button>
                  <button className="btn btn-primary" onClick={()=>setActiveView('screening')} style={{padding:'14px 28px',fontSize:15,background:'linear-gradient(135deg,#10b981,#059669)',boxShadow:'0 10px 20px rgba(16,185,129,0.2)'}}>
                    Next Step: Run AI Screening →
                  </button>
                </div>
              </div>
            )
          }
        </div>
      )}

      {/* Currently Active */}
      {activeCriteria?.rawText&&!parsed&&(
        <div style={{padding:16,background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'var(--radius-lg)'}}>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:6,fontWeight:600}}>CURRENTLY ACTIVE CRITERIA</div>
          <div style={{fontSize:13,color:'var(--text-secondary)',fontStyle:'italic'}}>"{activeCriteria.rawText.slice(0,120)}…"</div>
          <div style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
            <span className="badge badge-accent">{activeCriteria.experienceLevel}</span>
            {activeCriteria.requiredSkills?.slice(0,5).map(s=><span key={s} className="badge badge-success">{s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
