'use client'

import { FormEvent, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, Send, Sparkles } from 'lucide-react'

const starters = ['What is this company strategy?', 'Explain the main roles', 'What are the key features?']

export function CompanyAssistant() {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/company-assistant' }),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || status === 'streaming' || status === 'submitted') return
    sendMessage({ text })
    setInput('')
  }

  return <>
    <button className="assistant-bubble" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="assistant" aria-label={open ? 'Close company guide' : 'Open company guide'}><Bot size={22} /><span className="assistant-bubble-pulse" /></button>
    {open && <section className="company-assistant" id="assistant" aria-labelledby="assistant-title">
    <div className="assistant-header"><div className="assistant-icon"><Bot size={18} /></div><div><div className="heading-with-icon"><h3 id="assistant-title">Company guide</h3><span className="ai-badge"><Sparkles size={12} /> AI</span></div><p>Ask about strategy, roles, products, and how the company works.</p></div><span className="assistant-status">Brief answers</span></div>
    <div className="assistant-starters">{starters.map((starter) => <button key={starter} type="button" onClick={() => { sendMessage({ text: starter }) }}>{starter}</button>)}</div>
    <div className="assistant-messages" aria-live="polite">{messages.length === 0 && <div className="assistant-empty"><Bot size={20} /><span>Ask a question to get a clear, practical explanation.</span></div>}{messages.map((message) => <div className={`assistant-message ${message.role}`} key={message.id}><span className="message-label">{message.role === 'user' ? 'You' : 'Guide'}</span><p>{message.parts.filter((part) => part.type === 'text').map((part) => part.text).join('')}</p></div>)}{(status === 'submitted' || status === 'streaming') && <div className="assistant-thinking"><span /><span /><span />Thinking</div>}{error && <p className="assistant-error">AI chat is temporarily unavailable because the AI Gateway needs billing verification. Add a valid card to enable responses.</p>}</div>
    <form className="assistant-form" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about the company..." aria-label="Ask the company guide" /><button type="submit" aria-label="Send question" disabled={!input.trim() || status === 'streaming' || status === 'submitted'}><Send size={16} /></button></form>
    </section>}
  </>
}
