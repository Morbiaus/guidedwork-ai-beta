import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, BrainCircuit, CheckCircle2, ClipboardList, CreditCard, Database, Download, History, Lock, PlayCircle, RotateCcw, Save, Sparkles, Zap } from 'lucide-react'

const STORAGE_KEY = 'guidedwork-touch-go-v3'

const AGENTS = [
  ['Executive Assistant', 'Atlas', 'Organizes priorities, drafts messages, prepares meetings, and creates a simple daily command brief.'],
  ['Job Search Agent', 'Sentry', 'Scores jobs, helps tailor career material, drafts recruiter messages, and tracks follow-ups.'],
  ['LinkedIn GrowthDesk Agent', 'Signal', 'Turns ideas and experience into posts, comments, and profile language.'],
  ['Risk & Governance Agent', 'Sentinel', 'Drafts control reviews, risk summaries, governance plans, and evidence-ready notes.'],
  ['Household Operations Agent', 'Hearth', 'Organizes home tasks, family logistics, vendor follow-ups, and reminders.'],
  ['Custom Agent', 'Nova', 'Builds a helper for one specific recurring task or workflow.'],
].map(([label, name, mission]) => ({ label, name, mission }))

const PACKAGES = [
  ['Starter Agent', '$149', 'One guided helper with simple setup steps and a downloadable backup.'],
  ['Pro Agent Pack', '$299', 'Prompt pack, simulation, activation guide, audit log, and delivery handoff.'],
  ['Done-For-You Setup', '$799+', 'Workflow mapping, approval model, setup support, and working-agent confirmation.'],
]

const HOW_TO = [
  'Tell us what you want help with.',
  'We recommend the best helper type.',
  'Answer simple checkbox questions.',
  'Click Build My Helper.',
  'Try one practice run.',
  'Choose where you want to use it.',
  'Follow one setup step at a time.',
  'Send your first test message.',
  'Confirm: My helper works.',
]

const QUICK_TASKS = ['Remember important things', 'Help me write messages', 'Make simple lists', 'Prepare for appointments', 'Organize family tasks', 'Summarize notes']
const QUICK_INPUTS = ['Notes', 'Messages', 'Appointments', 'Documents', 'Task lists', 'Family logistics']
const QUICK_TONES = ['Clear and kind', 'Short and simple', 'Patient and step-by-step', 'Direct and practical']
const TEST_MESSAGE = 'Help me make a simple plan for tomorrow.'

const PLATFORMS = [
  { id: 'chatgpt', name: 'ChatGPT', bestFor: 'Best if you already use ChatGPT.', openUrl: 'https://chat.openai.com/gpts/editor', setup: ['Open ChatGPT.', 'Choose Create a GPT. If you do not see it, click Explore GPTs first.', 'Copy your helper instructions here.', 'Paste them into the Instructions box.', 'Name it and save it.'] },
  { id: 'claude', name: 'Claude', bestFor: 'Best for writing, documents, and thoughtful planning.', openUrl: 'https://claude.ai/projects', setup: ['Open Claude.', 'Create a Project.', 'Copy your helper instructions here.', 'Paste them into Project Instructions.', 'Start a new chat inside the project.'] },
  { id: 'gemini', name: 'Gemini', bestFor: 'Best if you use Google tools.', openUrl: 'https://gemini.google.com/gems', setup: ['Open Gemini.', 'Go to Gems.', 'Create a new Gem.', 'Copy your helper instructions here.', 'Paste, save, and test it.'] },
  { id: 'setup', name: 'Set it up for me', bestFor: 'Best if you do not want to touch setup at all.', openUrl: 'mailto:you@example.com?subject=GuidedWork%20AI%20setup%20help', setup: ['Send us the setup request.', 'We receive your helper details.', 'GuidedWork AI helps activate it for you.'] },
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
  boundaries: 'Ask me before anything is sent, posted, submitted, purchased, changed, or shared outside this app.',
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
    permission: i < 3 ? 'Inside the helper only' : 'Ask before outside use',
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

function HelpBox() {
  return <details className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><summary className="cursor-pointer font-black">I’m stuck</summary><div className="mt-3 grid gap-2 leading-6"><p>No problem. You can use the safe defaults, skip typing, or ask GuidedWork AI to set it up for you.</p><p>If a button opens another site and you do not see the same words, look for words like <b>Create</b>, <b>New</b>, <b>Project</b>, or <b>Gem</b>.</p></div></details>
}

export default function App() {
  const [step, setStep] = useState(1)
  const [intake, setIntake] = useState(baseIntake)
  const [workflows, setWorkflows] = useState([])
  const [selected, setSelected] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [run, setRun] = useState('')
  const [log, setLog] = useState([])
  const [platform, setPlatform] = useState('chatgpt')
  const [copied, setCopied] = useState('')

  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (s) { setStep(s.step || 1); setIntake(s.intake || baseIntake); setWorkflows(s.workflows || []); setSelected(s.selected || null); setPrompt(s.prompt || ''); setRun(s.run || ''); setLog(s.log || []); setPlatform(s.platform || 'chatgpt') } } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, intake, workflows, selected, prompt, run, log, platform })) }, [step, intake, workflows, selected, prompt, run, log, platform])

  const agent = useMemo(() => AGENTS.find((a) => a.label === intake.agentType) || AGENTS[0], [intake.agentType])
  const chosenPlatform = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0]
  const addLog = (msg) => setLog((l) => [{ id: crypto.randomUUID(), time: new Date().toLocaleString(), msg }, ...l].slice(0, 20))
  const update = (key, value) => setIntake((i) => ({ ...i, [key]: value }))
  const append = (key, value) => setIntake((i) => i[key].toLowerCase().includes(value.toLowerCase()) ? i : ({ ...i, [key]: `${i[key]}${i[key].trim().endsWith('.') ? '' : '.'} ${value}.` }))
  const copyText = async (label, text) => { await navigator.clipboard.writeText(text); setCopied(label); addLog(`Copied ${label}`) }

  const chooseAgent = (a) => {
    setIntake((i) => ({ ...i, agentType: a.label, agentName: a.name, goal: a.mission }))
    setWorkflows([]); setPrompt(''); setRun('')
    addLog(`Selected ${a.label}`)
  }

  const applySafeDefaults = () => {
    setIntake((i) => ({ ...i, agentType: 'Household Operations Agent', agentName: 'Hearth', goal: 'Help me remember important things, organize simple tasks, prepare for appointments, and write clear messages.', tasks: 'Reminders, simple lists, appointment prep, family logistics, message drafts, and daily planning.', inputs: 'Notes, messages, appointments, documents, task lists, and family logistics.', tone: 'Clear, kind, patient, and step-by-step.' }))
    addLog('Applied simple safe defaults')
    setStep(2)
  }

  const build = () => {
    const wf = workflowsFor(intake.agentType)
    const pp = makePrompt(intake, wf)
    setWorkflows(wf); setSelected(wf[0]); setPrompt(pp)
    setRun(`${intake.agentName} practice run: ${wf[0].title}.\n\nWhat it would do:\n- Ask for the notes or task list it should use.\n- Make a simple draft for you to review.\n- Remind you before anything is shared or sent.\n- Suggest one next step.\n\nNext: choose where you want to use ${intake.agentName}.`)
    setStep(3)
    addLog(`Built ${intake.agentName} helper`)
  }

  const simulate = (wf) => {
    setSelected(wf)
    setRun(`${intake.agentName} practice run: ${wf.title}.\n\nWhat it would do:\n- Use your answers as guidance.\n- Produce a draft only.\n- Ask before outside action.\n- Recommend testing with one real example.\n\nPermission: ${wf.permission}`)
    addLog(`Practice run: ${wf.title}`)
  }

  const exportPackage = () => {
    const wf = workflows.length ? workflows : workflowsFor(intake.agentType)
    const pp = prompt || makePrompt(intake, wf)
    downloadJson(`${intake.agentName || 'guidedwork'}-activation-backup.json`, { product: 'GuidedWork AI Helper Activation Backup', version: '2.0', exportedAt: new Date().toISOString(), intake, workflows: wf, helperInstructions: pp, firstTestMessage: TEST_MESSAGE, selectedPlatform: chosenPlatform.name, latestRun: run, auditLog: log, safetyModel: { allowed: ['plan', 'draft', 'summarize', 'simulate'], requiresApproval: ['external action', 'sharing', 'submission', 'account changes'] } })
    addLog(`Downloaded ${intake.agentName} activation backup`)
  }

  const setupHref = chosenPlatform.id === 'setup'
    ? `mailto:you@example.com?subject=GuidedWork%20AI%20setup%20help&body=${encodeURIComponent(`Please help me activate my GuidedWork AI helper.\n\nHelper: ${intake.agentName}\nType: ${intake.agentType}\nPlatform: I want GuidedWork AI to set it up for me.\n\nMission:\n${intake.goal}\n\nInstructions:\n${prompt}`)}`
    : chosenPlatform.openUrl

  const reset = () => { localStorage.removeItem(STORAGE_KEY); setStep(1); setIntake(baseIntake); setWorkflows([]); setSelected(null); setPrompt(''); setRun(''); setLog([]); setPlatform('chatgpt'); setCopied('') }

  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950"><BrainCircuit className="h-5 w-5 text-white" /></div><div><p className="text-base font-black tracking-tight">GuidedWork AI</p><p className="text-xs text-slate-500">Simple helper builder for non-technical users</p></div></div><a href="#builder" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">Start Here</a></div></header>
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-10 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-20"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"><Sparkles className="h-4 w-4" /> Tell us. Build. Activate. Use.</div><h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-6xl">Make a helpful AI assistant without learning tech.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Answer a few plain-English questions. We recommend the helper, fill in safe defaults, and walk you through setup one step at a time.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#builder" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white">Make My Helper <ArrowRight className="h-4 w-4" /></a><button onClick={applySafeDefaults} className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold">I’m not sure — do it for me</button></div></motion.div><motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}><div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200"><div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><p className="text-sm text-slate-300">Current Helper</p><p className="text-3xl font-black">{intake.agentName}</p><p className="mt-1 text-slate-400">{agent.label}</p>{['Choose what you need','Use safe defaults','Build your helper','Practice once','Activate and test'].map((x) => <div key={x} className="mt-3 flex gap-3 rounded-2xl bg-white/10 p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{x}</div>)}</div></div></motion.div></section>

      <section className="mx-auto max-w-7xl px-5 pb-12"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><ClipboardList className="mt-1 h-6 w-6 shrink-0 text-slate-950" /><div><h2 className="text-2xl font-black">How this becomes a working helper</h2><p className="mt-2 text-sm leading-6 text-slate-600">No prompt-writing, no technical setup language. Follow one small step at a time.</p></div></div><div className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-9">{HOW_TO.map((item, i) => <div key={item} className="rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">{i + 1}</div><p className="text-sm font-bold leading-6 text-slate-800">{item}</p></div>)}</div></div></section>

      <section id="builder" className="border-y border-slate-200 bg-white py-16"><div className="mx-auto max-w-7xl px-5"><div className="mb-8 max-w-3xl"><p className="text-sm font-bold uppercase tracking-wide text-slate-500">Simple setup flow</p><h2 className="mt-2 text-4xl font-black">Build your helper</h2><p className="mt-4 text-base leading-7 text-slate-600">If you are unsure, choose <b>I’m not sure — do it for me</b>. The app will pick safe defaults and keep going.</p></div><div className="mb-8 grid gap-3 md:grid-cols-3"><Step n="1" text="Choose or auto-pick" active={step === 1} done={step > 1} /><Step n="2" text="Simple answers" active={step === 2} done={step > 2} /><Step n="3" text="Activate and test" active={step === 3} done={workflows.length > 0} /></div>

      {step === 1 && <div className="grid gap-5"><div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-black uppercase tracking-wide text-emerald-700">Easiest path</p><h3 className="mt-2 text-2xl font-black">Not sure what to choose?</h3><p className="mt-2 text-sm leading-6 text-emerald-950">We can pick a safe general helper for reminders, lists, appointments, family logistics, and message drafts.</p><button onClick={applySafeDefaults} className="mt-4 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white">I’m not sure — do it for me</button></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{AGENTS.map((a) => <button key={a.label} onClick={() => chooseAgent(a)} className={`rounded-3xl border p-5 text-left shadow-sm ${intake.agentType === a.label ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white'}`}><Bot className="mb-4 h-7 w-7" /><h3 className="text-lg font-black">{a.label}</h3><p className={`mt-3 text-sm leading-6 ${intake.agentType === a.label ? 'text-slate-200' : 'text-slate-600'}`}>{a.mission}</p></button>)}</div><div className="flex flex-col gap-3 sm:flex-row"><button onClick={() => setStep(2)} className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white">Next Step</button><button onClick={build} className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold">Build Demo For Me</button></div><HelpBox /></div>}

      {step === 2 && <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]"><div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="grid gap-5"><button onClick={applySafeDefaults} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left text-sm font-bold text-emerald-900">Use simple safe defaults</button><div><p className="mb-3 text-sm font-black text-slate-800">What should it help with? Tap any that fit.</p><div className="flex flex-wrap gap-2">{QUICK_TASKS.map((x) => <button key={x} onClick={() => append('tasks', x)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold">{x}</button>)}</div></div><Field label="Your name" value={intake.customer} onChange={(v) => update('customer', v)} helper="Optional." /><Field label="Helper name" value={intake.agentName} onChange={(v) => update('agentName', v)} /><Field label="What should this helper do?" textarea value={intake.goal} onChange={(v) => update('goal', v)} /><Field label="Repeated tasks" textarea value={intake.tasks} onChange={(v) => update('tasks', v)} /><div><p className="mb-3 text-sm font-black text-slate-800">What information will you give it?</p><div className="mb-3 flex flex-wrap gap-2">{QUICK_INPUTS.map((x) => <button key={x} onClick={() => append('inputs', x)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold">{x}</button>)}</div><Field label="Information" textarea value={intake.inputs} onChange={(v) => update('inputs', v)} /></div><div><p className="mb-3 text-sm font-black text-slate-800">How should it sound?</p><div className="mb-3 flex flex-wrap gap-2">{QUICK_TONES.map((x) => <button key={x} onClick={() => update('tone', x)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold">{x}</button>)}</div><Field label="Answer style" textarea value={intake.tone} onChange={(v) => update('tone', v)} /></div><Field label="What should it never do without approval?" textarea value={intake.boundaries} onChange={(v) => update('boundaries', v)} /><div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={intake.memory} onChange={(e) => update('memory', e.target.checked)} /> Remember on this device</label><label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold"><input type="checkbox" checked={intake.localOnly} onChange={(e) => update('localOnly', e.target.checked)} /> Keep private first</label></div><div className="grid gap-3 sm:grid-cols-3"><button onClick={() => setStep(1)} className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold">Back</button><button onClick={() => addLog('Saved locally')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold"><Save className="h-4 w-4" /> Save</button><button onClick={build} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white"><Zap className="h-4 w-4" /> Build My Helper</button></div><HelpBox /></div></div><div className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold uppercase tracking-wide text-slate-400">Preview</p><h3 className="mt-2 text-3xl font-black">{intake.agentName}</h3><p className="mt-1 text-slate-300">{intake.agentType}</p><p className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6">{intake.goal}</p><p className="mt-3 rounded-2xl bg-white/10 p-4 text-sm leading-6">Safety rule: {intake.boundaries}</p></div></div>}

      {step === 3 && <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]"><div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Ready to activate</p><h3 className="mt-2 text-3xl font-black">{intake.agentName} is built. Now let’s make it work.</h3><p className="mt-3 text-sm leading-6 text-slate-600">This is the important part: choose where you want to use your helper, copy the instructions, paste them there, and send one test message. We guide each step.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={build} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white">Practice Again</button><button onClick={exportPackage} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold"><Download className="h-4 w-4" /> Download Backup</button><button onClick={() => setStep(2)} className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold">Edit Answers</button><button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"><RotateCcw className="h-4 w-4" /> Start Over</button></div></div><div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><p className="font-black">Choose where to use it</p><div className="mt-4 grid gap-3">{PLATFORMS.map((p) => <button key={p.id} onClick={() => setPlatform(p.id)} className={`rounded-2xl border p-4 text-left ${platform === p.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white'}`}><p className="font-black">{p.name}</p><p className={`mt-1 text-sm ${platform === p.id ? 'text-slate-200' : 'text-slate-600'}`}>{p.bestFor}</p></button>)}</div></div><div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><p className="font-black">Setup steps for {chosenPlatform.name}</p><ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">{chosenPlatform.setup.map((x, i) => <li key={x}><b>{i + 1}.</b> {x}</li>)}</ol><div className="mt-5 grid gap-3"><a href={setupHref} target="_blank" rel="noreferrer" className="rounded-2xl bg-slate-950 px-5 py-4 text-center text-sm font-bold text-white">Open {chosenPlatform.name}</a><button onClick={() => copyText('helper instructions', prompt)} className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold">Copy Helper Instructions</button><button onClick={() => copyText('first test message', TEST_MESSAGE)} className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold">Copy First Test Message</button>{copied && <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Copied {copied}.</p>}</div></div><HelpBox /></div><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xl font-black">{intake.agentName}</p><p className="text-sm text-slate-500">{intake.agentType}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Built</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-4"><Database className="h-4 w-4" /> <b>Memory</b><p className="text-sm text-slate-600">{intake.memory ? 'Remember on this device' : 'Off'}</p></div><div className="rounded-2xl border border-slate-200 p-4"><Lock className="h-4 w-4" /> <b>Privacy mode</b><p className="text-sm text-slate-600">{intake.localOnly ? 'Private first' : 'Cloud-assisted'}</p></div></div><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Mission</p><p className="mt-2 text-sm leading-6 text-slate-700">{intake.goal}</p></div><div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Practice runs</p><div className="mt-3 grid gap-3">{workflows.map((wf) => <div key={wf.id} className={`rounded-2xl bg-white p-4 ring-1 ${selected?.id === wf.id ? 'ring-slate-950' : 'ring-slate-100'}`}><button onClick={() => setSelected(wf)} className="w-full text-left"><p className="text-sm font-black">{wf.id}. {wf.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{wf.description}</p><p className="mt-2 text-xs font-bold text-emerald-700">{wf.permission}</p></button><button onClick={() => simulate(wf)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white"><PlayCircle className="h-3.5 w-3.5" /> Run Practice</button></div>)}</div></div>{run && <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">{run}</pre>}{prompt && <details className="mt-5 rounded-2xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-slate-500">Show helper instructions</summary><pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">{prompt}</pre></details>}{log.length > 0 && <div className="mt-5 rounded-2xl border border-slate-200 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><History className="h-4 w-4" /> Activity log</p>{log.slice(0, 5).map((x) => <p key={x.id} className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><b>{x.time}</b> — {x.msg}</p>)}</div>}</div></div>}
      </div></section>

      <section className="bg-slate-950 py-16 text-white"><div className="mx-auto max-w-7xl px-5"><p className="text-sm font-bold uppercase tracking-wide text-slate-400">Pricing test</p><h2 className="mt-2 text-4xl font-black">Would people pay for setup that actually works?</h2><div className="mt-9 grid gap-5 lg:grid-cols-3">{PACKAGES.map(([name, price, desc], i) => <div key={name} className={`rounded-3xl border p-6 ${i === 1 ? 'border-white bg-white text-slate-950' : 'border-white/10 bg-white/5'}`}><CreditCard className="h-5 w-5" /><h3 className="mt-5 text-2xl font-black">{name}</h3><p className={`mt-3 text-sm leading-6 ${i === 1 ? 'text-slate-600' : 'text-slate-300'}`}>{desc}</p><p className="mt-6 text-4xl font-black">{price}</p><a href="#builder" className={`mt-7 inline-flex w-full justify-center rounded-2xl px-5 py-4 text-sm font-bold ${i === 1 ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'}`}>Make My Helper</a></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-16"><div className="rounded-[2rem] bg-slate-950 p-8 text-white md:p-10"><h2 className="text-3xl font-black">Grandma-proof rule</h2><p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">The flow is not finished when a file downloads. It is finished when the user can say: “My helper works.”</p></div></section>
    </main>
  </div>
}
