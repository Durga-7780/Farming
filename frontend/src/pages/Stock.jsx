import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Warehouse } from 'lucide-react'
import api from '../api/client'
import { EmptyState } from '../components/ui.jsx'

export default function Stock() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/stock/live').then((r) => { setStock(r.data); setLoading(false) })
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-800 text-[22px] text-ink">Stock</h1>
        <p className="text-muted text-[13.5px] mt-0.5">Live balance by produce variety (approved purchases − sales)</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-surface rounded-card animate-pulse border border-line/60" />)}
        </div>
      ) : stock.length === 0 ? (
        <div className="bg-surface rounded-card border border-line/60">
          <EmptyState icon={Warehouse} title="No stock data yet" subtitle="Add produce varieties and approve purchases to see stock here." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stock.map((s, i) => {
            const low = s.available < s.purchased * 0.1
            return (
              <motion.div
                key={s.variety_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface rounded-card shadow-card border border-line/60 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-display font-700 text-[15px] text-ink">{s.variety_name}</h4>
                  {low && <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium">Low stock</span>}
                </div>
                <div className="font-mono text-[26px] font-bold text-primary tracking-tight">
                  {s.available.toLocaleString('en-IN')} <span className="text-[13px] font-sans font-normal text-muted">{s.unit}</span>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-line/60 text-[12px] text-muted">
                  <span>In: {s.purchased.toLocaleString('en-IN')}</span>
                  <span>Out: {s.sold.toLocaleString('en-IN')}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
