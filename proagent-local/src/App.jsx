import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  Database,
  Download,
  FileCheck2,
  Gauge,
  Lock,
  MonitorDown,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  Workflow,
  Zap,
} from 'lucide-react'

const personas = [
  'Executive Assistant',
  'Job Search Agent',
  'Crypto Research Agent',
  'Risk & Compliance Analyst',
  'Household Operations Agent',
  'Custom Persona',
]

const packages = [
  {
    name: 'Local Agent Builder',
    price: '$149',
    tag: 'Starter',
    description: 'Create one proactive local agent with persona, goals, memory, and workflow rules.',
    features: ['Runs locally', 'One agent', 'Basic workflow templates', 'Approval checkpoints'],
  },
  {
    name: 'Agent Builder Pro',
    price: '$299',
    tag: 'Best value',
    description: 'Build multiple persona-based agents with memory, schedules, local files, and controlled actions.',
    features: ['Five local agents', 'Local file knowledge', 'Scheduled routines', 'Action audit trail'],
    highlighted: true,
  },
  {
    name: 'Team / Small Business',
    price: '$799',
    tag: 'Operator',
    description: 'For households, solopreneurs, and small teams that need governed local automation.',
    features: ['Ten agents', 'Role-based controls', 'Shared workflows', 'Exportable compliance logs'],
  },
]

const defaultAgent = {
  name: 'Atlas',
  persona: 'Executive Assistant',
  mission:
    'Proactively organize my work, surface important issues, draft recommendations, and help me execute routine tasks.',
  autonomy: 2,
  memory: true,
  localOnly: true,
  approvalMode: 'Require approval for external actions',
}

function downloadAgentProfile(agent) {
  const profile = {
    product: 'ProAgent Local',
    version: '0.1.0',
    createdAt: new Date().toISOString(),
    agent: {
      name: agent.name,
      persona: agent.persona,
      mission: agent.mission,
      autonomyLevel: agent.autonomy + 1,
      memoryEnabled: agent.memory,
      localFirstMode: agent.localOnly,
      approvalPolicy: agent.approvalMode,
    },
    trustedZones: {
      allowedWithoutApproval: [
        'Summarize local documents',
        'Draft messages and recommendations',
        'Create task lists',
        'Generate reports',
        'Prepare workflow plans',
      ],
      approvalRequired: [
        'Send emails',
        'Delete or move files',
        'Make purchases',
        'Post to social media',
        'Submit applications',
        'Move money or change financial settings',
      ],
    },
  }

  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${agent.name || 'proagent'}-profile.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-6 w-6 text-slate-950" />
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function AutonomyBadge({ level }) {
  const labels = ['Observe only', 'Draft and recommend', 'Act inside approved workflows', 'Act inside trusted zones']

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Autonomy Level</p>
          <p className="mt-1 text-sm text-slate-600">{labels[level]}</p>
        </div>
        <div className="rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">{level + 1}/4</div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-950" style={{ width: `${(level + 1) * 25}%` }} />
      </div>
    </div>
  )
}

function AgentPreview({ agent }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-950">{agent.name || 'Unnamed Agent'}</p>
            <p className="text-sm text-slate-500">{agent.persona}</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Local Ready</span>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Mission</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{agent.mission}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Database className="h-4 w-4" /> Memory
          </div>
          <p className="mt-1 text-sm text-slate-600">{agent.memory ? 'Enabled locally' : 'Disabled'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Lock className="h-4 w-4" /> Data Mode
          </div>
          <p className="mt-1 text-sm text-slate-600">{agent.localOnly ? 'Local-first' : 'Cloud-assisted'}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-bold text-amber-900">Action Policy</p>
            <p className="mt-1 text-sm leading-6 text-amber-800">{agent.approvalMode}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => downloadAgentProfile(agent)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white hover:bg-slate-800"
      >
        <Download className="h-4 w-4" /> Export Agent Profile JSON
      </button>
    </div>
  )
}

export default function App() {
  const [agent, setAgent] = useState(defaultAgent)

  const activeCapabilities = useMemo(
    () => [
      'Monitor inputs and surface priorities',
      'Draft recommendations and task plans',
      'Analyze local documents',
      'Run scheduled approved workflows',
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight">ProAgent Local</p>
              <p className="text-xs text-slate-500">Persona-based AI agents for real work</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#builder" className="hover:text-slate-950">Builder</a>
            <a href="#features" className="hover:text-slate-950">Features</a>
            <a href="#pricing" className="hover:text-slate-950">Pricing</a>
            <a href="#roadmap" className="hover:text-slate-950">Roadmap</a>
          </nav>
          <a href="#pricing" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-slate-800">
            Buy Local App
          </a>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4" /> Local-first agent automation
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
              Build a proactive AI agent that works like the persona you assign.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              ProAgent Local is a downloadable desktop-app concept that lets users create persona-based agents, define missions, connect local knowledge, set autonomy boundaries, and run useful workflows without needing to code.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#builder" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-slate-300 hover:bg-slate-800">
                Design an Agent <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#roadmap" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-950 hover:bg-slate-100">
                View Product Blueprint
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.1 }}>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Active Agent</p>
                    <p className="text-2xl font-black">{agent.name}</p>
                  </div>
                  <Gauge className="h-8 w-8 text-slate-300" />
                </div>
                <div className="mt-6 grid gap-3">
                  {activeCapabilities.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 text-sm text-slate-100">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="builder" className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Interactive product demo</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Agent Builder Interface</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                The installed app should guide non-technical users through persona, mission, local memory, autonomy, and action permissions.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid gap-5">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-800">Agent Name</span>
                    <input
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                      value={agent.name}
                      onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-800">Persona</span>
                    <select
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                      value={agent.persona}
                      onChange={(e) => setAgent({ ...agent, persona: e.target.value })}
                    >
                      {personas.map((persona) => (
                        <option key={persona}>{persona}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-800">Mission Statement</span>
                    <textarea
                      rows={5}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-900"
                      value={agent.mission}
                      onChange={(e) => setAgent({ ...agent, mission: e.target.value })}
                    />
                  </label>

                  <div className="grid gap-2">
                    <span className="text-sm font-bold text-slate-800">Autonomy Setting</span>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={agent.autonomy}
                      onChange={(e) => setAgent({ ...agent, autonomy: Number(e.target.value) })}
                    />
                    <AutonomyBadge level={agent.autonomy} />
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-800">Action Permission Policy</span>
                    <select
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                      value={agent.approvalMode}
                      onChange={(e) => setAgent({ ...agent, approvalMode: e.target.value })}
                    >
                      <option>Require approval for external actions</option>
                      <option>Auto-act only inside approved workflows</option>
                      <option>Auto-act for low-risk local tasks only</option>
                      <option>Full autonomy disabled until user defines trusted zones</option>
                    </select>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
                      <input type="checkbox" checked={agent.memory} onChange={(e) => setAgent({ ...agent, memory: e.target.checked })} />
                      Local memory enabled
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
                      <input type="checkbox" checked={agent.localOnly} onChange={(e) => setAgent({ ...agent, localOnly: e.target.checked })} />
                      Local-first data mode
                    </label>
                  </div>

                  <button
                    onClick={() => downloadAgentProfile(agent)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    <PlayCircle className="h-4 w-4" /> Generate Agent Profile
                  </button>
                </div>
              </div>

              <AgentPreview agent={agent} />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-16">
          <div className="mb-9 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Functional product requirements</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">What makes this operational</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The commercial product needs install, onboarding, local data controls, action logs, workflow templates, and a safe autonomy model.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={MonitorDown} title="Local Installer" text="Ship as a desktop app using Tauri or Electron with one-click install for Windows and Mac." />
            <FeatureCard icon={UserRoundCog} title="Persona Builder" text="Let users define role, tone, mission, boundaries, trusted zones, and success criteria." />
            <FeatureCard icon={Workflow} title="Workflow Engine" text="Use templates for recurring routines: research, file review, reminders, drafts, monitoring, and summaries." />
            <FeatureCard icon={ShieldCheck} title="Guarded Autonomy" text="Allow proactive behavior inside trusted zones, with approval thresholds and audit logs." />
            <FeatureCard icon={Lock} title="Local-First Privacy" text="Store files, memory, logs, and user preferences locally unless the user enables cloud services." />
            <FeatureCard icon={BrainCircuit} title="Model Choice" text="Support local models through Ollama and cloud APIs when users need stronger reasoning." />
            <FeatureCard icon={FileCheck2} title="Audit Trail" text="Record what the agent observed, recommended, drafted, and executed so the user can trust it." />
            <FeatureCard icon={Zap} title="Kill Switch" text="Give users a simple emergency stop for schedules, actions, connectors, and workflows." />
          </div>
        </section>

        <section id="pricing" className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-9 max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400">Storefront pricing</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight">Sell the outcome, not the technology</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Position the app as a practical local agent builder for professionals, families, job seekers, creators, and small businesses.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {packages.map((pkg) => (
                <div key={pkg.name} className={`rounded-3xl border p-6 ${pkg.highlighted ? 'border-white bg-white text-slate-950' : 'border-white/10 bg-white/5 text-white'}`}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${pkg.highlighted ? 'bg-slate-950 text-white' : 'bg-white/10 text-slate-200'}`}>{pkg.tag}</span>
                    <CreditCard className="h-5 w-5 opacity-70" />
                  </div>
                  <h3 className="text-2xl font-black">{pkg.name}</h3>
                  <p className={`mt-3 text-sm leading-6 ${pkg.highlighted ? 'text-slate-600' : 'text-slate-300'}`}>{pkg.description}</p>
                  <p className="mt-6 text-4xl font-black">{pkg.price}</p>
                  <ul className="mt-6 grid gap-3 text-sm">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`mt-7 w-full rounded-2xl px-5 py-4 text-sm font-bold ${pkg.highlighted ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-white text-slate-950 hover:bg-slate-200'}`}>
                    Purchase & Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Execution roadmap</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight">How to make this a real product</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Start with a narrow but valuable local assistant. Add higher autonomy only after trust is earned.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                ['1', 'Build MVP storefront', 'Landing page, pricing, demo builder, purchase/download flow, and product narrative.'],
                ['2', 'Create local desktop shell', 'Use Tauri or Electron with a local database, settings panel, memory store, and model connector.'],
                ['3', 'Add persona + workflow engine', 'Let users create agents with mission, persona, file access, schedule, and approved actions.'],
                ['4', 'Implement permission tiers', 'Observe, draft, recommend, auto-act in trusted zones, and emergency kill switch.'],
                ['5', 'Ship templates', 'Job search agent, executive assistant, household manager, crypto research analyst, risk review assistant.'],
                ['6', 'Add payment + licensing', 'Stripe checkout, license key validation, update channel, support portal, and documentation.'],
              ].map(([num, title, text]) => (
                <div key={num} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">{num}</div>
                  <div>
                    <h3 className="font-bold text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white md:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-3xl font-black tracking-tight">The strongest positioning: a governed local agent builder.</h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Do not market this as a reckless autonomous agent. Market it as a trusted local work system that acts proactively inside user-defined boundaries.
                </p>
              </div>
              <a href="#builder" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 hover:bg-slate-200">
                Try Builder <Zap className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
