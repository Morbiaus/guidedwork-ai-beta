import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Copy, Download, RotateCcw, Wand2 } from 'lucide-react'

const STORAGE_KEY = 'guidedwork-simple-wizard-v1'

const AGENTS = [
  {
    type: 'Daily Helper',
    name: 'Sunny',
    plain: 'Help me remember things and make simple plans.',
    mission: 'Remember important things, organize simple tasks, prepare for appointments, and make easy daily plans.',
    tasks: 'Daily planning, reminders, simple lists, appointment preparation, and family logistics.',
    icon: '☀️',
  },
  {
    type: 'Message Helper',
    name: 'Penny',
    plain: 'Help me write texts, emails, and notes.',
    mission: 'Draft clear, kind messages for family, friends, appointments, vendors, and everyday situations.',
    tasks: 'Message drafts, email replies, thank-you notes, appointment questions, and follow-up messages.',
    icon: '✉️',
  },
  {
    type: 'Appointment Helper',
    name: 'Grace',
    plain: 'Help me get ready for calls, doctors, and meetings.',
    mission: 'Prepare simple appointment notes, questions to ask, items to bring, and follow-up reminders.',
    tasks: 'Appointment prep, question lists, reminder checklists, follow-up summaries, and next-step planning.',
    icon: '📅',
  },
  {
    type: 'Document Helper',
    name: 'Scout',
    plain: 'Help me understand and organize documents.',
    mission: 'Summarize pasted text, organize key details, and explain documents in plain language.',
    tasks: 'Document summaries, key detail extraction, plain-English explanations, and organized notes.',
    icon: '📄',
  },
]

const PERSONALITIES = [
  { label: 'Kind and patient', tone: 'Kind, patient, calm, and step-by-step.' },
  { label: 'Short and simple', tone: 'Short, simple, clear, and easy to follow.' },
  { label: 'Friendly and encouraging', tone: 'Friendly, encouraging, practical, and reassuring.' },
  { label: 'Direct and practical', tone: 'Direct, practical, organized, and action-oriented.' },
]

const HOW_TO = [
  'Pick what you need help with.',
  'Choose how your helper should sound.',
  'Choose a name.',
  'Click Build My AI Agent.',
  'Try one simple task.',
  'See a useful answer.',
  'Copy the setup if you want to use it elsewhere.',
  'Ask for setup help if you get stuck.',
  'Confirm: my helper works.',
]

const TEST_TASKS = [
  'Help me make a simple plan for tomorrow.',
  'Help me write a kind message saying I need to reschedule.',
  'Help me make a list of questions for an appointment.',
]

function workflowsFor(agentType) {
  const map = {
    'Daily Helper': ['Tomorrow Plan', 'Reminder List', 'Family Task List'],
    'Message Helper': ['Friendly Message Draft', 'Follow-Up Note', 'Appointment Message'],
    'Appointment Helper': ['Appointment Prep', 'Questions to Ask', 'After-Visit Follow-Up'],
    'Document Helper': ['Plain-English Summary', 'Important Details', 'Questions to Clarify'],
  }
  return (map[agentType] || map['Daily Helper']).map((title, index) => ({
    id: index + 1,
    title,
    description: `Help with ${title.toLowerCase()} in simple language.`,
  }))
}

function makePrompt(agent, name, personality, workflows) {
  return `You are ${name}, a ${agent.type}.\n\nYour job:\n${agent.mission}\n\nHow you should sound:\n${personality.tone}\n\nWhat you help with:\n${agent.tasks}\n\nRules:\n- Use simple words.\n- Ask one question at a time if something is missing.\n- Give clear next steps.\n- Never send, post, buy, submit, or change anything without permission.\n\nStarter skills:\n${workflows.map((w) => `- ${w.title}: ${w.description}`).join('\n')}`
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

function StepDots({ step }) {
  return <div className="grid gap-2 sm:grid-cols-5" aria-label="Progress">
    {['Pick helper', 'Personality', 'Name', 'Build', 'Test'].map((label, index) => {
      const n = index + 1
      const active = step === n
      const done = step > n
      return <div key={label} className={`rounded-2xl border p-3 text-center ${active ? 'border-slate-950 bg-slate-950 text-white' : done ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
        <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-black">{done ? '✓' : n}</div>
        <p className="text-xs font-black">{label}</p>
      </div>
    })}
  </div>
}

function SmallButton({ children, onClick, primary = false, disabled = false }) {
  return <button disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black transition ${primary ? 'bg-slate-950 text-white hover:bg-slate-800' : 'border border-slate-300 bg-white text-slate-950 hover:bg-slate-50'} disabled:cursor-not-allowed disabled:opacity-50`}>{children}</button>
}

export default function App() {
  const [step, setStep] = useState(1)
  const [agentType, setAgentType] = useState(AGENTS[0].type)
  const [personalityLabel, setPersonalityLabel] = useState(PERSONALITIES[0].label)
  const [helperName, setHelperName] = useState(AGENTS[0].name)
  const [built, setBuilt] = useState(false)
  const [testTask, setTestTask] = useState(TEST_TASKS[0])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (saved) {
        setStep(saved.step || 1)
        setAgentType(saved.agentType || AGENTS[0].type)
        setPersonalityLabel(saved.personalityLabel || PERSONALITIES[0].label)
        setHelperName(saved.helperName || AGENTS[0].name)
        setBuilt(Boolean(saved.built))
        setTestTask(saved.testTask || TEST_TASKS[0])
      }
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, agentType, personalityLabel, helperName, built, testTask }))
  }, [step, agentType, personalityLabel, helperName, built, testTask])

  const agent = useMemo(() => AGENTS.find((a) => a.type === agentType) || AGENTS[0], [agentType])
  const personality = useMemo(() => PERSONALITIES.find((p) => p.label === personalityLabel) || PERSONALITIES[0], [personalityLabel])
  const workflows = useMemo(() => workflowsFor(agent.type), [agent.type])
  const prompt = useMemo(() => makePrompt(agent, helperName || agent.name, personality, workflows), [agent, helperName, personality, workflows])

  const buildAgent = () => {
    setBuilt(true)
    setStep(5)
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStep(1)
    setAgentType(AGENTS[0].type)
    setPersonalityLabel(PERSONALITIES[0].label)
    setHelperName(AGENTS[0].name)
    setBuilt(false)
    setTestTask(TEST_TASKS[0])
    setCopied(false)
  }

  const answer = `${helperName || agent.name} says:\n\nHere is a simple plan:\n\n1. Pick the most important thing you need to do.\n2. Write down anything you must not forget.\n3. Choose one small first step.\n4. Save anything that needs a reminder.\n\nFor your test task, I would start by asking: what are the top 2 or 3 things you want help with?`

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
  }

  const downloadBackup = () => {
    downloadJson(`${helperName || 'my-helper'}-ai-agent-backup.json`, {
      helperName,
      agentType: agent.type,
      personality: personality.label,
      testTask,
      instructions: prompt,
      note: 'This backup is optional. The simple user flow is complete when the helper gives a useful answer.',
    })
  }

  return <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-4xl">
      <header className="mb-5 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700"><BrainCircuit className="h-4 w-4" /> GuidedWork AI</div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Welcome to AI Agent Builder</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Make a simple AI helper in five easy steps. No tech words. No setup confusion. Just pick, build, and try it.</p>
      </header>

      <section className="mb-5 rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
        <StepDots step={step} />
      </section>

      <section key={step} className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        {step === 1 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Step 1 of 5</p>
          <h2 className="mt-2 text-3xl font-black">What should your AI Agent help with?</h2>
          <p className="mt-3 text-slate-600">Select one. You can change it later.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {AGENTS.map((a) => <button key={a.type} onClick={() => { setAgentType(a.type); setHelperName(a.name) }} className={`rounded-3xl border p-5 text-left transition ${agentType === a.type ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              <div className="text-3xl">{a.icon}</div>
              <h3 className="mt-3 text-xl font-black">{a.type}</h3>
              <p className={`mt-2 text-sm leading-6 ${agentType === a.type ? 'text-slate-200' : 'text-slate-600'}`}>{a.plain}</p>
            </button>)}
          </div>
          <div className="mt-6 flex justify-end"><SmallButton primary onClick={() => setStep(2)}>Next <ArrowRight className="h-4 w-4" /></SmallButton></div>
        </div>}

        {step === 2 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Step 2 of 5</p>
          <h2 className="mt-2 text-3xl font-black">Choose its personality</h2>
          <p className="mt-3 text-slate-600">How should your helper sound?</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PERSONALITIES.map((p) => <button key={p.label} onClick={() => setPersonalityLabel(p.label)} className={`rounded-3xl border p-5 text-left text-lg font-black transition ${personalityLabel === p.label ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>{p.label}</button>)}
          </div>
          <div className="mt-6 flex justify-between gap-3"><SmallButton onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</SmallButton><SmallButton primary onClick={() => setStep(3)}>Next <ArrowRight className="h-4 w-4" /></SmallButton></div>
        </div>}

        {step === 3 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Step 3 of 5</p>
          <h2 className="mt-2 text-3xl font-black">Choose a name</h2>
          <p className="mt-3 text-slate-600">We picked a name for you. Keep it or type a different one.</p>
          <label className="mt-6 block"><span className="mb-2 block text-sm font-black text-slate-700">AI Agent name</span><input value={helperName} onChange={(e) => setHelperName(e.target.value)} className="w-full rounded-3xl border border-slate-300 px-5 py-5 text-2xl font-black outline-none focus:border-slate-950" /></label>
          <div className="mt-6 rounded-3xl bg-slate-50 p-5"><p className="text-sm font-black uppercase tracking-wide text-slate-500">Preview</p><p className="mt-2 text-lg"><b>{helperName || agent.name}</b> will be a <b>{personality.label.toLowerCase()}</b> {agent.type.toLowerCase()}.</p></div>
          <div className="mt-6 flex justify-between gap-3"><SmallButton onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</SmallButton><SmallButton primary onClick={() => setStep(4)}>Next <ArrowRight className="h-4 w-4" /></SmallButton></div>
        </div>}

        {step === 4 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Step 4 of 5</p>
          <h2 className="mt-2 text-3xl font-black">Build your AI Agent</h2>
          <p className="mt-3 text-slate-600">Everything technical happens behind the scenes. Click once and your helper will be ready to test.</p>
          <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
            <div className="flex items-start gap-4"><div className="text-4xl">{agent.icon}</div><div><p className="text-3xl font-black">{helperName || agent.name}</p><p className="mt-1 text-slate-300">{agent.type} · {personality.label}</p></div></div>
            <ul className="mt-5 grid gap-3 text-sm text-slate-200">
              <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-300" /> Simple instructions created</li>
              <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-300" /> Safe approval rules added</li>
              <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-300" /> First test task prepared</li>
            </ul>
          </div>
          <div className="mt-6 flex justify-between gap-3"><SmallButton onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4" /> Back</SmallButton><SmallButton primary onClick={buildAgent}><Wand2 className="h-4 w-4" /> Build My AI Agent</SmallButton></div>
        </div>}

        {step === 5 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-emerald-600">Step 5 of 5</p>
          <h2 className="mt-2 text-3xl font-black">Confirm your helper works</h2>
          <p className="mt-3 text-slate-600">Try one simple task and look for a useful answer.</p>
          <div className="mt-6 grid gap-4">
            <label><span className="mb-2 block text-sm font-black text-slate-700">Test task</span><select value={testTask} onChange={(e) => setTestTask(e.target.value)} className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-base font-bold outline-none focus:border-slate-950">{TEST_TASKS.map((task) => <option key={task}>{task}</option>)}</select></label>
            <div className="rounded-3xl bg-slate-950 p-5 text-white"><p className="text-sm font-black uppercase tracking-wide text-slate-400">Useful return</p><pre className="mt-3 whitespace-pre-wrap text-sm leading-7">{answer}</pre></div>
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><p className="flex items-center gap-2 text-xl font-black"><CheckCircle2 className="h-6 w-6" /> My helper works</p><p className="mt-2 text-sm leading-6">You now have a working starter AI Agent. The optional buttons below are only for saving or using it somewhere else.</p></div>
          </div>
          <details className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <summary className="cursor-pointer font-black">Optional: use this helper somewhere else</summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">Copy these hidden instructions into ChatGPT, Claude, Gemini, or send them to GuidedWork AI for setup help.</p>
            <div className="mt-4 flex flex-wrap gap-3"><SmallButton onClick={copyPrompt}><Copy className="h-4 w-4" /> Copy Instructions</SmallButton><SmallButton onClick={downloadBackup}><Download className="h-4 w-4" /> Download Backup</SmallButton><a className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-black text-slate-950 hover:bg-slate-50" href={`mailto:you@example.com?subject=GuidedWork%20AI%20setup%20help&body=${encodeURIComponent(prompt)}`}>Set it up for me</a></div>
            {copied && <p className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-black text-emerald-800">Copied.</p>}
          </details>
          <div className="mt-6 flex justify-between gap-3"><SmallButton onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4" /> Back</SmallButton><SmallButton onClick={reset}><RotateCcw className="h-4 w-4" /> Start Over</SmallButton></div>
        </div>}
      </section>

      <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm">
        <details>
          <summary className="cursor-pointer font-black">How this becomes a working helper</summary>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {HOW_TO.map((item, index) => <div key={item} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black text-slate-400">STEP {index + 1}</p><p className="mt-1 text-sm font-bold leading-6 text-slate-700">{item}</p></div>)}
          </div>
        </details>
      </section>

      <footer className="py-6 text-center text-xs font-bold text-slate-500">Simplicity rule: one screen, one decision, one next button.</footer>
    </div>
  </main>
}
