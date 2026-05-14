import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(persist(
  (set, get) => ({
    // ── Resumes ──────────────────────────────────────────────
    resumes: [],
    addResumes: (list) => set(s => ({
      resumes: [...s.resumes, ...list.filter(r => !s.resumes.find(e => e.id === r.id))]
    })),
    updateResume: (id, data) => set(s => ({
      resumes: s.resumes.map(r => r.id === id ? { ...r, ...data } : r)
    })),
    deleteResume: (id) => set(s => ({ resumes: s.resumes.filter(r => r.id !== id) })),
    clearResumes: () => set({ resumes: [] }),

    // ── Hiring Positions (for criteria/screening) ─────────────
    jobTitles: [
      { id: 'jt1', title: 'Software Engineer', department: 'Engineering', color: '#6366f1' },
      { id: 'jt2', title: 'Data Scientist', department: 'Analytics', color: '#a855f7' },
      { id: 'jt3', title: 'Product Manager', department: 'Product', color: '#06b6d4' },
      { id: 'jt4', title: 'UX Designer', department: 'Design', color: '#ec4899' },
      { id: 'jt5', title: 'DevOps Engineer', department: 'Infrastructure', color: '#10b981' },
      { id: 'jt6', title: 'Marketing Manager', department: 'Marketing', color: '#f59e0b' },
    ],
    addJobTitle: (j) => set(s => ({ jobTitles: [...s.jobTitles, j] })),
    updateJobTitle: (id, data) => set(s => ({ jobTitles: s.jobTitles.map(j => j.id === id ? { ...j, ...data } : j) })),
    deleteJobTitle: (id) => set(s => ({ jobTitles: s.jobTitles.filter(j => j.id !== id) })),

    // ── Criteria ──────────────────────────────────────────────
    criteria: {},                   // { [jobId]: criteriaObject }
    activeCriteria: null,           // currently confirmed criteria for screening
    setCriteria: (jobId, c) => set(s => ({ criteria: { ...s.criteria, [jobId]: c } })),
    setActiveCriteria: (c) => set({ activeCriteria: c }),

    // ── Screening ─────────────────────────────────────────────
    screeningResults: {},           // { [jobId]: ScoredResume[] }
    screeningHistory: [],           // [ { id, name, date, jobTitle, count, topScore } ]
    setScreeningResults: (jobId, results) => set(s => ({
      screeningResults: { ...s.screeningResults, [jobId]: results }
    })),
    saveRunToHistory: (run) => set(s => ({
      screeningHistory: [run, ...s.screeningHistory].slice(0, 20)
    })),

    // ── Reports ───────────────────────────────────────────────
    savedReports: {},               // { [jobId]: reportText }
    saveReport: (jobId, report) => set(s => ({ savedReports: { ...s.savedReports, [jobId]: report } })),

    // ── UI State ──────────────────────────────────────────────
    activeView: 'dashboard',
    setActiveView: (v) => set({ activeView: v }),
    selectedJobId: null,
    setSelectedJobId: (id) => set({ selectedJobId: id }),
  }),
  {
    name: 'hireiq-v3',
    partialize: s => ({
      resumes: s.resumes,
      jobTitles: s.jobTitles,
      criteria: s.criteria,
      screeningHistory: s.screeningHistory,
      savedReports: s.savedReports,
    })
  }
));

export default useStore;
