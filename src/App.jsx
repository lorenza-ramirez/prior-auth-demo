import React, { useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUp, X, FileText, Download, Sparkles, ThumbsUp, ThumbsDown, AlertTriangle, UserPlus, Paperclip, Info, Zap, ShieldCheck, ListChecks, RefreshCw, Plus, Home, CalendarDays, CheckCircle2, Users, Inbox, ClipboardCheck, Activity, Receipt, XSquare, Wallet, BarChart3, LineChart, Circle, PanelLeft, Bell, Search, Mic, Settings, HelpCircle, Loader2, Archive, SlidersHorizontal, ZoomIn, ZoomOut, ArrowLeft, Copy, Printer, History, Flag, Eye, MoreHorizontal, ArrowDown, ArrowUp, BookOpen, Pin, Mail, Stethoscope, SquarePen, Smile, ListFilter } from "lucide-react";

/* ---------- helpers ---------- */
const pd = (s) => { const [m, d, y] = s.split("/").map(Number); return new Date(y, m - 1, d); };
const fd = (dt) => String(dt.getMonth() + 1).padStart(2, "0") + "/" + String(dt.getDate()).padStart(2, "0") + "/" + dt.getFullYear();
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return fd(d); };

/* ---------- synthetic clinical content ---------- */
const COND = {
  knee: { caseName: "Rehab LT Knee", icd: "M17.12", dxDesc: "Unilateral primary osteoarthritis, left knee",
    cc: "Left knee pain and stiffness with stairs and prolonged standing",
    hx: "Gradual onset over 8 months with recent worsening after a fall. Pain is 6/10 at worst and 3/10 at rest.",
    findings: ["Left knee flexion 98 degrees (right 130)", "Quadriceps strength 3+/5", "Antalgic gait with decreased stance time"],
    limits: "Unable to climb a flight of stairs without rest, limited to 10 minutes of standing, and needs a rail on stairs.",
    prior: "Independent with stairs and 45 minute walks",
    goals: ["Knee flexion to 120 degrees in 6 weeks", "Climb 12 stairs without a rail", "Stand 30 minutes with pain 2/10 or less"],
    intro: "restore knee mobility and strength and return to stairs and community walking" },
  lumbar: { caseName: "Rehab Lumbar", icd: "M54.16", dxDesc: "Radiculopathy, lumbar region",
    cc: "Low back pain radiating into the right leg",
    hx: "Onset 5 weeks ago after lifting at work. Pain is 7/10 with sitting longer than 15 minutes.",
    findings: ["Lumbar flexion limited to 40 percent of normal", "Positive slump test on the right", "Core endurance 20 seconds in prone plank"],
    limits: "Unable to sit through a work shift, lift more than 10 pounds, or sleep through the night.",
    prior: "Full duty, no restrictions",
    goals: ["Sit 60 minutes with pain 3/10 or less", "Lift 30 pounds from floor to waist", "Sleep 6 hours without waking from pain"],
    intro: "reduce radicular symptoms and restore safe lifting and sitting tolerance" },
  shoulder: { caseName: "Rehab RT Shoulder", icd: "M75.100", dxDesc: "Rotator cuff tear or rupture, not specified as traumatic",
    cc: "Right shoulder pain and weakness with overhead reaching",
    hx: "Insidious onset 3 months ago, worse at night. Pain is 5/10 with reaching.",
    findings: ["Active shoulder elevation 110 degrees (left 170)", "External rotation strength 3/5", "Positive empty can test"],
    limits: "Cannot reach overhead shelves, dress without pain, or carry groceries on the right.",
    prior: "Independent in all self care and recreational swimming",
    goals: ["Active elevation to 160 degrees", "Carry 15 pounds with the right arm", "Sleep on right side without pain"],
    intro: "restore shoulder strength and range for overhead reaching and daily lifting" },
  neck: { caseName: "Rehab Neck", icd: "M54.2", dxDesc: "Cervicalgia",
    cc: "Neck pain with headaches after desk work",
    hx: "Gradual onset over 4 months, 5/10 at end of day.",
    findings: ["Cervical rotation 50 degrees right, 65 left", "Deep neck flexor endurance 12 seconds", "Upper trapezius tenderness bilaterally"],
    limits: "Cannot work at a computer past 45 minutes or drive more than 30 minutes without pain.",
    prior: "Full time desk work without symptoms",
    goals: ["Cervical rotation 75 degrees bilaterally", "Work 3 hours at a computer with pain 2/10 or less"],
    intro: "restore neck mobility and postural endurance for work and driving" },
  hip: { caseName: "Rehab Hip", icd: "M25.552", dxDesc: "Pain in left hip",
    cc: "Left hip pain with walking and getting out of a car",
    hx: "Onset 7 weeks ago without injury. Pain is 6/10 with weight bearing.",
    findings: ["Hip flexion 95 degrees (right 120)", "Gluteus medius strength 3/5", "Trendelenburg gait on the left"],
    limits: "Walks less than 5 minutes and cannot get in or out of a car without assistance.",
    prior: "Independent walker, 30 minute daily walks",
    goals: ["Walk 20 minutes with pain 2/10 or less", "Enter and exit a car independently", "Hip flexion to 115 degrees"],
    intro: "restore hip mobility and strength for walking and transfers" },
};
const SVC = [
  { cpt: "97110", desc: "Therapeutic exercise", units: 2 },
  { cpt: "97140", desc: "Manual therapy", units: 2 },
  { cpt: "97530", desc: "Therapeutic activities", units: 1 },
];
const PAYERS = {
  northwind: { form: "Northwind Provider PT Prior Authorization Form", fax: "(860) 555-0177", plan: "Northwind PPO" },
  cascadia: { form: "Cascadia Outpatient Therapy Authorization Request", fax: "(860) 555-0142", plan: "Cascadia Select HMO" },
  harbor: { form: "Harbor Medicaid Request for Authorization (RFA)", fax: "(860) 555-0109", plan: "Harbor Medicaid" },
};
const RULES = [
  { id: "r1", payer: "northwind", text: "Northwind PPO and EPO: authorization required after the initial evaluation", src: "Contract term 4.1" },
  { id: "r2", payer: "cascadia", text: "Cascadia Select HMO: authorization required for outpatient therapy", src: "Contract term 6.1" },
  { id: "r3", payer: "harbor", text: "Harbor Medicaid: authorization required for any therapy plan of care", src: "Addendum 4.1" },
];
const FAC = { facility: "Ridgeline Physical Therapy, Hartford", tin: "06-1234567" };

const mk = (id, name, mrn, dob, sex, payerKey, memberId, group, cond, o) => {
  const c = COND[cond];
  return {
    id, name, mrn, dob, sex, payerKey, plan: PAYERS[payerKey].plan, memberId, group,
    phone: o.phone, address: o.address, ...c, ...FAC,
    treatingPT: "Arthur Ting, PT, DPT", treatingNpi: o.ptNpi === undefined ? "1982736450" : o.ptNpi,
    referringName: o.refName, referringNpi: o.refNpi,
    evalDate: o.evalDate, nextVisit: o.nextVisit, trigger: o.trigger, requested: SVC.map((s) => ({ ...s })),
    requestedVisits: 12, frequency: "2x per week", duration: "6 weeks", pain: o.pain || "6/10",
  };
};
const FLAGGED = [
  mk("p1", "Marcus Ellison", "3041882", "03/14/1968", "Male", "northwind", "NWH-4410-2291", "GRP-7781", "knee",
    { phone: "(860) 555-0118", address: "42 Maple Ave, Hartford, CT 06103", refName: "Dr. Elena Park, MD", refNpi: "1457390281", evalDate: "11/16/2026", nextVisit: "11/19/2026",
      trigger: { type: "rule", text: "Rule: Northwind PPO requires auth after initial evaluation" } }),
  mk("p2", "Priya Raman", "3052207", "07/02/1981", "Female", "cascadia", "CAS-908812-03", "AZ-0092", "lumbar",
    { phone: "(203) 555-0166", address: "9 Harbor View Rd, Stamford, CT 06902", refName: "Dr. Samuel Ortiz, MD", refNpi: "", evalDate: "11/17/2026", nextVisit: "11/20/2026", pain: "7/10",
      trigger: { type: "eligibility", text: "Eligibility check (271): prior authorization required for PT" } }),
  mk("p3", "Daniel Okafor", "3047730", "11/23/1975", "", "harbor", "HMP-55120934", "", "shoulder",
    { phone: "(860) 555-0131", address: "180 Park St, New Britain, CT 06051", refName: "Dr. Mei Chen, MD", refNpi: "1093847562", evalDate: "11/16/2026", nextVisit: "11/19/2026", pain: "5/10",
      trigger: { type: "rule", text: "Rule: Harbor Medicaid requires auth for any plan of care" } }),
  mk("p4", "Hannah Brooks", "3055981", "02/09/1990", "Female", "northwind", "NWH-7720-5513", "GRP-7781", "neck",
    { phone: "(475) 555-0172", address: "7 Elm Ct, Manchester, CT 06040", refName: "Dr. Elena Park, MD", refNpi: "1457390281", evalDate: "11/17/2026", nextVisit: "11/23/2026", pain: "5/10",
      trigger: { type: "rule", text: "Rule: Northwind PPO requires auth after initial evaluation" } }),
  mk("p5", "Tom Whitfield", "3049914", "09/30/1957", "Male", "cascadia", "CAS-771045-01", "AZ-0092", "knee",
    { phone: "(860) 555-0149", address: "311 Oak Hill Dr, Glastonbury, CT 06033", refName: "Dr. Samuel Ortiz, MD", refNpi: "1720458936", evalDate: "11/18/2026", nextVisit: "11/24/2026",
      trigger: { type: "eligibility", text: "Eligibility check (271): prior authorization required for PT" } }),
  mk("p6", "Rosa Delgado", "3058806", "05/18/1972", "Female", "harbor", "HMP-60288415", "", "hip",
    { phone: "(860) 555-0103", address: "58 Wells St, Hartford, CT 06106", refName: "Dr. Mei Chen, MD", refNpi: "1093847562", ptNpi: "", evalDate: "11/18/2026", nextVisit: "11/25/2026",
      trigger: { type: "rule", text: "Rule: Harbor Medicaid requires auth for any plan of care" } }),
  mk("p7", "Elena Marquez", "3060112", "06/21/1984", "Female", "cascadia", "CAS-615507-02", "AZ-0092", "lumbar",
    { phone: "(203) 555-0127", address: "24 Pine St, Norwalk, CT 06851", refName: "Dr. Samuel Ortiz, MD", refNpi: "1720458936", evalDate: "11/16/2026", nextVisit: "11/19/2026", pain: "6/10",
      trigger: { type: "eligibility", text: "Eligibility check (271): prior authorization required for PT" } }),
  mk("p8", "Jamal Fletcher", "3060947", "01/12/1971", "Male", "northwind", "NWH-3318-7740", "GRP-7781", "shoulder",
    { phone: "(860) 555-0184", address: "902 Main St, Middletown, CT 06457", refName: "Dr. Elena Park, MD", refNpi: "1457390281", evalDate: "11/16/2026", nextVisit: "11/20/2026", pain: "5/10",
      trigger: { type: "rule", text: "Rule: Northwind PPO requires auth after initial evaluation" } }),
  mk("p9", "Grace Lindqvist", "3061558", "10/05/1963", "Female", "harbor", "HMP-48820615", "", "knee",
    { phone: "(475) 555-0139", address: "77 Cedar Ln, Bristol, CT 06010", refName: "Dr. Mei Chen, MD", refNpi: "", evalDate: "11/17/2026", nextVisit: "11/21/2026",
      trigger: { type: "rule", text: "Rule: Harbor Medicaid requires auth for any plan of care" } }),
  mk("p10", "Victor Nguyen", "3062203", "04/28/1989", "Male", "northwind", "NWH-9054-1126", "GRP-7781", "hip",
    { phone: "(860) 555-0166", address: "15 Quarry Rd, Meriden, CT 06450", refName: "Dr. Elena Park, MD", refNpi: "1457390281", evalDate: "11/17/2026", nextVisit: "11/21/2026",
      trigger: { type: "rule", text: "Rule: Northwind PPO requires auth after initial evaluation" } }),
  mk("p11", "Aisha Rahman", "3062871", "12/15/1996", "Female", "cascadia", "CAS-402918-05", "AZ-0092", "neck",
    { phone: "(203) 555-0178", address: "603 Elm Ave, New Haven, CT 06511", refName: "Dr. Samuel Ortiz, MD", refNpi: "1720458936", evalDate: "11/17/2026", nextVisit: "11/22/2026", pain: "4/10",
      trigger: { type: "eligibility", text: "Eligibility check (271): prior authorization required for PT" } }),
  mk("p12", "Peter Kowalski", "3063340", "08/03/1959", "", "harbor", "HMP-71360284", "", "lumbar",
    { phone: "(860) 555-0152", address: "38 River Rd, Windsor, CT 06095", refName: "Dr. Mei Chen, MD", refNpi: "1093847562", evalDate: "11/18/2026", nextVisit: "11/24/2026", pain: "7/10",
      trigger: { type: "rule", text: "Rule: Harbor Medicaid requires auth for any plan of care" } }),
  mk("p13", "Maria Santoro", "3063995", "02/14/1977", "Female", "northwind", "NWH-6672-0391", "GRP-7781", "knee",
    { phone: "(475) 555-0111", address: "120 Spring St, Danbury, CT 06810", refName: "Dr. Elena Park, MD", refNpi: "1457390281", evalDate: "11/18/2026", nextVisit: "11/25/2026",
      trigger: { type: "rule", text: "Rule: Northwind PPO requires auth after initial evaluation" } }),
  mk("p14", "Lionel Baptiste", "3064618", "07/19/1982", "Male", "cascadia", "CAS-830175-04", "AZ-0092", "shoulder",
    { phone: "(203) 555-0193", address: "9 Bayview Ct, Milford, CT 06460", refName: "Dr. Samuel Ortiz, MD", refNpi: "1720458936", ptNpi: "", evalDate: "11/18/2026", nextVisit: "11/26/2026", pain: "5/10",
      trigger: { type: "eligibility", text: "Eligibility check (271): prior authorization required for PT" } }),
];
const SEED = [
  { id: "s1", name: "Leah Moreno", mrn: "2715218", dob: "04/11/1979", auth: "LM-11.04.26", case: "Rehab LT Hand", payer: "Northwind PPO", start: "11/04/2026", end: "01/15/2027", authorized: 12, completed: 3, stage: "Approved", nextVisit: "11/19/2026", att: [] },
  { id: "s2", name: "Gabriel Santos", mrn: "2698815", dob: "12/02/1985", auth: "GS-11.02.26", case: "Rehab Lumbar", payer: "Cascadia Select HMO", start: "11/02/2026", end: "12/31/2026", authorized: 10, completed: 4, stage: "Approved", nextVisit: "11/19/2026", att: [] },
  { id: "s3", name: "Nora Whitaker", mrn: "2701140", dob: "08/27/1964", auth: "NW-10.28.26", case: "Rehab RT Knee", payer: "Harbor Medicaid", start: "10/28/2026", end: "12/10/2026", authorized: 8, completed: 5, stage: "Approved", nextVisit: "11/20/2026", att: [] },
  { id: "s4", name: "Ibrahim Salah", mrn: "2688203", dob: "01/19/1993", auth: "IS-10.20.26", case: "Rehab Ankle", payer: "Northwind EPO", start: "10/20/2026", end: "12/01/2026", authorized: 12, completed: 9, stage: "Approved", nextVisit: "11/19/2026", att: [] },
  { id: "s5", name: "Owen Hartigan", mrn: "2677104", dob: "05/09/1990", auth: "OH-10.14.26", case: "Rehab LT Shoulder", payer: "Cascadia Select HMO", start: "10/14/2026", end: "12/15/2026", authorized: 12, completed: 7, stage: "Approved", nextVisit: "11/19/2026", att: [] },
  { id: "s6", name: "Priscilla Duarte", mrn: "2671568", dob: "09/23/1968", auth: "PD-10.12.26", case: "Rehab Neck", payer: "Northwind PPO", start: "10/12/2026", end: "12/04/2026", authorized: 10, completed: 8, stage: "Approved", nextVisit: "11/20/2026", att: [] },
  { id: "s7", name: "Terrence Wolfe", mrn: "2664390", dob: "03/30/1975", auth: "TW-10.07.26", case: "Rehab Lumbar", payer: "Harbor Medicaid", start: "10/07/2026", end: "11/30/2026", authorized: 8, completed: 6, stage: "Approved", nextVisit: "11/19/2026", att: [] },
  { id: "s8", name: "Camila Reyes", mrn: "2658826", dob: "11/11/1987", auth: "CR-10.05.26", case: "Rehab RT Hip", payer: "Cascadia Select HMO", start: "10/05/2026", end: "12/20/2026", authorized: 12, completed: 5, stage: "Approved", nextVisit: "11/20/2026", att: [] },
  { id: "s9", name: "Dennis Okonkwo", mrn: "2649712", dob: "06/02/1961", auth: "DO-09.29.26", case: "Rehab LT Knee", payer: "Northwind EPO", start: "09/29/2026", end: "11/24/2026", authorized: 12, completed: 11, stage: "Approved", nextVisit: "11/19/2026", att: [] },
  { id: "s10", name: "Sofia Petrova", mrn: "2641058", dob: "01/25/1994", auth: "SP-09.22.26", case: "Rehab Ankle", payer: "Harbor Medicaid", start: "09/22/2026", end: "11/20/2026", authorized: 8, completed: 8, stage: "Approved", nextVisit: "11/19/2026", att: [] },
];
SEED.forEach((r) => { const cl = Math.round(r.completed * 0.65); r.claimed = cl; r.completed = r.completed - cl; r.nAppts = 3; });

/* ---------- form model ---------- */
const fieldsFor = (pk) => [
  { sec: "Member information", items: [
    { k: "name", l: "Member name", req: 1, src: "Demographics" },
    { k: "dob", l: "Date of birth", req: 1, src: "Demographics" },
    { k: "sex", l: "Sex", req: 1, src: "Demographics" },
    { k: "memberId", l: pk === "harbor" ? "Medicaid ID" : "Member ID", req: 1, src: "Insurance" },
    { k: "group", l: "Group number", req: pk === "harbor" ? 0 : 1, src: "Insurance" },
    { k: "phone", l: "Phone", req: 0, src: "Demographics" } ] },
  { sec: "Provider information", items: [
    { k: "facility", l: "Servicing facility", req: 1, src: "Practice settings" },
    { k: "tin", l: "Tax ID", req: 1, src: "Practice settings" },
    { k: "treatingPT", l: "Treating therapist", req: 1, src: "Initial eval" },
    { k: "treatingNpi", l: "Therapist NPI", req: 1, src: "Provider master" },
    { k: "referringName", l: "Referring provider", req: 1, src: "Referral" },
    { k: "referringNpi", l: "Referring NPI", req: 1, src: "Referral" } ] },
  { sec: "Request details", items: [
    { k: "icd", l: "Primary diagnosis code", req: 1, src: "Initial eval" },
    { k: "dxDesc", l: "Diagnosis description", req: 1, src: "Initial eval" },
    { k: "evalDate", l: "Evaluation date", req: 1, src: "Initial eval" },
    { k: "startDate", l: "Requested start date", req: 1, src: "Schedule" },
    { k: "requestedVisits", l: "Visits requested", req: 1, src: "Plan of care" },
    { k: "frequency", l: "Frequency", req: 1, src: "Plan of care" },
    { k: "duration", l: "Duration", req: 1, src: "Plan of care" },
    ...(pk === "harbor" ? [{ k: "urgency", l: "Review type", req: 1, src: "Payer form" }] : []) ] },
  { sec: "Clinical summary", items: [
    { k: "limits", l: "Functional limitations", req: 1, src: "Initial eval", area: 1 },
    { k: "goals", l: "Treatment goals", req: 1, src: "Initial eval", area: 1 } ] },
];
const valuesFor = (p, o) => ({
  name: p.name, dob: p.dob, sex: p.sex, memberId: p.memberId, group: p.group, phone: p.phone,
  facility: p.facility, tin: p.tin, treatingPT: p.treatingPT, treatingNpi: p.treatingNpi,
  referringName: p.referringName, referringNpi: p.referringNpi,
  icd: p.icd, dxDesc: p.dxDesc, evalDate: p.evalDate, startDate: p.nextVisit,
  requestedVisits: String(o.visits), frequency: o.freq, duration: o.dur, urgency: "Standard",
  limits: p.limits, goals: p.goals.join("; "),
});
const readiness = (p, o, edits) => {
  const vals = { ...valuesFor(p, o), ...(edits || {}) };
  const req = fieldsFor(p.payerKey).flatMap((s) => s.items).filter((f) => f.req);
  const missing = req.filter((f) => !String(vals[f.k] || "").trim());
  return { total: req.length, filled: req.length - missing.length, missing, vals };
};
const baseOpts = (p) => ({ visits: p.requestedVisits, freq: p.frequency, dur: p.duration });

const letterFor = (p, svc, o) => [
  "Re: Request for prior authorization, outpatient physical therapy",
  "Patient: " + p.name + "   DOB: " + p.dob + "   Member ID: " + p.memberId,
  "Plan: " + p.plan + "   Diagnosis: " + p.icd + " " + p.dxDesc,
  "Requested: " + svc.map((r) => r.cpt + " x" + r.units).join(", ") + " per visit, " + o.freq + " for " + o.dur + " (" + o.visits + " visits)",
  "",
  "To the Utilization Review Department,",
  "",
  "I am requesting authorization for skilled physical therapy for " + p.name + ", evaluated on " + p.evalDate + " for " + p.cc.toLowerCase() + ". " + p.hx,
  "",
  "Objective findings: " + p.findings.join("; ") + ".",
  "",
  "Functional limitations: " + p.limits + " Prior level of function: " + p.prior.toLowerCase() + ".",
  "",
  "Skilled therapy is required to " + p.intro + ". Goals: " + p.goals.join("; ") + ".",
  "",
  "Plan of care: " + o.freq + " for " + o.dur + " using " + svc.map((r) => r.desc.toLowerCase()).join(", ") + ".",
  "",
  "Please contact our office with any questions.",
  "",
  "Sincerely,",
  p.treatingPT,
  p.facility,
].join("\n");

const evalNote = (p) => [
  { h: "Subjective", segs: [["Chief complaint: ", 0], [p.cc, 1], [". History: ", 0], [p.hx, 1], [" Prior level of function: ", 0], [p.prior, 1], [".", 0]] },
  { h: "Objective", segs: [["Findings: ", 0], [p.findings.join("; "), 1], [". Pain: " + p.pain + ".", 0]] },
  { h: "Assessment", segs: [["Diagnosis: ", 0], [p.icd + " " + p.dxDesc, 1], [". Functional limits: ", 0], [p.limits, 1]] },
  { h: "Plan of care", segs: [["Goals: ", 0], [p.goals.join("; "), 1], [". Frequency and duration: 2x per week for 6 weeks. Referring provider: ", 0], [p.referringName, 1], [".", 0]] },
];

/* ---------- authorization record logic ---------- */
const apptsFor = (r) => Array.from({ length: r.nAppts || 12 }, (_, i) => ({ n: r.completed + (r.claimed || 0) + i + 1, date: addDays(r.nextVisit, i * 3) }));
const apptStatus = (r, a) => {
  if (r.stage !== "Approved") return { k: "warn", t: "Decision pending" };
  if (a.n > r.authorized) return { k: "block", t: "Beyond approved visits" };
  if (r.end && pd(a.date) > pd(r.end)) return { k: "block", t: "After auth end date" };
  if (pd(a.date) < pd(r.start)) return { k: "warn", t: "Before auth start date" };
  return { k: "ok", t: "Covered" };
};
const utilOf = (r) => {
  if (r.stage !== "Approved") return null;
  const claimed = r.claimed || 0;
  const open = Math.max(r.authorized - r.completed - claimed, 0);
  const sched = apptsFor(r).filter((a) => apptStatus(r, a).k === "ok").length;
  const scheduled = Math.min(sched, open);
  return { completed: r.completed, claimed, scheduled, available: open - scheduled };
};

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap");
*{box-sizing:border-box}
.app{--tonal:#f1f3fe;--s0:#fff;--s2:#f5f5f5;--s3:#e5e5e5;--ink:#1f1f1f;--ink2:#454545;--mut:#737373;--bsub:rgba(0,0,0,.1);--bstr:rgba(0,0,0,.2);--acc:#1132ee;--acc4:#405bf2;--accsub:rgba(17,50,238,.1);--ok:#228048;--okbg:rgba(42,153,83,.1);--warn:#9f5617;--warnbg:rgba(194,112,35,.1);--bad:#b52b2b;--badbg:rgba(181,43,43,.1);--info:#345dbf;--infobg:rgba(65,107,207,.1);--cyan:#1c7d8a;--cyanbg:rgba(50,171,188,.1);--slatebg:rgba(71,85,105,.1);--r:8px;font-family:Geist,"Geist Sans",Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--tonal);height:100vh;display:flex;flex-direction:column;font-size:13px;line-height:1.6}
.app button{font:inherit;cursor:pointer;color:inherit}.app input,.app select,.app textarea{font:inherit;color:inherit}
.app :focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.shell{flex:1;min-height:0;display:flex}
.side{width:200px;flex:none;display:flex;flex-direction:column;padding:8px}
.logo{display:flex;align-items:center;gap:6px;height:32px;padding:0 6px;font-size:18px}.logo b{font-weight:600;letter-spacing:-.3px}
.navscroll{flex:1;overflow:auto;margin-top:16px}
.ngrp{margin-bottom:4px}.nh{display:flex;align-items:center;gap:8px;height:28px;padding:0 6px;color:var(--ink);font-weight:500}.nchev{margin-left:auto;color:var(--mut)}
.nitems.indent{margin-left:9px;border-left:1px solid var(--bsub);padding-left:0}
.nitem{display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border-radius:var(--r);color:var(--ink2);margin-bottom:2px}.nitem:hover{background:var(--accsub)}.nitem.on{background:var(--accsub);color:var(--acc);font-weight:500}
.sfoot{display:flex;align-items:center;gap:10px;height:36px;color:var(--ink2)}.avatar{width:28px;height:28px;border-radius:50%;background:#f1b24a;display:grid;place-items:center;font-weight:600;color:var(--ink)}
.main{flex:1;min-width:0;display:flex;flex-direction:column;padding:0 8px 8px 0}
.gbar{height:36px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 4px 0 0}
.gl{display:flex;align-items:center;gap:8px;min-width:240px;color:var(--ink2)}.gl .sep{color:#b3b8cc}
.gsearch{display:flex;align-items:center;gap:6px;color:var(--ink2)}.gs{display:flex;align-items:center;gap:6px;width:320px;height:27px;border-radius:var(--r);background:var(--s3);background:rgba(0,0,0,.05);padding:0 10px;color:var(--mut)}.kbd{margin-left:auto;font-size:12px}
.gr{display:flex;gap:16px;min-width:240px;justify-content:flex-end}.ai{display:flex;align-items:center;gap:5px;color:var(--acc);font-weight:500}
.panel{flex:1;min-height:0;background:var(--s0);border:1px solid var(--bsub);border-radius:var(--r);overflow:auto;position:relative}
.page{padding:8px 0 80px;min-height:100%;display:flex;flex-direction:column}
.phead{display:flex;align-items:center;justify-content:space-between;padding:0 12px 8px;gap:8px 12px;flex-wrap:wrap}
.pact{display:flex;gap:8px;align-items:center}
.muted{color:var(--mut)}.sm{font-size:12px;line-height:1.4}.mt{margin-top:6px}.amber{color:var(--warn)}.b{color:var(--acc)}.g{color:var(--ok)}.m{color:var(--mut)}.grow{flex:1}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:100px;height:28px;padding:0 14px;border:1px solid transparent;background:none;white-space:nowrap;font-weight:500;font-size:13px}
.btn.primary{background:var(--acc);color:#fff}.btn.primary:hover{background:#0e28c4}.btn.primary:disabled{background:var(--acc);opacity:.4}
.btn.outline{border-color:var(--acc);color:var(--acc);background:transparent}.btn.outline:hover{background:var(--accsub)}
.btn.ghost{padding:0 12px;color:var(--acc)}.btn.ghost:hover{background:var(--accsub)}
.btn.neutral{background:var(--s0);border-color:var(--bsub);color:var(--ink)}.btn.neutral:hover{background:var(--s2)}
.btn.dtert{padding:0 12px;color:var(--bad)}.btn.dtert:hover{background:var(--badbg)}
.btn:disabled{opacity:.4;cursor:default}
.link{background:none;border:0;color:var(--acc);padding:0;font-weight:500}.link.red{color:var(--bad)}
.ico{border:0;background:none;border-radius:var(--r);width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;color:var(--ink2)}.ico:hover,.ico.on{background:var(--accsub);color:var(--acc)}
.chip{display:inline-flex;align-items:center;gap:4px;border-radius:100px;height:20px;padding:0 8px;font-size:12px;font-weight:500;white-space:nowrap}
.chip.grey{background:var(--slatebg);color:var(--ink2)}.chip.blue{background:var(--infobg);color:var(--info)}.chip.violet{background:var(--cyanbg);color:var(--cyan)}.chip.green{background:var(--okbg);color:var(--ok)}.chip.amber{background:var(--warnbg);color:var(--warn)}.chip.red{background:var(--badbg);color:var(--bad)}
.tabs{display:flex;gap:8px}.tabs button{white-space:nowrap;border:0;background:none;height:28px;padding:0 12px;border-radius:100px;color:var(--ink2);display:flex;align-items:center}.tabs button:hover{background:var(--accsub)}.tabs button.on{background:var(--accsub);color:var(--acc);font-weight:500}
.badge{margin-left:6px;background:var(--bad);color:#fff;border-radius:100px;font-size:11px;line-height:16px;padding:0 6px}
.tblwrap{overflow:auto}
.tbl{width:100%;border-collapse:collapse}.tbl th{text-align:left;font-weight:500;color:var(--ink);padding:0 12px;height:28px;background:var(--s2);white-space:nowrap}
.tbl td{padding:6px 12px;border-bottom:1px solid var(--bsub);vertical-align:middle;min-height:36px}.tbl tr.hov{cursor:pointer}.tbl tr.hov:hover,.tbl tr.selrow{background:var(--tonal)}
.tbl input[type=checkbox]{accent-color:var(--acc)}
.pt{color:var(--acc);font-weight:500}
.ready{display:flex;align-items:center;gap:8px}.rbar{flex:1;height:6px;background:var(--s3);border-radius:100px;overflow:hidden;min-width:60px}.rbar i{display:block;height:100%;background:#c27023}.rbar i.full{background:#2a9953}
.how{margin:0 12px 8px;border:1px solid var(--bsub);border-radius:var(--r);background:var(--tonal)}.howh{display:flex;align-items:center;gap:8px;width:100%;border:0;background:none;padding:6px 12px;text-align:left}.howh .muted{flex:1}
.howb{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;padding:0 12px 12px}.rule{display:flex;gap:8px;align-items:center;margin-top:6px;flex-wrap:wrap}
.filters{display:flex;align-items:center;gap:12px;padding:0 12px 8px}.filters select{height:28px;border:1px solid var(--bsub);border-radius:var(--r);padding:0 8px;background:var(--s0)}
.seg{display:flex;gap:4px}.seg button{border:1px solid var(--bsub);background:var(--s0);height:28px;padding:0 12px;border-radius:100px;color:var(--ink2)}.seg button.on{background:var(--accsub);border-color:transparent;color:var(--acc);font-weight:500}
.chk{display:flex;align-items:center;gap:6px}.chk input{accent-color:var(--acc)}
.empty{margin:12px;border:1px dashed var(--bstr);border-radius:var(--r);padding:40px;text-align:center;color:var(--mut)}
.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:84px;background:var(--ink);color:#fff;border-radius:var(--r);padding:8px 14px;display:flex;gap:8px;align-items:center;z-index:50}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:30;display:flex;justify-content:flex-end}
.drawer{width:480px;max-width:100%;background:var(--s0);height:100%;display:flex;flex-direction:column;box-shadow:-8px 0 24px rgba(0,0,0,.14)}.drawer.narrow{width:420px}
.dh{display:flex;justify-content:space-between;align-items:flex-start;padding:12px 16px;border-bottom:1px solid var(--bsub)}.big{font-size:16px;font-weight:600}.dbody{padding:4px 16px 28px;overflow:auto}
.sect{margin:16px 0 6px;font-weight:600;display:flex;gap:8px;align-items:center}
.kv{display:grid;grid-template-columns:110px 1fr;gap:4px 12px;margin:8px 0}.kv span{color:var(--mut)}.kv b{font-weight:500}.kv.wide{grid-template-columns:150px 1fr}
table.mini{width:100%;border-collapse:collapse;margin-top:8px}.mini th{text-align:left;color:var(--mut);font-weight:500;padding:4px 6px;background:var(--s2)}.mini td{padding:4px 6px;border-bottom:1px solid var(--bsub)}
.att{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--bsub)}.att>div{flex:1}
.dletter{background:var(--tonal);border-radius:var(--r);padding:10px;margin:8px 0}.dec .trio{margin-top:8px}
mark{background:#ffe99a;border-radius:3px;padding:0 2px;color:inherit}
.ul{margin:6px 0 0 18px;padding:0}.ul li{margin:3px 0}
.flowpage{display:flex;flex-direction:column;height:100%}
.fbar{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;border-bottom:1px solid var(--bsub);flex:none}.crumb{display:flex;gap:8px;align-items:center}.sep{color:#b3b8cc}.fright{display:flex;align-items:center;gap:8px}.vsep{width:1px;height:20px;background:var(--bsub)}
.stepwrap{position:relative}.steppill{border:1px solid var(--acc);color:var(--acc);background:var(--s0);border-radius:100px;height:28px;padding:0 12px;display:flex;gap:6px;align-items:center;font-weight:500}
.stepmenu{position:absolute;right:0;top:34px;background:var(--s0);border:1px solid var(--bsub);border-radius:var(--r);box-shadow:0 8px 24px rgba(0,0,0,.14);width:240px;padding:4px;z-index:20}
.stepmenu button{display:flex;gap:10px;align-items:center;width:100%;border:0;background:none;text-align:left;padding:6px 8px;border-radius:var(--r)}.stepmenu button.on{background:var(--accsub)}.num{background:var(--s0);border:1.5px solid var(--ink);border-radius:3px;width:18px;height:18px;display:grid;place-items:center;font-size:11px;font-weight:500}.stepmenu .on .num{background:var(--acc);border-color:var(--acc);color:#fff}
.split{display:grid;grid-template-columns:minmax(380px,1fr) minmax(380px,1fr);flex:1;min-height:0}
.lcol{overflow:auto;display:flex;flex-direction:column;gap:12px;padding:12px}.rcol{background:var(--tonal);border-left:1px solid var(--bsub);display:flex;flex-direction:column;min-height:0}
.card{background:var(--s0);border:1px solid var(--bsub);border-radius:var(--r);padding:12px}.card.grow{flex:1;display:flex;flex-direction:column}.ct{font-weight:500;margin-bottom:8px;font-size:14px}
.row{display:flex;gap:8px;align-items:center}.row.between{justify-content:space-between;margin-top:8px}
.note{display:flex;gap:6px;align-items:center;margin-top:8px;color:var(--acc);background:var(--tonal);border-radius:var(--r);padding:4px 10px;font-size:12px}
.svc{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--bsub)}
.num2,.trio label,.fld label{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--mut)}.num2{flex-direction:row;align-items:center;gap:8px}
.num2 input{width:60px}.trio{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px}
.app input:not([type=checkbox]):not([type=radio]),.app textarea{border:1px solid var(--bsub);border-radius:var(--r);padding:0 8px;height:28px;background:var(--s0);width:100%;color:var(--ink)}
.app textarea{height:auto;padding:6px 8px}.app input:not([type=checkbox]):not([type=radio]):hover,.app textarea:hover{border-color:var(--bstr)}.app input:focus,.app textarea:focus{border-color:var(--acc)}
.okline,.warnline{display:flex;gap:8px;align-items:center;margin-top:8px;padding:6px 10px;border-radius:var(--r)}.okline{background:var(--okbg);color:var(--ok)}.warnline{background:var(--warnbg);color:var(--warn)}
.aibanner{display:flex;align-items:center;gap:8px;background:var(--tonal);color:var(--acc);border-radius:var(--r);padding:6px 10px;margin-bottom:8px}.aibanner span{flex:1}
.letta{flex:1;min-height:360px;resize:vertical;line-height:1.5}
.fld{margin-bottom:8px}.fld label{display:flex;flex-direction:row;justify-content:space-between}.fld .src{font-size:12px}.fld.miss .src{color:var(--warn)}.fld.miss input,.fld.miss textarea{border-color:#c27023;background:#fffaf4}.req{color:var(--bad);font-style:normal}
.pk{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--bsub)}.pk>div{flex:1}
.opt{display:flex;gap:10px;align-items:center;border:1px solid var(--bsub);border-radius:var(--r);padding:8px 10px;margin-bottom:8px;cursor:pointer}.opt.on{border-color:var(--acc);background:var(--tonal)}.opt input{accent-color:var(--acc)}
.rtabs{display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--bsub)}.rtabs button{border:0;background:none;height:28px;padding:0 12px;border-radius:100px;color:var(--ink2)}.rtabs button.on{background:var(--accsub);color:var(--acc);font-weight:500}
.rbody{overflow:auto;padding:16px;flex:1;background:var(--s2)}
.paper{background:#fff;border-radius:16px;padding:32px 36px;box-shadow:0 1px 4px rgba(0,0,0,.08);font-size:13px;line-height:1.6;color:var(--ink);max-width:760px;margin:0 auto}
.ph{margin-bottom:12px}.ph.c{text-align:center}.ph b{font-size:15px;font-weight:600}.pmeta{font-size:12px;color:var(--mut);border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:10px}.psec{margin-bottom:10px}.psec p{margin:2px 0}.pfoot{margin-top:14px;font-size:12px;color:var(--mut)}
.letter{white-space:pre-wrap;font-family:inherit;margin:0}
.fsec{margin-top:12px}.fh{background:var(--s2);font-weight:600;padding:3px 8px;margin-bottom:6px;border-radius:6px}.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}.fcell.wide{grid-column:1/-1}.fcell label{font-size:11px;color:var(--mut);display:block}.fv{border-bottom:1px solid #999;min-height:16px}.fv.miss{background:#fff1c9;color:#8a5200;border-bottom-color:#c27023}
.ft{width:100%;border-collapse:collapse}.ft th,.ft td{border:1px solid #bbb;padding:3px 6px;text-align:left}.sig{display:flex;justify-content:space-between;margin-top:20px}

.dt{position:relative;margin:0 12px;border:1px solid var(--bsub);border-radius:var(--r);background:var(--s0);overflow:hidden}
.dt.contained{margin:0}
.dth{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;gap:12px}
.views{display:flex;gap:8px}.vtab{border:0;background:none;height:28px;padding:0 12px;border-radius:100px;color:var(--ink2)}.vtab:hover{background:var(--accsub)}.vtab.on{background:var(--accsub);color:var(--acc);font-weight:500}
.dact{display:flex;align-items:center;gap:8px}
.ico.sq{width:28px;height:28px;justify-content:center;align-items:center;padding:0}
.sf{position:relative;display:flex;align-items:center}.sf input{width:180px;padding-right:28px!important;background:var(--s2)!important;border-color:transparent!important}.sf svg{position:absolute;right:8px;color:var(--mut)}
.frow{display:flex;align-items:center;gap:8px;padding:0 12px 8px}
.fchip{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:100px;background:var(--s2);border:0;font-size:12px}.fchip select{border:0;background:none;font-weight:500;height:22px;padding:0}.fchip.tog.on{background:var(--accsub);color:var(--acc);font-weight:500}
.dtc{overflow:auto}
.tbl.wide{min-width:1140px}
.tbl th.stick,.tbl td.stick{position:sticky;right:0;background:var(--s0);box-shadow:-1px 0 0 var(--bsub);width:52px;min-width:52px;padding:0 8px;text-align:center}
.tbl th.stick{background:var(--s2)}.tbl tr.selrow td.stick,.tbl tr:hover td.stick{background:var(--tonal)}
.asg{width:28px;height:28px;border-radius:50%;border:1px dashed var(--bstr);background:none;color:var(--mut);display:inline-grid;place-items:center;font-size:11px;font-weight:600;padding:0}.asg:hover{background:var(--accsub);color:var(--acc);border-color:var(--acc)}.asg.on{border:0;background:var(--accsub);color:var(--acc)}
.pgn{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-top:1px solid var(--bsub)}.pgn select{margin-left:8px;height:28px;border:1px solid var(--bsub);border-radius:var(--r);background:var(--s2);padding:0 8px}.pgn-r{display:flex;align-items:center;gap:8px}.pgb{width:28px;height:28px;border:0;border-radius:var(--r);background:none;color:var(--acc)}.pgb.on{background:var(--accsub)}
.bulkdock{margin-top:auto;flex:none;position:sticky;bottom:20px;display:flex;justify-content:center;align-items:flex-end;height:0;overflow:visible;z-index:10;pointer-events:none}.bulk{pointer-events:auto;background:var(--s0);border:1px solid var(--bsub);box-shadow:0 8px 24px rgba(0,0,0,.14);border-radius:12px;padding:8px 12px;display:flex;align-items:center;gap:12px;white-space:nowrap}
.bcount{background:#141414;color:#fff;border-radius:6px;min-width:28px;height:28px;display:grid;place-items:center;padding:0 6px;font-weight:600}

.bdiv{width:1px;height:28px;background:var(--bsub)}
.bwrap{position:relative}

.pop{position:absolute;background:var(--s0);border:1px solid var(--bsub);border-radius:var(--r);box-shadow:0 8px 24px rgba(0,0,0,.14);padding:4px;min-width:200px;z-index:30;display:flex;flex-direction:column}
.pop.up{bottom:34px;left:0}.pop button{border:0;background:none;text-align:left;padding:6px 8px;border-radius:var(--r);display:flex;flex-direction:column}.pop button:hover{background:var(--accsub)}
.tri{display:grid;grid-template-columns:240px minmax(0,1fr) minmax(0,1fr);flex:1;min-height:0}
.clist{border-right:1px solid var(--bsub);display:flex;flex-direction:column;min-height:0}
.clist-h{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--bsub)}
.clist-b{flex:1;overflow:auto;padding:4px}
.citem{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--r);cursor:pointer;min-height:36px}.citem:hover{background:var(--s2)}.citem.on{background:var(--accsub)}
.citem-b{flex:1;min-width:0}.ellip{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.okc{color:#2a9953;flex:none}.openc{color:var(--warn);flex:none}.warnc{color:#c27023;flex:none;margin-top:2px}
.spin{animation:sp 1s linear infinite;color:var(--acc);flex:none}@keyframes sp{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.spin{animation:none}}
.clist-f{position:relative;padding:8px;border-top:1px solid var(--bsub)}.btn.wide{width:100%;justify-content:center}
.rev{overflow:auto;border-right:1px solid var(--bsub)}.revin{padding:12px;display:flex;flex-direction:column;gap:8px}
.reading{display:flex;flex-direction:column;align-items:center;gap:6px;padding:60px 20px;text-align:center}
.chead h3{margin:0 0 4px;font-size:16px;font-weight:600}
.aisum{display:flex;gap:10px;background:var(--tonal);border-radius:var(--r);padding:10px 12px;color:var(--acc)}.aisum-t{font-weight:500;color:var(--ink)}.aisum svg{margin-top:2px;flex:none}
.sublabel{margin-top:8px;font-weight:500;color:var(--ink2)}.sublabel.tight{margin-top:10px;font-size:12px;color:var(--mut)}
.qacard{display:flex;gap:10px;align-items:flex-start;text-align:left;border:1px solid var(--bsub);border-radius:var(--r);padding:8px 10px;background:var(--s0);width:100%}.qacard:hover{background:var(--s2)}.qacard b{font-weight:500}
.actcard{display:flex;gap:10px;border:1px solid rgba(194,112,35,.3);background:rgba(194,112,35,.06);border-radius:var(--r);padding:10px}.actcard.done{border-color:var(--bsub);background:var(--s2)}.actb{flex:1}
.disc{border:1px solid var(--bsub);border-radius:var(--r)}.disc-t{display:flex;align-items:center;gap:8px;width:100%;border:0;background:none;padding:8px 10px;text-align:left}.disc-b{padding:4px 10px 10px}
.doc{display:flex;flex-direction:column;min-height:0;background:var(--s0)}
.sendbody{padding:12px;overflow:auto;display:flex;flex-direction:column;gap:12px}.sendbody .opt{flex:1;margin:0}
.pn{font-weight:500}
.fcell.hl{background:#fff1a8;outline:2px solid #e6c200}
@media(max-width:1100px){.tri{grid-template-columns:200px 1fr}.doc{display:none}}
.chipbtn{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:100px;border:0;background:var(--slatebg);color:var(--ink2);font-size:12px;font-weight:500}.chipbtn:hover{background:var(--badbg);color:var(--bad)}
.fwrap{position:relative}.fpop{top:32px;left:0;min-width:240px;padding:8px;gap:8px;bottom:auto}.fgroup{display:flex;flex-direction:column;gap:4px;padding:4px}.fl{font-weight:500;font-size:12px;color:var(--mut)}.fopt{display:flex;align-items:center;gap:8px;padding:2px 0}.fopt input{accent-color:var(--acc)}.fpop select{height:28px;border:1px solid var(--bsub);border-radius:var(--r);padding:0 8px;background:var(--s0)}.fpop button.btn{flex-direction:row;align-items:center}.btn.ghost.act{background:var(--accsub)}.fchip.on{border:0;cursor:pointer}
.dth{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;gap:12px;flex-wrap:wrap}
.views{display:flex;align-items:center;gap:8px}.vtab{white-space:nowrap;border:0;background:none;height:28px;padding:0 12px;border-radius:100px;color:var(--ink2);display:flex;align-items:center}.vtab:hover{background:var(--accsub)}.vtab.on{background:var(--accsub);color:var(--acc);font-weight:500}
.vdiv{width:1px;height:20px;background:var(--bsub)}
.dact{display:flex;align-items:center;gap:8px}
.ico.sq{width:28px;height:28px;position:relative}.ico.sq.on{background:var(--accsub);color:var(--acc)}.adot{position:absolute;top:3px;right:3px;width:7px;height:7px;border-radius:50%;background:var(--bad)}
.sf{position:relative;display:flex;align-items:center}.sf input{width:180px;padding-right:28px!important;background:var(--s2)!important;border-color:transparent!important}.sf svg{position:absolute;right:8px;color:var(--mut);pointer-events:none}
.fpop.right{left:auto;right:0}
.tbl th.stick2,.tbl td.stick2{position:sticky;right:0;width:44px;min-width:44px;padding:0 8px;background:var(--s0);text-align:center}
.tbl th.stick2{background:var(--s2)}.tbl tr.selrow td.stick2,.tbl tr:hover td.stick2{background:var(--tonal)}
.tbl th.stick,.tbl td.stick{right:0}.tbl th.actc,.tbl td.actc{width:40px;min-width:40px;padding:0 4px;text-align:center}
.tbl.wide{min-width:1900px}.tbl.wide td,.tbl.wide th{white-space:nowrap}
.asg{width:28px;height:28px;border-radius:50%;border:1px solid var(--bsub);background:var(--s0);color:var(--ink2);display:inline-grid;place-items:center;padding:0}.asg:hover{background:var(--accsub);color:var(--acc);border-color:var(--acc)}
.ract{color:var(--acc);position:relative}.ract:hover{background:var(--accsub)}
.ract::after{content:attr(data-tip);position:absolute;left:34px;top:50%;transform:translateY(-50%);z-index:5;background:var(--ink);color:#fff;font-size:12px;line-height:1.4;padding:3px 8px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s}
.ract:hover::after,.ract:focus-visible::after{opacity:1}
.frow{padding:0 12px 8px}
.util{width:150px;outline:none;border-radius:var(--r);padding:2px 0}.util:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.ubar{height:8px;border-radius:100px;background:var(--s0);border:1px solid var(--bstr);overflow:hidden;display:flex}.ubar i{display:block;height:100%}.ubar .k{background:#5fae5c}.ubar .c{background:#2c5db5}.ubar .s{background:#8cb3ea}
.usum{font-size:12px;line-height:1.4;color:var(--mut);margin-top:3px}.usum b{color:var(--ink);font-weight:500}
.ulegend{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin-top:8px;font-size:12px;line-height:1.4;white-space:nowrap}.ulegend span{display:flex;align-items:center;gap:6px}.ulegend i{width:7px;height:7px;border-radius:50%;flex:none}
.lc{color:#2c5db5}.lc i{background:#2c5db5}.lk{color:#3f8f3c}.lk i{background:#5fae5c}.ls{color:#5e8fd6}.ls i{background:#8cb3ea}.la{color:var(--mut)}.la i{background:#9aa0a6}
.util.full{width:auto;max-width:300px;margin:8px 0}
.utip{position:fixed;z-index:60;background:var(--s0);border:1px solid var(--bsub);border-radius:var(--r);box-shadow:0 8px 24px rgba(0,0,0,.16);padding:10px 12px;width:260px;pointer-events:none}.utip-h{font-weight:500;margin-bottom:6px}.utip-f{margin-top:8px}
.asg.on{border:0;background:var(--accsub);color:var(--acc);font-size:11px;font-weight:600}
.chead h3{margin:0;font-size:20px;font-weight:600;letter-spacing:-.2px}.chead .sub{color:var(--mut);margin-top:2px}
.rpanel{border:1px solid var(--bsub);border-radius:16px;background:var(--tonal);overflow:hidden}
.rp-top{padding:16px}.rp-t{font-size:15px;font-weight:500;color:var(--ink)}.rp-b{margin-top:6px;color:var(--ink2)}.rp-b.solo{margin-top:0}.rp-th{display:flex;gap:4px;margin-top:8px;margin-left:-6px}
.rp-body{border-top:1px solid var(--bsub);padding:16px;display:flex;flex-direction:column;gap:10px}
.sublabel2{color:var(--mut);margin-top:4px}
.qacard{display:flex;gap:12px;align-items:flex-start;text-align:left;border:1px solid var(--bsub);border-radius:14px;padding:12px 14px;background:var(--s0);width:100%;box-shadow:none}.qacard:hover{background:var(--s0);border-color:var(--bstr)}.qacard b{font-weight:500;font-size:14px}.qd{color:var(--ink2);margin-top:1px}.qacard .okc{margin-top:1px}
.actcard{display:block;background:var(--s0);border:0;box-shadow:0 1px 4px rgba(0,0,0,.1);border-radius:14px;padding:12px 14px}.actcard.done{background:var(--s0);opacity:.85;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.act-h{display:flex;align-items:center;justify-content:space-between;gap:12px}.act-h b{font-weight:500;font-size:14px}.act-b{margin-top:6px;color:var(--ink2)}
.rcard{border:1px solid var(--bsub);border-radius:16px;padding:16px;background:var(--s0)}.rc-t{font-weight:600;font-size:15px;margin-bottom:8px}
.rstep{display:flex;align-items:center;gap:12px;padding:8px 0;color:var(--ink2)}.rstep.cur{color:var(--ink);font-weight:500}.spinb{animation:sp 1s linear infinite;color:var(--ink);flex:none}
@media(prefers-reduced-motion:reduce){.spinb{animation:none}}
.rtool{display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:1px solid var(--bsub);background:var(--s0)}
.zsel{position:relative;display:flex;align-items:center}.zsel select{appearance:none;border:0;background:none;height:28px;padding:0 20px 0 6px;color:var(--ink);cursor:pointer}.zsel svg{position:absolute;right:4px;pointer-events:none;color:var(--ink)}
.rtool .ico:disabled{opacity:.35;cursor:default}
.pgcirc{width:28px;height:28px;border-radius:50%;border:1px solid var(--bsub);background:var(--s0);display:grid;place-items:center;color:var(--ink2);padding:0}.pgcirc:disabled{opacity:.5;cursor:default}
.pgtxt{font-size:14px;color:var(--ink2);min-width:44px;text-align:center}
.scrim.center{justify-content:center;align-items:center;background:rgba(0,0,0,.3)}
.modal{width:640px;max-width:calc(100% - 32px);background:var(--s0);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.24);overflow:hidden;display:flex;flex-direction:column}
.mh{padding:20px 20px 12px}.mh h3{margin:0 0 2px;font-size:18px;font-weight:600}
.mprog{height:3px;background:var(--s3)}.mprog i{display:block;height:100%;background:var(--acc);transition:width .4s ease}
@media(prefers-reduced-motion:reduce){.mprog i{transition:none}}
.mbody{padding:8px 12px;max-height:50vh;overflow:auto}
.mrow{display:flex;align-items:center;gap:12px;padding:10px 8px;border-bottom:1px solid var(--bsub)}.mrow:last-child{border-bottom:0}
.mfile{width:32px;height:32px;border-radius:8px;background:var(--tonal);color:var(--acc);display:grid;place-items:center;flex:none}
.mtxt{flex:1;min-width:0}.mtxt b{font-weight:500}.mst{display:flex;align-items:center;gap:8px;flex:none}
.mf{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:12px 16px;border-top:1px solid var(--bsub);min-height:56px}
.modal.wide{width:760px}.mh.row{display:flex;align-items:center;gap:8px}.mh.row h3{font-size:16px}
.mprev{background:var(--s2);padding:16px;max-height:56vh;overflow:auto}
.mpdf{width:36px;height:44px;border-radius:6px;background:var(--badbg);color:var(--bad);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;flex:none;font-size:9px}.mpdf b{font-weight:700;letter-spacing:.3px}
.mtxt .muted{white-space:normal}
.sendsplit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);flex:1;min-height:0}
.sendleft{overflow:auto;padding:12px;display:flex;flex-direction:column;gap:12px;min-width:0}
.sendleft .opt{flex:1;margin:0}
.pkgtitle{display:flex;align-items:center;gap:8px;height:28px}
.pkgpage{margin-bottom:16px}.pkghead{display:flex;align-items:center;gap:8px;margin:4px 4px 8px;color:var(--ink2)}.pkghead b{font-weight:500;color:var(--ink)}
.rbody.pkg{scroll-behavior:auto}
.pc{display:flex;flex-direction:column;height:100%}
.pc-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px 4px;flex-wrap:wrap}
.pc-id{display:flex;align-items:center;gap:10px}.pc-av{width:36px;height:36px;border-radius:50%;background:#cdb8e8;display:grid;place-items:center;font-weight:600}
.pc-name{font-size:16px}.pc-name a{color:var(--acc);font-weight:500;cursor:pointer}.accc{color:var(--acc)}
.pcirc{width:36px;height:36px;border-radius:50%;border:1px solid var(--bsub);background:var(--s0);display:grid;place-items:center;color:var(--acc);padding:0}.pcirc:hover{background:var(--accsub)}
.pc-tabs{display:flex;align-items:center;gap:4px;padding:0 16px;border-bottom:1px solid var(--bsub)}
.pctab{border:0;background:none;height:40px;padding:0 12px;border-bottom:2px solid transparent;color:var(--ink2);font-weight:500;margin-bottom:-1px;white-space:nowrap}.pctab:hover{color:var(--ink)}.pctab.on{color:var(--acc);border-bottom-color:var(--acc)}
.ico.acc{color:var(--acc)}
.pc-main{display:flex;flex:1;min-height:0}.pc-body{flex:1;min-width:0;overflow:auto;padding:16px 16px 80px;position:relative;display:flex;flex-direction:column}
.pc-rail{width:48px;border-left:1px solid var(--bsub);display:flex;flex-direction:column;align-items:center;gap:8px;padding-top:12px;flex:none}
.pc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}.pc-head h2{margin:0;font-size:20px;font-weight:600}
.sf.wide input{width:300px;padding-left:30px!important;padding-right:8px!important}.sf .sl{position:absolute;left:10px;right:auto}
.tbl.attbl th.actw,.tbl.attbl td.actw{width:130px;min-width:130px;text-align:left;padding:0 8px}
.thsort{border:0;background:none;display:inline-flex;align-items:center;gap:6px;padding:0;font-weight:500}
.tbl tr.grp td{background:var(--s2);padding:6px 12px}.grpin{display:flex;align-items:center;gap:8px}.grpin input{accent-color:var(--acc)}
.gchip{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:100px;font-size:13px}.gchip.green{background:rgba(42,153,83,.12)}.gchip.amber{background:rgba(194,112,35,.14)}.gchip.blue{background:var(--infobg);color:var(--info)}
.tbl.attbl td,.tbl.attbl th{white-space:nowrap}.docname{display:flex;align-items:center;gap:8px;color:var(--ink2)}
.docdrawer{width:720px}.docdrawer .rbody{flex:1}
.grow2{display:flex;gap:12px;padding:6px 0;border-bottom:1px solid #eee}.grow2 .muted{width:160px;flex:none}
@media(max-width:900px){.split{grid-template-columns:1fr}.howb{grid-template-columns:1fr}.side{display:none}}
`;


/* ---------- small pieces ---------- */
const Chip = ({ tone = "grey", children }) => <span className={"chip " + tone}>{children}</span>;
const TriggerChip = ({ t }) => t.type === "rule" ? <Chip tone="blue"><ListChecks size={12} />Payer rule</Chip> : <Chip tone="violet"><ShieldCheck size={12} />Eligibility check</Chip>;
const Ready = ({ pct }) => (
  <div className="ready"><div className="rbar"><i style={{ width: pct + "%" }} className={pct === 100 ? "full" : ""} /></div><span>{pct}%</span></div>
);
const Util = ({ r, full }) => {
  const [tip, setTip] = useState(null);
  const u = utilOf(r);
  if (!u) return <div className="muted sm">Pending decision</div>;
  const tot = Math.max(r.authorized, 1);
  const w = (n) => (n / tot) * 100 + "%";
  const bar = <div className="ubar" aria-hidden="true"><i className="k" style={{ width: w(u.claimed) }} /><i className="c" style={{ width: w(u.completed) }} /><i className="s" style={{ width: w(u.scheduled) }} /></div>;
  const legend = (
    <div className="ulegend">
      <span className="lc"><i />{u.completed} Completed</span><span className="lk"><i />{u.claimed} Claimed</span>
      <span className="ls"><i />{u.scheduled} Scheduled</span><span className="la"><i />{u.available} Available</span>
    </div>
  );
  if (full) return <div className="util full">{bar}{legend}</div>;
  const show = (e) => { const b = e.currentTarget.getBoundingClientRect(); const up = b.bottom + 150 > window.innerHeight; setTip({ x: b.left, y: up ? b.top - 6 : b.bottom + 6, up }); };
  const label = u.completed + " completed, " + u.claimed + " claimed, " + u.scheduled + " scheduled, " + u.available + " available";
  return (
    <div className="util" tabIndex={0} aria-label={"Utilization: " + label} onMouseEnter={show} onMouseLeave={() => setTip(null)} onFocus={show} onBlur={() => setTip(null)}>
      {bar}
      <div className="usum"><b>{u.available}</b> of {r.authorized} available</div>
      {tip && (
        <div className="utip" role="tooltip" style={{ left: tip.x, top: tip.y, transform: tip.up ? "translateY(-100%)" : "none" }}>
          <div className="utip-h">Utilization</div>{bar}{legend}
          <div className="muted sm utip-f">{r.authorized} visits authorized, {r.start} to {r.end || "open ended"}</div>
        </div>)}
    </div>
  );
};

/* ---------- paper previews ---------- */
function EvalPaper({ p }) {
  return (
    <div className="paper">
      <div className="ph"><b>{p.facility}</b><div>Initial evaluation and plan of care</div></div>
      <div className="pmeta">{p.name} | DOB {p.dob} | MRN {p.mrn} | Evaluated {p.evalDate} | {p.treatingPT}</div>
      {evalNote(p).map((s) => (
        <div key={s.h} className="psec"><b>{s.h}</b><p>{s.segs.map((g, i) => g[1] ? <mark key={i}>{g[0]}</mark> : <span key={i}>{g[0]}</span>)}</p></div>
      ))}
      <div className="pfoot">Highlighted text is what Air used to build the letter and the form.</div>
    </div>
  );
}
function LetterPaper({ p, text }) {
  return (
    <div className="paper">
      <div className="ph c"><b>{p.facility}</b><div>Outpatient physical therapy</div></div>
      <pre className="letter">{text}</pre>
    </div>
  );
}
function FormPaper({ p, vals, svc, hl }) {
  const pay = PAYERS[p.payerKey];
  return (
    <div className="paper form">
      <div className="ph c"><b>{pay.form}</b><div>Fax to {pay.fax}</div></div>
      {fieldsFor(p.payerKey).map((s) => (
        <div key={s.sec} className="fsec">
          <div className="fh">{s.sec}</div>
          <div className="fgrid">
            {s.items.map((f) => {
              const v = String(vals[f.k] || "").trim();
              return (
                <div key={f.k} className={"fcell" + (f.area ? " wide" : "") + (hl === f.k ? " hl" : "")}>
                  <label>{f.l}{f.req ? " *" : ""}</label>
                  {v ? <div className="fv">{v}</div> : f.req ? <div className="fv miss">Missing</div> : <div className="fv empty">&nbsp;</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="fsec">
        <div className="fh">Requested services (per visit)</div>
        <table className="ft"><thead><tr><th>CPT</th><th>Description</th><th>Units</th></tr></thead>
          <tbody>{svc.map((r) => <tr key={r.cpt}><td>{r.cpt}</td><td>{r.desc}</td><td>{r.units}</td></tr>)}</tbody></table>
      </div>
      <div className="fsec sig"><div>Therapist signature: ____________________</div><div>Date: ____________</div></div>
    </div>
  );
}

/* ---------- multi-patient flow (same pattern as the contract upload) ---------- */
const DIRECTORY = { "Dr. Samuel Ortiz, MD": "1720458936", "Dr. Elena Park, MD": "1457390281", "Dr. Mei Chen, MD": "1093847562" };
const suggestFor = (p, k) => k === "referringNpi" ? DIRECTORY[p.referringName] : k === "treatingNpi" ? "1982736450" : undefined;
const suggestNote = { referringNpi: "Matched in the provider directory by name", treatingNpi: "From the provider master for the treating therapist" };
const initials = (n) => n.split(" ").map((x) => x[0]).join("").slice(0, 2);

function Disc({ title, tag, open, onToggle, children }) {
  return (
    <div className="disc">
      <button className="disc-t" aria-expanded={open} onClick={onToggle}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<b>{title}</b>{tag && <Chip tone="grey">{tag}</Chip>}</button>
      {open && <div className="disc-b">{children}</div>}
    </div>
  );
}

const READ_STEPS = ["Reading the initial evaluation", "Matching demographics and insurance", "Finding the payer form", "Drafting the clinical summary", "Checking for missing fields"];
const initSt = (p) => ({ step: 0, sumVote: null, read: false, resolved: {}, edits: {}, draft: null, svc: p.requested.map((r) => ({ ...r })), o: baseOpts(p), vote: null, busy: false });

function Flow({ ids, pool, onClose, onSend }) {
  const [order, setOrder] = useState(ids);
  const [st, setSt] = useState(() => Object.fromEntries(ids.map((i) => [i, initSt(pool.find((x) => x.id === i))])));
  const [sel, setSel] = useState(ids[0]);
  const [step, setStep] = useState(0);
  const [menu, setMenu] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState("eval");
  const [hl, setHl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [open, setOpen] = useState({ svc: false, letter: false, fields: false });
  const [method, setMethod] = useState("download");
  const [incl, setIncl] = useState({});
  const P = (id) => pool.find((x) => x.id === id);
  const upd = (id, patch) => setSt((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const timers = React.useRef([]);
  const startRead = (id, delay) => {
    READ_STEPS.forEach((_, k) => timers.current.push(setTimeout(() => upd(id, { step: k + 1 }), delay + (k + 1) * 350)));
    timers.current.push(setTimeout(() => upd(id, { read: true }), delay + READ_STEPS.length * 350 + 250));
  };
  React.useEffect(() => {
    ids.forEach((id, i) => startRead(id, 300 + Math.floor(i / 2) * 1200));
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const info = (id) => {
    const p = P(id), s = st[id];
    const base = readiness(p, s.o, {});
    const rd = readiness(p, s.o, s.edits);
    const acts = base.missing;
    const reviewed = acts.every((f) => s.resolved[f.k]);
    const partial = acts.some((f) => s.resolved[f.k] === "skipped");
    return { p, s, rd, acts, reviewed, partial };
  };
  const allRead = order.every((id) => st[id].read);
  const includedIds = order.filter((id) => incl[id] !== false);
  const canSend = includedIds.length > 0 && includedIds.every((id) => st[id].read && info(id).reviewed);

  const remove = (id) => {
    const next = order.filter((x) => x !== id);
    setOrder(next);
    if (!next.length) { onClose(); return; }
    if (sel === id) setSel(next[0]);
  };
  const add = (id) => {
    setOrder([...order, id]); setSt((s) => ({ ...s, [id]: initSt(P(id)) })); setAddOpen(false);
    startRead(id, 100);
  };
  const candidates = pool.filter((x) => !order.includes(x.id));
  const go = (n) => { setStep(n); setMenu(false); };
  const pick = (id) => { setSel(id); setTab("eval"); setHl(null); };
  const accept = (id, f, val, how) => { const s = st[id]; upd(id, { edits: { ...s.edits, [f.k]: val }, resolved: { ...s.resolved, [f.k]: how } }); };
  const skip = (id, f) => { const s = st[id]; upd(id, { resolved: { ...s.resolved, [f.k]: "skipped" } }); };
  const regen = (id) => { upd(id, { busy: true }); setTimeout(() => upd(id, { busy: false, draft: null, vote: null }), 900); };
  const showTab = (t, k) => { setTab(t); setHl(k || null); };

  const [pkgPg, setPkgPg] = useState(0);
  const pkgRef = React.useRef(null);
  const fileName = (p) => { const n = p.name.split(" "); return n.slice(1).join("") + "_" + n[0] + "_PA_Packet.pdf"; };
  const [sending, setSending] = useState(null);
  const [dl, setDl] = useState({});
  const send = () => {
    const results = includedIds.map((id) => { const { p, s, rd } = info(id); return { p, method, rd, svc: s.svc, o: s.o, letter: s.draft === null ? letterFor(p, s.svc, s.o) : s.draft }; });
    setSending({ results, done: 0 }); setDl({});
    results.forEach((_, i) => timers.current.push(setTimeout(() => setSending((s) => s ? { ...s, done: Math.max(s.done, i + 1) } : s), 700 + i * 650)));
  };
  const finishSend = () => { const r = sending.results; setSending(null); onSend(r); };
  const onPkgScroll = () => {
    const c = pkgRef.current; if (!c) return;
    const top = c.getBoundingClientRect().top; let cur = 0;
    c.querySelectorAll("[data-pg]").forEach((el, i) => { if (el.getBoundingClientRect().top - top <= 90) cur = i; });
    setPkgPg(cur);
  };
  const goPkg = (i) => {
    const c = pkgRef.current; if (!c) return;
    const el = c.querySelector('[data-pg="' + i + '"]'); if (!el) return;
    c.scrollBy({ top: el.getBoundingClientRect().top - c.getBoundingClientRect().top - 12, behavior: "smooth" });
  };

  const cur = order.includes(sel) ? info(sel) : null;
  const curP = cur ? cur.p : null;

  const header = (
    <div className="fbar">
      <div className="crumb"><b>Generate Prior Auth Forms</b></div>
      <div className="fright">
        <div className="stepwrap">
          <button className="steppill" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>{step + 1} of 2: {step === 0 ? "Review" : "Review and send"}<ChevronDown size={14} /></button>
          {menu && (
            <div className="stepmenu" role="menu">
              {["Review", "Review and send"].map((n, i) => (
                <button key={n} role="menuitem" className={i === step ? "on" : ""} disabled={i === 1 && !allRead} onClick={() => go(i)}>
                  <span className="num">{i + 1}</span><span><div>{n}</div><div className="muted sm">{i === 0 ? (step === 1 ? "Complete" : "In progress") : step === 1 ? (canSend ? "Ready to send" : "Needs review") : "Pending"}</div></span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="vsep" />
        <button className="btn dtert" onClick={onClose}>Cancel</button>
        {step === 0
          ? <button className="btn primary" disabled={!allRead} onClick={() => go(1)}>Continue</button>
          : <button className="btn primary" disabled={!canSend} title={canSend ? "" : "Review every included patient first"} onClick={send}>{method === "download" ? "Download" : "Send"} {includedIds.length} packet{includedIds.length === 1 ? "" : "s"}</button>}
      </div>
    </div>
  );

  if (step === 1) {
    const pages = includedIds.flatMap((id) => { const { p, s, rd } = info(id); const letter = s.draft === null ? letterFor(p, s.svc, s.o) : s.draft; return [{ id, p, rd, svc: s.svc, letter, kind: "letter" }, { id, p, rd, svc: s.svc, letter, kind: "form" }]; });
    const curPage = pages[Math.min(pkgPg, pages.length - 1)];
    return (
      <div className="flowpage">
        {header}
        <div className="sendsplit">
          <div className="sendleft">
            <div className="card">
              <div className="ct">How do you want to send these?</div>
              <div className="row">
                <label className={"opt" + (method === "download" ? " on" : "")}><input type="radio" checked={method === "download"} onChange={() => setMethod("download")} /><div><b>Download PDFs</b><div className="muted sm">Upload them to each payer portal yourself</div></div></label>
                <label className={"opt" + (method === "fax" ? " on" : "")}><input type="radio" checked={method === "fax"} onChange={() => setMethod("fax")} /><div><b>Send by fax</b><div className="muted sm">To each payer's fax number</div></div></label>
              </div>
              <div className="note"><Info size={13} />Air does not connect to payer portals. Each packet is saved to the authorization's attachments.</div>
            </div>
            <div className="dt contained">
              <table className="tbl"><thead><tr><th style={{ width: 36 }} /><th>Patient</th><th>Required fields</th><th>Status</th><th /></tr></thead><tbody>
                {order.map((id) => { const { p, rd, reviewed, partial } = info(id); const on = incl[id] !== false; const idx = pages.findIndex((x) => x.id === id); return (
                  <tr key={id} className={"hov" + (curPage && curPage.id === id ? " selrow" : "")} onClick={() => { if (idx >= 0) goPkg(idx); }}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={on} onChange={() => setIncl({ ...incl, [id]: !on })} aria-label={"Include " + p.name} /></td>
                    <td><b className="pn">{p.name}</b><div className="muted sm">MRN: {p.mrn} | {p.plan} form</div></td>
                    <td style={{ minWidth: 120 }}><Ready pct={Math.round((rd.filled / rd.total) * 100)} /><div className="muted sm">{rd.filled} of {rd.total}</div></td>
                    <td>{!reviewed ? <Chip tone="red">Needs review</Chip> : partial || rd.missing.length ? <Chip tone="amber">Partial</Chip> : <Chip tone="green">Complete</Chip>}</td>
                    <td onClick={(e) => e.stopPropagation()}>{!reviewed && <button className="btn ghost" onClick={() => { pick(id); go(0); }}>Review</button>}</td></tr>); })}
              </tbody></table>
            </div>
          </div>
          <div className="doc">
            <div className="rtabs"><span className="pkgtitle"><b>PDF package</b><span className="muted"> {includedIds.length} patient{includedIds.length === 1 ? "" : "s"}, {pages.length} pages</span></span></div>
            <div className="rtool">
              <button className="ico" aria-label="Zoom out" onClick={() => setZoom(Math.max(50, zoom - 25))} disabled={zoom <= 50}><ZoomOut size={18} /></button>
              <label className="zsel"><select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom">{[50, 75, 100, 125, 150].map((z) => <option key={z} value={z}>{z}%</option>)}</select><ChevronDown size={12} /></label>
              <button className="ico" aria-label="Zoom in" onClick={() => setZoom(Math.min(150, zoom + 25))} disabled={zoom >= 150}><ZoomIn size={18} /></button>
              <span className="grow" />
              <button className="pgcirc" aria-label="Previous page" disabled={pkgPg <= 0} onClick={() => goPkg(Math.max(0, pkgPg - 1))}><ChevronUp size={14} /></button>
              <span className="pgtxt">{pages.length ? Math.min(pkgPg, pages.length - 1) + 1 : 0} of {pages.length}</span>
              <button className="pgcirc" aria-label="Next page" disabled={pkgPg >= pages.length - 1} onClick={() => goPkg(Math.min(pages.length - 1, pkgPg + 1))}><ChevronDown size={14} /></button>
            </div>
            <div className="rbody pkg" ref={pkgRef} onScroll={onPkgScroll}>
              {pages.length === 0 ? <div className="muted sm" style={{ textAlign: "center", marginTop: 40 }}>Select at least one patient to build the package.</div> : (
                <div style={{ zoom: zoom / 100 }}>
                  {pages.map((pg, i) => (
                    <section key={pg.id + pg.kind} data-pg={i} className="pkgpage">
                      {pg.kind === "letter" && <div className="pkghead"><FileText size={14} /><b>{fileName(pg.p)}</b><span className="muted sm">{pg.p.name}, 2 pages</span></div>}
                      {pg.kind === "letter" ? <LetterPaper p={pg.p} text={pg.letter} /> : <FormPaper p={pg.p} vals={pg.rd.vals} svc={pg.svc} hl={null} />}
                    </section>))}
                </div>)}
            </div>
          </div>
        </div>
        {sending && (() => {
          const n = sending.results.length, done = sending.done >= n, fax = method === "fax";
          return (
            <div className="scrim center" onKeyDown={(e) => { if (e.key === "Escape" && done) finishSend(); }}>
              <div className="modal" role="dialog" aria-modal="true" aria-labelledby="sendttl">
                <div className="mh">
                  <h3 id="sendttl">{done ? (fax ? n + (n === 1 ? " fax sent" : " faxes sent") : n + (n === 1 ? " packet ready" : " packets ready")) : (fax ? "Sending " + n + (n === 1 ? " fax" : " faxes") : "Preparing " + n + (n === 1 ? " packet" : " packets"))}</h3>
                  <div className="muted sm">{fax ? "Sent to each payer's fax number. Confirmations are saved to the authorization." : "Each packet has the clinical letter and the payer form."}</div>
                </div>
                <div className="mprog" role="progressbar" aria-valuemin="0" aria-valuemax={n} aria-valuenow={sending.done}><i style={{ width: (sending.done / n) * 100 + "%" }} /></div>
                <div className="mbody">
                  {sending.results.map((r, i) => { const ready = sending.done > i; return (
                    <div key={r.p.id} className="mrow">
                      <span className="mfile"><FileText size={16} /></span>
                      <div className="mtxt"><b>{r.p.name}</b><div className="muted sm">{fax ? "Fax to " + PAYERS[r.p.payerKey].fax : fileName(r.p) + ", 2 pages"}</div></div>
                      {!ready ? <span className="mst"><Loader2 size={16} className="spinb" /><span className="muted sm">{fax ? "Sending" : "Preparing"}</span></span>
                        : fax ? <span className="mst"><Chip tone="green">Sent</Chip><span className="muted sm">FX-{100230 + i * 7}</span></span>
                        : dl[r.p.id] ? <span className="mst"><Chip tone="green"><Check size={12} />Downloaded</Chip></span>
                        : <span className="mst"><Chip tone="green">Ready</Chip><button className="btn ghost" onClick={() => setDl({ ...dl, [r.p.id]: true })}><Download size={14} />Download</button></span>}
                    </div>); })}
                </div>
                <div className="mf">
                  {!done ? <span className="muted sm">This takes a few seconds</span> : <>
                    {!fax && <button className="btn ghost" onClick={() => { const a = {}; sending.results.forEach((r) => { a[r.p.id] = true; }); setDl(a); }}><Download size={14} />Download all</button>}
                    <button className="btn primary" onClick={finishSend}>Done</button></>}
                </div>
              </div>
            </div>);
        })()}
      </div>
    );
  }

  return (
    <div className="flowpage">
      {header}
      <div className="tri">
        <div className="clist">
          <div className="clist-h"><b>Patients</b><span className="muted">{order.length}</span></div>
          <div className="clist-b">
            {order.map((id) => { const p = P(id), s = st[id]; const done = s.read ? info(id).reviewed : false; return (
              <div key={id} className={"citem" + (sel === id ? " on" : "")} onClick={() => pick(id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") pick(id); }}>
                {!s.read ? <Loader2 size={16} className="spin" /> : done ? <CheckCircle2 size={16} className="okc" /> : <Circle size={16} className="openc" />}
                <div className="citem-b"><div className="ellip">{p.name}</div><div className="muted sm ellip">{s.read ? p.caseName + " | " + p.plan : "Reading the chart"}</div></div>
                <button className="ico" aria-label={"Remove " + p.name} onClick={(e) => { e.stopPropagation(); remove(id); }}><X size={14} /></button>
              </div>); })}
          </div>
          <div className="clist-f">
            <button className="btn outline wide" onClick={() => setAddOpen(!addOpen)} disabled={!candidates.length}><Plus size={14} />Add patients</button>
            {addOpen && <div className="pop up">{candidates.map((c) => <button key={c.id} onClick={() => add(c.id)}><b>{c.name}</b><span className="muted sm">{c.plan}</span></button>)}</div>}
          </div>
        </div>

        <div className="rev">
          {!cur ? null : !cur.s.read ? (
            <div className="revin">
              <div className="chead"><h3>{curP.name}</h3><div className="sub">{curP.caseName}, {curP.plan}</div></div>
              <div className="rcard">
                <div className="rc-t">Athelas AI is reading the chart</div>
                {READ_STEPS.slice(0, Math.min(cur.s.step + 1, READ_STEPS.length)).map((t, i) => (
                  <div key={t} className={"rstep" + (i === cur.s.step ? " cur" : "")}>{i < cur.s.step ? <CheckCircle2 size={20} className="okc" /> : <Loader2 size={20} className="spinb" />}<span>{t}</span></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="revin">
              <div className="chead"><h3>{curP.name}</h3><div className="sub">{curP.caseName}, {curP.plan}, evaluated {curP.evalDate}</div></div>
              {(() => { const open = cur.acts.filter((f) => !cur.s.resolved[f.k]).length; return (
              <div className="rpanel">
                <div className="rp-top">
                  {cur.acts.length > 0 && <div className="rp-t">{open === 0 ? "All items reviewed" : open + (open === 1 ? " item needs" : " items need") + " your review before you send"}</div>}
                  <div className={"rp-b" + (cur.acts.length === 0 ? " solo" : "")}>Athelas AI filled {cur.rd.filled} of {cur.rd.total} required fields from the initial evaluation signed {curP.evalDate}. Select anything below to see where it comes from in the document.</div>
                  <div className="rp-th">
                    <button className={"ico" + (cur.s.sumVote === "up" ? " on" : "")} onClick={() => upd(curP.id, { sumVote: "up" })} aria-label="Helpful"><ThumbsUp size={16} /></button>
                    <button className={"ico" + (cur.s.sumVote === "down" ? " on" : "")} onClick={() => upd(curP.id, { sumVote: "down" })} aria-label="Not helpful"><ThumbsDown size={16} /></button>
                  </div>
                </div>
                <div className="rp-body">
                  <div className="sublabel2">Chart review</div>
                  {[["Initial evaluation", "Signed " + curP.evalDate + " by " + curP.treatingPT, "eval", null], ["Insurance", curP.plan + ", member " + curP.memberId, "form", "memberId"], ["Referral", curP.referringName + " on file", "form", "referringName"], ["Authorization required", (() => { const t = curP.trigger.text.replace(/^[^:]+: /, ""); return t.charAt(0).toUpperCase() + t.slice(1); })(), "form", null]].map(([t, d, tb, k]) => (
                    <button key={t} className="qacard" onClick={() => showTab(tb, k)}><CheckCircle2 size={20} className="okc" /><div><b>{t}</b><div className="qd">{d}</div></div></button>
                  ))}
                  {cur.acts.length > 0 && <div className="sublabel2">{cur.acts.length === 1 ? "Suggested action" : "Suggested actions"}</div>}
                  {cur.acts.map((f) => { const res = cur.s.resolved[f.k]; const sg = suggestFor(curP, f.k); return (
                    <div key={f.k} className={"actcard" + (res ? " done" : "")}>
                      <div className="act-h"><b>{f.l} is missing</b>{!res && sg && <button className="btn outline" onClick={() => accept(curP.id, f, sg, "accepted")}>Accept</button>}{res && <Chip tone={res === "skipped" ? "amber" : "green"}>{res === "skipped" ? "Sending without it" : "Done"}</Chip>}</div>
                      <div className="act-b">{res ? (res === "skipped" ? "Add it by hand on the printed form." : f.l + " set to " + cur.s.edits[f.k] + ".") : sg ? "Athelas AI suggests " + sg + ". " + suggestNote[f.k] + "." : "It is not in the chart. Enter it below or send without it."}</div>
                      {!res && (
                        <div className="row mt">
                          {!sg && <ManualFill onSave={(v) => accept(curP.id, f, v, "filled")} label={f.l} />}
                          <button className="btn ghost" onClick={() => skip(curP.id, f)}>Send without it</button>
                        </div>)}
                    </div>); })}
                </div>
              </div>); })()}

              <Disc title="Requested services" tag={cur.s.svc.length + " found"} open={open.svc} onToggle={() => setOpen({ ...open, svc: !open.svc })}>
                {cur.s.svc.map((r, i) => (
                  <div key={r.cpt} className="svc"><div><b>{r.cpt}</b><div className="muted sm">{r.desc}</div></div>
                    <label className="num2">Units per visit<input type="number" min="0" value={r.units} onChange={(e) => upd(curP.id, { svc: cur.s.svc.map((x, j) => j === i ? { ...x, units: Math.max(0, Number(e.target.value) || 0) } : x) })} /></label></div>))}
                <div className="trio">
                  <label>Total visits<input type="number" min="1" value={cur.s.o.visits} onChange={(e) => upd(curP.id, { o: { ...cur.s.o, visits: Math.max(1, Number(e.target.value) || 1) } })} /></label>
                  <label>Frequency<input value={cur.s.o.freq} onChange={(e) => upd(curP.id, { o: { ...cur.s.o, freq: e.target.value } })} /></label>
                  <label>Duration<input value={cur.s.o.dur} onChange={(e) => upd(curP.id, { o: { ...cur.s.o, dur: e.target.value } })} /></label>
                </div>
              </Disc>

              <Disc title="Clinical summary letter" tag="Drafted by Athelas AI" open={open.letter} onToggle={() => { setOpen({ ...open, letter: !open.letter }); showTab("letter"); }}>
                <div className="aibanner"><Sparkles size={14} /><span>Athelas AI drafted this letter from the initial evaluation</span>
                  <button className={"ico" + (cur.s.vote === "up" ? " on" : "")} onClick={() => upd(curP.id, { vote: "up" })} aria-label="Good draft"><ThumbsUp size={14} /></button>
                  <button className={"ico" + (cur.s.vote === "down" ? " on" : "")} onClick={() => upd(curP.id, { vote: "down" })} aria-label="Poor draft"><ThumbsDown size={14} /></button></div>
                <textarea className="letta" rows="12" value={cur.s.busy ? "Drafting from the evaluation..." : cur.s.draft === null ? letterFor(curP, cur.s.svc, cur.s.o) : cur.s.draft} disabled={cur.s.busy} onChange={(e) => upd(curP.id, { draft: e.target.value })} />
                <div className="row between"><div className="muted sm">Sources: initial evaluation, referral, insurance</div><button className="btn ghost" onClick={() => regen(curP.id)} disabled={cur.s.busy}><RefreshCw size={13} />Regenerate</button></div>
              </Disc>

              <Disc title="Form fields" tag={cur.rd.filled + " of " + cur.rd.total + " filled"} open={open.fields} onToggle={() => { setOpen({ ...open, fields: !open.fields }); showTab("form"); }}>
                {fieldsFor(curP.payerKey).map((sec) => (
                  <div key={sec.sec}><div className="sublabel tight">{sec.sec}</div>
                    {sec.items.map((f) => { const v = cur.rd.vals[f.k] || ""; const miss = f.req && !String(v).trim(); return (
                      <div key={f.k} className={"fld" + (miss ? " miss" : "")}>
                        <label><span>{f.l}{f.req ? <i className="req"> *</i> : null}</span><span className="src">{miss ? "Not found in chart" : "From " + f.src}</span></label>
                        {f.area ? <textarea rows="3" value={v} onFocus={() => showTab("form", f.k)} onChange={(e) => upd(curP.id, { edits: { ...cur.s.edits, [f.k]: e.target.value } })} />
                          : <input value={v} onFocus={() => showTab("form", f.k)} onChange={(e) => upd(curP.id, { edits: { ...cur.s.edits, [f.k]: e.target.value } })} />}
                      </div>); })}
                  </div>))}
              </Disc>
            </div>
          )}
        </div>

        <div className="doc">
          <div className="rtabs">
            {[["eval", "Initial evaluation"], ["letter", "Letter"], ["form", "Payer form"]].map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => showTab(k)}>{l}</button>)}
          </div>
          <div className="rtool">
            <button className="ico" aria-label="Zoom out" onClick={() => setZoom(Math.max(50, zoom - 25))} disabled={zoom <= 50}><ZoomOut size={18} /></button>
            <label className="zsel"><select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom">{[50, 75, 100, 125, 150].map((z) => <option key={z} value={z}>{z}%</option>)}</select><ChevronDown size={12} /></label>
            <button className="ico" aria-label="Zoom in" onClick={() => setZoom(Math.min(150, zoom + 25))} disabled={zoom >= 150}><ZoomIn size={18} /></button>
            <span className="grow" />
            <button className="pgcirc" aria-label="Previous page" disabled><ChevronUp size={14} /></button>
            <span className="pgtxt">1 of 1</span>
            <button className="pgcirc" aria-label="Next page" disabled><ChevronDown size={14} /></button>
          </div>
          <div className="rbody">
            {cur && cur.s.read ? (
              <div style={{ zoom: zoom / 100 }}>
                {tab === "eval" && <EvalPaper p={curP} />}
                {tab === "letter" && <LetterPaper p={curP} text={cur.s.draft === null ? letterFor(curP, cur.s.svc, cur.s.o) : cur.s.draft} />}
                {tab === "form" && <FormPaper p={curP} vals={cur.rd.vals} svc={cur.s.svc} hl={hl} />}
              </div>
            ) : <div className="muted sm" style={{ textAlign: "center", marginTop: 40 }}>The document appears once the chart is read.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManualFill({ onSave, label }) {
  const [v, setV] = useState("");
  return (
    <div className="row" style={{ flex: 1 }}>
      <input placeholder={"Enter " + label.toLowerCase()} value={v} onChange={(e) => setV(e.target.value)} aria-label={label} />
      <button className="btn outline" disabled={!v.trim()} onClick={() => onSave(v.trim())}>Save</button>
    </div>
  );
}

/* ---------- patient chart: Attachments ---------- */
const payerKeyOf = (s) => /northwind/i.test(s) ? "northwind" : /cascadia/i.test(s) ? "cascadia" : "harbor";
const condOf = (s) => /lumbar|spine/i.test(s) ? "lumbar" : /shoulder/i.test(s) ? "shoulder" : /neck/i.test(s) ? "neck" : /hip/i.test(s) ? "hip" : "knee";
const chartFromRec = (r) => mk("c" + r.id, r.name, r.mrn, r.dob, "Female", payerKeyOf(r.payer), "MBR-" + r.mrn, "GRP-" + r.mrn.slice(-4), condOf(r.case),
  { phone: "(860) 555-0100", address: "1 Main St, Hartford, CT 06103", refName: "Dr. Elena Park, MD", refNpi: "1457390281", evalDate: addDays(r.start, -3), nextVisit: r.nextVisit,
    trigger: { type: "rule", text: "Rule: payer requires auth after initial evaluation" } });
const resolveChart = (mrn, records) => {
  const rec = records.find((r) => r.mrn === mrn) || null;
  const p = FLAGGED.find((x) => x.mrn === mrn) || (rec ? chartFromRec(rec) : null);
  return { p, rec };
};

const GROUPS = [["pa", "Prior authorization", "blue"], ["patient", "Patient", "green"], ["fax", "Fax", "amber"]];
const docsFor = (p, rec) => {
  const ev = p.evalDate, d = [];
  const gen = !!(rec && rec.att && rec.att.some((a) => a.gen));
  if (rec) {
    d.push({ id: "pa1", group: "pa", name: "Clinical summary letter.pdf", date: rec.stage === "Submitted" ? "11/18/2026" : addDays(rec.start, -3), tags: ["Prior auth"], gen, kind: "letter" });
    d.push({ id: "pa2", group: "pa", name: PAYERS[p.payerKey].form + ".pdf", date: rec.stage === "Submitted" ? "11/18/2026" : addDays(rec.start, -3), tags: ["Prior auth"], gen, kind: "form" });
    if (rec.stage === "Approved") d.push({ id: "pa3", group: "pa", name: "Authorization decision letter.pdf", date: rec.start, tags: ["Prior auth", "Decision"], gen: false, kind: "decision" });
  }
  d.push({ id: "pt1", group: "patient", name: "Initial evaluation.pdf", date: ev, tags: ["Clinical"], kind: "eval" });
  d.push({ id: "pt2", group: "patient", name: "Insurance card, front and back.pdf", date: addDays(ev, -6), tags: ["Insurance"], kind: "insurance" });
  d.push({ id: "pt3", group: "patient", name: "Patient intake form.pdf", date: addDays(ev, -5), tags: ["Intake"], kind: "intake" });
  d.push({ id: "pt4", group: "patient", name: "Eligibility response (271).pdf", date: addDays(ev, -4), tags: ["Insurance"], kind: "eligibility" });
  d.push({ id: "fx1", group: "fax", name: "Inbound referral fax.pdf", date: addDays(ev, -8), tags: ["Referral"], kind: "fax" });
  d.push({ id: "fx2", group: "fax", name: "Referral order.pdf", date: addDays(ev, -8), tags: ["Referral"], kind: "referral" });
  return d.map((x) => ({ ...x, cases: rec ? rec.case : p.caseName }));
};

function GenericPaper({ d, p, rec }) {
  const rows = {
    decision: [["Determination", "Approved"], ["Authorization number", rec && rec.auth], ["Approved visits", rec && rec.authorized], ["Effective", rec && (rec.start + " to " + (rec.end || "open ended"))], ["Payer", p.plan]],
    referral: [["Referring provider", p.referringName], ["Referring NPI", p.referringNpi || "Not on file"], ["Diagnosis", p.icd + " " + p.dxDesc], ["Order", "Physical therapy evaluate and treat"], ["Frequency", "2x per week for 6 weeks"]],
    insurance: [["Plan", p.plan], ["Member ID", p.memberId], ["Group number", p.group || "Not applicable"], ["Payer fax", PAYERS[p.payerKey].fax]],
    eligibility: [["Coverage", "Active"], ["Plan", p.plan], ["Therapy benefit", "Outpatient physical therapy covered"], ["Prior authorization", p.trigger.type === "eligibility" ? "Required for PT" : "Not returned by the payer"]],
    intake: [["Name", p.name], ["Date of birth", p.dob], ["Phone", p.phone], ["Address", p.address], ["Chief complaint", p.cc]],
    fax: [["From", p.referringName], ["Pages", "3"], ["Received", addDays(p.evalDate, -8)], ["Contents", "Referral order, recent visit note, insurance information"]],
  }[d.kind] || [];
  return (
    <div className="paper">
      <div className="ph"><b>{d.name.replace(/\.pdf$/, "")}</b><div>{p.name} | DOB {p.dob} | MRN {p.mrn}</div></div>
      {rows.map(([k, v]) => <div key={k} className="grow2"><span className="muted">{k}</span><b>{v}</b></div>)}
      <div className="pfoot">Synthetic document for the prototype.</div>
    </div>
  );
}
function DocViewer({ d, p, rec, onClose, toast }) {
  const [zoom, setZoom] = useState(100);
  const paper = d.kind === "eval" ? <EvalPaper p={p} />
    : d.kind === "letter" ? <LetterPaper p={p} text={letterFor(p, p.requested, baseOpts(p))} />
    : d.kind === "form" ? <FormPaper p={p} vals={readiness(p, baseOpts(p), {}).vals} svc={p.requested} hl={null} />
    : <GenericPaper d={d} p={p} rec={rec} />;
  return (
    <div className="scrim" onClick={onClose}>
      <aside className="drawer docdrawer" role="dialog" aria-label={d.name} onClick={(e) => e.stopPropagation()}>
        <div className="dh"><div><b className="big">{d.name}</b><div className="row mt">{d.gen && <Chip tone="blue"><Sparkles size={12} />Generated by Air</Chip>}{d.tags.map((t) => <Chip key={t} tone="grey">{t}</Chip>)}<span className="muted sm">{d.date}</span></div></div>
          <div className="row"><button className="ico" aria-label="Download" onClick={() => toast("Download is simulated in this prototype")}><Download size={16} /></button><button className="ico" aria-label="Close" onClick={onClose}><X size={16} /></button></div></div>
        <div className="rtool">
          <button className="ico" aria-label="Zoom out" onClick={() => setZoom(Math.max(50, zoom - 25))} disabled={zoom <= 50}><ZoomOut size={18} /></button>
          <label className="zsel"><select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom">{[50, 75, 100, 125, 150].map((z) => <option key={z} value={z}>{z}%</option>)}</select><ChevronDown size={12} /></label>
          <button className="ico" aria-label="Zoom in" onClick={() => setZoom(Math.min(150, zoom + 25))} disabled={zoom >= 150}><ZoomIn size={18} /></button>
          <span className="grow" /><button className="pgcirc" aria-label="Previous page" disabled><ChevronUp size={14} /></button><span className="pgtxt">1 of 1</span><button className="pgcirc" aria-label="Next page" disabled><ChevronDown size={14} /></button>
        </div>
        <div className="rbody"><div style={{ zoom: zoom / 100 }}>{paper}</div></div>
      </aside>
    </div>
  );
}

const CHART_TABS = ["Demographics", "Visits & Notes", "Attachments", "Tasks", "Medications", "Allergies", "Vitals", "Problem List", "Orders", "Labs"];
function PatientChart({ p, rec, onBack, toast }) {
  const [tab, setTab] = useState("Attachments");
  const [q, setQ] = useState("");
  const [desc, setDesc] = useState(true);
  const [open, setOpen] = useState({ pa: true, patient: true, fax: true });
  const [sel, setSel] = useState({});
  const [view, setView] = useState(null);
  const all = docsFor(p, rec);
  const shown = all.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()));
  const sorted = (g) => shown.filter((d) => d.group === g).sort((a, b) => (desc ? 1 : -1) * (pd(b.date) - pd(a.date)));
  const selN = shown.filter((d) => sel[d.id]).length;
  const allOn = shown.length > 0 && shown.every((d) => sel[d.id]);
  const setMany = (list, v) => { const n = { ...sel }; list.forEach((d) => { n[d.id] = v; }); setSel(n); };
  return (
    <div className="pc">
      <div className="pc-top">
        <div className="pc-id">
          <span className="pc-av">{p.name[0]}</span>
          <span className="pc-name"><a>{p.name.toUpperCase()}</a> <span>(MRN: {p.mrn}, DOB: {p.dob})</span></span>
          <ChevronDown size={16} className="accc" />
          <button className="pcirc" aria-label="Copy patient details" title="Copy"><Copy size={16} /></button>
          <button className="pcirc" aria-label="Insurance" title="Insurance"><Wallet size={16} /></button>
          <button className="pcirc" aria-label="Print" title="Print"><Printer size={16} /></button>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={onBack}><ArrowLeft size={14} />Back to Prior Authorizations</button>
          <button className="pcirc" aria-label="History" title="History"><History size={16} /></button>
          <button className="pcirc" aria-label="Flag" title="Flag"><Flag size={16} /></button>
          <button className="btn neutral" onClick={() => toast("Booking is not part of this demo")}><CalendarDays size={14} />Book Visit</button>
        </div>
      </div>
      <div className="pc-tabs">
        {CHART_TABS.map((t) => <button key={t} className={"pctab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>{t}</button>)}
        <span className="grow" />
        <button className="ico" aria-label="Notes"><BookOpen size={18} /></button><button className="ico acc" aria-label="Pinned"><Pin size={18} /></button><button className="ico" aria-label="Care plan"><Activity size={18} /></button>
      </div>
      <div className="pc-main">
        <div className="pc-body">
          {tab !== "Attachments" ? <div className="empty">{tab} is not part of this demo.</div> : (
            <>
              <div className="pc-head">
                <h2>Attachments</h2>
                <div className="dact">
                  <label className="sf wide"><Search size={14} className="sl" /><input placeholder="Search attachments by file name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search attachments" /></label>
                  <button className="ico sq" aria-label="Display"><SlidersHorizontal size={16} /></button>
                  <button className="ico sq" aria-label="Filter"><ListFilter size={16} /></button>
                  <button className="btn primary" onClick={() => toast("Uploading is not part of this demo")}><Plus size={14} />Add</button>
                </div>
              </div>
              <div className="dt contained">
                <div className="tblwrap"><table className="tbl attbl"><thead><tr>
                  <th style={{ width: 40 }}><input type="checkbox" checked={allOn} onChange={() => setMany(shown, !allOn)} aria-label="Select all documents" /></th>
                  <th>Name</th><th><button className="thsort" onClick={() => setDesc(!desc)} aria-label="Sort by document date">Document Date {desc ? <ArrowDown size={14} /> : <ArrowUp size={14} />}</button></th><th>Tags</th><th>Cases</th><th className="stick actw">Actions</th></tr></thead><tbody>
                  {GROUPS.map(([g, label, tone]) => { const rows = sorted(g); if (!rows.length) return null; const gOn = rows.every((d) => sel[d.id]); return (
                    <React.Fragment key={g}>
                      <tr className="grp"><td colSpan={6}><div className="grpin">
                        <button className="ico" aria-label={(open[g] ? "Collapse " : "Expand ") + label} aria-expanded={open[g]} onClick={() => setOpen({ ...open, [g]: !open[g] })}>{open[g] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
                        <input type="checkbox" checked={gOn} onChange={() => setMany(rows, !gOn)} aria-label={"Select " + label} />
                        <span className={"gchip " + tone}>{label}</span><span className="muted">({rows.length})</span></div></td></tr>
                      {open[g] && rows.map((d) => (
                        <tr key={d.id} className={"hov" + (sel[d.id] ? " selrow" : "")} onClick={() => setView(d)}>
                          <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={!!sel[d.id]} onChange={() => setSel({ ...sel, [d.id]: !sel[d.id] })} aria-label={"Select " + d.name} /></td>
                          <td><span className="docname"><FileText size={16} /><a className="pt">{d.name}</a></span></td>
                          <td>{d.date}</td>
                          <td><div className="row">{d.gen && <Chip tone="blue"><Sparkles size={12} />Generated by Air</Chip>}{d.tags.map((t) => <Chip key={t} tone="grey">{t}</Chip>)}</div></td>
                          <td>{d.cases}</td>
                          <td className="stick actw" onClick={(e) => e.stopPropagation()}><div className="row">
                            <button className="ico" aria-label={"View " + d.name} title="View" onClick={() => setView(d)}><Eye size={16} /></button>
                            <button className="ico" aria-label={"Download " + d.name} title="Download" onClick={() => toast("Download is simulated in this prototype")}><Download size={16} /></button>
                            <button className="ico" aria-label="More actions" title="More"><MoreHorizontal size={16} /></button></div></td></tr>))}
                    </React.Fragment>); })}
                  {shown.length === 0 && <tr><td colSpan={6}><div className="empty" style={{ margin: 12 }}>No attachments match "{q}".</div></td></tr>}
                </tbody></table></div>
              </div>
              {selN > 0 && (
                <div className="bulkdock"><div className="bulk" role="toolbar" aria-label="Bulk actions">
                  <span className="bcount">{selN}</span>
                  <button className="btn dtert" onClick={() => setSel({})}>Deselect</button>
                  <span className="bdiv" />
                  <button className="btn neutral" onClick={() => toast("Download is simulated in this prototype")}>Download</button>
                  <button className="btn neutral" onClick={() => toast("Printing is simulated in this prototype")}>Print</button>
                </div></div>)}
            </>)}
        </div>
        <div className="pc-rail"><button className="ico" aria-label="Edit note"><SquarePen size={18} /></button><button className="ico acc" aria-label="Attachments"><Paperclip size={18} /></button><button className="ico" aria-label="Clinical"><Stethoscope size={18} /></button><button className="ico" aria-label="Messages"><Mail size={18} /></button><button className="ico" aria-label="Portal"><Smile size={18} /></button></div>
      </div>
      {view && <DocViewer d={view} p={p} rec={rec} onClose={() => setView(null)} toast={toast} />}
    </div>
  );
}

/* ---------- authorization details drawer ---------- */
function Drawer({ r, onClose, onDecide, toast }) {
  const [dv, setDv] = useState(""); const [ds, setDs] = useState(""); const [de, setDe] = useState(""); const [read, setRead] = useState(false);
  const [esc, setEsc] = useState({});
  if (!r) return null;
  const appts = apptsFor(r);
  const readLetter = () => { setRead(true); setDv(String(Math.max((r.requested || 12) - 2, 1))); setDs(r.nextVisit); setDe(addDays(r.nextVisit, 60)); };
  const apply = () => { onDecide(r.id, { authorized: Number(dv) || 0, start: ds, end: de }); setRead(false); toast("Visits and dates updated from the decision"); };
  return (
    <div className="scrim" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="dh"><div><b className="big">{r.name}</b><div className="muted sm">Pre-Certification | DOB {r.dob} | MRN {r.mrn}</div></div><button className="ico" onClick={onClose} aria-label="Close"><X size={16} /></button></div>
        <div className="dbody">
          <div className="sect">Authorization information</div>
          <div className="kv wide"><span>Authorization number</span><b>{r.auth}</b><span>Payer</span><b>{r.payer}</b><span>Case</span><b>{r.case}</b>
            <span>Stage</span><b>{r.stage === "Approved" ? <Chip tone="green">Approved</Chip> : <Chip tone="amber">Submitted, awaiting decision</Chip>}</b>
            <span>Start date</span><b>{r.start || "-"}</b><span>End date</span><b>{r.end || "-"}</b>
            <span>Visits authorized</span><b>{r.stage === "Approved" ? r.authorized : "Pending" + (r.requested ? " (" + r.requested + " requested)" : "")}</b></div>
          <Util r={r} full />

          {r.stage === "Submitted" && (
            <>
              <div className="sect">Record the decision <Chip tone="amber">Prototype</Chip></div>
              <div className="muted sm">Upload the payer's decision letter. Air reads the approved visits and dates, and you confirm before anything changes.</div>
              {!read ? <button className="btn outline mt" onClick={readLetter}><Sparkles size={14} />Read decision letter</button> : (
                <div className="dec">
                  <div className="dletter">Determination: <mark>{dv} visits</mark> of {r.requested} requested are approved from <mark>{ds}</mark> through <mark>{de}</mark>. Remaining visits require a new request.</div>
                  <div className="trio"><label>Approved visits<input type="number" value={dv} onChange={(e) => setDv(e.target.value)} /></label>
                    <label>Start<input value={ds} onChange={(e) => setDs(e.target.value)} /></label><label>End<input value={de} onChange={(e) => setDe(e.target.value)} /></label></div>
                  <button className="btn primary mt" onClick={apply}><Check size={14} />Confirm and update</button>
                </div>
              )}
            </>
          )}

          <div className="sect">Upcoming visits against this authorization</div>
          <div className="muted sm">Visits outside the approved visits or dates are blocked or warned, and can go to a person.</div>
          <table className="mini"><thead><tr><th>Visit</th><th>Date</th><th>Check</th><th /></tr></thead><tbody>
            {appts.map((a) => { const s = apptStatus(r, a); return (
              <tr key={a.n}><td>#{a.n}</td><td>{a.date}</td><td><Chip tone={s.k === "ok" ? "green" : s.k === "warn" ? "amber" : "red"}>{s.t}</Chip></td>
                <td>{s.k !== "ok" && r.stage === "Approved" ? (esc[a.n] ? <span className="muted sm">In escalation queue</span> : <button className="btn ghost" onClick={() => { setEsc({ ...esc, [a.n]: 1 }); toast("Sent to the authorization team queue"); }}>Escalate</button>) : null}</td></tr>); })}
          </tbody></table>

          <div className="sect">Attachments</div>
          {r.att.length === 0 ? <div className="muted sm">No files yet.</div> : r.att.map((a, i) => (
            <div key={i} className="att"><Paperclip size={15} /><div><b>{a.name}</b><div className="muted sm">{a.when} | {a.note}</div></div>{a.gen && <Chip tone="blue">Generated by Air</Chip>}</div>
          ))}
        </div>
      </aside>
    </div>
  );
}

const ASSIGNEES = ["You", "Jonathon Zuniga", "Central Auth Team"];

/* ---------- app ---------- */
export default function PriorAuthMockC() {
  const [tab, setTab] = useState("needs");
  const [needs, setNeeds] = useState(FLAGGED);
  const [records, setRecords] = useState(SEED);
  const [sel, setSel] = useState({});
  const [fTrig, setFTrig] = useState("all");
  const [fPayer, setFPayer] = useState("all");
  const [soon, setSoon] = useState(false);
  const [assign, setAssign] = useState({});
  const [asgMenu, setAsgMenu] = useState(false);
  const [chart, setChart] = useState(null);
  const [q, setQ] = useState("");
  const [flow, setFlow] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [filtOpen, setFiltOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3200); };

  const shown = needs.filter((p) => (fTrig === "all" || p.trigger.type === fTrig) && (fPayer === "all" || p.payerKey === fPayer) && (!soon || (pd(p.nextVisit) - pd("11/18/2026")) / 864e5 <= 3) && (!q || (p.name + " " + p.mrn).toLowerCase().includes(q.toLowerCase())));
  const selIds = needs.filter((p) => sel[p.id]).map((p) => p.id);
  const allOn = shown.length > 0 && shown.every((p) => sel[p.id]);
  const toggleAll = () => { const n = { ...sel }; shown.forEach((p) => { n[p.id] = !allOn; }); setSel(n); };
  const startFlow = (ids) => { setAsgMenu(false); setFlow({ ids }); };

  const onSend = (results) => {
    const recs = results.map((res) => { const p = res.p; return {
      id: "n" + p.id, name: p.name, mrn: p.mrn, dob: p.dob, auth: p.name.split(" ").map((x) => x[0]).join("") + "-11.18.26", case: p.caseName, payer: p.plan,
      start: p.nextVisit, end: "", authorized: 0, requested: res.o.visits, completed: 0, stage: "Submitted", nextVisit: p.nextVisit,
      att: [
        { name: "Clinical summary letter.pdf", when: "Today", note: res.method === "fax" ? "Faxed to " + PAYERS[p.payerKey].fax : "Downloaded", gen: 1 },
        { name: PAYERS[p.payerKey].form + ".pdf", when: "Today", note: res.rd.missing.length ? res.rd.missing.length + " fields left for staff" : "All required fields filled", gen: 1 },
      ] }; });
    const done = results.map((r) => r.p.id);
    setRecords((rs) => [...recs, ...rs]); setNeeds((ns) => ns.filter((x) => !done.includes(x.id))); setSel({});
    setFlow(null); setTab("pre");
    toast(results.length + " packet" + (results.length > 1 ? "s" : "") + (results[0].method === "fax" ? " sent by fax" : " downloaded") + " and saved to attachments");
  };
  const decide = (id, d) => { setRecords((rs) => rs.map((r) => r.id === id ? { ...r, ...d, stage: "Approved" } : r)); };
  const drawerRec = records.find((r) => r.id === drawer);
  const nActive = (fTrig !== "all" ? 1 : 0) + (fPayer !== "all" ? 1 : 0) + (soon ? 1 : 0);
  const payersIn = [...new Set(FLAGGED.map((p) => p.payerKey))];
  const assignSel = (who) => { const a = { ...assign }; selIds.forEach((i) => { a[i] = who; }); setAssign(a); setAsgMenu(false); toast("Assigned " + selIds.length + " to " + who); };

  const NAV = [
    [null, [[Home, "Home"], [CalendarDays, "Visits"], [CheckCircle2, "Tasks"]]],
    ["Medical Records", [[Users, "Patients"], [Inbox, "Inbox"], [ClipboardCheck, "Prior Authorizations", true], [Activity, "Interventions"]]],
    ["Revenue Cycle", [[FileText, "Encounters"], [Receipt, "Claims"], [XSquare, "Denials"], [Wallet, "Remittances"]]],
    ["Reporting", [[BarChart3, "Practice Pulse"], [LineChart, "EMR Reports"]]],
  ];

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="shell">
        <nav className="side" aria-label="Main">
          <div className="logo"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 9h5.5M10.5 9H16M9 2v5.5M9 10.5V16" stroke="#1f1f1f" strokeWidth="2.4" strokeLinecap="round" /></svg><b>Air</b></div>
          <div className="navscroll">
            {NAV.map(([h, items], gi) => (
              <div key={gi} className="ngrp">
                {h && <div className="nh"><Circle size={14} />{h}<ChevronUp size={13} className="nchev" /></div>}
                <div className={h ? "nitems indent" : "nitems"}>
                  {items.map(([Ic, label, on]) => { const act = chart ? label === "Patients" : !!on; return <div key={label} className={"nitem" + (act ? " on" : "")} role="button" tabIndex={0} onClick={() => { if (label === "Prior Authorizations") { setChart(null); setFlow(null); } }}><Ic size={15} />{label}</div>; })}
                </div>
              </div>
            ))}
          </div>
          <div className="sfoot"><span className="avatar">A</span><Settings size={15} /><span className="grow" /><HelpCircle size={15} /></div>
        </nav>
        <div className="main">
          <div className="gbar">
            <div className="gl"><PanelLeft size={15} /><span className="muted">{chart ? "Patients" : "Prior Authorizations"}</span></div>
            <div className="gsearch"><Bell size={14} /><div className="gs"><Search size={13} />Global Search<span className="kbd">ctrl+K</span></div></div>
            <div className="gr"><span className="ai"><Mic size={13} />Scribe</span><span className="ai"><Sparkles size={13} />Athelas AI</span></div>
          </div>
          <div className="panel">
            {chart && !flow ? (() => { const { p, rec } = resolveChart(chart, records); return p ? <PatientChart key={chart} p={p} rec={rec} onBack={() => setChart(null)} toast={toast} /> : null; })() : flow ? (
              <Flow key={flow.ids.join("-")} ids={flow.ids} pool={needs} onClose={() => setFlow(null)} onSend={onSend} />
            ) : (
              <div className="page">
                <div className="dth">
                  <div className="views">
                    <button className={"vtab" + (tab === "pre" ? " on" : "")} onClick={() => setTab("pre")}>Pre-Certifications</button>
                    <button className={"vtab" + (tab === "ref" ? " on" : "")} onClick={() => setTab("ref")}>Referrals</button>
                    <span className="vdiv" />
                    <button className={"vtab" + (tab === "needs" ? " on" : "")} onClick={() => setTab("needs")}>Needs Authorization<span className="badge">{needs.length}</span></button>
                  </div>
                  <div className="dact">
                    {tab === "needs" && (
                      <div className="fwrap">
                        <button className={"ico sq" + (filtOpen || nActive ? " on" : "")} aria-label="Filters" aria-haspopup="dialog" aria-expanded={filtOpen} title="Filters" onClick={() => setFiltOpen(!filtOpen)}><SlidersHorizontal size={15} />{nActive > 0 && <span className="adot" />}</button>
                        {filtOpen && (
                          <div className="pop fpop right" role="dialog" aria-label="Filters">
                            <div className="fgroup"><div className="fl">Why flagged</div>
                              {[["all", "All"], ["rule", "Payer rule"], ["eligibility", "Eligibility check"]].map(([k, l]) => <label key={k} className="fopt"><input type="radio" name="trig" checked={fTrig === k} onChange={() => setFTrig(k)} />{l}</label>)}</div>
                            <div className="fgroup"><div className="fl">Payer</div>
                              <select value={fPayer} onChange={(e) => setFPayer(e.target.value)} aria-label="Payer"><option value="all">All payers</option>{payersIn.map((k) => <option key={k} value={k}>{PAYERS[k].plan}</option>)}</select></div>
                            <div className="fgroup"><div className="fl">Next visit</div>
                              <label className="fopt"><input type="checkbox" checked={soon} onChange={(e) => setSoon(e.target.checked)} />Within 3 days</label></div>
                            <div className="fgroup row between"><button className="btn ghost" onClick={() => { setFTrig("all"); setFPayer("all"); setSoon(false); }}>Reset</button><button className="btn primary" onClick={() => setFiltOpen(false)}>Done</button></div>
                          </div>)}
                      </div>
                    )}
                    <button className="ico sq" aria-label="Display" title="Display"><Settings size={15} /></button>
                    <button className="ico sq" aria-label="Download filtered" title="Download filtered" onClick={() => toast("Filtered list downloaded")}><Download size={15} /></button>
                    <button className="btn primary" onClick={() => toast("Manual creation works as it does today")}><Plus size={14} />Create Authorization</button>
                    <label className="sf"><input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search patients" /><Search size={14} /></label>
                  </div>
                </div>

                {tab === "ref" && <div className="empty">Referral tracking is not part of this demo.</div>}

                {tab === "pre" && (
                  <div className="tblwrap"><table className="tbl"><thead><tr><th>Patient</th><th>Auth number</th><th>Case</th><th>Utilization</th><th>Payer</th><th>Start date</th><th>End date</th><th>Stage</th></tr></thead><tbody>
                    {records.filter((r) => !q || (r.name + " " + r.mrn).toLowerCase().includes(q.toLowerCase())).map((r) => (
                      <tr key={r.id} className="hov" onClick={() => setDrawer(r.id)}>
                        <td><a className="pt" role="link" tabIndex={0} onClick={(e) => { e.stopPropagation(); setChart(r.mrn); }} onKeyDown={(e) => { if (e.key === "Enter") setChart(r.mrn); }}>{r.name}</a><div className="muted sm">MRN: {r.mrn}</div></td><td>{r.auth}</td><td>{r.case}</td><td style={{ minWidth: 190 }}><Util r={r} /></td><td>{r.payer}</td><td>{r.start}</td><td>{r.end || "-"}</td>
                        <td>{r.stage === "Approved" ? <Chip tone="green">Approved</Chip> : <Chip tone="amber">Submitted</Chip>}</td></tr>))}
                  </tbody></table></div>
                )}

                {tab === "needs" && (
                  <>
                    {nActive > 0 && (
                      <div className="frow">
                        {fTrig !== "all" && <button className="fchip on" onClick={() => setFTrig("all")}>{fTrig === "rule" ? "Payer rule" : "Eligibility check"}<X size={12} /></button>}
                        {fPayer !== "all" && <button className="fchip on" onClick={() => setFPayer("all")}>{PAYERS[fPayer].plan}<X size={12} /></button>}
                        {soon && <button className="fchip on" onClick={() => setSoon(false)}>Next visit within 3 days<X size={12} /></button>}
                        <span className="grow" /><span className="muted sm">{shown.length} of {needs.length} patients</span>
                      </div>)}
                    {needs.length === 0 ? <div className="empty">Nothing needs an authorization right now. New patients appear here when a rule or eligibility check flags them.</div> : (
                      <div className="tblwrap"><table className="tbl wide"><thead><tr>
                        <th style={{ width: 34 }}><input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select all" /></th><th className="actc" aria-label="Row actions" />
                        <th>Patient</th><th>Case</th><th>Payer</th><th>Why flagged</th><th>Form ready</th><th>Next visit</th><th>Evaluated</th><th>Visits requested</th><th>Diagnosis</th><th>Referring provider</th><th>Provider</th><th>Facility</th><th className="stick" aria-label="Assignee" /></tr></thead><tbody>
                        {shown.map((p) => { const rd = readiness(p, baseOpts(p)); const pct = Math.round((rd.filled / rd.total) * 100); const who = assign[p.id]; return (
                          <tr key={p.id} className={sel[p.id] ? "selrow" : ""}>
                            <td><input type="checkbox" checked={!!sel[p.id]} onChange={() => setSel({ ...sel, [p.id]: !sel[p.id] })} aria-label={"Select " + p.name} /></td>
                            <td className="actc"><button className="ico ract" aria-label={"Generate form for " + p.name} data-tip="Generate form" onClick={() => startFlow([p.id])}><FileText size={16} /></button></td>
                            <td><a className="pt" role="link" tabIndex={0} onClick={() => setChart(p.mrn)} onKeyDown={(e) => { if (e.key === "Enter") setChart(p.mrn); }}>{p.name}</a><div className="muted sm">MRN: {p.mrn}</div></td>
                            <td>{p.caseName}</td>
                            <td>{p.plan}</td>
                            <td style={{ minWidth: 230 }}><TriggerChip t={p.trigger} /><div className="muted sm mt">{(() => { const t = p.trigger.text.replace(/^[^:]+: /, ""); return t.charAt(0).toUpperCase() + t.slice(1); })()}</div></td>
                            <td style={{ minWidth: 130 }}><Ready pct={pct} />{rd.missing.length > 0 && <div className="amber sm">{rd.missing.length} to fill</div>}</td>
                            <td>{p.nextVisit}</td>
                            <td>{p.evalDate}</td>
                            <td>{p.requestedVisits}</td>
                            <td style={{ minWidth: 200 }}>{p.icd}<div className="muted sm">{p.dxDesc}</div></td>
                            <td>{p.referringName.split(",")[0]}</td>
                            <td>{p.treatingPT.split(",")[0]}</td>
                            <td>{p.facility.split(", ")[1] || p.facility}</td>
                            <td className="stick">{who ? <button className="asg on" title={(who === "You" ? "You" : who) + " (click to unassign)"} aria-label={"Assigned to " + who} onClick={() => setAssign({ ...assign, [p.id]: undefined })}>{who === "You" ? "A" : initials(who)}</button> : <button className="asg" aria-label="Assign to you" title="Assign to you" onClick={() => setAssign({ ...assign, [p.id]: "You" })}><UserPlus size={14} /></button>}</td>
                            </tr>); })}
                      </tbody></table></div>
                    )}
                    {selIds.length > 0 && (
                      <div className="bulkdock"><div className="bulk" role="toolbar" aria-label="Bulk actions">
                        <span className="bcount">{selIds.length}</span>
                        <button className="btn dtert" onClick={() => setSel({})}>Deselect</button>
                        <span className="bdiv" />
                        <div className="bwrap">
                          <button className="btn neutral" aria-haspopup="menu" aria-expanded={asgMenu} onClick={() => setAsgMenu(!asgMenu)}>Assign<ChevronDown size={14} /></button>
                          {asgMenu && <div className="pop up" role="menu">{ASSIGNEES.map((a) => <button key={a} role="menuitem" onClick={() => assignSel(a)}>{a}</button>)}</div>}
                        </div>
                        <button className="btn neutral" onClick={() => startFlow(selIds)}>Generate forms</button>
                        <span className="bdiv" />
                        <button className="ico" aria-label="Download list" title="Download list" onClick={() => toast("List exported")}><Download size={15} /></button>
                        <button className="ico" aria-label="Dismiss from queue" title="Dismiss from queue" onClick={() => { setNeeds(needs.filter((x) => !sel[x.id])); setSel({}); toast("Dismissed from the queue"); }}><Archive size={15} /></button>
                      </div></div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {drawerRec && <Drawer key={drawerRec.id + drawerRec.stage} r={drawerRec} onClose={() => setDrawer(null)} onDecide={decide} toast={toast} />}
      {msg && <div className="toast"><Check size={14} />{msg}</div>}
    </div>
  );
}
