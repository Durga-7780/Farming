import React from 'react'
import { motion } from 'framer-motion'

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[12.5px] font-medium text-muted mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-line bg-surfacealt text-[16px] sm:text-[14px] text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all'

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light',
    accent: 'bg-accent text-primary-dark hover:bg-accent-dark hover:text-white',
    ghost: 'bg-transparent text-ink border border-line hover:bg-surfacealt',
    danger: 'bg-danger/10 text-danger hover:bg-danger hover:text-white',
  }
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center mb-4">
          <Icon size={22} className="text-primary" />
        </div>
      )}
      <h4 className="font-display font-700 text-[15px] text-ink mb-1">{title}</h4>
      {subtitle && <p className="text-[13px] text-muted max-w-sm mb-4">{subtitle}</p>}
      {action}
    </div>
  )
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-line/60 text-muted',
    success: 'bg-success/10 text-success',
    warning: 'bg-accent-soft text-accent-dark',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${tones[tone]}`}>
      {children}
    </span>
  )
}
