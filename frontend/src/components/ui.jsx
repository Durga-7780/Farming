import React from 'react'
import { motion } from 'framer-motion'

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition-all shadow-sm'

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20',
    accent: 'bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20',
    ghost: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-sm',
    danger: 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white font-medium',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white font-medium',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-4 py-2.5 text-[13.5px]',
    lg: 'px-5 py-3 text-[15px]'
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`rounded-xl transition-all inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`}
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
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 shadow-sm">
          <Icon size={26} className="text-blue-600" />
        </div>
      )}
      <h4 className="font-display font-700 text-[16px] text-slate-900 mb-1">{title}</h4>
      {subtitle && <p className="text-[13.5px] text-slate-500 max-w-sm mb-5 leading-relaxed">{subtitle}</p>}
      {action}
    </div>
  )
}

export function Badge({ children, tone = 'default', size = 'md' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  }

  const py = size === 'sm' ? 'py-0.5 px-2 text-[10.5px]' : 'py-1 px-2.5 text-[11.5px]'

  return (
    <span className={`rounded-lg font-semibold capitalize inline-flex items-center gap-1 ${py} ${tones[tone]}`}>
      {children}
    </span>
  )
}
