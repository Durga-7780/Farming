import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wheat, ArrowRight, Loader2, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Field, inputClass, Button } from '../components/ui.jsx'
import { API_BASE } from '../api/client.js'

export default function Login() {
  const [email, setEmail] = useState('admin@agroledger.local')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      if (!err?.response) {
        setError(`Cannot connect to backend server (${API_BASE}). Ensure backend is running.`)
      } else {
        setError(err?.response?.data?.detail || 'Login failed. Check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden text-slate-100">
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -bottom-40 -right-40" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30"
          >
            <Wheat size={30} className="text-white" />
          </motion.div>
          <h1 className="font-display font-800 text-[26px] text-white tracking-tight">AgroLedger ERP</h1>
          <p className="text-slate-300 text-[14px] mt-1">Enterprise Agricultural Procurement &amp; Mill System</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl p-7 space-y-4 backdrop-blur-xl">
          <Field label="Work Email Address">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@agroledger.local"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-600 text-[13px] bg-rose-50 border border-rose-200 p-3 rounded-xl">
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="primary" className="w-full !py-3 text-[15px]" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In to Dashboard <ArrowRight size={16} /></>}
          </Button>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[12px] text-slate-600 text-center space-y-1 mt-4">
            <div>Default Admin Credentials:</div>
            <div className="font-mono text-blue-700 font-bold">admin@agroledger.local / Admin@123</div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
