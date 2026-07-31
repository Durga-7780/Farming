import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, AlertCircle, X, Bot } from 'lucide-react'
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
      {/* Prominent Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 md:bottom-24 md:right-8 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 border-2 border-white dark:border-slate-800 shadow-blue-600/40 ${isOpen ? 'hidden' : ''}`}
        title="AgroLedger AI Assistant"
      >
        <Sparkles size={28} className="animate-pulse" />
      </button>

      {/* Spacious Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            className="fixed bottom-20 right-6 md:bottom-24 md:right-8 w-[450px] max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden"
            style={{ maxHeight: '680px', height: '82vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-5 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <Sparkles size={22} className="text-sky-400" />
                </div>
                <div>
                  <span className="font-display font-800 text-[17px] tracking-tight block text-white">AgroLedger AI Assistant</span>
                  <span className="text-[11.5px] text-blue-200 font-medium">Real-time procurement &amp; financial insights</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col">
              {history.length === 0 && (
                <div className="text-center my-auto py-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-sky-400 shadow-sm">
                    <Bot size={28} />
                  </div>
                  <h4 className="font-display font-800 text-[18px] text-slate-950 dark:text-white mb-1">How can I help you today?</h4>
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 mb-5 max-w-xs mx-auto">Ask me questions about farmer purchases, mill dispatches, or outstanding ledgers.</p>
                  
                  <div className="flex flex-col gap-2.5">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => ask(s)}
                        className="text-[13px] text-left px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-blue-500 dark:hover:border-sky-400 hover:shadow-md transition-all font-semibold"
                      >
                        ⚡ {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] font-medium leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm font-semibold shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm shadow-sm'}`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm flex items-center gap-2.5 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-blue-600 dark:text-sky-400" />
                    <span className="text-[13px] text-slate-700 dark:text-slate-300 font-semibold">Analyzing database...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
                  <AlertCircle size={17} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-[13px] text-rose-700 dark:text-rose-300 font-medium">{error}</div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <form onSubmit={e => { e.preventDefault(); ask(question) }} className="flex gap-2">
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask AgroLedger AI a question..."
                  className={`${inputClass} !min-h-[46px] text-[14px] bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700`}
                />
                <Button type="submit" variant="primary" disabled={loading || !question.trim()} className="!min-h-[46px] px-5">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
