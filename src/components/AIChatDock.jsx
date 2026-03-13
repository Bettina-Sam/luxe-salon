import { useState } from 'react'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'

export default function AIChatDock(){
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi. I can help with style ideas, booking guidance, and quick beauty tips.' },
  ])

  const submit = async () => {
    const prompt = input.trim()
    if (!prompt || loading) return
    if (!GEMINI_API_KEY) {
      setError('Missing VITE_GEMINI_API_KEY. Add it to your .env file and restart the dev server.')
      return
    }

    setMessages((prev) => [...prev, { role: 'user', text: prompt }])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text:
                      `You are Luxe Salon AI assistant. Keep responses concise, practical, and friendly. ` +
                      `Focus on salon services, style prep, and simple confidence tips.\n\nUser: ${prompt}`,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 220 },
          }),
        }
      )

      const payload = await response.json()
      const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).join(' ')?.trim()

      if (!response.ok || !text) {
        throw new Error(payload?.error?.message || 'AI chat is not available right now.')
      }

      setMessages((prev) => [...prev, { role: 'model', text }])
    } catch (err) {
      setError(err.message || 'AI chat is not available right now.')
    } finally {
      setLoading(false)
    }
  }

  const onEnter = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <aside className={`ai-dock ${open ? 'open' : ''}`} aria-live="polite">
      <button
        className="ai-dock-trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        🤖 AI Chat
      </button>

      {open && (
        <div className="ai-dock-panel">
          <div className="ai-dock-head">
            <strong>Luxe AI Chat</strong>
            <span className="chip">Gemini 2.5 Flash</span>
          </div>

          <div className="ai-dock-log">
            {messages.map((message, idx) => (
              <div key={idx} className={`ai-msg ${message.role === 'user' ? 'is-user' : 'is-bot'}`}>
                {message.text}
              </div>
            ))}
            {loading && <div className="ai-msg is-bot">Thinking...</div>}
          </div>

          <div className="ai-dock-form">
            <textarea
              rows="2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onEnter}
              placeholder="Ask anything about your look or booking..."
            />
            <button className="btn" type="button" onClick={submit} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>

          {error && <div className="ai-dock-error">{error}</div>}
        </div>
      )}
    </aside>
  )
}
