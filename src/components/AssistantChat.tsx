'use client'
import { useState, useRef, useEffect, FormEvent } from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: Date
}

const SUGGESTIONS = [
  'How many calls came in today?',
  'Show me all transferred calls from today',
  'What was the success rate this week?',
  'Why did the last call get transferred?',
  'Show me calls where booking failed',
]

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    setError(null)

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim(), ts: new Date() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      const text = await res.text()
      let data: { reply?: string; error?: string }
      try { data = JSON.parse(text) } catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`) }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.reply, ts: new Date() }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px' }}>

        {isEmpty && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, textAlign: 'center', padding: '48px 24px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(27,79,140,0.12), rgba(13,148,136,0.1))', border: '1px solid rgba(27,79,140,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: '#1B4F8C' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10"/>
                <path d="M12 6v6l4 2"/>
                <path d="M20 14l2 2-2 2"/>
                <path d="M18 16h4"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 8 }}>CareSync AI Assistant</h2>
            <p style={{ fontSize: 13.5, color: '#6B7280', maxWidth: 380, lineHeight: 1.6, marginBottom: 28 }}>
              Ask me anything about your call logs — outcomes, transcripts, success rates, transfer reasons, or agent issues.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 520 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  padding: '7px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 500,
                  background: 'white', border: '1px solid rgba(0,0,0,0.1)', color: '#374151',
                  cursor: 'pointer', transition: 'all 0.18s',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: 10, marginBottom: 16, alignItems: 'flex-start',
            animation: 'fadeSlideUp 0.25s cubic-bezier(0.32,0.72,0,1) both',
          }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'assistant' ? 'rgba(27,79,140,0.1)' : 'rgba(13,148,136,0.1)',
              border: `1px solid ${msg.role === 'assistant' ? 'rgba(27,79,140,0.2)' : 'rgba(13,148,136,0.2)'}`,
              color: msg.role === 'assistant' ? '#1B4F8C' : '#0D9488',
              fontSize: 11, fontWeight: 700,
            }}>
              {msg.role === 'assistant' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              ) : 'You'}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '78%',
              background: msg.role === 'user' ? 'rgba(13,148,136,0.07)' : 'white',
              border: `1px solid ${msg.role === 'user' ? 'rgba(13,148,136,0.14)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              padding: '11px 15px',
              boxShadow: msg.role === 'assistant' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: '#111827', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
              <div style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 6 }}>
                {msg.ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(27,79,140,0.1)', border: '1px solid rgba(27,79,140,0.2)', color: '#1B4F8C' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <ThinkingDots />
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} style={{
        borderTop: '1px solid rgba(0,0,0,0.08)',
        paddingTop: 16,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about call outcomes, transcripts, transfer reasons..."
            rows={1}
            style={{
              width: '100%', resize: 'none', overflow: 'hidden',
              padding: '11px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.14)',
              fontSize: 13.5, color: '#111827', outline: 'none',
              background: 'white', lineHeight: 1.5, boxSizing: 'border-box',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'border-color 0.18s',
              fontFamily: 'inherit',
              minHeight: 44,
            }}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 160) + 'px'
            }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            width: 44, height: 44, borderRadius: 12, border: 'none',
            background: input.trim() && !loading ? '#1B4F8C' : 'rgba(0,0,0,0.08)',
            color: input.trim() && !loading ? 'white' : '#9CA3AF',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.18s',
          }}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
      <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
        Enter to send · Shift+Enter for new line · Read-only analysis mode
      </p>
    </div>
  )
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#1B4F8C',
          animation: `dotPulse 1.4s ease-in-out ${i * 0.16}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
