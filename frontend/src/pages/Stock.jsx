import React, { useEffect, useState } from 'react'
import { Warehouse, Wheat, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react'
import api from '../api/client'
import DataTable from '../components/DataTable.jsx'
import { Badge } from '../components/ui.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Stock() {
  const { t } = useLanguage()
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/stock')
      setStock(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const columns = [
    {
      key: 'produce_variety_name',
      label: t('variety_col'),
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-sky-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
            <Wheat size={16} />
          </div>
          <span className="font-extrabold text-slate-950 dark:text-white text-[14px]">{t(val)}</span>
        </div>
      )
    },
    {
      key: 'unit',
      label: t('unit_col'),
      sortable: true,
      render: (val) => <span className="font-mono text-slate-700 dark:text-slate-300 font-extrabold text-[12px] uppercase">{t(val) || 'QUINTAL'}</span>
    },
    {
      key: 'total_received',
      label: t('total_received_col'),
      sortable: true,
      align: 'right',
      render: (val) => (
        <div className="inline-flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">
          <ArrowDownLeft size={14} />
          <span>{Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
      )
    },
    {
      key: 'total_dispatched',
      label: t('total_dispatched_col'),
      sortable: true,
      align: 'right',
      render: (val) => (
        <div className="inline-flex items-center gap-1 font-mono text-blue-700 dark:text-sky-400 font-extrabold">
          <ArrowUpRight size={14} />
          <span>{Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
      )
    },
    {
      key: 'current_stock',
      label: t('stock_balance_col'),
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono text-slate-950 dark:text-white font-extrabold text-[15px]">
          {Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'status',
      label: t('status'),
      sortable: true,
      align: 'center',
      render: (_, row) => {
        const isLow = (row.current_stock || 0) < 500
        return (
          <Badge tone={isLow ? 'warning' : 'success'} size="sm">
            {isLow ? 'Low Stock' : 'Optimal'}
          </Badge>
        )
      }
    }
  ]

  const cardRender = (s) => (
    <div key={s.id || s.produce_variety_name} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-display font-800 text-[16px] text-slate-950 dark:text-white">{t(s.produce_variety_name)}</h4>
          <span className="text-[12px] font-mono text-slate-500 font-bold uppercase">{t(s.unit) || 'QUINTAL'}</span>
        </div>
        <Badge tone={s.current_stock < 500 ? 'warning' : 'success'}>
          {s.current_stock < 500 ? 'Low Stock' : 'Optimal'}
        </Badge>
      </div>
      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800 font-mono">
        <div><span className="text-slate-500 font-sans">Received: </span><span className="font-bold text-emerald-600 dark:text-emerald-400">{s.total_received} qtl</span></div>
        <div><span className="text-slate-500 font-sans">Dispatched: </span><span className="font-bold text-blue-600 dark:text-sky-400">{s.total_dispatched} qtl</span></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-slate-950 dark:text-white font-extrabold text-[16px]">{Number(s.current_stock || 0).toLocaleString('en-IN')} qtl</span>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title={t('stock_title')}
        subtitle={t('stock_sub')}
        columns={columns}
        data={stock}
        searchKeys={['produce_variety_name', 'unit']}
        defaultSortKey="current_stock"
        defaultSortOrder="desc"
        cardRender={cardRender}
      />
    </div>
  )
}
