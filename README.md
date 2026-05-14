# HireIQ - Autonomous AI Resume Screening Pipeline

HireIQ is a robust, production-ready AI Resume Screener that autonomously parses, categorizes, and evaluates hundreds of applicant resumes against specific job criteria using native LLM vision capabilities. 

Built specifically to replace unreliable regex-based parsers, this system uses **Google Gemini Flash Native Vision** to deeply understand resume layouts, contexts, and semantic skill relationships.

---

## 🧠 Core Architecture & Technical Implementation

### 1. LLM-Native Document Ingestion
Unlike traditional systems that rely on OCR libraries or raw text scraping (which breaks formatting), HireIQ feeds raw Base64 PDFs and Images directly into **Google Gemini 1.5 Flash / 2.0 Flash**. The AI "sees" the document exactly as a recruiter does, ensuring that sidebars, complex tables, and creative layouts don't corrupt the data extraction.

### 2. Bulletproof AI Constraint Engineering
To prevent LLM hallucinations, the pipeline uses strict prompt engineering coupled with **Javascript Hard-Overrides**:
- **JSON Enforcement:** The LLM is forced to return highly structured JSON. A robust Regex layer (`/\{[\s\S]*\}/`) intercepts the response to strip conversational padding.
- **Bi-Directional Post-Processing:** The AI is strictly bound to HR business logic. For example, a candidate is *only* tagged as an "Intern" if their resume timeline explicitly contains `[\-\–\—]\s*(present|current|now)`. If the AI falsely assigns an Intern tag to a past internship, the JS interceptor overrides the AI and forces the tag to `Fresher`. 

### 3. Deep-Scan Skill Matching Engine
Standard exact-match string arrays fail when a candidate writes "Machine Learning Algorithms" and the required skill is "Machine Learning".
- **Substring Normalization:** Both the extracted skills and required skills are stripped of special characters and lowercased for partial substring matching.
- **Deep Document Fallback:** If the LLM entirely misses a skill and fails to include it in the JSON array, the `evaluateResume` engine executes a raw text scan against the entire document string. This provides a **100% guarantee** that if a required skill physically exists in the document, it will be matched.

### 4. Resilient Network & API Handling
To deal with rate limits and temporary outages:
- **Exponential Backoff:** The `parseResumeData` fetch loop intercepts `429 (Rate Limit)` and `5xx (Service Unavailable)` errors, automatically doubling the wait time and retrying in the background. This ensures that batch uploads of hundreds of resumes don't crash due to API quota exhaustion.

---

## 💻 Frontend & UI/UX

- **Hierarchical Library:** Resumes are automatically clustered by `Auto-Extracted Job Title` ➔ `Experience Level` (Fresher, Junior, Mid, Senior, Lead).
- **Intelligent Scoring Matrix:** Candidates are scored out of 100 based on weighted metrics: Skills (35%), Experience (25%), Title Relevance (30%), and Impact/Education (10%).
- **Markdown Reporting:** Generates downloadable plain-text tables summarizing candidate ranks, missed skills, and recruiter verdicts for easy pasting into Notion or JIRA.

---

## 🚀 Setup & Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/ragasudhasel/Resume-analyzer.git
   cd Resume-analyzer
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables:**
   Create a \`.env\` file in the root directory and add your Google Gemini API key:
   \`\`\`env
   VITE_GEMINI_API_KEY=your_api_key_here
   \`\`\`

4. **Run the Development Server:**
   \`\`\`bash
   npm run dev
   \`\`\`

---

*This application was architected for strict data extraction reliability, leveraging AI for semantic understanding while utilizing deterministic programming to enforce business logic constraints.*
