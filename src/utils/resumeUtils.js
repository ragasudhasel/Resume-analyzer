// ── Helpers ───────────────────────────────────────────────────────────────────
export const generateId = () => Math.random().toString(36).substr(2,9) + Date.now().toString(36);
export const stringToColor = (s='') => {
  let h=0; for(let i=0;i<s.length;i++) h=s.charCodeAt(i)+((h<<5)-h);
  return ['#6366f1','#a855f7','#06b6d4','#ec4899','#10b981','#f59e0b','#ef4444','#f97316'][Math.abs(h)%8];
};
export const getScoreColor = s => s>=80?'#10b981':s>=60?'#f59e0b':s>=40?'#f97316':'#ef4444';
export const getScoreLabel = s => s>=80?'Strong Match':s>=60?'Good Match':s>=40?'Partial Match':'Weak Match';
export const getScoreTier  = s => s>=80?'strong':s>=60?'good':s>=40?'partial':'weak';

// ── PDF Text Extraction ────────────────────────────────────────────────────────
function extractStringsFromPDF(buf) {
  const arr = new Uint8Array(buf);
  const raw = new TextDecoder('latin1').decode(arr);
  const btEt = [...raw.matchAll(/BT([\s\S]{1,3000}?)ET/g)].map(m=>m[1]);
  let out = '';
  for (const blk of btEt) {
    [...blk.matchAll(/\(([^)]{1,300})\)\s*Tj/g)].forEach(m=>{ out+=m[1]+' '; });
    [...blk.matchAll(/\[([^\]]{1,600})\]\s*TJ/g)].forEach(m=>{
      out += [...m[1].matchAll(/\(([^)]{1,100})\)/g)].map(x=>x[1]).join('')+' ';
    });
  }
  if (out.trim().length<80) {
    let run='',res='';
    for (let i=0;i<arr.length;i++){const c=arr[i];if(c>=32&&c<=126){run+=String.fromCharCode(c);}else{if(run.length>=4)res+=run+' ';run='';}}
    out=res;
  }
  return out.replace(/\s+/g,' ').trim();
}

export async function extractTextFromFile(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    const isPDF = file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
    const isImg = file.type.startsWith('image/');
    if (isPDF) {
      r.onload = e => resolve(extractStringsFromPDF(e.target.result)||`[PDF] ${file.name}`);
      r.readAsArrayBuffer(file);
    } else if (isImg) {
      // Images: return filename as hint, OCR not available client-side
      resolve(`[IMAGE RESUME] ${file.name} — image content requires server-side OCR`);
    } else {
      r.onload = e => resolve(e.target.result||'');
      r.readAsText(file);
    }
  });
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({ mimeType: file.type || 'application/pdf', data: base64 });
    };
    reader.onerror = error => reject(error);
  });
}

// ── Job Title Map (60+ patterns) ──────────────────────────────────────────────
const JT_MAP = [
  ['full stack developer','Full Stack Developer'],['fullstack developer','Full Stack Developer'],
  ['full-stack developer','Full Stack Developer'],['full stack engineer','Full Stack Developer'],
  ['frontend developer','Frontend Developer'],['front end developer','Frontend Developer'],
  ['front-end developer','Frontend Developer'],['ui developer','Frontend Developer'],
  ['react developer','React Developer'],['vue developer','Vue Developer'],
  ['angular developer','Angular Developer'],['next.js developer','Next.js Developer'],
  ['backend developer','Backend Developer'],['back end developer','Backend Developer'],
  ['back-end developer','Backend Developer'],['server side developer','Backend Developer'],
  ['node.js developer','Node.js Developer'],['nodejs developer','Node.js Developer'],
  ['java developer','Java Developer'],['java engineer','Java Developer'],
  ['python developer','Python Developer'],['python engineer','Python Developer'],
  ['php developer','PHP Developer'],['ruby developer','Ruby Developer'],
  ['golang developer','Go Developer'],['rust developer','Rust Developer'],
  ['software engineer','Software Engineer'],['software developer','Software Developer'],
  ['web developer','Web Developer'],['application developer','Software Developer'],
  ['machine learning engineer','ML Engineer'],['ml engineer','ML Engineer'],
  ['ai engineer','AI Engineer'],['artificial intelligence','AI Engineer'],
  ['deep learning engineer','ML Engineer'],['nlp engineer','NLP Engineer'],
  ['computer vision engineer','Computer Vision Engineer'],
  ['data scientist','Data Scientist'],['data analyst','Data Analyst'],
  ['data engineer','Data Engineer'],['business intelligence','BI Analyst'],
  ['research scientist','Research Scientist'],['research engineer','Research Engineer'],
  ['devops engineer','DevOps Engineer'],['devsecops','DevSecOps Engineer'],
  ['site reliability','SRE Engineer'],['cloud engineer','Cloud Engineer'],
  ['infrastructure engineer','DevOps Engineer'],['platform engineer','Platform Engineer'],
  ['network engineer','Network Engineer'],['cybersecurity','Cybersecurity Engineer'],
  ['security engineer','Security Engineer'],['security analyst','Security Analyst'],
  ['systems administrator','SysAdmin'],['database administrator','DBA'],
  ['mobile developer','Mobile Developer'],['android developer','Android Developer'],
  ['ios developer','iOS Developer'],['flutter developer','Flutter Developer'],
  ['react native developer','React Native Developer'],['xamarin developer','Mobile Developer'],
  ['ux designer','UX Designer'],['ui designer','UI Designer'],
  ['ui/ux designer','UI/UX Designer'],['ux/ui designer','UI/UX Designer'],
  ['product designer','Product Designer'],['graphic designer','Graphic Designer'],
  ['visual designer','Visual Designer'],['motion designer','Motion Designer'],
  ['product manager','Product Manager'],['project manager','Project Manager'],
  ['program manager','Program Manager'],['scrum master','Scrum Master'],
  ['agile coach','Agile Coach'],['business analyst','Business Analyst'],
  ['solutions architect','Solutions Architect'],['system analyst','Systems Analyst'],
  ['qa engineer','QA Engineer'],['quality assurance','QA Engineer'],
  ['test engineer','Test Engineer'],['sdet','SDET'],
  ['automation engineer','Automation Engineer'],['manual tester','QA Engineer'],
  ['blockchain developer','Blockchain Developer'],['smart contract','Blockchain Developer'],
  ['web3 developer','Web3 Developer'],['game developer','Game Developer'],
  ['unity developer','Game Developer'],['unreal developer','Game Developer'],
  ['embedded systems','Embedded Engineer'],['firmware engineer','Firmware Engineer'],
  ['iot engineer','IoT Engineer'],['hardware engineer','Hardware Engineer'],
  ['digital marketing','Digital Marketer'],['marketing manager','Marketing Manager'],
  ['seo specialist','SEO Specialist'],['content writer','Content Writer'],
  ['hr manager','HR Manager'],['human resources','HR Specialist'],
  ['recruiter','Recruiter'],['talent acquisition','Recruiter'],
  ['sales manager','Sales Manager'],['business development','Business Development'],
  ['financial analyst','Financial Analyst'],['accountant','Accountant'],
];

// ── Extract Job Title ─────────────────────────────────────────────────────────
export function extractJobTitleFromResume(raw) {
  if (!raw||raw.length<10) return 'General';
  const text = raw.toLowerCase().replace(/[^a-z0-9\s/.,\-]/g,' ');

  const cleanTitle = (str) => {
    let s = str.replace(/^(?:a|an|the|seeking|looking|for|role|roles|position|as|of|passionate|experienced|aspiring|hardworking|motivated|driven|dedicated|professional|i|am|is|are|to|work|become)\s+/gi, '').trim();
    // Remove trailing 'roles' or 'position'
    s = s.replace(/\s+(?:roles?|positions?)$/i, '').trim();
    // Capitalize words
    s = s.replace(/\b\w/g, c=>c.toUpperCase());
    // Fix acronyms
    s = s.replace(/Ai\b/g, 'AI').replace(/Ml\b/g, 'ML').replace(/Llm\b/g, 'LLM');
    return s;
  };

  // 1. Strict Target Match (Looks specifically for "Seeking AI Engineer role", "Aspiring Data Analyst", etc)
  const targetMatch = raw.match(/(?:seeking|looking for|aspiring|target(?:ing)?|role(?: as a| as an)?|position(?: as a| as an)?)(?:\s+(?:a|an|the|to|become))?\s+([A-Za-z\s\-\/&]+?(?:Engineer|Developer|Scientist|Analyst|Designer|Manager|Specialist|Architect|Consultant|Programmer|Lead|Tester|Administrator|LLM|AI\/ML|AIML|Data|DevOps))\b/i);
  if (targetMatch) {
    const title = cleanTitle(targetMatch[1]);
    if (title.split(' ').length <= 5 && title.length > 3) return title;
  }

  // 2. Summary/objective section scan
  const secM = raw.match(/(?:objective|career objective|professional summary|summary|profile|about me|seeking)[^\n:]{0,20}[:\n]\s*(.{20,500}?)(?:\n\n|\n[A-Z]|skills|education|experience|$)/i);
  if (secM) { 
    const snip=secM[1];
    
    // Dynamic Extraction: look for [Modifiers] [Role]
    const dynamicMatch = snip.match(/\b((?:[A-Za-z]+\s+){0,3}(?:Engineer|Developer|Scientist|Analyst|Designer|Manager|Specialist|Architect|Consultant|Programmer|Lead|Tester|Administrator|LLM|AI\/ML|AIML|Data|DevOps))\b/i);
    if (dynamicMatch) {
      const title = cleanTitle(dynamicMatch[1]);
      if (title.split(' ').length <= 4 && title.length > 3) return title;
    }

    const lSnip=snip.toLowerCase(); 
    for(const[p,t]of JT_MAP) if(lSnip.includes(p)) return t; 
  }

  // 3. Header scan (first 1000 chars)
  const hdr = raw.slice(0, 1000);
  const hdrMatch = hdr.match(/\b((?:[A-Za-z]+\s+){0,3}(?:Engineer|Developer|Scientist|Analyst|Designer|Manager|Specialist|Architect|Consultant|Programmer|Lead|Tester|Administrator|LLM|AI\/ML|AIML|Data|DevOps))\b/i);
  if (hdrMatch) {
    const title = cleanTitle(hdrMatch[1]);
    if (title.split(' ').length <= 4 && title.length > 3) return title;
  }

  // 4. Full text JT_MAP
  for(const[p,t]of JT_MAP) if(text.includes(p)) return t;

  // 4. Skill inference
  const inf={
    'Frontend Developer':['react','angular','vue','html','css','javascript'],
    'Backend Developer':['node','django','spring','express','laravel','flask','fastapi'],
    'ML Engineer':['pandas','numpy','sklearn','tensorflow','pytorch','jupyter'],
    'DevOps Engineer':['docker','kubernetes','jenkins','ansible','terraform','ci/cd'],
    'UX Designer':['figma','sketch','adobe xd','wireframe','prototype'],
    'Android Developer':['android','kotlin','gradle','android studio'],
    'iOS Developer':['ios','swift','xcode','objective-c'],
    'Data Analyst':['excel','tableau','power bi','sql','pivot','matplotlib'],
    'QA Engineer':['selenium','cypress','jest','testing','test cases'],
  };
  let best=null,bestN=0;
  for(const[title,kws]of Object.entries(inf)){const hits=kws.filter(k=>text.includes(k)).length;if(hits>bestN){bestN=hits;best=title;}}
  return bestN>=2?best:'General';
}

// ── Sub-category ──────────────────────────────────────────────────────────────
export function detectSubCategory(text='') {
  const t=text.toLowerCase();
  if(/intern(ship)?|trainee|apprentice|industrial training/.test(t)) return 'Intern';
  if(/work(ed)?\s+(at|with|for)|employed|employment|professional experience|working at|joined|company|pvt\.?\s*ltd|inc\.|corp\./.test(t)||extractExpYears(t)>=1) return 'Experience';
  return 'Project';
}

// ── Experience Level ──────────────────────────────────────────────────────────
export function detectExpLevel(text='',expYears=0) {
  const t=text.toLowerCase();
  // Only classify as Intern if the person IS currently an intern (not someone who once had interns)
  const isCurrentIntern = /(?:seeking|looking for|aspiring).*intern/i.test(t) || /\bintern\b.*\b(?:current|present|ongoing)\b/i.test(t) || /(?:currently|presently).*\bintern\b/i.test(t);
  if(isCurrentIntern && expYears<=0) return 'Intern';
  if(/\btrainee\b/.test(t) && expYears<=0) return 'Intern';

  // Use years if we extracted them
  if(expYears>0){
    if(expYears<=1) return 'Fresher';
    if(expYears<=3) return 'Junior';
    if(expYears<=6) return 'Mid-Level';
    if(expYears<=10) return 'Senior';
    return 'Lead / Principal';
  }

  // No years found — try graduation year
  const gradM=text.match(/(?:graduated|batch|class of|passing year)\s*[:]?\s*(\d{4})/i)||text.match(/(\d{4})\s*(?:graduate|passout|batch)/i);
  if(gradM){const yr=parseInt(gradM[1]),age=new Date().getFullYear()-yr;if(age<=1)return 'Fresher';if(age<=3)return 'Junior';if(age<=6)return 'Mid-Level';return 'Senior';}

  // Check if resume mentions substantial work experience sections
  const hasWork = /\b(?:work experience|professional experience|employment history|work history)\b/i.test(text);
  if(hasWork) return 'Junior'; // At least junior if they have a work section

  return 'Fresher';
}

// ── Impact Level (for Intern/Fresher) ────────────────────────────────────────
export function detectImpact(text='') {
  const t=text.toLowerCase();
  let score=0;
  if(/deployed|live|production|real users|users|published/.test(t)) score+=3;
  if(/github\.com|gitlab\.com|bitbucket/.test(t)) score+=2;
  if(/team lead|led\s+a\s+team|managed\s+a\s+team/.test(t)) score+=2;
  if(/hackathon|open source|contribution|contributor/.test(t)) score+=2;
  if(/certification|certified|aws certified|google certified/.test(t)) score+=2;
  if(/api|microservices|docker|kubernetes|machine learning|tensorflow|pytorch/.test(t)) score+=2;
  if(/e-commerce|payment|authentication|real.?time|websocket/.test(t)) score+=1;
  if(/project|built|developed|created|implemented/.test(t)) score+=1;
  if(/tutorial|clone|basic|simple|todo|hello world/.test(t)) score-=2;
  if(score>=7) return 'High';
  if(score>=3) return 'Medium';
  return 'Low';
}

// ── Skills ────────────────────────────────────────────────────────────────────
// Skills that are safe for simple .includes() matching (multi-word or long enough)
const SAFE_SKILLS=[
  'javascript','typescript','python','golang','kotlin','swift','ruby',
  'react','angular','vue','next.js','svelte','nuxt','gatsby','html','css','sass','tailwind','bootstrap',
  'node.js','express','django','flask','spring boot','spring','fastapi','laravel','asp.net','rails','nestjs',
  'sql','postgresql','mysql','mongodb','redis','elasticsearch','cassandra','graphql','firebase','supabase',
  'aws','azure','gcp','docker','kubernetes','jenkins','terraform','ansible','ci/cd','github actions','linux',
  'machine learning','deep learning','tensorflow','pytorch','scikit-learn','keras','pandas','numpy','opencv',
  'flutter','react native','android','xamarin','jetpack compose',
  'figma','sketch','adobe xd','photoshop','illustrator',
  'git','bash','rest api','microservices','agile','scrum','jira','confluence',
  'tableau','power bi','excel','data analysis','spark','hadoop','kafka','airflow',
  'selenium','cypress','jest','mocha','junit','pytest','playwright','postman',
  'blockchain','solidity','web3','ethereum',
  'unity','unreal engine','opengl','webgl',
];
// Skills that need word-boundary matching (short words that are also common substrings)
const BOUNDARY_SKILLS=['java','php','c\\+\\+','c#','rust','ios','nlp','r lang','scala'];
// Display names for boundary skills
const BOUNDARY_DISPLAY={'java':'Java','php':'PHP','c\\+\\+':'C++','c#':'C#','rust':'Rust','ios':'iOS','nlp':'NLP','r lang':'R','scala':'Scala'};

export function extractSkills(text=''){
  const t=text.toLowerCase();
  const found=[];

  // Safe skills: simple includes (they're long enough to not false-match)
  for(const s of SAFE_SKILLS){
    if(t.includes(s) && !found.includes(s)) found.push(s);
  }

  // Boundary skills: use word boundary regex
  // Java: must not be part of 'javascript'
  if(/\bjava\b/i.test(text) && !/javascript/i.test(text.replace(/\bjava\b/gi,''))) found.push('java');
  else if(/\bjava\b/i.test(text) && /javascript/i.test(text)) {
    // Both java and javascript exist — check if 'java' appears independently
    const noJs = text.replace(/javascript/gi,'');
    if(/\bjava\b/i.test(noJs)) found.push('java');
  }
  if(/\bphp\b/i.test(text)) found.push('php');
  if(/\bc\+\+\b|\bcpp\b/i.test(text)) found.push('c++');
  if(/\bc#\b|\bcsharp\b/i.test(text)) found.push('c#');
  if(/\brust\b/i.test(text) && /programming|developer|language|cargo|crate/i.test(text)) found.push('rust');
  if(/\bios\b/i.test(text)) found.push('ios');
  if(/\bnlp\b/i.test(text)) found.push('nlp');
  if(/\bscala\b/i.test(text)) found.push('scala');
  // R language: only if explicitly mentioned as a language/tool
  if(/\br\b.*(?:programming|language|studio|shiny|cran|ggplot)/i.test(text) || /(?:programming|language).*\br\b/i.test(text)) found.push('R');

  return [...new Set(found)];
}
const SKILL_LIST=[...SAFE_SKILLS,...Object.values(BOUNDARY_DISPLAY).map(s=>s.toLowerCase())];

// ── Experience Years ──────────────────────────────────────────────────────────
function extractExpYears(t=''){
  const patterns=[
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:work\s+|professional\s+|industry\s+|hands[- ]?on\s+)?(?:experience|exp)/i,
    /(?:experience|exp)[:\s]+(\d+)\+?\s*years?/i,
    /(?:with|having|over|around|approximately|about)\s+(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*(?:yrs?|years?)\s+(?:in|of|exp)/i,
    /(?:total|overall)\s+(?:of\s+)?(\d+)\+?\s*years?/i,
  ];
  for(const p of patterns){
    const m=t.match(p); if(m) return parseInt(m[1]);
  }
  // Try to calculate from date ranges like (2019-2024)
  const dateRanges = [...t.matchAll(/(20\d{2})\s*[-–to]+\s*(20\d{2}|present|current|now)/gi)];
  if(dateRanges.length>0){
    let totalYrs=0;
    for(const dr of dateRanges){
      const start=parseInt(dr[1]);
      const end=/present|current|now/i.test(dr[2])?new Date().getFullYear():parseInt(dr[2]);
      totalYrs+=Math.max(0,end-start);
    }
    if(totalYrs>0) return totalYrs;
  }
  return 0;
}

// ── All Certifications / Hackathons / Projects ─────────────────────────────────
function extractCerts(text=''){
  const certs=[];
  const lines=text.split('\n');
  let inSection=false;
  for(const line of lines){
    if(/certification|certificate|certified/i.test(line)) inSection=true;
    if(inSection&&line.trim().length>10&&line.trim().length<100) certs.push(line.trim());
    if(certs.length>5) break;
  }
  return certs;
}

// ── Full Resume Parser ────────────────────────────────────────────────────────
export async function parseResumeData(fileData, textContent, filename) {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const t = textContent || '';
  
  try {
    const prompt = `You are an expert HR Resume Parser. Extract the following information from the provided resume document and return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks or add any conversational text.

CRITICAL RULES:
1. "skills" MUST be an array of strings containing ALL technical and soft skills.
2. "jobTitle" MUST be EXACTLY what they wrote (e.g., 'AI Engineer', 'RAG LLM Developer'). If none, guess based on skills.
3. "impact" MUST be "High", "Medium", or "Low" based on the quality of their projects/internships.
4. "experienceLevel" RULES: If they have an ongoing internship/role marked "Present" (e.g. 2023 - Present) but no other full-time experience, classify as "Intern". If they only have completed past college internships or no experience, classify as "Fresher". Only classify as "Junior", "Mid-Level", etc. if they have full-time post-graduate work experience with specific years.

Required JSON structure (do NOT add extra keys):
{
  "name": "Full name of candidate",
  "email": "Email address",
  "phone": "Phone number",
  "summary": "Their career objective or professional summary",
  "jobTitle": "Specific job title",
  "expYears": Number (total years of experience, e.g. 2. If intern/fresher, put 0),
  "experienceLevel": "Intern", "Fresher", "Junior", "Mid-Level", "Senior", or "Lead / Principal",
  "skills": ["skill1", "skill2", "skill3"],
  "education": "Bachelors", "Masters", "PhD", or "Diploma",
  "impact": "High"
}`;

    let parts = [{ text: prompt }];
    if (fileData && fileData.data) {
      parts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.data } });
    } else {
      parts.push({ text: `\n\nResume Text:\n${t.substring(0, 6000)}` });
    }

    let response;
    let retries = 3;
    let delayMs = 3000;
    
    while (retries > 0) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: parts }],
          generationConfig: { temperature: 0.1 }
        })
      });
      
      if (response.ok) break;
      if (response.status === 429 || response.status >= 500) {
        retries--;
        if (retries === 0) throw new Error(`Gemini API Error (${response.status})`);
        await new Promise(r => setTimeout(r, delayMs));
        delayMs *= 2;
      } else {
        throw new Error("Gemini API Failed with status " + response.status);
      }
    }

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`API ${response.status}: ${errTxt.substring(0,60)}`);
    }
    const data = await response.json();
    let jsonStr = data.candidates[0].content.parts[0].text;
    
    // Robustly extract JSON block in case LLM added conversational text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in LLM response");
    jsonStr = jsonMatch[0];
    
    const parsed = JSON.parse(jsonStr);
    
    let extractedSkills = parsed.skills;
    if (typeof extractedSkills === 'string') {
      extractedSkills = extractedSkills.split(',').map(s=>s.trim()).filter(Boolean);
    }
    if (!Array.isArray(extractedSkills)) extractedSkills = [];
    
    let expLevel = parsed.experienceLevel || 'Fresher';
    
    // Strict Bi-directional Hard-Override for "Intern"
    // The user strictly demanded: "Only if 'Year - Present' is there, it should be Intern. Otherwise analyze."
    const expYears = Number(parsed.expYears) || 0;
    const hasOngoingTimeline = /[\-\–\—]\s*(present|current|now|ongoing)/i.test(t);
    
    if (hasOngoingTimeline && expYears <= 1 && /intern/i.test(t)) {
      // Force Intern if they are actively interning
      expLevel = 'Intern';
    } else if (hasOngoingTimeline && expLevel === 'Fresher') {
      expLevel = 'Intern';
    } else if (expLevel === 'Intern') {
      // If AI assigned Intern but there is no 'Present', downgrade to Fresher
      expLevel = 'Fresher';
    }
    
    return {
      name: parsed.name || filename.replace(/\.[^/.]+$/,''),
      email: parsed.email || '',
      phone: parsed.phone || '',
      summary: parsed.summary || '',
      jobTitle: parsed.jobTitle || 'General',
      experienceLevel: expLevel,
      skills: extractedSkills,
      education: parsed.education || 'Bachelors',
      expYears: Number(parsed.expYears) || 0,
      impact: ['Intern','Fresher'].includes(parsed.experienceLevel) ? (parsed.impact || 'Medium') : null,
      subCategory: Number(parsed.expYears) > 0 ? 'Experience' : 'Project',
      certifications: extractCerts(t),
      text: t.toLowerCase()
    };
  } catch (error) {
    console.error("LLM Extraction failed, falling back to Regex:", error);
    const lower=t.toLowerCase();
    let name=filename.replace(/\.[^/.]+$/,'').replace(/[_\-]+/g,' ').trim();
    const nm=t.match(/^\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/m);
    if(nm&&nm[1].length<60) name=nm[1].trim();

    const email=(t.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)||[])[0]||'';
    const phone=(t.match(/(\+?[\d][\d\s\-(). ]{7,16}[\d])/)||[])[0]?.replace(/\s+/g,' ').trim()||'';

    const sumM=t.match(/(?:objective|career objective|professional summary|summary|profile|about me)[^\n:]{0,10}[:\n]\s*(.{30,600}?)(?:\n\n|\n[A-Z]|skills|education|experience|$)/i);
    const summary=sumM?sumM[1].trim():'';

    const expYears=extractExpYears(lower);
    const experienceLevel=detectExpLevel(t,expYears);
    const subCategory=detectSubCategory(t);
    
    // Expose error in UI to easily debug API limits/failures
    const jobTitle= `ERR: ${error.message.substring(0, 45)}`;
    
    const skills=extractSkills(t);
    const impact=(['Intern','Fresher'].includes(experienceLevel))?detectImpact(t):null;
    const certifications=extractCerts(t);

    let education='Not specified';
    if(/ph\.?d|doctorate/.test(lower)) education='PhD';
    else if(/master|mba|m\.?s\b|m\.?tech|m\.?e\b|m\.?sc/.test(lower)) education='Masters';
    else if(/bachelor|b\.?e\b|b\.?tech|b\.?sc|b\.?com|b\.?a\b|degree/.test(lower)) education='Bachelors';
    else if(/diploma|polytechnic/.test(lower)) education='Diploma';

    return { name, email, phone, summary, experienceLevel, subCategory, jobTitle, skills, education, expYears, impact, certifications, text: t };
  }
}

// ── Criteria Parser ───────────────────────────────────────────────────────────
export function parseCriteriaText(rawText='') {
  const lower=rawText.toLowerCase();
  const c={ requiredSkills:[], niceSkills:[], experienceLevel:'Fresher', education:'Bachelors', workType:'Any', keywords:[], minYears:0, extractedTitle:'', rawText };

  const yM=lower.match(/(\d+)\+?\s*(?:years?|yrs?)/); if(yM){c.minYears=parseInt(yM[1]);c.experienceLevel=c.minYears>=10?'Lead / Principal':c.minYears>=6?'Senior':c.minYears>=3?'Mid-Level':c.minYears>=1?'Junior':'Fresher';}
  if(/senior|lead|principal|staff\s+eng/.test(lower)) c.experienceLevel='Senior';
  else if(/mid.?level|intermediate/.test(lower)) c.experienceLevel='Mid-Level';
  else if(/junior|entry.?level|fresher|graduate/.test(lower)) c.experienceLevel='Junior';

  if(/ph\.?d/.test(lower)) c.education='PhD';
  else if(/master|mba|m\.?tech/.test(lower)) c.education='Masters';
  else if(/bachelor|degree|b\.?tech/.test(lower)) c.education='Bachelors';
  else if(/diploma/.test(lower)) c.education='Diploma';

  if(/remote/.test(lower)) c.workType='Remote';
  else if(/hybrid/.test(lower)) c.workType='Hybrid';
  else if(/onsite|on.?site|office/.test(lower)) c.workType='Onsite';

  c.requiredSkills=SKILL_LIST.filter(s=>lower.includes(s));
  const after=lower.match(/(?:skills?|proficient in|expertise in|experience in)[:\s]+([^\n.]+)/);
  if(after){after[1].split(/[,;|]+/).map(x=>x.trim()).filter(x=>x.length>1&&x.length<30).forEach(e=>{if(!c.requiredSkills.includes(e))c.requiredSkills.push(e);});}

  const nice=lower.match(/(?:nice to have|preferred|bonus|plus)[:\s]+([^\n.]+)/);
  if(nice) c.niceSkills=nice[1].split(/[,;]+/).map(x=>x.trim()).filter(Boolean);

  const kw=rawText.match(/(?:keywords?|must have|require[sd]?)[:\s]+([^\n.]+)/i);
  if(kw) c.keywords=kw[1].split(/[,;]+/).map(x=>x.trim()).filter(Boolean);

  for(const[p,t]of JT_MAP){if(lower.includes(p)){c.extractedTitle=t;break;}}

  return c;
}

// ── Scoring ───────────────────────────────────────────────────────────────────
export function scoreResume(resume, criteria) {
  const bd={};

  // Skills (35 pts)
  const reqSkills = criteria.requiredSkills.map(s=>s.toLowerCase().replace(/[^a-z0-9]/g,''));
  const resSkills = (resume.skills||[]).map(s=>s.toLowerCase().replace(/[^a-z0-9]/g,''));

  let matchC = 0;
  const matched = [], missing = [];
  
  for (let i = 0; i < reqSkills.length; i++) {
    const rs = reqSkills[i];
    const originalRs = criteria.requiredSkills[i];
    
    // Check if the normalized skill exists as a substring in any of the extracted resume skills
    let isMatch = resSkills.find(resSk => resSk === rs || resSk.includes(rs) || rs.includes(resSk));
    
    // Deep Fallback: If LLM failed to extract it into the array, physically scan the raw resume text
    if (!isMatch && resume.text) {
      if (resume.text.toLowerCase().includes(originalRs.toLowerCase())) {
        isMatch = true;
      } else if (resume.text.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(rs)) {
        isMatch = true;
      }
    }
    
    if (isMatch) {
      matchC++;
      matched.push(originalRs);
    } else {
      missing.push(originalRs);
    }
  }

  if (reqSkills.length > 0) {
    const pct = Math.round(matchC/reqSkills.length*100);
    bd.skills={score:Math.round(pct/100*35),max:35,pct,matched,missing};
  } else { bd.skills={score:20,max:35,pct:57,matched:resume.skills?.slice(0,4)||[],missing:[]}; }

  // Experience (25 pts)
  const lvl={Intern:0,Fresher:1,Junior:2,'Mid-Level':3,Senior:4,'Lead / Principal':5};
  const reqL=lvl[criteria.experienceLevel]??1, resL=lvl[resume.experienceLevel]??0;
  const diff=Math.abs(reqL-resL);
  const expScore=diff===0?25:diff===1?17:diff===2?9:3;
  bd.experience={score:expScore,max:25,pct:Math.round(expScore/25*100),required:criteria.experienceLevel,actual:resume.experienceLevel};

  // Education (15 pts)
  const edu={'Not specified':0,Diploma:1,Bachelors:2,Masters:3,PhD:4};
  const rEdu=edu[resume.education]??0, cEdu=edu[criteria.education]??2;
  const eduScore=rEdu>=cEdu?15:rEdu===cEdu-1?10:rEdu===cEdu-2?5:2;
  bd.education={score:eduScore,max:15,pct:Math.round(eduScore/15*100),required:criteria.education,actual:resume.education};

  // Job Title Relevance (15 pts)
  const titleMatch=criteria.extractedTitle&&resume.jobTitle?(criteria.extractedTitle.toLowerCase()===resume.jobTitle.toLowerCase()?15:resume.jobTitle.toLowerCase().includes(criteria.extractedTitle.toLowerCase().split(' ')[0])?10:5):8;
  bd.titleRelevance={score:titleMatch,max:15,pct:Math.round(titleMatch/15*100)};

  // Project/Intern Impact (10 pts) — weighted for freshers
  let projScore=6;
  if(['Intern','Fresher'].includes(resume.experienceLevel)){
    const imp={'High':10,'Medium':6,'Low':2};
    projScore=imp[resume.impact||'Low']||4;
  }
  bd.projectImpact={score:projScore,max:10,pct:Math.round(projScore/10*100),impact:resume.impact||'N/A'};

  // Keywords (extra)
  const kwMatched=(criteria.keywords||[]).filter(k=>(resume.text||'').toLowerCase().includes(k.toLowerCase()));
  bd.keywords={matched:kwMatched,total:criteria.keywords?.length||0};

  const total=bd.skills.score+bd.experience.score+bd.education.score+bd.titleRelevance.score+bd.projectImpact.score;
  const percentage=Math.min(100,Math.round(total));
  return {percentage,breakdown:bd};
}

// ── Grouping ──────────────────────────────────────────────────────────────────
const EXP_ORDER=['Intern','Fresher','Junior','Mid-Level','Senior','Lead / Principal'];

export function buildHierarchy(resumes=[]) {
  // Returns: { [jobTitle]: { [expLevel]: Resume[] } }
  const tree={};
  [...resumes].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).forEach(r=>{
    const jt=r.jobTitle||'General';
    const el=r.experienceLevel||'Fresher';
    if(!tree[jt]) tree[jt]={};
    if(!tree[jt][el]) tree[jt][el]=[];
    tree[jt][el].push(r);
  });
  // Sort inside each level: High impact first for Intern/Fresher
  for(const jt of Object.keys(tree))
    for(const el of Object.keys(tree[jt]))
      if(['Intern','Fresher'].includes(el))
        tree[jt][el].sort((a,b)=>({'High':0,'Medium':1,'Low':2}[a.impact||'Low']||2)-({'High':0,'Medium':1,'Low':2}[b.impact||'Low']||2));
  return tree;
}

export function groupAlphabetically(resumes=[]) {
  const sorted=[...resumes].sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  return sorted.reduce((g,r)=>{const l=((r.name||r.fileName||'?')[0]).toUpperCase();if(!g[l])g[l]=[];g[l].push(r);return g;},{});
}

export { EXP_ORDER, SKILL_LIST };
