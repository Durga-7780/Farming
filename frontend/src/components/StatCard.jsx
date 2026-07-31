import React from 'react'
import { motion } from 'framer-motion'

export default function StatCard({ label, value, sublabel, icon: Icon, tone = 'primary', delay = 0 }) {
  const toneMap = {
    primary: 'text-primary bg-primary-soft',
    accent: 'text-accent-dark bg-accent-soft',
    success: 'text-success bg-success/10',
    danger: 'text-danger bg-danger/10',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-surface rounded-card shadow-card p-5 border border-line/60"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[12.5px] text-muted font-medium">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <div className="font-mono text-[22px] font-semibold text-ink tracking-tight tabular-nums">{value}</div>
      {sublabel && <div className="text-[12px] text-muted mt-1">{sublabel}</div>}
    </motion.div>
  )
}
