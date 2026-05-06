import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  FileCheck2,
  Gauge,
  History,
  Lock,
  MonitorDown,
  PlayCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  Workflow,
  Zap,
} from 'lucide-react'

const STORAGE_KEY = 'proagent-local-mvp-state'

const personas = [
  'Executive Assistant',
  'Job Search Agent',
  'Research Analyst',
  'Risk & Compliance Analyst',
  'Household Operations Agent',
  'Custom Persona',
]

const packages = [
  {
    name: 'Local Agent Builder',
    price: '$149',
    tag: 'Starter',
    description: 'Create one local agent with persona, mission, memory, workflows, and approval checkpoints.',
    features: ['Runs locally', 'One agent', 'Workflow templates', 'Approval checkpoints'],
  },
  {
    name: 'Agent Builder Pro',
    price: '$299',
    tag: 'Best value',
    description: 'Build multiple persona-based agents with local memory, templates, simulations, and audit logs.',
    features: ['Five agents', 'Local saved state', 'Simulated workflow runs', 'Exportable agent package'],
    highlighted: true,
  },
  {
    name: 'Team / Small Business',
    price: '$799',
    tag: 'Operator',
    description: 'For users and small teams that need governed local workflow automation.',
    features: ['Ten agents', 'Role-based settings', 'Shared templates', 'Exportable audit logs'],
  },
]

const defaultAgent = {
  name: 'Atlas',
  persona: 'Executive Assistant',
  mission: 'Organize my work, surface important issues, draft recommendations, and help me plan routine tasks.',
  autonomy: 2,
  memory: true,
  localOnly: true,
  approvalMode: 'Require approval for anything outside the local workspace',
}

function nowLabel() {
  return new Date().toLocaleString()
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function generateStarterWorkflows(agent) {
  const templates = {
    'Executive Assistant': [
      ['Morning Command Brief', 'Review priorities, open tasks, and notes; produce a short daily command brief.'],
      ['Message Drafting Queue', 'Draft responses and follow-ups for user review without sending anything.'],
      ['Decision Memo Builder', 'Turn messy notes into options, tradeoffs, and a recommended next step.'],
      ['Meeting Prep Pack', 'Create agenda, talking points, questions, and follow-up items.'],
      ['End-of-Day Closeout', 'Summarize completed work, unresolved issues, and tomorrow’s first actions.'],
    ],
    'Job Search Agent': [
      ['Role Fit Review', 'Compare a target role against user criteria for compensation, remote status, seniority, and fit.'],
      ['Resume Alignment Draft', 'Prepare role-specific resume bullets using the user’s actual background.'],
      ['Recruiter Message Draft', 'Create concise recruiter messages for review.'],
      ['Application Tracker Update', 'Prepare a status record with next action, owner, and follow-up date.'],
      ['Interview Prep Brief', 'Generate likely questions, STAR points, and role-specific positioning.'],
    ],
    'Research Analyst': [
      ['Research Brief', 'Summarize a topic, identify key questions, and separate facts from assumptions.'],
      ['Source Quality Review', 'Rank notes or sources by reliability, recency, and relevance.'],
      ['Opportunity Scan', 'Identify themes, opportunities, risks, and recommended follow-up questions.'],
      ['Watchlist Summary', 'Create a watchlist of topics or signals for human review.'],
      ['Weekly Research Memo', 'Draft a plain-English memo with findings, open questions, and next actions.'],
    ],
    'Risk & Compliance Analyst': [
      ['Control Quality Review', 'Review control language for objective, activity, evidence, frequency, owner, and action quality.'],
      ['Issue Description Draft', 'Convert raw observations into clear issue statements with risk, impact, and corrective action.'],
      ['Regulatory Mapping Pass', 'Map obligations to risks, controls, gaps, and evidence needs.'],
      ['RCSA Challenge Brief', 'Prepare second-line challenge questions and expected evidence.'],
      ['Executive Risk Summary', 'Draft a concise senior-leader brief with risk posture, themes, and next steps.'],
    ],
    'Household Operations Agent': [
      ['Weekly Home Plan', 'Create a household task plan covering appointments, errands, repairs, and family needs.'],
      ['Document Organizer', 'Summarize household documents and propose folder names and retention actions.'],
      ['Maintenance Reminder Plan', 'Track recurring home maintenance and upcoming reminders.'],
      ['Family Logistics Brief', 'Prepare a practical daily or weekly family logistics plan.'],
      ['Budget Notes Organizer', 'Organize bill and spending notes for review without initiating payments.'],
    ],
    'Custom Persona': [
      ['Mission Intake', 'Clarify the custom persona’s purpose, success criteria, limits, and daily rhythm.'],
      ['Priority Scan', 'Generate the top five recommended next actions from available notes.'],
      ['Drafting Routine', 'Prepare drafts, checklists, summaries, or reports aligned to the assigned persona.'],
      ['Boundary Check', 'Identify actions that require human approval before proceeding.'],
      ['Daily Closeout', 'Summarize what was done, what remains open, and what needs human decision.'],
    ],
  }

  return (templates[agent.persona] || templates['Custom Persona']).map(([title, description], index) => ({
    id: index + 1,
    title,
    description,
    cadence: index === 0 ? 'Daily' : index === 4 ? 'End of day / weekly' : 'As needed',
    permission: index <= 2 ? 'Local workspace only' : 'Human review before external use',
  }))
}

function simulateWorkflowRun(agent, workflow) {
  if (!workflow) return ''
  const personaNotes = {
    'Risk & Compliance Analyst': [
      'Check whether the control objective, activity, evidence, frequency, owner, and action language are clear.',
      'Flag vague evidence language because it weakens auditability and oversight challenge.',
      'Recommended next action: draft a focused challenge question and request supporting evidence.',
    ],
    'Job Search Agent': [
      'Filter roles against salary, remote preference, seniority, domain fit, and credibility of the employer.',
      'Flag generic resume language that undersells measurable leadership and risk outcomes.',
      'Recommended next action: create a targeted resume variant and recruiter note for the highest-fit role.',
    ],
    'Executive Assistant': [
      'Organize the day around decisions and high-value work, not just volume of tasks.',
      'Flag meetings or follow-ups that lack clear outcomes.',
      'Recommended next action: create a command brief with top three priorities and blocked items.',
    ],
    'Research Analyst': [
      'Separate confirmed facts, assumptions, and open questions before forming a recommendation.',
      'Flag weak or stale source material for human review.',
      'Recommended next action: draft a short research memo with findings and next questions.',
    ],
    'Household Operations Agent': [
      'Group household work by urgency, location, and dependency to reduce wasted motion.',
      'Flag items waiting on another person, vendor, or decision.',
      'Recommended next action: create a weekly plan with must-do, should-do, and waiting-on categories.',
    ],
    'Custom Persona': [
      'Clarify the role, boundaries, success criteria, and expected output format.',
      'Flag any task that is too broad or lacks enough context.',
      'Recommended next action: define the top five recurring tasks and approval thresholds.',
    ],
  }
  const notes = personaNotes[agent.persona] || personaNotes['Custom Persona']

  return [
    `${agent.name} simulated the "${workflow.title}" workflow as a ${agent.persona}.`,
    'No external action was taken. This is a local planning output.',
    '',
    'Simulated output:',
    ...notes.map((note) => `- ${note}`),
    '',
    `Permission rule: ${workflow.permission}`,
  ].join('\n')
}

function buildAgentPackage(agent, workflows, runOutput, auditLog) {
  return {
    product: 'ProAgent Local',
    version: '0.3.0',
    exportedAt: new Date().toISOString(),
    agent,
    safetyModel: {
      principle: 'Local planning and drafting are allowed. External actions require human review.',
      allowedLocally: ['summaries', 'drafts', 'checklists', 'reports', 'workflow plans', 'simulated runs'],
      requiresHumanReview: ['sending messages', 'posting publicly', 'deleting files', 'changing accounts', 'submitting forms'],
    },
    workflows,
    latestRunOutput: runOutput,
    auditLog,
  }
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100"><Icon className="h-6 w-6 text-slate-950" /></div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function AutonomyBadge({ level }) {
  const labels = ['Observe only', 'Draft and recommend', 'Run local simulations', 'Use approved local workflows']
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-sm font-semibold text-slate-900">Autonomy Level</p><p className="mt-1 text-sm text-slate-600">{labels[level]}</p></div>
        <div className="rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">{level + 1}/4</div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-950" style={{ width: `${(level + 1) * 25}%` }} /></div>
    </div>
  )
}

function WorkflowCard({ workflow, selected, onSelect, onRun }) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ${selected ? 'ring-slate-950' : 'ring-transparent'}`}>
      <button onClick={onSelect} className="w-full text-left">
        <p className="text-sm font-black text-slate-950">{workflow.id}. {workflow.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{workflow.description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{workflow.cadence}</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{workflow.permission}</span></div>
      </button>
      <button onClick={onRun} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"><PlayCircle className="h-3.5 w-3.5" /> Run Simulation</button>
    </div>
  )
}

function AgentPanel({ agent, workflows, selectedWorkflow, runOutput, auditLog, onExport, onRunWorkflow, onSelectWorkflow }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950"><Bot className="h-6 w-6 text-white" /></div><div><p className="text-xl font-black text-slate-950">{agent.name || 'Unnamed Agent'}</p><p className="text-sm text-slate-500">{agent.persona}</p></div></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Local Ready</span></div>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Mission</p><p className="mt-2 text-sm leading-6 text-slate-700">{agent.mission}</p></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Database className="h-4 w-4" /> Memory</div><p className="mt-1 text-sm text-slate-600">{agent.memory ? 'Enabled locally' : 'Disabled'}</p></div><div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Lock className="h-4 w-4" /> Data Mode</div><p className="mt-1 text-sm text-slate-600">{agent.localOnly ? 'Local-first' : 'Cloud-assisted'}</p></div></div>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><p className="text-sm font-bold text-amber-900">Action Policy</p><p className="mt-1 text-sm leading-6 text-amber-800">{agent.approvalMode}</p></div></div></div>
      {workflows.length > 0 && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Starter Workflows</p><div className="mt-3 grid gap-3">{workflows.map((workflow) => <WorkflowCard key={workflow.id} workflow={workflow} selected={selectedWorkflow?.id === workflow.id} onSelect={() => onSelectWorkflow(workflow)} onRun={() => onRunWorkflow(workflow)} />)}</div></div>}
      {runOutput && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-300"><ClipboardList className="h-4 w-4" /> Latest Simulated Run</p><pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-100">{runOutput}</pre></div>}
      {auditLog.length > 0 && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><History className="h-4 w-4" /> Audit Log</p><div className="mt-3 grid gap-2">{auditLog.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600"><span className="font-bold text-slate-900">{item.time}</span> — {item.message}</div>)}</div></div>}
      <button onClick={onExport} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white hover:bg-slate-800"><Download className="h-4 w-4" /> Export Full Agent Package JSON</button>
    </div>
  )
}

export default function App() {
  const [agent, setAgent] = useState(defaultAgent)
  const [workflows, setWorkflows] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [runOutput, setRunOutput] = useState('')
  const [auditLog, setAuditLog] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (saved?.agent) setAgent(saved.agent)
      if (saved?.workflows) setWorkflows(saved.workflows)
      if (saved?.selectedWorkflow) setSelectedWorkflow(saved.selectedWorkflow)
      if (saved?.runOutput) setRunOutput(saved.runOutput)
      if (saved?.auditLog) setAuditLog(saved.auditLog)
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ agent, workflows, selectedWorkflow, runOutput, auditLog }))
  }, [agent, workflows, selectedWorkflow, runOutput, auditLog])

  const activeCapabilities = useMemo(() => ['Monitor local inputs and surface priorities', 'Draft recommendations and task plans', 'Generate safe workflow simulations', 'Export an auditable agent package'], [])

  const addLog = (message) => setAuditLog((current) => [{ id: crypto.randomUUID(), time: nowLabel(), message }, ...current].slice(0, 20))

  const handleGenerate = () => {
    const generated = generateStarterWorkflows(agent)
    setWorkflows(generated)
    setSelectedWorkflow(generated[0])
    setRunOutput('')
    addLog(`Generated ${generated.length} workflows for ${agent.name}.`)
  }

  const handleRunWorkflow = (workflow) => {
    const output = simulateWorkflowRun(agent, workflow)
    setSelectedWorkflow(workflow)
    setRunOutput(output)
    addLog(`Simulated workflow: ${workflow.title}.`)
  }

  const handleExport = () => {
    const generated = workflows.length > 0 ? workflows : generateStarterWorkflows(agent)
    downloadJson(`${agent.name || 'proagent'}-agent-package.json`, buildAgentPackage(agent, generated, runOutput, auditLog))
    if (workflows.length === 0) setWorkflows(generated)
    addLog(`Exported full package for ${agent.name}.`)
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ agent, workflows, selectedWorkflow, runOutput, auditLog }))
    addLog(`Saved ${agent.name} locally in this browser.`)
  }

  const handleReset = () => {
    setAgent(defaultAgent)
    setWorkflows([])
    setSelectedWorkflow(null)
    setRunOutput('')
    setAuditLog([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950"><BrainCircuit className="h-5 w-5 text-white" /></div><div><p className="text-base font-black tracking-tight">ProAgent Local</p><p className="text-xs text-slate-500">Governed local agents for real work</p></div></div><nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex"><a href="#builder" className="hover:text-slate-950">Builder</a><a href="#features" className="hover:text-slate-950">Features</a><a href="#pricing" className="hover:text-slate-950">Pricing</a><a href="#roadmap" className="hover:text-slate-950">Roadmap</a></nav><a href="#pricing" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-slate-800">Buy Local App</a></div></header>
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-20"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"><Sparkles className="h-4 w-4" /> Local-first agent automation</div><h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl">Build a proactive AI agent that works like the persona you assign.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">ProAgent Local lets users create persona-based agents, define missions, generate workflows, simulate safe local runs, save locally, and export an auditable agent package.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#builder" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-slate-300 hover:bg-slate-800">Design an Agent <ArrowRight className="h-4 w-4" /></a><a href="#roadmap" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-950 hover:bg-slate-100">View Product Blueprint</a></div></motion.div><motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.1 }}><div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200"><div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-300">Active Agent</p><p className="text-2xl font-black">{agent.name}</p></div><Gauge className="h-8 w-8 text-slate-300" /></div><div className="mt-6 grid gap-3">{activeCapabilities.map((item) => <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 text-sm text-slate-100"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><span>{item}</span></div>)}</div></div></div></motion.div></section>
        <section id="builder" className="border-y border-slate-200 bg-white py-16"><div className="mx-auto max-w-7xl px-5"><div className="mb-8 max-w-3xl"><p className="text-sm font-bold uppercase tracking-wide text-slate-500">Interactive product demo</p><h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Agent Builder Interface</h2><p className="mt-4 text-base leading-7 text-slate-600">Configure the agent, generate workflows, run safe simulations, save locally, and export the package.</p></div><div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]"><div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="grid gap-5"><label className="grid gap-2"><span className="text-sm font-bold text-slate-800">Agent Name</span><input className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900" value={agent.name} onChange={(e) => setAgent({ ...agent, name: e.target.value })} /></label><label className="grid gap-2"><span className="text-sm font-bold text-slate-800">Persona</span><select className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900" value={agent.persona} onChange={(e) => { setAgent({ ...agent, persona: e.target.value }); setWorkflows([]); setRunOutput('') }}>{personas.map((persona) => <option key={persona}>{persona}</option>)}</select></label><label className="grid gap-2"><span className="text-sm font-bold text-slate-800">Mission Statement</span><textarea rows={5} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-900" value={agent.mission} onChange={(e) => { setAgent({ ...agent, mission: e.target.value }); setWorkflows([]); setRunOutput('') }} /></label><div className="grid gap-2"><span className="text-sm font-bold text-slate-800">Autonomy Setting</span><input type="range" min="0" max="3" value={agent.autonomy} onChange={(e) => setAgent({ ...agent, autonomy: Number(e.target.value) })} /><AutonomyBadge level={agent.autonomy} /></div><label className="grid gap-2"><span className="text-sm font-bold text-slate-800">Action Permission Policy</span><select className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900" value={agent.approvalMode} onChange={(e) => setAgent({ ...agent, approvalMode: e.target.value })}><option>Require approval for anything outside the local workspace</option><option>Allow local drafting and simulation only</option><option>Allow approved local workflows only</option><option>Disable workflow runs until user reviews settings</option></select></label><div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700"><input type="checkbox" checked={agent.memory} onChange={(e) => setAgent({ ...agent, memory: e.target.checked })} />Local memory enabled</label><label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700"><input type="checkbox" checked={agent.localOnly} onChange={(e) => setAgent({ ...agent, localOnly: e.target.checked })} />Local-first data mode</label></div><div className="grid gap-3 sm:grid-cols-2"><button onClick={handleGenerate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white hover:bg-slate-800"><PlayCircle className="h-4 w-4" /> Generate Workflows</button><button onClick={handleExport} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold text-slate-950 hover:bg-slate-100"><Download className="h-4 w-4" /> Export Package</button></div><div className="grid gap-3 sm:grid-cols-2"><button onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold text-slate-950 hover:bg-slate-100"><Save className="h-4 w-4" /> Save Locally</button><button onClick={handleReset} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 hover:bg-red-100"><RotateCcw className="h-4 w-4" /> Reset</button></div></div></div><AgentPanel agent={agent} workflows={workflows} selectedWorkflow={selectedWorkflow} runOutput={runOutput} auditLog={auditLog} onExport={handleExport} onRunWorkflow={handleRunWorkflow} onSelectWorkflow={setSelectedWorkflow} /></div></div></section>
        <section id="features" className="mx-auto max-w-7xl px-5 py-16"><div className="mb-9 max-w-3xl"><p className="text-sm font-bold uppercase tracking-wide text-slate-500">Functional product requirements</p><h2 className="mt-2 text-4xl font-black tracking-tight">What makes this operational</h2><p className="mt-4 text-base leading-7 text-slate-600">The commercial product needs install, onboarding, local data controls, action logs, workflow templates, model connection, and a safe autonomy model.</p></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"><FeatureCard icon={MonitorDown} title="Local Installer" text="Ship as a desktop app using Tauri or Electron with one-click install for Windows and Mac." /><FeatureCard icon={UserRoundCog} title="Persona Builder" text="Let users define role, mission, boundaries, trusted zones, and success criteria." /><FeatureCard icon={Workflow} title="Workflow Engine" text="Use templates for recurring routines: research, file review, reminders, drafts, and summaries." /><FeatureCard icon={ShieldCheck} title="Guarded Autonomy" text="Keep runs local first and require review before external use." /><FeatureCard icon={Lock} title="Local-First Privacy" text="Store memory, logs, and preferences locally unless the user enables cloud services." /><FeatureCard icon={BrainCircuit} title="Model Choice" text="Support local models through Ollama and optional cloud APIs." /><FeatureCard icon={FileCheck2} title="Audit Trail" text="Record what the agent generated, simulated, saved, and exported." /><FeatureCard icon={Zap} title="Kill Switch" text="Give users a clear stop/reset control for workflows and saved state." /></div></section>
        <section id="pricing" className="bg-slate-950 py-16 text-white"><div className="mx-auto max-w-7xl px-5"><div className="mb-9 max-w-3xl"><p className="text-sm font-bold uppercase tracking-wide text-slate-400">Storefront pricing</p><h2 className="mt-2 text-4xl font-black tracking-tight">Sell the outcome, not the technology</h2><p className="mt-4 text-base leading-7 text-slate-300">Position the app as a practical local agent builder for professionals, families, job seekers, creators, and small businesses.</p></div><div className="grid gap-5 lg:grid-cols-3">{packages.map((pkg) => <div key={pkg.name} className={`rounded-3xl border p-6 ${pkg.highlighted ? 'border-white bg-white text-slate-950' : 'border-white/10 bg-white/5 text-white'}`}><div className="mb-5 flex items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${pkg.highlighted ? 'bg-slate-950 text-white' : 'bg-white/10 text-slate-200'}`}>{pkg.tag}</span><CreditCard className="h-5 w-5 opacity-70" /></div><h3 className="text-2xl font-black">{pkg.name}</h3><p className={`mt-3 text-sm leading-6 ${pkg.highlighted ? 'text-slate-600' : 'text-slate-300'}`}>{pkg.description}</p><p className="mt-6 text-4xl font-black">{pkg.price}</p><ul className="mt-6 grid gap-3 text-sm">{pkg.features.map((feature) => <li key={feature} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {feature}</li>)}</ul><button className={`mt-7 w-full rounded-2xl px-5 py-4 text-sm font-bold ${pkg.highlighted ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-white text-slate-950 hover:bg-slate-200'}`}>Purchase & Download</button></div>)}</div></div></section>
        <section id="roadmap" className="mx-auto max-w-7xl px-5 py-16"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-bold uppercase tracking-wide text-slate-500">Execution roadmap</p><h2 className="mt-2 text-4xl font-black tracking-tight">How to make this a real product</h2><p className="mt-4 text-base leading-7 text-slate-600">Start with a useful local assistant. Add broader integrations only after trust is earned.</p></div><div className="grid gap-4">{[['1', 'MVP agent package', 'Persona, mission, workflow generation, simulation, export, local save, and audit log.'], ['2', 'Local model connector', 'Connect exported profiles to Ollama for real local generation.'], ['3', 'Desktop shell', 'Use Tauri with local database, settings panel, memory store, and file permissions.'], ['4', 'Permission tiers', 'Observe, draft, recommend, simulate, and run approved local workflows.'], ['5', 'Template marketplace', 'Job search, executive assistant, household manager, research analyst, and risk review packs.'], ['6', 'Payment and licensing', 'Stripe checkout, license key validation, update channel, support portal, and documentation.']].map(([num, title, text]) => <div key={num} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">{num}</div><div><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div></div>)}</div></div></section>
        <section className="mx-auto max-w-7xl px-5 pb-20"><div className="rounded-[2rem] bg-slate-950 p-8 text-white md:p-10"><div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><h2 className="text-3xl font-black tracking-tight">The strongest positioning: a governed local agent builder.</h2><p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">Market it as a trusted local work system that helps users plan, draft, simulate, and review work inside clear boundaries.</p></div><a href="#builder" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 hover:bg-slate-200">Try Builder <Zap className="h-4 w-4" /></a></div></div></section>
      </main>
    </div>
  )
}
