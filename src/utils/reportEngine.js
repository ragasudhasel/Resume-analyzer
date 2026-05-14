// AI Intelligence Report Engine — generates professional recruiter-style text

import { getScoreLabel } from './resumeUtils';

function threshold(results) {
  const top10pct = results.length>0 ? results[Math.floor(results.length*0.1)].score : 0;
  const top25pct = results.length>0 ? results[Math.floor(results.length*0.25)].score : 0;
  return { top10pct, top25pct };
}

export function generateReport(results, criteria, jobTitle) {
  const strong = results.filter(r=>r.score>=80);
  const good   = results.filter(r=>r.score>=60&&r.score<80);
  const partial = results.filter(r=>r.score>=40&&r.score<60);
  const weak   = results.filter(r=>r.score<40);
  const top3   = results.slice(0,3);
  const top5   = results.slice(0,5);
  const { top10pct } = threshold(results);
  const avgScore = results.length? Math.round(results.reduce((s,r)=>s+r.score,0)/results.length):0;

  const poolQuality = strong.length>=results.length*0.3?'strong':good.length>=results.length*0.4?'mixed':'challenging';

  // ── SECTION 1: Executive Summary ─────────────────────────────────────────
  const exec = `
## 🔍 Executive Summary

A total of **${results.length} resumes** were analyzed against the criteria for the **${jobTitle||'target role'}** position. The role required **${criteria.experienceLevel||'any'}** level candidates with proficiency in ${(criteria.requiredSkills||[]).slice(0,4).join(', ')||'various technical skills'}, and a minimum education of **${criteria.education||'Bachelors'}**.

The overall candidate pool quality is **${poolQuality}**. The average match score across all candidates was **${avgScore}/100**. A total of **${strong.length} candidates** achieved a strong match (80+), **${good.length}** achieved a good match (60–79), and **${partial.length}** showed partial compatibility.

${strong.length>0 ? `**${strong.length} candidates crossed the recommended shortlist threshold of 80%.** These candidates are ready for immediate interview consideration.` : `No candidates crossed the 80% threshold. The ${good.length} candidates in the 60–79 range are recommended as a shortlist for a revised criteria evaluation.`}
`.trim();

  // ── SECTION 2: Top Candidate Spotlights ──────────────────────────────────
  const verdicts = ['Strongly recommended for interview','Worth considering for first round','Shortlist as backup candidate'];

  const spotlights = top3.map((r, i) => {
    const bd = r.breakdown||{};
    const matched = bd.skills?.matched||[];
    const missing = bd.skills?.missing||[];
    const skillPct = bd.skills?.pct||0;
    const expFit = bd.experience?.pct||0;

    const strengths = [];
    if(skillPct>=70) strengths.push(`Matches **${matched.slice(0,4).join(', ')}** — covering ${skillPct}% of required skills`);
    if(expFit>=80) strengths.push(`Experience level (${r.experienceLevel}) is a strong fit for the ${criteria.experienceLevel} requirement`);
    if(r.impact==='High') strengths.push(`High-impact profile with deployed projects and real-world contributions`);
    if(r.certifications?.length>0) strengths.push(`Holds relevant certifications: ${r.certifications[0]}`);
    if(strengths.length<2) strengths.push(`Overall profile is well-aligned with the target domain of ${r.jobTitle}`);

    const gaps = [];
    if(missing.length>0) gaps.push(`Missing skills: ${missing.slice(0,3).join(', ')}`);
    if(expFit<60) gaps.push(`Experience level (${r.experienceLevel}) is not a direct match for the required ${criteria.experienceLevel}`);
    if(gaps.length===0) gaps.push('No major gaps identified — well-rounded candidate');

    return `
### ${['🥇','🥈','🥉'][i]} Rank #${i+1} — ${r.name||r.fileName} · **${r.score}/100**

${r.name||r.fileName} ranked #${i+1} with a score of **${r.score}/100** because ${skillPct>=70?`they match ${skillPct}% of the required technical skills`:`their overall profile aligns moderately with the role requirements`}${expFit>=80?`, their ${r.experienceLevel} experience level is an exact match for what this role demands,`:''} and their background in **${r.jobTitle||'software development'}** is ${r.score>=75?'directly':'reasonably'} relevant to this position.

**Strongest Points:**
${strengths.map(s=>`- ${s}`).join('\n')}

**Gaps / Concerns:**
${gaps.map(g=>`- ${g}`).join('\n')}

> 💬 **Recruiter Verdict:** *${verdicts[i]||'Consider for further review'}*
`.trim();
  }).join('\n\n---\n\n');

  // ── SECTION 3: Comparison Table ───────────────────────────────────────────
  const tableRows = top5.map((r,i)=>{
    const bd=r.breakdown||{};
    const verdict=r.score>=80?'✅ Strong':r.score>=60?'🟡 Good':r.score>=40?'🟠 Backup':'🔴 Weak';
    return `| #${i+1} | ${r.name||r.fileName} | ${r.score} | ${bd.skills?.pct||0}% | ${bd.experience?.pct||0}% | ${bd.titleRelevance?.pct||0}% | ${bd.education?.pct||0}% | ${r.impact||'N/A'} | ${(bd.skills?.matched||[]).slice(0,3).join(', ')||'—'} | ${(bd.skills?.missing||[]).slice(0,2).join(', ')||'—'} | ${verdict} |`;
  }).join('\n');

  const table = `
## 📊 Side-by-Side Comparison — Top ${top5.length} Candidates

| Rank | Candidate | Score | Skills% | Exp% | Title% | Edu% | Impact | Matched Skills | Missing | Verdict |
|------|-----------|-------|---------|------|--------|------|--------|----------------|---------|---------|
${tableRows}
`.trim();

  // ── SECTION 4: Why NOT the others ────────────────────────────────────────
  const bottom = weak.length+partial.length;
  const bottomReasons = [];
  if(partial.length>0||weak.length>0){
    const missingSkillsCandidates=results.filter(r=>r.score<60&&(r.breakdown?.skills?.missing||[]).length>2).length;
    const wrongLevelCandidates=results.filter(r=>r.score<60&&Math.abs(({'Intern':0,'Fresher':1,'Junior':2,'Mid-Level':3,'Senior':4,'Lead / Principal':5}[r.experienceLevel]??0)-({'Intern':0,'Fresher':1,'Junior':2,'Mid-Level':3,'Senior':4,'Lead / Principal':5}[criteria.experienceLevel]??1))>=2).length;
    if(missingSkillsCandidates>0) bottomReasons.push(`**${missingSkillsCandidates} candidates** lacked 3 or more of the core required skills`);
    if(wrongLevelCandidates>0) bottomReasons.push(`**${wrongLevelCandidates} candidates** had a significant mismatch in experience level relative to the ${criteria.experienceLevel} requirement`);
    bottomReasons.push(`Several profiles showed unrelated job titles or career objectives not aligned with ${jobTitle||'this role'}`);
  }

  const bottomSection = bottom>0 ? `
## ⬇️ Why the Remaining Candidates Scored Lower

The remaining **${bottom} candidates** scored below 60 primarily because:

${bottomReasons.map(r=>`- ${r}`).join('\n')}

This does not necessarily disqualify these candidates for other open roles — they may be a strong fit for different positions within the organization.
`.trim() : '';

  // ── Assemble Full Report ──────────────────────────────────────────────────
  return [
    `# 🧠 HireIQ Intelligence Report`,
    `**Job Position:** ${jobTitle||'N/A'} · **Generated:** ${new Date().toLocaleString()} · **Total Analyzed:** ${results.length}`,
    '---',
    exec,
    '---',
    `## 👤 Top Candidate Spotlights`,
    spotlights,
    '---',
    table,
    bottomSection?'---':'',
    bottomSection,
  ].filter(Boolean).join('\n\n');
}

export function reportToPlainText(md) {
  return md
    .replace(/#{1,6}\s/g,'')
    .replace(/\*\*(.+?)\*\*/g,'$1')
    .replace(/\*(.+?)\*/g,'$1')
    .replace(/>\s/g,'')
    .replace(/\|[^\n]+\|/g, l => l.replace(/\|/g,'\t'))
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1');
}
