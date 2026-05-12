function fallbackReply(agent, message, messages = []) {
  const name = agent?.name || 'Your helper'
  const type = agent?.type || 'Daily Helper'
  const brain = agent?.brain || 'GuidedWork AI'
  const text = String(message || '').trim() || 'Help me make a simple plan.'
  const previousAssistant = [...messages].reverse().find((m) => m.role === 'assistant')?.content || ''

  if (/shorter|short|brief|condense/i.test(text) && previousAssistant) {
    if (/message|draft|reschedule/i.test(previousAssistant)) {
      return `${name} says:\n\nSure — shorter version:\n\n“Hi, I need to reschedule. What other times work for you? Thank you.”`
    }
    return `${name} says:\n\nShort version:\n\n1. Pick the most important thing.\n2. Choose one small first step.\n3. Do it, then check it off.`
  }

  if (/plan|tomorrow|schedule|day|remember|task|todo/i.test(text)) {
    return `${name} says:\n\nHere is a simple plan for tomorrow:\n\n1. Pick your top 3 things.\n2. Put the most important one first.\n3. Choose a time for each one.\n4. Leave one open space for anything unexpected.\n5. At the end of the day, check what is done.\n\nIf you tell me your 3 tasks, I can organize the day for you.`
  }

  if (/question|questions|appointment|doctor|meeting|call/i.test(text) || type === 'Appointment Helper') {
    return `${name} says:\n\nHere are simple questions to bring:\n\n1. What is the main thing I need to know?\n2. What should I do next?\n3. Is there anything I should avoid?\n4. When should I follow up?\n5. Who should I contact if I have questions later?`
  }

  if (/document|letter|paper|summarize|form/i.test(text) || type === 'Document Helper') {
    return `${name} says:\n\nPaste the document here and I will give you:\n\n1. A short summary.\n2. Important dates, names, and amounts.\n3. Anything that needs action.\n4. Questions to ask if something is unclear.`
  }

  if (/message|text|email|reschedule|reply|draft|write/i.test(text) || type === 'Message Helper') {
    return `${name} says:\n\nHere is a kind draft:\n\n“Hi, I’m sorry, but I need to reschedule. Please let me know what other times work for you. Thank you.”\n\nIf you want, I can make it shorter, warmer, or more formal.`
  }

  return `${name} says:\n\nI’m connected to ${brain}. Tell me what you need help with, and I’ll keep it simple. A good starting point is: “Help me make a plan” or “Help me write a message.”`
}

function normalizedMessages(messages = []) {
  return messages.slice(-12).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 4000),
  }))
}

async function callOpenAI({ instructions, messages }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: instructions },
        ...normalizedMessages(messages),
      ],
      temperature: 0.4,
      max_tokens: 600,
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || null
}

async function callAnthropic({ instructions, messages }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
      system: instructions,
      messages: normalizedMessages(messages),
      max_tokens: 600,
      temperature: 0.4,
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  return data?.content?.map((part) => part?.text || '').join('').trim() || null
}

async function callGemini({ instructions, messages }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const contents = normalizedMessages(messages).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instructions }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('').trim() || null
}

async function withTimeout(promise, ms = 7000) {
  let timeout
  const timeoutPromise = new Promise((resolve) => {
    timeout = setTimeout(() => resolve(null), ms)
  })
  const result = await Promise.race([promise, timeoutPromise])
  clearTimeout(timeout)
  return result
}

async function getLlmReply({ instructions, messages, agent }) {
  const brain = String(agent?.brain || 'GuidedWork AI').toLowerCase()
  const common = {
    instructions: `${instructions}\n\nYou are inside a simple consumer app. Be concise, warm, and practical. Never claim you performed outside actions.`,
    messages,
  }

  if (brain.includes('claude')) return withTimeout(callAnthropic(common))
  if (brain.includes('gemini')) return withTimeout(callGemini(common))
  return withTimeout(callOpenAI(common))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { instructions, messages = [], agent = {} } = req.body || {}
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || ''
    const reply = await getLlmReply({ instructions, messages, agent })

    return res.status(200).json({
      reply: reply || fallbackReply(agent, lastUser, messages),
      mode: reply ? 'llm' : 'fallback',
      brain: agent?.brain || 'GuidedWork AI',
    })
  } catch (error) {
    return res.status(200).json({ reply: fallbackReply(req.body?.agent, '', req.body?.messages || []), mode: 'fallback' })
  }
}
