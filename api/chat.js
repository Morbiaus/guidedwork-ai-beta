function fallbackReply(agent, message, messages = []) {
  const name = agent?.name || 'Your helper'
  const type = agent?.type || 'Daily Helper'
  const text = String(message || '').trim() || 'Help me make a simple plan.'
  const previousAssistant = [...messages].reverse().find((m) => m.role === 'assistant')?.content || ''

  if (/shorter|short|brief|condense/i.test(text) && previousAssistant) {
    if (/message|draft|reschedule/i.test(previousAssistant)) {
      return `${name} says:\n\nSure — shorter version:\n\n“Hi, I need to reschedule. What other times work for you? Thank you.”`
    }
    return `${name} says:\n\nShort version:\n\n1. Pick the most important thing.\n2. Choose one small first step.\n3. Do it, then check it off.`
  }

  if (type === 'Message Helper' || /message|text|email|reschedule|reply/i.test(text)) {
    return `${name} says:\n\nHere is a kind draft:\n\n“Hi, I’m sorry, but I need to reschedule. Please let me know what other times work for you. Thank you.”\n\nIf you want, I can make it shorter, warmer, or more formal.`
  }
  if (type === 'Appointment Helper' || /appointment|doctor|meeting|call/i.test(text)) {
    return `${name} says:\n\nHere is a simple appointment plan:\n\n1. Confirm the time and place.\n2. Bring any papers, cards, or notes.\n3. Write your top 3 questions.\n4. Ask what the next step is before you leave.\n\nIf you tell me the appointment type, I can make the list more specific.`
  }
  if (type === 'Document Helper' || /document|letter|paper|summarize/i.test(text)) {
    return `${name} says:\n\nPaste the document here and I will give you:\n\n1. A short summary.\n2. Important dates, names, and amounts.\n3. Anything that needs action.\n4. Questions to ask if something is unclear.`
  }
  return `${name} says:\n\nHere is a simple plan:\n\n1. Pick the most important thing.\n2. Write down what you must not forget.\n3. Choose one small first step.\n4. Decide when you will do it.\n5. Check it off when finished.\n\nTell me your top 2 or 3 tasks and I’ll organize them for you.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { instructions, messages = [], agent = {} } = req.body || {}
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || ''
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return res.status(200).json({ reply: fallbackReply(agent, lastUser, messages), mode: 'fallback' })
    }

    const llmMessages = [
      { role: 'system', content: `${instructions}\n\nYou are inside a simple consumer app. Be concise, warm, and practical. Never claim you performed outside actions.` },
      ...messages.slice(-12).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 4000) })),
    ]

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: llmMessages,
        temperature: 0.4,
        max_tokens: 600,
      }),
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return res.status(200).json({ reply: fallbackReply(agent, lastUser, messages), mode: 'fallback' })
    }

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content?.trim() || fallbackReply(agent, lastUser, messages)
    return res.status(200).json({ reply, mode: 'llm' })
  } catch (error) {
    return res.status(200).json({ reply: fallbackReply(req.body?.agent, '', req.body?.messages || []), mode: 'fallback' })
  }
}
