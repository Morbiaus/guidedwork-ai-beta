import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Copy, Download, Link2, MousePointerClick, RotateCcw, Send, Wand2 } from 'lucide-react'

const STORAGE_KEY = 'guidedwork-simple-wizard-v1'

const AGENTS = [
  {
    type: 'Weather & News Helper',
    name: 'Beacon',
    plain: 'Tell me the weather and simple news updates.',
    mission: 'Give simple weather updates, top news headlines, and plain next steps for the day.',
    tasks: 'Weather checks, simple forecasts, top news headlines, and easy daily briefings.',
    icon: '🌤️',
  },
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

const AI_BRAINS = [
  { id: 'guidedwork', name: 'GuidedWork AI', badge: 'Recommended', plain: 'Easiest. GuidedWork provides the AI brain and handles the connection.', icon: '✨' },
  { id: 'chatgpt', name: 'ChatGPT', badge: 'Popular', plain: 'Pick this if you want your agent powered by a ChatGPT-style brain.', icon: '💬' },
  { id: 'claude', name: 'Claude', badge: 'Writing', plain: 'Pick this for careful writing, planning, and explanations.', icon: '📝' },
  { id: 'gemini', name: 'Gemini', badge: 'Google', plain: 'Pick this for everyday help with a Google-style AI brain.', icon: '🔎' },
  { id: 'concierge', name: 'Set it up for me', badge: 'Hands-off', plain: 'GuidedWork contacts you and handles the whole connection.', icon: '🛠️' },
]

const TEST_TASKS = [
  'Help me make a simple plan for tomorrow.',
  'Help me write a kind message saying I need to reschedule.',
  'Help me make a list of questions for an appointment.',
]

const TEST_TASKS_BY_AGENT = {
  'Weather & News Helper': [
    "Tell me the weather in Miami and today's top news.",
    "What is today's top news?",
    "Tell me the weather in New York.",
  ],
  'Daily Helper': TEST_TASKS,
  'Message Helper': [
    'Help me write a kind message saying I need to reschedule.',
    'Make that message shorter.',
    'Make it warmer.',
  ],
  'Appointment Helper': [
    'Help me make a list of questions for an appointment.',
    'What should I bring to a doctor appointment?',
    'Help me remember what to ask.',
  ],
  'Document Helper': [
    'Help me understand a document.',
    'Tell me what details I should look for in a letter.',
    'Make a checklist for reviewing a form.',
  ],
}

function workflowsFor(agentType) {
  const map = {
    'Weather & News Helper': ['Weather Check', 'Top News', 'Morning Briefing'],
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

function makeAgentReply(agent, helperName, personality, task) {
  const cleanTask = task?.trim() || 'Help me make a simple plan for tomorrow.'
  if (agent.type === 'Weather & News Helper') {
    return `${helperName} says:\n\nI can help with weather and news. Try this exact message:\n\n“Tell me the weather in Miami and today's top news.”\n\nIf you want weather, include your city. If you want news, ask for today’s top news.\n\nTask I handled: ${cleanTask}`
  }
  if (agent.type === 'Message Helper') {
    return `${helperName} says:\n\nHere is a simple message you can use:\n\n“Hi, I’m sorry, but I need to reschedule. Please let me know what other times work for you. Thank you.”\n\nBefore you send it, I can also make it warmer, shorter, or more formal.\n\nTask I handled: ${cleanTask}`
  }
  if (agent.type === 'Appointment Helper') {
    return `${helperName} says:\n\nHere is an appointment prep list:\n\n1. Write down the appointment time and place.\n2. Bring your ID, insurance card, and any papers.\n3. Write your top 3 questions.\n4. Bring a list of medicines or important notes.\n5. After the visit, write down the next step.\n\nTask I handled: ${cleanTask}`
  }
  if (agent.type === 'Document Helper') {
    return `${helperName} says:\n\nPaste the document here and I will return:\n\n1. A short plain-English summary.\n2. The most important dates, names, and amounts.\n3. Anything that needs your attention.\n4. Questions you may want to ask.\n\nTask I handled: ${cleanTask}`
  }
  return `${helperName} says:\n\nHere is a simple plan:\n\n1. Pick the most important thing you need to do.\n2. Write down anything you must not forget.\n3. Choose one small first step.\n4. Set aside a time to do it.\n5. Check it off when done.\n\nIf you want, tell me your top 2 or 3 things for tomorrow and I’ll organize them.\n\nTask I handled: ${cleanTask}\n\nStyle used: ${personality.label}.`
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
  const [activated, setActivated] = useState(false)
  const [aiBrain, setAiBrain] = useState('guidedwork')
  const [agentInput, setAgentInput] = useState(TEST_TASKS[0])
  const [agentReply, setAgentReply] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatPending, setChatPending] = useState(false)

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
        setAgentInput(saved.agentInput || saved.testTask || TEST_TASKS[0])
        setAgentReply(saved.agentReply || '')
        setActivated(Boolean(saved.activated))
        setAiBrain(saved.aiBrain || 'guidedwork')
        setChatMessages(saved.chatMessages || [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, agentType, personalityLabel, helperName, built, testTask, agentInput, agentReply, activated, aiBrain, chatMessages }))
  }, [step, agentType, personalityLabel, helperName, built, testTask, agentInput, agentReply, activated, aiBrain, chatMessages])

  const agent = useMemo(() => AGENTS.find((a) => a.type === agentType) || AGENTS[0], [agentType])
  const personality = useMemo(() => PERSONALITIES.find((p) => p.label === personalityLabel) || PERSONALITIES[0], [personalityLabel])
  const workflows = useMemo(() => workflowsFor(agent.type), [agent.type])
  const prompt = useMemo(() => makePrompt(agent, helperName || agent.name, personality, workflows), [agent, helperName, personality, workflows])
  const selectedBrain = useMemo(() => AI_BRAINS.find((brain) => brain.id === aiBrain) || AI_BRAINS[0], [aiBrain])
  const starterTasks = useMemo(() => TEST_TASKS_BY_AGENT[agent.type] || TEST_TASKS, [agent.type])

  const buildAgent = () => {
    setBuilt(true)
    setAgentInput(starterTasks[0])
    setActivated(false)
    setAgentReply('')
    setChatMessages([])
    setStep(5)
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStep(1)
    setAgentType(AGENTS[0].type)
    setPersonalityLabel(PERSONALITIES[0].label)
    setHelperName(AGENTS[0].name)
    setBuilt(false)
    setTestTask(starterTasks[0])
    setCopied(false)
    setAgentInput(starterTasks[0])
    setAgentReply('')
    setActivated(false)
    setAiBrain('guidedwork')
    setChatMessages([])
    setChatPending(false)
  }

  const activateBrain = (brainId) => {
    const brain = AI_BRAINS.find((item) => item.id === brainId) || AI_BRAINS[0]
    const name = helperName || agent.name
    setAiBrain(brain.id)
    setActivated(false)
    setAgentInput(starterTasks[0])
    setChatMessages([{ role: 'assistant', content: `Hi, I’m ${name}. I’m connected to ${brain.name}. Ask me for help, or tap one of the starter tasks below.` }])
    setStep(6)
  }

  const runAgent = async () => {
    const content = agentInput.trim()
    if (!content || chatPending) return
    const userMessage = { role: 'user', content }
    const priorMessages = chatMessages.length ? chatMessages : [{ role: 'assistant', content: `Hi, I’m ${helperName || agent.name}. I’m ready to help.` }]
    const nextMessages = [...priorMessages, userMessage]
    setChatMessages(nextMessages)
    setAgentInput('')
    setChatPending(true)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          instructions: prompt,
          messages: nextMessages,
          agent: { type: agent.type, name: helperName || agent.name, personality: personality.label, brain: selectedBrain.name },
        }),
      })
      clearTimeout(timeout)
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Chat failed')
      const assistantMessage = { role: 'assistant', content: data.reply || makeAgentReply(agent, helperName || agent.name, personality, content) }
      setChatMessages([...nextMessages, assistantMessage])
    } catch {
      const assistantMessage = { role: 'assistant', content: makeAgentReply(agent, helperName || agent.name, personality, content) }
      setChatMessages([...nextMessages, assistantMessage])
    } finally {
      setActivated(true)
      setChatPending(false)
    }
  }


  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
  }

  const downloadBackup = () => {
    downloadJson(`${helperName || 'my-helper'}-ai-agent-backup.json`, {
      helperName,
      agentType: agent.type,
      personality: personality.label,
      aiBrain: selectedBrain.name,
      testTask,
      instructions: prompt,
      chatMessages,
      note: 'This backup is optional. The simple user flow is complete when the helper answers and the user can keep chatting.',
    })
  }

  return <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-4xl">
      <header className="mb-5 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700"><BrainCircuit className="h-4 w-4" /> GuidedWork AI</div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Welcome to AI Agent Builder</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Make a simple AI helper in easy steps. No tech words. No setup confusion. Just pick, build, connect, and chat.</p>
      </header>

      <section key={step} className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        {step === 1 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Step 1 of 6</p>
          <h2 className="mt-2 text-3xl font-black">What do you want your AI Agent to help with?</h2>
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
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Step 2 of 6</p>
          <h2 className="mt-2 text-3xl font-black">Choose its personality</h2>
          <p className="mt-3 text-slate-600">How should your helper sound?</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PERSONALITIES.map((p) => <button key={p.label} onClick={() => setPersonalityLabel(p.label)} className={`rounded-3xl border p-5 text-left text-lg font-black transition ${personalityLabel === p.label ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>{p.label}</button>)}
          </div>
          <div className="mt-6 flex justify-between gap-3"><SmallButton onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</SmallButton><SmallButton primary onClick={() => setStep(3)}>Next <ArrowRight className="h-4 w-4" /></SmallButton></div>
        </div>}

        {step === 3 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Step 3 of 6</p>
          <h2 className="mt-2 text-3xl font-black">Choose a name</h2>
          <p className="mt-3 text-slate-600">We picked a name for you. Keep it or type a different one.</p>
          <label className="mt-6 block"><span className="mb-2 block text-sm font-black text-slate-700">AI Agent name</span><input value={helperName} onChange={(e) => setHelperName(e.target.value)} className="w-full rounded-3xl border border-slate-300 px-5 py-5 text-2xl font-black outline-none focus:border-slate-950" /></label>
          <div className="mt-6 rounded-3xl bg-slate-50 p-5"><p className="text-sm font-black uppercase tracking-wide text-slate-500">Preview</p><p className="mt-2 text-lg"><b>{helperName || agent.name}</b> will be a <b>{personality.label.toLowerCase()}</b> {agent.type.toLowerCase()}.</p></div>
          <div className="mt-6 flex justify-between gap-3"><SmallButton onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</SmallButton><SmallButton primary onClick={() => setStep(4)}>Next <ArrowRight className="h-4 w-4" /></SmallButton></div>
        </div>}

        {step === 4 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Step 4 of 6</p>
          <h2 className="mt-2 text-3xl font-black">Build your AI Agent</h2>
          <p className="mt-3 text-slate-600">Everything technical happens behind the scenes. Click once. Then we will show you exactly what to do next.</p>
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
          <p className="text-sm font-black uppercase tracking-wide text-emerald-600">Step 5 of 6</p>
          <h2 className="mt-2 text-3xl font-black">Your agent is built</h2>
          <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <p className="flex items-center gap-2 text-2xl font-black"><CheckCircle2 className="h-7 w-7" /> {helperName || agent.name} is ready</p>
            <p className="mt-2 text-base leading-7">Now choose the AI brain that will answer for your agent. You do not need to know passwords, keys, or technical settings here.</p>
          </div>
          <h3 className="mt-7 text-xl font-black">Step 5A: Pick one AI brain</h3>
          <p className="mt-2 text-slate-600">Tap one box. If you are not sure, choose GuidedWork AI.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {AI_BRAINS.map((brain) => <button key={brain.id} onClick={() => setAiBrain(brain.id)} className={`rounded-3xl border p-5 text-left transition ${aiBrain === brain.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl">{brain.icon}</div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${aiBrain === brain.id ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'}`}>{aiBrain === brain.id ? 'Selected' : brain.badge}</span>
              </div>
              <h3 className="mt-3 text-xl font-black">{brain.name}</h3>
              <p className={`mt-2 text-sm leading-6 ${aiBrain === brain.id ? 'text-slate-200' : 'text-slate-600'}`}>{brain.plain}</p>
            </button>)}
          </div>
          <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
            <p className="flex items-center gap-2 text-lg font-black"><Link2 className="h-5 w-5" /> Step 5B: GuidedWork connects it</p>
            <p className="mt-2">When you press the button below, GuidedWork connects <b>{helperName || agent.name}</b> to <b>{selectedBrain.name}</b>. If a sign-in is needed, GuidedWork will show one simple sign-in screen. If setup is not available, GuidedWork will handle it for you.</p>
          </div>
          <div className="mt-6 flex justify-between gap-3"><SmallButton onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4" /> Back</SmallButton><SmallButton primary onClick={() => activateBrain(aiBrain)}><Link2 className="h-4 w-4" /> Connect {selectedBrain.name}</SmallButton></div>
        </div>}

        {step === 6 && <div>
          <p className="text-sm font-black uppercase tracking-wide text-emerald-600">Step 6 of 6</p>
          <h2 className="mt-2 text-3xl font-black">Test your new agent</h2>
          <p className="mt-3 text-slate-600">Follow these steps in order. Do not guess — just go one line at a time.</p>
          <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><p className="flex items-center gap-2 text-xl font-black"><CheckCircle2 className="h-6 w-6" /> {helperName || agent.name} is built and connected to {selectedBrain.name}</p><p className="mt-2 text-sm leading-6">Now we will prove it works.</p></div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-black">What to do</h3>
              <ol className="mt-4 grid gap-3 text-sm leading-6">
                <li className={`rounded-2xl p-4 ${activated ? 'bg-white text-slate-500' : 'bg-white text-slate-950 shadow-sm'}`}><b>1.</b> Look at the message box on the right.</li>
                <li className={`rounded-2xl p-4 ${activated ? 'bg-white text-slate-500' : 'bg-white text-slate-950 shadow-sm'}`}><b>2.</b> Keep the sample message, or type your own.</li>
                <li className={`rounded-2xl p-4 ${activated ? 'bg-white text-slate-500' : 'bg-slate-950 text-white shadow-sm'}`}><b>3.</b> Press <b>Send Test Message</b>.</li>
                <li className={`rounded-2xl p-4 ${activated ? 'bg-emerald-100 text-emerald-950 shadow-sm' : 'bg-white text-slate-500'}`}><b>4.</b> Read the answer from {helperName || agent.name}.</li>
                <li className={`rounded-2xl p-4 ${activated ? 'bg-slate-950 text-white shadow-sm' : 'bg-white text-slate-500'}`}><b>5.</b> Ask one more question to keep chatting.</li>
              </ol>
            </div>
            <div className="grid gap-4">
              <div className="max-h-[26rem] overflow-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3">
                  {chatMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-3xl px-5 py-4 text-sm leading-7 ${message.role === 'user' ? 'ml-8 bg-slate-950 text-white' : 'mr-8 bg-white text-slate-800 shadow-sm'}`}>
                    <p className="mb-1 text-xs font-black uppercase tracking-wide opacity-60">{message.role === 'user' ? 'You' : helperName || agent.name}</p>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>)}
                  {chatPending && <div className="mr-8 rounded-3xl bg-white px-5 py-4 text-sm font-bold text-slate-500 shadow-sm">{helperName || agent.name} is thinking…</div>}
                </div>
              </div>
              <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700"><MousePointerClick className="h-4 w-4" /> Test message box</p>
                <div className="flex flex-wrap gap-3">{starterTasks.map((task) => <button key={task} onClick={() => { setAgentInput(task); setTestTask(task); setAgentReply('') }} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-bold hover:bg-slate-50">Use sample: {task}</button>)}</div>
                <label className="mt-4 block"><span className="mb-2 block text-sm font-black text-slate-700">Message your AI Agent</span><textarea rows={4} value={agentInput} onChange={(e) => setAgentInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runAgent() }} className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-base font-bold leading-7 outline-none focus:border-slate-950" /></label>
                <div className="mt-4"><SmallButton primary onClick={runAgent} disabled={chatPending || !agentInput.trim()}><Send className="h-4 w-4" /> {activated ? `Send Another Message to ${helperName || agent.name}` : `Send Test Message`}</SmallButton></div>
              </div>
              {activated && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><p className="flex items-center gap-2 text-xl font-black"><CheckCircle2 className="h-6 w-6" /> Test complete — your AI Agent works</p><p className="mt-2 text-sm leading-6">You can keep chatting above. The conversation stays here on this device.</p></div>}
            </div>
          </div>
          <details className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <summary className="cursor-pointer font-black">Optional advanced setup</summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">The agent already works here. These buttons are only for saving a backup or using the same agent somewhere else.</p>
            <div className="mt-4 flex flex-wrap gap-3"><SmallButton onClick={copyPrompt}><Copy className="h-4 w-4" /> Copy Instructions</SmallButton><SmallButton onClick={downloadBackup}><Download className="h-4 w-4" /> Download Backup</SmallButton><a className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-black text-slate-950 hover:bg-slate-50" href={`mailto:you@example.com?subject=GuidedWork%20AI%20setup%20help&body=${encodeURIComponent(prompt)}`}>Set it up for me</a></div>
            {copied && <p className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-black text-emerald-800">Copied.</p>}
          </details>
          <div className="mt-6 flex justify-between gap-3"><SmallButton onClick={() => setStep(5)}><ArrowLeft className="h-4 w-4" /> Back</SmallButton><SmallButton onClick={reset}><RotateCcw className="h-4 w-4" /> Start Over</SmallButton></div>
        </div>}
      </section>

      <footer className="py-6 text-center text-xs font-bold text-slate-500">Simplicity rule: one screen, one decision, one next button.</footer>
    </div>
  </main>
}
