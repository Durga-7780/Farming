import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, AlertCircle, X } from 'lucide-react'
import api from '../api/client'
import { Button, inputClass } from './ui.jsx'

const SUGGESTIONS = [
  'Give me a general health summary',
  'Which produce variety is most profitable?',
  'Should I be worried about outstanding payments?',
]

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([]) // to store chat flow

  async function ask(q) {
    if (!q) return
    
    // Add user question to history
    setHistory(prev => [...prev, { role: 'user', content: q }])
    
    setLoading(true)
    setError('')
    setQuestion('') // clear input

    try {
      const { data } = await api.post('/api/ai/insights', { question: q })
      setHistory(prev => [...prev, { role: 'ai', content: data.insight }])
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(detail || 'Could not reach the AI service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-accent rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform z-40 ${isOpen ? 'hidden' : ''}`}
      >
        <Sparkles size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[360px] max-w-[calc(100vw-32px)] bg-surface rounded-2xl shadow-2xl border border-line/60 z-50 flex flex-col overflow-hidden"
            style={{ maxHeight: '600px', height: '80vh' }}
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-accent" />
                <span className="font-display font-700 text-[15px]">AgroLedger AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-bg/30 flex flex-col">
              {history.length === 0 && (
                <div className="text-center mt-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={20} className="text-primary" />
                  </div>
                  <h4 className="font-medium text-ink mb-1">How can I help?</h4>
                  <p className="text-[12px] text-muted mb-4">Ask me anything about your purchases, sales, or payments.</p>
                  
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => ask(s)}
                        className="text-[12px] text-left px-3 py-2 border border-line/60 rounded-lg hover:bg-surfacealt/50 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-surface border border-line/60 text-ink rounded-bl-sm'}`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl px-4 py-3 bg-surface border border-line/60 text-ink rounded-bl-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-primary" />
                    <span className="text-[12.5px] text-muted">Thinking...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-danger/10 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle size={15} className="text-danger shrink-0 mt-0.5" />
                  <div className="text-[12px] text-danger/90">{error}</div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-line/60 bg-surface">
              <form onSubmit={e => { e.preventDefault(); ask(question) }} className="flex gap-2">
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className={inputClass}
                />
                <Button type="submit" variant="accent" disabled={loading || !question.trim()}>
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
