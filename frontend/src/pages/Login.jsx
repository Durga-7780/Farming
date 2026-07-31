import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wheat, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Field, inputClass, Button } from '../components/ui.jsx'

export default function Login() {
  const [email, setEmail] = useState('admin@agroledger.local')
  const [password, setPassword] = useState('')
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
      setError(err?.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 34px)'
      }} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4"
          >
            <Wheat size={26} className="text-primary-dark" />
          </motion.div>
          <h1 className="font-display font-800 text-[22px] text-white tracking-tight">AgroLedger</h1>
          <p className="text-white/50 text-[13px] mt-1">Farmer &amp; mill procurement, in one ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card p-6 space-y-4">
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@business.com"
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
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-[13px]">
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign in <ArrowRight size={15} /></>}
          </Button>

          <p className="text-[11.5px] text-muted text-center pt-1">
            First run? Use the seeded admin: <span className="font-mono">admin@agroledger.local</span> / <span className="font-mono">Admin@123</span>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
