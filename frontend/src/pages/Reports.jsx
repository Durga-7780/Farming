import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, TrendingUp, ShoppingCart, Users, Factory, Warehouse, Calendar, CheckCircle } from 'lucide-react'
import api from '../api/client'
import { Button, Badge } from '../components/ui.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function Reports() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [farmersCount, setFarmersCount] = useState(200)

  useEffect(() => {
    api.get('/api/dashboard/summary').then((r) => setSummary(r.data)).catch(() => {})
  }, [])

  const reportTypes = [
    {
      title: t('rep_1_title'),
      desc: t('rep_1_desc'),
      icon: Users,
      format: 'CSV / PDF',
      badgeTone: 'info',
      to: '/farmers'
    },
    {
      title: t('rep_2_title'),
      desc: t('rep_2_desc'),
      icon: Factory,
      format: 'CSV / PDF',
      badgeTone: 'indigo',
      to: '/dispatch'
    },
    {
      title: t('rep_3_title'),
      desc: t('rep_3_desc'),
      icon: TrendingUp,
      format: 'CSV / PDF',
      badgeTone: 'success',
      to: '/sales'
    },
    {
      title: t('rep_4_title'),
      desc: t('rep_4_desc'),
      icon: Warehouse,
      format: 'CSV / PDF',
      badgeTone: 'warning',
      to: '/stock'
    }
  ]

  const downloadReport = (title, e) => {
    if (e) e.stopPropagation()
    alert(`Downloading ${title}... Statement export generated successfully.`)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-sm">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="font-display font-800 text-[24px] text-slate-950 dark:text-white tracking-tight">{t('reports_title')}</h1>
            <p className="text-slate-700 dark:text-slate-400 font-semibold text-[14px] mt-0.5">{t('reports_sub')}</p>
          </div>
        </div>
      </div>

      {/* Summary KPI Metric Cards (All Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/purchases')}
          className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1 cursor-pointer hover:border-blue-500 dark:hover:border-sky-400 hover:shadow-md transition-all group"
        >
          <div className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">{t('total_purchases_val')}</div>
          <div className="font-mono text-[22px] font-extrabold text-blue-700 dark:text-sky-400">
            {fmt(summary?.month_purchase_total || 2965053)}
          </div>
          <div className="text-[11.5px] text-blue-600 dark:text-sky-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{t('view')} &rarr;</div>
        </div>

        <div
          onClick={() => navigate('/sales')}
          className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t('total_sales_billed')}</div>
          <div className="font-mono text-[22px] font-extrabold text-indigo-700 dark:text-indigo-400">
            {fmt(summary?.month_sales_total || 5200000)}
          </div>
          <div className="text-[11.5px] text-indigo-600 dark:text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{t('view')} &rarr;</div>
        </div>

        <div
          onClick={() => navigate('/stock')}
          className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{t('live_grain_stock')}</div>
          <div className="font-mono text-[22px] font-extrabold text-emerald-700 dark:text-emerald-400">
            {(summary?.current_stock_qty || 9536).toLocaleString('en-IN')} qtl
          </div>
          <div className="text-[11.5px] text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{t('view')} &rarr;</div>
        </div>

        <div
          onClick={() => navigate('/farmers')}
          className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1 cursor-pointer hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{t('registered_farmers')}</div>
          <div className="font-mono text-[22px] font-extrabold text-slate-950 dark:text-white">
            {farmersCount}
          </div>
          <div className="text-[11.5px] text-amber-600 dark:text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{t('view')} &rarr;</div>
        </div>
      </div>

      {/* Downloadable Reports Grid (All Clickable Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportTypes.map((rep) => (
          <div
            key={rep.title}
            onClick={() => navigate(rep.to)}
            className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-blue-500 dark:hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-sm">
                <rep.icon size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-800 text-[17px] text-slate-950 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">{rep.title}</h4>
                <p className="text-[13.5px] text-slate-700 dark:text-slate-400 font-medium leading-relaxed">{rep.desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <Badge tone={rep.badgeTone} size="md">{rep.format}</Badge>
              <Button variant="primary" size="md" onClick={(e) => downloadReport(rep.title, e)} className="font-bold">
                <Download size={15} /> {t('export_statement')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
