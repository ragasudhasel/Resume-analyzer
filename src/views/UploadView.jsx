import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import useStore from '../store/useStore';
import { generateId, extractTextFromFile, parseResumeData, fileToBase64 } from '../utils/resumeUtils';
import { generateDemoResumes } from '../utils/demoData';
import { Upload, Folder, Link, CheckCircle, AlertCircle, Loader, X, Pencil, Zap, BarChart2, FileText, Image } from 'lucide-react';

const TITLE_OPTIONS=['Full Stack Developer','Frontend Developer','Backend Developer','Software Engineer','Data Scientist','Data Analyst','ML Engineer','DevOps Engineer','Cloud Engineer','Mobile Developer','Android Developer','iOS Developer','Flutter Developer','UX Designer','UI/UX Designer','Product Manager','Business Analyst','QA Engineer','Cybersecurity Engineer','Blockchain Developer','Game Developer','Embedded Engineer','HR Specialist','Marketing Manager','General'];

export default function UploadView() {
  const { addResumes, setActiveView } = useStore();
  const [tab, setTab] = useState('drop');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ total:0, parsed:0, failed:0 });
  const [processing, setProcessing] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [editId, setEditId] = useState(null);

  const processFiles = async (files) => {
    setProcessing(true);
    const arr = Array.from(files);
    setStats({ total: arr.length, parsed:0, failed:0, current: 0 });
    const out=[];
    for (let i=0;i<arr.length;i++) {
      setStats(s => ({...s, current: i + 1}));
      const file=arr[i];
      let r;
      try {
        let fileData = null;
        let textContent = '';
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          // New flawless inline extraction
          fileData = await fileToBase64(file);
        } else {
          // Fallback text extraction for txt/docx
          textContent = await extractTextFromFile(file);
        }
        
        // Call the new Gemini API parser with native PDF understanding
        const parsed = await parseResumeData(fileData, textContent, file.name);
        r = { id:generateId(), fileName:file.name, fileSize:file.size, fileType:file.type, uploadedAt:new Date().toISOString(), source:'upload', status:'parsed', ...parsed };
        out.push(r);
        setStats(s=>({...s, parsed:s.parsed+1}));
      } catch(e) {
        r = { id:generateId(), fileName:file.name, name:file.name, status:'error', error:e.message };
        out.push(r);
        setStats(s=>({...s, failed:s.failed+1}));
      }
      setResults(prev=>[r,...prev]);
      
      // Delay to respect Gemini Free Tier 15 RPM limit (4 seconds per file)
      if (i < arr.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    }
    addResumes(out);
    setProcessing(false);
  };

  const onDrop = useCallback(accepted => processFiles(accepted), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple:true,
    accept:{ 'application/pdf':['.pdf'],'text/plain':['.txt'],'application/msword':['.doc'],'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx'],'image/*':['.png','.jpg','.jpeg'] }
  });

  const handleDrive = () => {
    if(!driveLink.trim()) return;
    const r={ id:generateId(), fileName:'drive_import.pdf', name:'Drive Import', email:'', phone:'', experienceLevel:'Mid-Level', subCategory:'Experience', jobTitle:'Software Engineer', skills:[], education:'Bachelors', expYears:2, text:'', source:'drive', status:'parsed', impact:null, uploadedAt:new Date().toISOString(), driveLink };
    addResumes([r]); setResults(prev=>[r,...prev]); setDriveLink('');
    setStats(s=>({...s,total:s.total+1,parsed:s.parsed+1}));
    alert('Drive link saved (full auto-import requires server-side Google Drive API with OAuth).');
  };

  const loadDemo = () => { const d=generateDemoResumes(); addResumes(d); setResults(d); setStats({total:d.length,parsed:d.length,failed:0}); };
  const updateTitle=(id,title)=>setResults(prev=>prev.map(r=>r.id===id?{...r,jobTitle:title}:r));
  const success=results.filter(r=>r.status!=='error');
  const failed=results.filter(r=>r.status==='error');

  return (
    <div style={{maxWidth:900,margin:'0 auto'}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:6}}>Upload Resumes</h1>
        <p style={{color:'var(--text-secondary)',fontSize:14}}>Job titles are <strong style={{color:'var(--accent-light)'}}>auto-extracted</strong> from each resume's career summary · Correct any wrong detections below</p>
      </div>

      {/* Demo Button */}
      <div style={{marginBottom:20,padding:'16px 20px',borderRadius:'var(--radius-lg)',background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.05))',border:'1px solid rgba(99,102,241,0.2)',display:'flex',alignItems:'center',gap:16}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,marginBottom:3}}>🧪 Load Demo Resumes</div>
          <div style={{fontSize:13,color:'var(--text-secondary)'}}>8 realistic resumes: Full Stack Dev, Data Scientist, DevOps, ML Engineer, UX Designer, QA, Android Dev, Backend Dev</div>
        </div>
        <button className="btn btn-primary" onClick={loadDemo} style={{background:'linear-gradient(135deg,#a855f7,#6366f1)',whiteSpace:'nowrap'}}><Zap size={15}/> Load Demo</button>
      </div>

      {/* Live Dashboard */}
      {(processing || stats.total>0) && (
        <div className="card" style={{padding:'16px 20px',marginBottom:20,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {[['Total Files',stats.total,'var(--accent-light)'],['✅ Parsed',stats.parsed,'var(--success)'],['❌ Failed',stats.failed,'var(--danger)']].map(([l,v,c])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="tab-nav" style={{marginBottom:18,maxWidth:360}}>
        {[['drop','Drop Zone'],['browse','Browse Files'],['drive','Drive Link']].map(([id,label])=>(
          <button key={id} className={`tab-btn ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {tab==='drop' && (
        <div {...getRootProps()} className={`drop-zone ${isDragActive?'dragging':''}`} style={{marginBottom:20}}>
          <input {...getInputProps()}/>
          <div style={{pointerEvents:'none'}}>
            <div style={{width:64,height:64,borderRadius:18,background:'rgba(99,102,241,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><Upload size={28} color="var(--accent-light)"/></div>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{isDragActive?'🎯 Drop here!':'Drag & Drop Resumes'}</h3>
            <p style={{color:'var(--text-secondary)',marginBottom:12,fontSize:14}}>Supports PDF, DOCX, TXT, PNG, JPG — hundreds of files at once</p>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
              {['PDF','DOCX','TXT','PNG','JPG'].map(f=><span key={f} className="badge badge-accent">{f}</span>)}
            </div>
          </div>
        </div>
      )}

      {tab==='browse' && (
        <label style={{display:'block',padding:40,border:'2px dashed var(--border)',borderRadius:'var(--radius-xl)',textAlign:'center',cursor:'pointer',marginBottom:20}}
          onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
          <input type="file" multiple accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" onChange={e=>processFiles(e.target.files)} style={{display:'none'}}/>
          <Folder size={36} color="var(--accent-light)" style={{display:'block',margin:'0 auto 12px'}}/>
          <h3 style={{fontWeight:600,marginBottom:6}}>Browse & Select Files</h3>
          <p style={{color:'var(--text-secondary)',fontSize:14}}>Pick hundreds of files at once · PDF, DOCX, TXT, Images</p>
        </label>
      )}

      {tab==='drive' && (
        <div className="card" style={{padding:24,marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            <Link size={20} color="var(--info)"/>
            <div><h3 style={{fontWeight:700}}>Google Drive Folder</h3><p style={{fontSize:13,color:'var(--text-secondary)'}}>Paste a shared folder link to import all resumes</p></div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <input value={driveLink} onChange={e=>setDriveLink(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." style={{padding:'11px 14px',flex:1}}/>
            <button className="btn btn-primary" onClick={handleDrive}><Link size={15}/> Import</button>
          </div>
          <p style={{fontSize:12,color:'var(--text-muted)',marginTop:10}}>⚠️ Full auto-import requires server-side OAuth integration</p>
        </div>
      )}

      {/* Processing indicator */}
      {processing && (
        <div className="card" style={{padding:18,marginBottom:18,display:'flex',alignItems:'center',gap:14}}>
          <Loader size={20} color="var(--accent)" style={{animation:'spin 1s linear infinite'}}/>
          <div><div style={{fontWeight:600}}>Analyzing {stats.current} of {stats.total}...</div></div>
        </div>
      )}

      {/* Results */}
      {results.length>0 && (
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div>
              <h2 style={{fontWeight:800,fontSize:18}}>{success.length} Resumes Processed</h2>
              <p style={{fontSize:13,color:'var(--accent-light)'}}>✏️ Click the pencil icon to correct a wrong job title</p>
            </div>
            <button className="btn btn-ghost" style={{fontSize:12}} onClick={()=>setResults([])}><X size={13}/> Clear</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {results.map(r=>(
              <div key={r.id} className="card" style={{padding:'14px 18px'}}>
                {r.status==='error'
                  ? <div style={{display:'flex',gap:10,alignItems:'center'}}><AlertCircle size={17} color="var(--danger)"/><span style={{fontSize:13,color:'var(--danger)'}}>{r.fileName} — failed to parse</span></div>
                  : (
                    <div style={{display:'flex',alignItems:'flex-start',gap:14,flexWrap:'wrap'}}>
                      <div style={{width:42,height:42,borderRadius:11,background:'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(168,85,247,0.2))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{color:'var(--accent-light)',fontWeight:800,fontSize:16}}>{(r.name||'?')[0].toUpperCase()}</span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{r.name||r.fileName}</div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                          <span style={{fontSize:11,color:'var(--text-muted)',fontWeight:600}}>AUTO-DETECTED:</span>
                          {editId===r.id
                            ? <select defaultValue={r.jobTitle} onChange={e=>{updateTitle(r.id,e.target.value);setEditId(null);}} style={{padding:'4px 8px',fontSize:13,width:'auto',borderColor:'var(--accent)'}}>
                                {TITLE_OPTIONS.map(t=><option key={t} value={t}>{t}</option>)}
                              </select>
                            : <><span style={{fontSize:13,fontWeight:700,color:'var(--accent-light)',padding:'3px 10px',background:'rgba(99,102,241,0.15)',borderRadius:20,border:'1px solid rgba(99,102,241,0.3)'}}>{r.jobTitle||'General'}</span>
                                <button onClick={()=>setEditId(r.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',padding:2}}><Pencil size={12}/></button></>
                          }
                        </div>
                        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                          <span className="badge badge-success">{r.experienceLevel}</span>
                          <span className="badge badge-accent">{r.education}</span>
                          {r.impact&&<span className={`badge ${r.impact==='High'?'badge-success':r.impact==='Medium'?'badge-warning':'badge-danger'}`}>{r.impact} Impact</span>}
                          {r.skills?.length>0&&<span className="badge badge-purple">{r.skills.length} skills</span>}
                          {r.expYears>0&&<span className="badge badge-info">{r.expYears}y exp</span>}
                        </div>
                        {r.skills?.length>0&&<div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{r.skills.slice(0,8).map(s=><span key={s} className="tag" style={{fontSize:11}}>{s}</span>)}{r.skills.length>8&&<span className="tag" style={{fontSize:11}}>+{r.skills.length-8}</span>}</div>}
                      </div>
                      <CheckCircle size={17} color="var(--success)" style={{flexShrink:0,marginTop:4}}/>
                    </div>
                  )
                }
              </div>
            ))}
          </div>
          <div style={{marginTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius-lg)'}}>
            <div>
              <div style={{fontWeight:700, color:'var(--success)', marginBottom:4, fontSize: 15}}>✅ {stats.total} Resumes Uploaded & Parsed</div>
              <div style={{fontSize:13, color:'var(--text-secondary)'}}>Are all resumes uploaded? Proceed to view the organized library.</div>
            </div>
            <button className="btn btn-primary" onClick={() => setActiveView('library')} style={{padding:'14px 28px', fontSize:15, background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 10px 20px rgba(16,185,129,0.2)'}}>
              Yes, Next Step: View Library →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
