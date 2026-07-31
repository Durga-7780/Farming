import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ShoppingCart, TrendingUp, Warehouse, Users, Wallet, Factory } from 'lucide-react'
import api from '../api/client'
import StatCard from '../components/StatCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [topFarmers, setTopFarmers] = useState([])

  useEffect(() => {
    api.get('/api/dashboard/summary').then((r) => setSummary(r.data)).catch(() => {})
    api.get('/api/dashboard/trend?days=14').then((r) => setTrend(r.data)).catch(() => {})
    api.get('/api/dashboard/top-farmers?limit=5').then((r) => setTopFarmers(r.data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-800 text-[22px] text-ink">Good day, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted text-[13.5px] mt-0.5">Here's where the business stands today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Today's purchases" value={fmt(summary?.todays_purchases)} icon={ShoppingCart} tone="primary" delay={0} />
        <StatCard label="Today's sales" value={fmt(summary?.todays_sales)} icon={TrendingUp} tone="accent" delay={0.05} />
        <StatCard label="Current stock" value={`${(summary?.current_stock_qty || 0).toLocaleString('en-IN')} qtl`} icon={Warehouse} tone="success" delay={0.1} />
        <StatCard label="Pending farmer payouts" value={fmt(summary?.pending_farmer_payments)} icon={Wallet} tone="danger" delay={0.15} />
        <StatCard label="Pending mill collections" value={fmt(summary?.pending_mill_payments)} icon={Factory} tone="danger" delay={0.2} />
        <StatCard label="Active farmers" value={summary?.total_farmers ?? '—'} icon={Users} tone="primary" delay={0.25} />
        <StatCard label="This month · purchases" value={fmt(summary?.month_purchase_total)} tone="primary" delay={0.3} />
        <StatCard label="This month · sales" value={fmt(summary?.month_sales_total)} tone="accent" delay={0.35} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface rounded-card shadow-card p-5 border border-line/60"
      >
        <h3 className="font-display font-700 text-[15px] text-ink mb-4">Purchases vs sales · last 14 days</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#163832" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#163832" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="saleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D9A441" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#D9A441" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DA" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5C6B63' }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#5C6B63' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              formatter={(v) => fmt(v)}
              contentStyle={{ borderRadius: 10, border: '1px solid #DDE3DA', fontSize: 12.5 }}
            />
            <Area type="monotone" dataKey="purchases" stroke="#163832" fill="url(#purchaseGrad)" strokeWidth={2} name="Purchases" />
            <Area type="monotone" dataKey="sales" stroke="#D9A441" fill="url(#saleGrad)" strokeWidth={2} name="Sales" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-surface rounded-card shadow-card p-5 border border-line/60"
      >
        <h3 className="font-display font-700 text-[15px] text-ink mb-4">Top farmers by purchase value</h3>
        {topFarmers.length === 0 ? (
          <p className="text-muted text-[13px]">No purchases recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {topFarmers.map((f, i) => {
              const max = topFarmers[0]?.total || 1
              return (
                <div key={f.name} className="flex items-center gap-3">
                  <span className="w-5 text-[12px] text-muted font-mono">{i + 1}</span>
                  <span className="w-32 shrink-0 text-[13.5px] text-ink truncate">{f.name}</span>
                  <div className="flex-1 h-2 bg-surfacealt rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(f.total / max) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 * i }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                  <span className="text-[12.5px] font-mono text-muted w-24 text-right">{fmt(f.total)}</span>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
