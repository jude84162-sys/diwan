import { useState, useRef, useEffect } from 'react'
import { chat, ChatMessage } from '../../lib/ai/agent'
import './AIAssistant.css'

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    const newUserMsg: ChatMessage = { role: 'user', content: userText }
    const updatedHistory = [...messages, newUserMsg]
    setMessages(updatedHistory)
    setLoading(true)

    try {
      const reply = await chat(messages, userText)
      setMessages([...updatedHistory, { role: 'model', content: reply }])
    } catch (err) {
      setMessages([
        ...updatedHistory,
        { role: 'model', content: '⚠️ تعذّر الاتصال. حاول مرة أخرى.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleQuick = (text: string) => {
    handleSend(text)
  }

  const suggestions = [
    '📊 شو مصاريفي هذا الشهر؟',
    '💰 كم دين عليّ؟',
    '💵 هل الدولار طلع أو نزل؟',
    '📈 ملخص شامل',
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        className={`ai-fab ${open ? 'ai-fab-open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="ديوان AI"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="ai-window">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-info">
              <span className="ai-header-icon">🤖</span>
              <div>
                <div className="ai-header-title">ديوان AI</div>
                <div className="ai-header-status">مساعدك الذكي</div>
              </div>
            </div>
            <button
              className="ai-close"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.length === 0 && (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">👋</div>
                <div className="ai-welcome-title">مرحباً!</div>
                <p className="ai-welcome-text">
                  أنا مساعدك الذكي. اسألني عن مصاريفك، ديونك، أو الأسعار.
                </p>
                <div className="ai-suggestions">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="ai-suggestion"
                      onClick={() => handleQuick(s.replace(/^[^\s]+\s/, ''))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`ai-msg ai-msg-${msg.role === 'user' ? 'user' : 'model'}`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="ai-msg ai-msg-model ai-typing">
                <span></span><span></span><span></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-input-row">
            <input
              type="text"
              className="ai-input"
              placeholder="اكتب سؤالك..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button
              className="ai-send"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="إرسال"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
