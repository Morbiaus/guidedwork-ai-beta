import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, BrainCircuit, CheckCircle2, ClipboardList, CreditCard, Database, Download, History, Lock, PlayCircle, RotateCcw, Save, ShieldCheck, Sparkles, Zap } from 'lucide-react'

const STORAGE_KEY = 'guidedwork-touch-go-v2'

const AGENTS = [
  ['Executive Assistant', 'Atlas', 'Organizes priorities, drafts messages, prepares meetings, and creates a simple daily command brief.'],
  ['Job Search Agent', 'Sentry', 'Scores jobs, helps tailor career material, drafts recruiter messages, and tracks follow-ups.'],
  ['LinkedIn GrowthDesk Agent', 'Signal', 'Turns ideas and experience into posts, comments, and profile language.'],
  ['Risk & Governance Agent', 'Sentinel', 'Drafts control reviews, risk summaries, governance plans, and evidence-ready notes.'],
  ['Household Operations Agent', 'Hearth', 'Organizes home tasks, family logistics, vendor follow-ups, and reminders.'],
  ['Custom Agent', 'Nova', 'Builds a helper for one specific recurring task or workflow.'],
].map(([label, name, mission]) => ({ label, name, mission }))

const PACKAGES = [
  ['Starter Agent', '$149', 'One questionnaire-built agent with starter workflows and a downloadable package.'],
  ['Pro Agent Pack', '$299', 'Prompt pack, simulation, audit log, and delivery handoff.'],
  ['Small Team Build', '$799+', 'Workflow mapping, approval model, and implementation support.'],
]

const HOW_TO = [
  'Click Start Here.',
  'Choose the type of agent you want.',
  'Click Next Step.',
  'Answer the short questions in plain English.',
  'Click Build My Agent.',
  'Click Run Simulation to see what your agent can do.',
  'Click Download My Agent Package.',
]

const baseIntake = {
  agentType: 'Executive Assistant',
  customer: '',
  agentName: 'Atlas',
  goal: 'Help me organize important work and create useful drafts without taking action on its own.',
  tasks: 'Summarize priorities, draft messages, organize notes, prepare checklists, and recommend next actions.',
  inputs: 'Notes, pasted text, documents, task lists, job descriptions, messages, or meeting notes.',
  tone: 'Clear, practical, direct, and easy to act on.',
  tools: 'Local files, browser notes, email drafts, calendar notes, and downloaded package.',
  boundaries: 'Require human approval before anything is sent, posted, submitted, purchased, changed, or shared outside the workspace.',
  cadence: 'As needed, with review before external action.',
  memory: true,
  localOnly: true,
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function workflowsFor(type) {
  const map = {
    'Executive Assistant': ['Morning Command Brief', 'Message Drafting Queue', 'Meeting Prep Pack', 'Decision Memo Builder', 'End-of-Day Closeout'],
    'Job Search Agent': ['Role Fit Review', 'Resume Alignment Draft', 'Recruiter Message Draft', 'Application Tracker Update', 'Interview Prep Brief'],
    'LinkedIn GrowthDesk Agent': ['Weekly Content Scan', 'Post Draft Builder', 'First Comment Draft', 'Profile Language Pass', 'Engagement Review'],
    'Risk & Governance Agent': ['Control Quality Review', 'Issue Description Draft', 'Governance Plan Builder', 'Challenge Questions', 'Executive Risk Summary'],
    'Household Operations Agent': ['Weekly Home Plan', 'Vendor Follow-Up Draft', 'Document Organizer', 'Maintenance Reminder Plan', 'Family Logistics Brief'],
    'Custom Agent': ['Mission Intake', 'Priority Scan', 'Workflow Draft', 'Boundary Check', 'Closeout Summary'],
  }
  return (map[type] || map['Custom Agent']).map((title, i) => ({
    id: i + 1,
    title,
    description: `Use the questionnaire to run the ${title.toLowerCase()} workflow and produce a draft for human review.`,
    permission: i < 3 ? 'Local workspace only' : 'Human review before external use',
  }))
}

function makePrompt(intake, workflows) {
  return `You are ${intake.agentName}, a ${intake.agentType}.\n\nMission:\n${intake.goal}\n\nRecurring tasks:\n${intake.tasks}\n\nInputs you may use:\n${intake.inputs}\n\nOutput style:\n${intake.tone}\n\nTools or workspace:\n${intake.tools}\n\nBoundaries:\n${intake.boundaries}\n\nReview cadence:\n${intake.cadence}\n\nStarter workflows:\n${workflows.map((w) => `- ${w.title}: ${w.description}`).join('\n')}\n\nOperating rule: plan, draft, summarize, and simulate first. Ask for human approval before any external action.`
}

function Field({ label, value, onChange, textarea = false, helper }) {
  return <label className="grid gap-2"><span className="text-sm font-bold text-slate-800">{label}</span>{textarea ? <textarea rows={3} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-900" value={value} onChange={(e) => onChange(e.target.value)} /> : <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900" value={value} onChange={(e) => onChange(e.target.value)} />}{helper && <span className="text-xs leading-5 text-slate-500">{helper}</span>}</label>
}

function Step({ n, active, done, text }) {
  return <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${active ? 'border-slate-950 bg-white shadow-sm' : done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white/70'}`}><div className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${active ? 'bg-slate-950 text-white' : done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{done ? '✓' : n}</div><p className="text-sm font-bold text-slate-700">{text}</p></div>
}

export default function App() {
  const [step, setStep] = useState(1)
  const [intake, setIntake] = useState(baseIntake)
  const [workflows, setWorkflows] = useState([])
  const [selected, setSelected] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [run, setRun] = useState('')
  const [log, setLog] = useState([])

  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (s) { setStep(s.step || 1); setIntake(s.intake || baseIntake); setWorkflows(s.workflows || []); setSelected(s.selected || null); setPrompt(s.prompt || ''); setRun(s.run || ''); setLog(s.log || []) } } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, intake, workflows, selected, prompt, run, log })) }, [step, intake, workflows, selected, prompt, run, log])

  const agent = useMemo(() => AGENTS.find((a) => a.label === intake.agentType) || AGENTS[0], [intake.agentType])
  const addLog = (msg) => setLog((l) => [{ id: crypto.randomUUID(), time: new Date().toLocaleString(), msg }, ...l].slice(0, 20))
  const update = (key, value) => setIntake((i) => ({ ...i, [key]: value }))

  const chooseAgent = (a) => {
    setIntake((i) => ({ ...i, agentType: a.label, agentName: a.name, goal: a.mission }))
    setWorkflows([]); setPrompt(''); setRun('')
    addLog(`Selected ${a.label}`)
  }

  const build = () => {
    const wf = workflowsFor(intake.agentType)
    const pp = makePrompt(intake, wf)
    setWorkflows(wf); setSelected(wf[0]); setPrompt(pp)
    setRun(`${intake.agentName} simulated ${wf[0].title}.\n\nOutput:\n- Understood mission: ${intake.goal}\n- First input to request: ${intake.inputs}\n- Drafting style: ${intake.tone}\n- Next action: test this workflow with one real sample input.\n\nPermission: ${wf[0].permission}`)
    setStep(3)
    addLog(`Built ${intake.agentName} package`)
  }

  const simulate = (wf) => {
    setSelected(wf)
    setRun(`${intake.agentName} simulated ${wf.title}.\n\nOutput:\n- Used the questionnaire as operating context.\n- Produced a draft-only result for human review.\n- Flagged boundaries before external action.\n- Recommended testing with one real sample.\n\nPermission: ${wf.permission}`)
    addLog(`Simulated ${wf.title}`)
  }

  const exportPackage = () => {
    const wf = workflows.length ? workflows : workflowsFor(intake.agentType)
    const pp = prompt || makePrompt(intake, wf)
    downloadJson(`${intake.agentName || 'guidedwork'}-agent-package.json`, { product: 'GuidedWork AI Touch-and-Go Agent Package', version: '1.1', exportedAt: new Date().toISOString(), intake, workflows: wf, promptPack: pp, latestRun: run, auditLog: log, safetyModel: { allowed: ['plan', 'draft', 'summarize', 'simulate'], requiresApproval: ['external action', 'sharing', 'submission', 'account changes'] } })
    addLog(`Downloaded ${intake.agentName} package`)
  }

  const reset = () => { localStorage.removeItem(STORAGE_KEY); setStep(1); setIntake(baseIntake); setWorkflows([]); setSelected(null); setPrompt(''); setRun(''); setLog([]) }

  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950"><BrainCircuit className="h-5 w-5 text-white" /></div><div><p className="text-base font-black tracking-tight">GuidedWork AI</p><p className="text-xs text-slate-500">Simple agent builder for user testing</p></div></div><a href="#builder" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">Start Here</a></div></header>
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-10 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-20"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"><Sparkles className="h-4 w-4" /> Pick. Answer. Build. Download.</div><h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-6xl">Build a simple AI agent package in a few minutes.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">You do not need to know anything about AI. Just answer the questions like you are explaining the job to a helpful assistant.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#builder" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white">Start Here <ArrowRight className="h-4 w-4" /></a><button onClick={build} className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold">Build Demo For Me</button></div></motion.div><motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}><div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200"><div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><p className="text-sm text-slate-300">Current Agent</p><p className="text-3xl font-black">{intake.agentName}</p><p className="mt-1 text-slate-400">{agent.label}</p>{['Pick an agent type','Answer simple questions','Click Build My Agent','Run Simulation','Download My Agent Package'].map((x) => <div key={x} className="mt-3 flex gap-3 rounded-2xl bg-white/10 p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{x}</div>)}</div></div></motion.div></section>

      <section className="mx-auto max-w-7xl px-5 pb-12"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><ClipboardList className="mt-1 h-6 w-6 shrink-0 text-slate-950" /><div><h2 className="text-2xl font-black">How to build your agent</h2><p className="mt-2 text-sm leading-6 text-slate-600">Follow these steps in order. Do not worry about perfect answers.</p></div></div><div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-7">{HOW_TO.map((item, i) => <div key={item} className="rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">{i + 1}</div><p className="text-sm font-bold leading-6 text-slate-800">{item}</p></div>)}</div></div></section>

      <section id="builder" className="border-y border-slate-200 bg-white py-16"><div className="mx-auto max-w-7xl px-5"><div className="mb-8 max-w-3xl"><p className="text-sm font-bold uppercase tracking-wide text-slate-500">Customer test flow</p><h2 className="mt-2 text-4xl font-black">Build your agent</h2><p className="mt-4 text-base leading-7 text-slate-600">Not sure which one to choose? Start with Executive Assistant. It is the easiest general-purpose agent to test.</p></div><div className="mb-8 grid gap-3 md:grid-cols-3"><Step n="1" text="Pick your agent" active={step === 1} done={step > 1} /><Step n="2" text="Answer simple questions" active={step === 2} done={step > 2} /><Step n="3" text="Build and download" active={step === 3} done={workflows.length > 0} /></div>

      {step === 1 && <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{AGENTS.map((a) => <button key={a.label} onClick={() => chooseAgent(a)} className={`rounded-3xl border p-5 text-left shadow-sm ${intake.agentType === a.label ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white'}`}><Bot className="mb-4 h-7 w-7" /><h3 className="text-lg font-black">{a.label}</h3><p className={`mt-3 text-sm leading-6 ${intake.agentType === a.label ? 'text-slate-200' : 'text-slate-600'}`}>{a.mission}</p></button>)}<div className="md:col-span-2 lg:col-span-3 flex flex-col gap-3 sm:flex-row"><button onClick={() => setStep(2)} className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white">Next Step</button><button onClick={build} className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold">Skip Questions And Build Demo</button></div></div>}

      {step === 2 && <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]"><div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="grid gap-5"><Field label="Your name" value={intake.customer} onChange={(v) => update('customer', v)} helper="Optional. This helps name the test package." /><Field label="Agent name" value={intake.agentName} onChange={(v) => update('agentName', v)} /><Field label="What should this agent help you do?" textarea value={intake.goal} onChange={(v) => update('goal', v)} /><Field label="What repeated tasks should it help with?" textarea value={intake.tasks} onChange={(v) => update('tasks', v)} /><Field label="What information will you give it?" textarea value={intake.inputs} onChange={(v) => update('inputs', v)} /><Field label="How should the answer sound?" textarea value={intake.tone} onChange={(v) => update('tone', v)} /><Field label="What should it never do without your approval?" textarea value={intake.boundaries} onChange={(v) => update('boundaries', v)} /><div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={intake.memory} onChange={(e) => update('memory', e.target.checked)} /> Remember locally</label><label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={intake.localOnly} onChange={(e) => update('localOnly', e.target.checked)} /> Keep local first</label></div><div className="grid gap-3 sm:grid-cols-3"><button onClick={() => setStep(1)} className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold">Back</button><button onClick={() => addLog('Saved locally')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold"><Save className="h-4 w-4" /> Save</button><button onClick={build} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white"><Zap className="h-4 w-4" /> Build My Agent</button></div></div></div><div className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold uppercase tracking-wide text-slate-400">Preview</p><h3 className="mt-2 text-3xl font-black">{intake.agentName}</h3><p className="mt-1 text-slate-300">{intake.agentType}</p><p className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6">{intake.goal}</p><p className="mt-3 rounded-2xl bg-white/10 p-4 text-sm leading-6">Boundary: {intake.boundaries}</p></div></div>}

      {step === 3 && <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]"><div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Success</p><h3 className="mt-2 text-3xl font-black">Your agent package is ready.</h3><p className="mt-3 text-sm leading-6 text-slate-600">You can now run a simulation, download your package, and send it to GuidedWork AI for setup help.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={build} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white">Rebuild My Agent</button><button onClick={exportPackage} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold"><Download className="h-4 w-4" /> Download My Agent Package</button><button onClick={() => setStep(2)} className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold">Edit Answers</button><button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"><RotateCcw className="h-4 w-4" /> Start Over</button></div></div><div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><p className="font-black">Tester instructions</p><ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600"><li>1. Run one simulation.</li><li>2. Download the package.</li><li>3. Answer the feedback questionnaire.</li><li>4. Tell us what confused you.</li></ol></div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xl font-black">{intake.agentName}</p><p className="text-sm text-slate-500">{intake.agentType}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Ready</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-4"><Database className="h-4 w-4" /> <b>Memory</b><p className="text-sm text-slate-600">{intake.memory ? 'Enabled locally' : 'Disabled'}</p></div><div className="rounded-2xl border border-slate-200 p-4"><Lock className="h-4 w-4" /> <b>Data mode</b><p className="text-sm text-slate-600">{intake.localOnly ? 'Local-first' : 'Cloud-assisted'}</p></div></div><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Mission</p><p className="mt-2 text-sm leading-6 text-slate-700">{intake.goal}</p></div><div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Generated workflows</p><div className="mt-3 grid gap-3">{workflows.map((wf) => <div key={wf.id} className={`rounded-2xl bg-white p-4 ring-1 ${selected?.id === wf.id ? 'ring-slate-950' : 'ring-slate-100'}`}><button onClick={() => setSelected(wf)} className="w-full text-left"><p className="text-sm font-black">{wf.id}. {wf.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{wf.description}</p><p className="mt-2 text-xs font-bold text-emerald-700">{wf.permission}</p></button><button onClick={() => simulate(wf)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white"><PlayCircle className="h-3.5 w-3.5" /> Run Simulation</button></div>)}</div></div>{prompt && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><ClipboardList className="h-4 w-4" /> Prompt pack</p><pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">{prompt}</pre></div>}{run && <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">{run}</pre>}{log.length > 0 && <div className="mt-5 rounded-2xl border border-slate-200 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><History className="h-4 w-4" /> Audit log</p>{log.slice(0, 5).map((x) => <p key={x.id} className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><b>{x.time}</b> — {x.msg}</p>)}</div>}</div></div>}
      </div></section>

      <section className="bg-slate-950 py-16 text-white"><div className="mx-auto max-w-7xl px-5"><p className="text-sm font-bold uppercase tracking-wide text-slate-400">Pricing test</p><h2 className="mt-2 text-4xl font-black">Would people pay for the package?</h2><div className="mt-9 grid gap-5 lg:grid-cols-3">{PACKAGES.map(([name, price, desc], i) => <div key={name} className={`rounded-3xl border p-6 ${i === 1 ? 'border-white bg-white text-slate-950' : 'border-white/10 bg-white/5'}`}><CreditCard className="h-5 w-5" /><h3 className="mt-5 text-2xl font-black">{name}</h3><p className={`mt-3 text-sm leading-6 ${i === 1 ? 'text-slate-600' : 'text-slate-300'}`}>{desc}</p><p className="mt-6 text-4xl font-black">{price}</p><a href="#builder" className={`mt-7 inline-flex w-full justify-center rounded-2xl px-5 py-4 text-sm font-bold ${i === 1 ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'}`}>Build My Agent</a></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-16"><div className="rounded-[2rem] bg-slate-950 p-8 text-white md:p-10"><h2 className="text-3xl font-black">For the tester</h2><p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">Please be honest. If anything is confusing, that is useful. The goal is to make this simple enough for anyone to use.</p></div></section>
    </main>
  </div>
}
