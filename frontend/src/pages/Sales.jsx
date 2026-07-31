import React, { useEffect, useState, useMemo } from 'react'
import { Plus, TrendingUp, Check, Eye, Wheat } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Sales() {
  const { t } = useLanguage()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewSale, setViewSale] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/sales')
      setSales(data)
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
      key: 'invoice_no',
      label: t('sale_no_col'),
      sortable: true,
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold">{val}</span>
    },
    {
      key: 'mill_name',
      label: t('target_mill_col'),
      sortable: true,
      render: (val) => <span className="font-extrabold text-slate-950 dark:text-white">{t(val) || '—'}</span>
    },
    {
      key: 'produce_variety_name',
      label: t('variety_col'),
      sortable: true,
      render: (val) => val ? <Badge tone="info" size="sm"><Wheat size={11} /> {t(val)}</Badge> : '—'
    },
    {
      key: 'quantity',
      label: t('quantity_bags_col'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-900 dark:text-white font-extrabold">{val ? val.toLocaleString() : 0}</span>
    },
    {
      key: 'rate_per_unit',
      label: t('unit_price_col'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">₹{val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'net_receivable',
      label: t('net_col'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{fmt(val)}</span>
    },
    {
      key: 'status',
      label: t('payment_status'),
      sortable: true,
      align: 'center',
      render: (val) => (
        <Badge tone={val === 'paid' ? 'success' : 'warning'} size="sm">
          {val === 'paid' ? t('active') : t('pending')}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: t('actions'),
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setViewSale(row) }}>
          <Eye size={13} /> {t('view')}
        </Button>
      )
    }
  ]

  const cardRender = (s) => (
    <div key={s.id} onClick={() => setViewSale(s)} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-blue-600 dark:text-sky-400 font-bold text-[13px]">{s.invoice_no}</span>
          <h4 className="font-display font-800 text-[15px] text-slate-950 dark:text-white">{t(s.mill_name)}</h4>
        </div>
        <Badge tone={s.status === 'paid' ? 'success' : 'warning'}>{s.status}</Badge>
      </div>
      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800">
        <div><span className="text-slate-500">Variety: </span><span className="font-bold text-slate-900 dark:text-white">{t(s.produce_variety_name)}</span></div>
        <div><span className="text-slate-500">Quantity: </span><span className="font-mono font-bold text-slate-900 dark:text-white">{s.quantity} bags</span></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-[15px]">{fmt(s.net_receivable)}</span>
        <Button variant="ghost" size="sm" onClick={() => setViewSale(s)}>
          <Eye size={14} /> {t('view')}
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title={t('sales_title')}
        subtitle={t('sales_sub')}
        columns={columns}
        data={sales}
        searchKeys={['invoice_no', 'mill_name', 'produce_variety_name']}
        defaultSortKey="invoice_no"
        defaultSortOrder="desc"
        onRowClick={(s) => setViewSale(s)}
        cardRender={cardRender}
      />

      {viewSale && (
        <Modal open={!!viewSale} onClose={() => setViewSale(null)} title={`Sale Invoice — ${viewSale.invoice_no}`}>
          <div className="space-y-4 font-sans text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[12px] font-mono text-blue-600 dark:text-sky-400 font-bold">{viewSale.invoice_no}</span>
                <h3 className="font-display font-800 text-[18px] text-slate-950 dark:text-white">{t(viewSale.mill_name)}</h3>
              </div>
              <Badge tone={viewSale.status === 'paid' ? 'success' : 'warning'}>{viewSale.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[13.5px]">
              <div><span className="text-slate-500">Variety:</span> <strong className="text-slate-900 dark:text-white">{t(viewSale.produce_variety_name)}</strong></div>
              <div><span className="text-slate-500">Quantity:</span> <strong className="font-mono text-slate-900 dark:text-white">{viewSale.quantity} bags</strong></div>
              <div><span className="text-slate-500">Net Billing:</span> <strong className="font-mono text-emerald-600 dark:text-emerald-400">{fmt(viewSale.net_receivable)}</strong></div>
            </div>

            <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-3">
              <Button variant="ghost" onClick={() => setViewSale(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
