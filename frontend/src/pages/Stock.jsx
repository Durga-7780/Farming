import React, { useEffect, useState } from 'react'
import { Warehouse, Wheat, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import api from '../api/client'
import DataTable from '../components/DataTable.jsx'
import { Badge } from '../components/ui.jsx'

export default function Stock() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/stock/live').then((r) => {
      setStock(r.data)
      setLoading(false)
    })
  }, [])

  const varietyOptions = Array.from(new Set(stock.map((s) => s.variety_name).filter(Boolean)))

  const columns = [
    {
      key: 'variety_name',
      label: 'Produce Variety Name',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-sky-400 font-bold flex items-center justify-center shrink-0">
            <Wheat size={16} />
          </div>
          <span className="font-extrabold text-slate-950 dark:text-white text-[14px]">{val}</span>
        </div>
      )
    },
    {
      key: 'unit',
      label: 'Unit',
      sortable: true,
      render: (val) => <span className="font-mono text-slate-700 dark:text-slate-300 font-bold uppercase text-[12px]">{val || 'Quintal'}</span>
    },
    {
      key: 'purchased',
      label: 'Total Received (In)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-[14px] inline-flex items-center gap-1">
          <ArrowDownRight size={14} /> {val ? val.toLocaleString('en-IN') : 0}
        </span>
      )
    },
    {
      key: 'sold',
      label: 'Dispatched / Sold (Out)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono text-indigo-700 dark:text-indigo-400 font-extrabold text-[14px] inline-flex items-center gap-1">
          <ArrowUpRight size={14} /> {val ? val.toLocaleString('en-IN') : 0}
        </span>
      )
    },
    {
      key: 'available',
      label: 'Live Available Stock',
      sortable: true,
      align: 'right',
      render: (val, row) => {
        const low = val < row.purchased * 0.1
        return (
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold text-[16px]">{val ? val.toLocaleString('en-IN') : 0}</span>
            {low ? <Badge tone="danger" size="sm">Low Stock</Badge> : <Badge tone="success" size="sm">Healthy</Badge>}
          </div>
        )
      }
    }
  ]

  const filterFields = [
    { key: 'variety_name', label: 'Produce Variety Name', type: 'select', options: varietyOptions },
    { key: 'unit', label: 'Stock Unit', type: 'select', options: ['Quintal', 'Bags', 'Kg'] },
    { key: 'available', label: 'Min Available Stock (qtl)', type: 'min', placeholder: 'Min available' },
    { key: 'purchased', label: 'Min Total Received (In)', type: 'min', placeholder: 'Min received' },
    { key: 'sold', label: 'Min Dispatched (Out)', type: 'min', placeholder: 'Min dispatched' }
  ]

  const cardRender = (s) => {
    const low = s.available < s.purchased * 0.1
    return (
      <div key={s.variety_id} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-display font-700 text-[16px] text-slate-900 dark:text-white">{s.variety_name}</h4>
          {low ? <Badge tone="danger">Low Stock</Badge> : <Badge tone="success">In Stock</Badge>}
        </div>
        <div className="font-mono text-[24px] font-bold text-blue-700 dark:text-sky-400">
          {s.available.toLocaleString('en-IN')} <span className="text-[13px] font-sans text-slate-600 dark:text-slate-400 font-semibold">{s.unit}</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-[12.5px] text-slate-700 dark:text-slate-300 font-medium">
          <span>Received: <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{s.purchased.toLocaleString('en-IN')}</strong></span>
          <span>Dispatched: <strong className="text-indigo-700 dark:text-indigo-400 font-mono font-bold">{s.sold.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Live Inventory & Warehouse Stock"
        subtitle="Real-time stock calculations across all produce varieties"
        columns={columns}
        data={stock}
        searchKeys={['variety_name', 'unit']}
        filterFields={filterFields}
        defaultSortKey="available"
        defaultSortOrder="desc"
        cardRender={cardRender}
      />
    </div>
  )
}
