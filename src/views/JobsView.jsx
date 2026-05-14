import React, { useState } from 'react';
import useStore from '../store/useStore';
import { generateId, parseCriteriaText } from '../utils/resumeUtils';
import { Plus, Pencil, Trash2, Briefcase, Users, X, Check, Upload, Mic, Image, FileText, Wand2 } from 'lucide-react';

const DEPT_COLORS = { Engineering: '#6366f1', Analytics: '#a855f7', Design: '#ec4899', Product: '#06b6d4', Infrastructure: '#10b981', Marketing: '#f59e0b', HR: '#ef4444', Finance: '#f97316' };

const PREDEFINED = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
  'DevOps Engineer', 'Full Stack Developer', 'Machine Learning Engineer',
  'Backend Developer', 'Frontend Developer', 'Mobile Developer',
  'QA Engineer', 'Business Analyst', 'Marketing Manager', 'HR Manager',
  'Data Analyst', 'Cybersecurity Engineer', 'Cloud Engineer',
];

const CRITERIA_EXAMPLES = [
  "Need 3+ years experience in React and Node.js. Must have Bachelor's degree. Keywords: REST API, microservices.",
  "Senior Data Scientist with 5 years experience. Skills: Python, TensorFlow, SQL. Masters or PhD preferred.",
  "Entry level UX Designer. Skills: Figma, Adobe XD. Bachelors in Design.",
  "DevOps Engineer with Docker, Kubernetes, AWS experience. 2+ years. CI/CD knowledge required.",
];

export default function JobsView() {
  const { jobTitles, addJobTitle, updateJobTitle, deleteJobTitle, resumes, criteria, setCriteria } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', department: 'Engineering', color: '#6366f1' });
  const [inputMode, setInputMode] = useState('predefined');
  const [openCriteriaId, setOpenCriteriaId] = useState(null);

  const jobResumes = (jobId) => resumes.filter(r => r.assignedJobId === jobId);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    if (editId) { updateJobTitle(editId, form); setEditId(null); }
    else addJobTitle({ id: generateId(), ...form });
    setForm({ title: '', department: 'Engineering', color: '#6366f1' });
    setShowAdd(false);
  };

  const startEdit = (job) => {
    setForm({ title: job.title, department: job.department, color: job.color });
    setEditId(job.id);
    setShowAdd(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach(title => addJobTitle({ id: generateId(), title, department: 'Engineering', color: '#6366f1' }));
      alert(`✅ Added ${lines.length} job titles from file`);
    };
    reader.readAsText(file);
  };

  const handleAudio = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Try Chrome.'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.onresult = (e) => setForm(f => ({ ...f, title: e.results[0][0].transcript }));
    rec.start();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Job Positions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage positions · Set screening criteria · Track candidates</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ title: '', department: 'Engineering', color: '#6366f1' }); }}>
          <Plus size={16} /> Add Position
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAdd && (
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{editId ? 'Edit Position' : 'New Job Position'}</h3>

          {/* Input Mode */}
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Define Title Via</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {[['predefined','✨ Predefined'],['type','⌨️ Type'],['paste','📋 Paste'],['file','📄 File'],['image','🖼️ Image'],['audio','🎤 Audio']].map(([id, label]) => (
              <button key={id} onClick={() => setInputMode(id)} style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid',
                borderColor: inputMode === id ? 'var(--accent)' : 'var(--border)',
                background: inputMode === id ? 'rgba(99,102,241,0.15)' : 'var(--bg-glass)',
                color: inputMode === id ? 'var(--accent-light)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif',
              }}>{label}</button>
            ))}
          </div>

          {inputMode === 'predefined' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PREDEFINED.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, title: t }))} style={{
                    padding: '7px 16px', borderRadius: 20, border: '1px solid',
                    borderColor: form.title === t ? 'var(--accent)' : 'var(--border)',
                    background: form.title === t ? 'rgba(99,102,241,0.15)' : 'var(--bg-glass)',
                    color: form.title === t ? 'var(--accent-light)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif',
                  }}>{t}</button>
                ))}
              </div>
              {form.title && <div style={{ marginTop: 10, padding: '8px 14px', background: 'rgba(99,102,241,0.1)', borderRadius: 8, fontSize: 13, color: 'var(--accent-light)' }}>Selected: <strong>{form.title}</strong></div>}
            </div>
          )}

          {(inputMode === 'type' || inputMode === 'paste') && (
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder={inputMode === 'paste' ? 'Paste job title here...' : 'Type job title...'}
              style={{ padding: '12px 16px', marginBottom: 16 }} />
          )}

          {inputMode === 'file' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: '1px dashed var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                <input type="file" accept=".txt,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                <Upload size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Upload text/CSV file</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>One job title per line — all will be added</div>
                </div>
              </label>
            </div>
          )}

          {inputMode === 'image' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: '1px dashed var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={() => alert('OCR: In production, Google Vision API extracts text from uploaded JD image.')} style={{ display: 'none' }} />
                <Image size={20} color="var(--purple)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Upload JD image</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>OCR extracts job title from the image</div>
                </div>
              </label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Or type manually..." style={{ padding: '12px 16px', marginTop: 8 }} />
            </div>
          )}

          {inputMode === 'audio' && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <button className="btn btn-primary" onClick={handleAudio} style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)' }}>
                <Mic size={16} /> Speak Title
              </button>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Spoken title appears here..." style={{ padding: '12px 16px', flex: 1 }} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end', marginTop: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Department</label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={{ padding: '10px 12px' }}>
                {Object.keys(DEPT_COLORS).map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.values(DEPT_COLORS).map(c => (
                  <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '2px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleAdd}><Check size={16} />{editId ? 'Update' : 'Add'}</button>
              <button className="btn btn-ghost" onClick={() => { setShowAdd(false); setEditId(null); }}><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Job Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
        {jobTitles.map(job => {
          const count = jobResumes(job.id).length;
          const hasCriteria = criteria[job.id]?.rawText;
          const isOpen = openCriteriaId === job.id;

          return (
            <div key={job.id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${job.color}` }}>
              <div style={{ padding: '20px 20px 16px', background: `linear-gradient(135deg,${job.color}10,transparent)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${job.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={22} color={job.color} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost" style={{ padding: 7, minWidth: 0 }} onClick={() => startEdit(job)}><Pencil size={14} /></button>
                    <button className="btn btn-danger" style={{ padding: 7, minWidth: 0 }} onClick={() => deleteJobTitle(job.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: `${job.color}22`, color: job.color, fontWeight: 600 }}>{job.department}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {count}</span>
                  {hasCriteria && <span className="badge badge-success" style={{ fontSize: 10 }}>✅ Criteria Set</span>}
                </div>
              </div>

              {/* Criteria Toggle */}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={() => setOpenCriteriaId(isOpen ? null : job.id)} style={{
                  width: '100%', padding: '11px 20px', background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  color: isOpen ? 'var(--accent-light)' : 'var(--text-secondary)',
                  fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600,
                }}>
                  <Wand2 size={15} />
                  {hasCriteria ? 'Edit Screening Criteria' : 'Set Screening Criteria'}
                  <span style={{ marginLeft: 'auto', fontSize: 16 }}>{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && <CriteriaPanel job={job} criteria={criteria[job.id]} setCriteria={c => setCriteria(job.id, c)} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Criteria Panel — Type Naturally ─────────────────────────────────────────
function CriteriaPanel({ job, criteria, setCriteria }) {
  const [text, setText] = useState(criteria?.rawText || '');
  const [parsed, setParsed] = useState(criteria || null);
  const [example, setExample] = useState('');

  const handleParse = () => {
    const c = parseCriteriaText(text);
    setParsed(c);
    setCriteria(c);
    alert('✅ Criteria saved and parsed!');
  };

  const fillExample = (ex) => { setText(ex); setExample(ex); setParsed(null); };

  return (
    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
      <div style={{ paddingTop: 16, marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          TYPE CRITERIA IN PLAIN ENGLISH ✍️
        </label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
          placeholder={`Example:\n"Need 3+ years in React and Node.js. Must have Bachelor's degree. Keywords: REST API, microservices."`}
          style={{ padding: '12px 14px', width: '100%', resize: 'vertical', lineHeight: 1.6, fontSize: 13 }} />
      </div>

      {/* Quick Examples */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>QUICK FILL EXAMPLES:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {CRITERIA_EXAMPLES.slice(0, 2).map((ex, i) => (
            <button key={i} onClick={() => fillExample(ex)} style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-glass)', color: 'var(--text-secondary)',
              cursor: 'pointer', textAlign: 'left', fontSize: 11,
              fontFamily: 'Inter,sans-serif',
            }}>💡 {ex.slice(0, 60)}...</button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleParse} style={{ width: '100%', justifyContent: 'center' }}>
        <Wand2 size={15} /> Parse & Save Criteria
      </button>

      {/* Parsed Preview */}
      {parsed && (
        <div style={{ marginTop: 14, padding: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>✅ Parsed Criteria</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Level:</span> <strong>{parsed.experienceLevel}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Education:</span> <strong>{parsed.education}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Min Years:</span> <strong>{parsed.minYears}+</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Keywords:</span> <strong>{parsed.keywords?.length || 0}</strong></div>
          </div>
          {parsed.requiredSkills?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>REQUIRED SKILLS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {parsed.requiredSkills.map(s => <span key={s} className="badge badge-accent" style={{ fontSize: 10 }}>{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
