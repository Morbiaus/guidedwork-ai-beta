function decodeEntities(text = '') {
  return String(text)
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripHtml(text = '') {
  return decodeEntities(text).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function extractWeatherLocation(text = '') {
  const match = String(text).match(/\bweather\b(?:\s+(?:in|for|near))?\s+([a-zA-Z][a-zA-Z .'-]{1,40})/i)
  if (!match) return ''
  return match[1]
    .replace(/\b(and|with|plus|today|tomorrow|this week|latest|top|news).*$/i, '')
    .replace(/[?.!,]+$/g, '')
    .trim()
}

async function getWeather(location) {
  if (!location) return null
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
  const geo = await fetch(geoUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null)
  const place = geo?.results?.[0]
  if (!place) return `I could not find the weather location “${location}.” Try a city name, like “Miami” or “New York.”`

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
  const data = await fetch(weatherUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null)
  const current = data?.current
  const daily = data?.daily
  if (!current) return `I could not get the weather for ${place.name} right now.`

  const rain = daily?.precipitation_probability_max?.[0]
  const high = Math.round(daily?.temperature_2m_max?.[0] ?? current.temperature_2m)
  const low = Math.round(daily?.temperature_2m_min?.[0] ?? current.temperature_2m)
  const temp = Math.round(current.temperature_2m)
  const feels = Math.round(current.apparent_temperature)
  const wind = Math.round(current.wind_speed_10m || 0)
  const rainText = Number.isFinite(rain) ? ` Rain chance today: ${rain}%.` : ''

  return `Weather for ${place.name}${place.admin1 ? `, ${place.admin1}` : ''}: ${temp}°F now, feels like ${feels}°F. Today’s high is about ${high}°F and the low is about ${low}°F. Wind is about ${wind} mph.${rainText}`
}

async function getTopNews() {
  const url = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en'
  const xml = await fetch(url, { headers: { 'user-agent': 'GuidedWorkAI/1.0' } }).then((r) => (r.ok ? r.text() : '')).catch(() => '')
  const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<\/item>/g)]
    .slice(0, 5)
    .map((m, index) => `${index + 1}. ${stripHtml(m[1])}`)
  if (!items.length) return 'I could not get today’s headlines right now. Please try again in a minute.'
  return `Today’s top headlines:\n${items.join('\n')}`
}

async function liveWeatherNewsReply(agent, message) {
  const text = String(message || '')
  const asksWeather = /\bweather|forecast|temperature|rain\b/i.test(text)
  const asksNews = /\bnews|headlines|latest\b/i.test(text)
  if (!asksWeather && !asksNews) return null

  const name = agent?.name || 'Your helper'
  const parts = []
  if (asksWeather) {
    const location = extractWeatherLocation(text)
    if (location) parts.push(await getWeather(location))
    else parts.push('For weather, tell me the city. Example: “Tell me the weather in Miami.”')
  }
  if (asksNews) parts.push(await getTopNews())

  return `${name} says:\n\n${parts.filter(Boolean).join('\n\n')}\n\nYou can ask me one follow-up, like “Will it rain?” or “Tell me more about headline 1.”`
}

function fallbackReply(agent, message, messages = []) {
  const name = agent?.name || 'Your helper'
  const type = agent?.type || 'Daily Helper'
  const brain = agent?.brain || 'GuidedWork AI'
  const text = String(message || '').trim() || 'Help me make a simple plan.'
  const previousAssistant = [...messages].reverse().find((m) => m.role === 'assistant')?.content || ''

  if (type === 'Weather & News Helper') {
    return `${name} says:\n\nI can help with weather and news. Try this exact message:\n\n“Tell me the weather in Miami and today's top news.”\n\nFor weather, include your city. For news, ask for today’s top news.`
  }

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

  return `${name} says:\n\nI’m connected to ${brain}. Tell me what you need help with, and I’ll keep it simple. A good starting point is: “Tell me the weather in Miami and today's top news.”`
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
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: instructions }, ...normalizedMessages(messages)], temperature: 0.4, max_tokens: 600 }),
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
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest', system: instructions, messages: normalizedMessages(messages), max_tokens: 600, temperature: 0.4 }),
  })
  if (!response.ok) return null
  const data = await response.json()
  return data?.content?.map((part) => part?.text || '').join('').trim() || null
}

async function callGemini({ instructions, messages }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  const contents = normalizedMessages(messages).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: instructions }] }, contents, generationConfig: { temperature: 0.4, maxOutputTokens: 600 } }),
  })
  if (!response.ok) return null
  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('').trim() || null
}

async function withTimeout(promise, ms = 7000) {
  let timeout
  const timeoutPromise = new Promise((resolve) => { timeout = setTimeout(() => resolve(null), ms) })
  const result = await Promise.race([promise, timeoutPromise])
  clearTimeout(timeout)
  return result
}

async function getLlmReply({ instructions, messages, agent }) {
  const brain = String(agent?.brain || 'GuidedWork AI').toLowerCase()
  const common = { instructions: `${instructions}\n\nYou are inside a simple consumer app. Be concise, warm, and practical. Never claim you performed outside actions.`, messages }
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
    const liveReply = await withTimeout(liveWeatherNewsReply(agent, lastUser), 7000)
    const reply = liveReply || await getLlmReply({ instructions, messages, agent })

    return res.status(200).json({
      reply: reply || fallbackReply(agent, lastUser, messages),
      mode: liveReply ? 'live' : reply ? 'llm' : 'fallback',
      brain: agent?.brain || 'GuidedWork AI',
    })
  } catch (error) {
    return res.status(200).json({ reply: fallbackReply(req.body?.agent, '', req.body?.messages || []), mode: 'fallback' })
  }
}
