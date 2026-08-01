import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = 'primary',
  delay = 0,
  to,
  onClick
}) {
  const navigate = useNavigate()

  const iconBgMap = {
    primary: 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-600/30 border-blue-700',
    accent: 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 border-indigo-700',
    success: 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 border-emerald-700',
    danger: 'bg-rose-600 dark:bg-rose-500 text-white shadow-md shadow-rose-600/30 border-rose-700',
    warning: 'bg-amber-600 dark:bg-amber-500 text-white shadow-md shadow-amber-600/30 border-amber-700',
    info: 'bg-sky-600 dark:bg-sky-500 text-white shadow-md shadow-sky-600/30 border-sky-700',
  }

  const borderGlowMap = {
    primary: 'hover:border-blue-400 dark:hover:border-sky-400 hover:shadow-lg hover:shadow-blue-600/10',
    accent: 'hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-600/10',
    success: 'hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-600/10',
    danger: 'hover:border-rose-400 dark:hover:border-rose-400 hover:shadow-lg hover:shadow-rose-600/10',
    warning: 'hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-lg hover:shadow-amber-600/10',
    info: 'hover:border-sky-400 dark:hover:border-sky-400 hover:shadow-lg hover:shadow-sky-600/10',
  }

  const handleClick = () => {
    if (onClick) onClick()
    if (to) navigate(to)
  }

  const isClickable = Boolean(to || onClick)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={isClickable ? handleClick : undefined}
      className={`group bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${
        borderGlowMap[tone]
      } ${isClickable ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        {/* Bold, Ultra-Legible Dark & Light Mode Headings */}
        <span className="font-display font-800 text-[14.5px] text-slate-950 dark:text-slate-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
          {label}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 shrink-0 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${iconBgMap[tone]}`}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="font-mono text-[20px] md:text-[24px] font-extrabold text-slate-950 dark:text-slate-100 tracking-tight tabular-nums group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors truncate" title={value}>
        {value}
      </div>

      {sublabel && (
        <div className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 mt-2 flex items-center justify-between gap-2">
          <span className="truncate" title={sublabel}>{sublabel}</span>
          {isClickable && (
            <span className="text-[11.5px] text-blue-700 dark:text-sky-400 font-extrabold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              View &rarr;
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}
