import React, { useEffect, useState, useMemo } from 'react'
import { Plus, TrendingUp, Wheat, Factory, FileText, Eye } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'

const emptyForm = { mill_id: '', produce_variety_id: '', quantity: '', rate_per_unit: '', invoice_number: '', vehicle_number: '', notes: '' }
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Sales() {
  const [sales, setSales] = useState([])
  const [mills, setMills] = useState([])
  const [varieties, setVarieties] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewSale, setViewSale] = useState(null)
  const [form, setForm] = useState(emptyForm)

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
    api.get('/api/mills', { params: { is_active: true, limit: 500 } }).then((r) => setMills(r.data))
    api.get('/api/produce-varieties').then((r) => setVarieties(r.data))
  }, [])

  const total = useMemo(() => (parseFloat(form.quantity) || 0) * (parseFloat(form.rate_per_unit) || 0), [form])

  function openCreate() { setForm(emptyForm); setModalOpen(true) }

  async function handleSubmit(e) {
    e.preventDefault()
    await api.post('/api/sales', {
      ...form,
      mill_id: Number(form.mill_id),
      produce_variety_id: Number(form.produce_variety_id),
      quantity: parseFloat(form.quantity) || 0,
      rate_per_unit: parseFloat(form.rate_per_unit) || 0,
    })
    setModalOpen(false)
    load()
  }

  const millOptions = Array.from(new Set(sales.map((s) => s.mill_name).filter(Boolean)))
  const varietyOptions = Array.from(new Set(sales.map((s) => s.produce_variety_name).filter(Boolean)))

  const columns = [
    {
      key: 'sale_no',
      label: 'Sale No.',
      sortable: true,
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold">{val}</span>
    },
    {
      key: 'mill_name',
      label: 'Target Mill',
      sortable: true,
      render: (val) => <span className="font-bold text-indigo-700 dark:text-indigo-400">{val}</span>
    },
    {
      key: 'produce_variety_name',
      label: 'Produce Variety',
      sortable: true,
      render: (val) => val ? <Badge tone="info" size="sm"><Wheat size={11} /> {val}</Badge> : '—'
    },
    {
      key: 'quantity',
      label: 'Quantity (qtl)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-900 dark:text-white font-bold">{val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'rate_per_unit',
      label: 'Rate / Unit (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">₹{val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'total_amount',
      label: 'Total Amount (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{fmt(val)}</span>
    },
    {
      key: 'invoice_number',
      label: 'Invoice #',
      sortable: true,
      render: (val) => val ? <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{val}</span> : <span className="text-slate-400">—</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setViewSale(row) }}>
          <Eye size={13} /> View
        </Button>
      )
    }
  ]

  const filterFields = [
    { key: 'mill_name', label: 'Target Rice Mill', type: 'select', options: millOptions },
    { key: 'produce_variety_name', label: 'Produce Variety', type: 'select', options: varietyOptions },
    { key: 'invoice_number', label: 'Invoice Number', type: 'search', placeholder: 'Search invoice #' },
    { key: 'quantity', label: 'Min Quantity (qtl)', type: 'min', placeholder: 'Min weight' },
    { key: 'total_amount', label: 'Min Total Amount (₹)', type: 'min', placeholder: 'Min amount' }
  ]

  const cardRender = (s) => (
    <div
      key={s.id}
      onClick={() => setViewSale(s)}
      className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-blue-600 dark:text-sky-400 font-bold text-[13px]">{s.sale_no}</span>
          <h4 className="font-display font-700 text-[15px] text-slate-900 dark:text-white">{s.mill_name}</h4>
        </div>
        <Badge tone="success">Billed</Badge>
      </div>
      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800">
        <div><span className="text-slate-500 dark:text-slate-400">Variety: </span><span>{s.produce_variety_name}</span></div>
        <div><span className="text-slate-500 dark:text-slate-400">Quantity: </span><span className="font-mono font-bold text-slate-900 dark:text-white">{s.quantity} qtl</span></div>
        <div><span className="text-slate-500 dark:text-slate-400">Invoice: </span><span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{s.invoice_number || 'N/A'}</span></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-[15px]">{fmt(s.total_amount)}</span>
        <Button variant="ghost" size="sm" onClick={() => setViewSale(s)}>
          <Eye size={14} /> View Invoice
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title="Mill Sales & Invoices"
        subtitle={`${sales.length} sale dispatches recorded for mill billing`}
        columns={columns}
        data={sales}
        searchKeys={['sale_no', 'mill_name', 'produce_variety_name', 'invoice_number', 'vehicle_number']}
        filterFields={filterFields}
        defaultSortKey="sale_no"
        defaultSortOrder="desc"
        onRowClick={(s) => setViewSale(s)}
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> Record New Sale
          </Button>
        }
      />

      {/* New Sale Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Mill Sale Dispatch" wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
          <Field label="Target Rice Mill *">
            <select required className={inputClass} value={form.mill_id} onChange={(e) => setForm({ ...form, mill_id: e.target.value })}>
              <option value="">Select Mill</option>
              {mills.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </Field>
          <Field label="Produce Variety *">
            <select required className={inputClass} value={form.produce_variety_id} onChange={(e) => setForm({ ...form, produce_variety_id: e.target.value })}>
              <option value="">Select Variety</option>
              {varieties.map((v) => <option key={v.id} value={v.id}>{v.name_en}</option>)}
            </select>
          </Field>
          <Field label="Quantity (Quintals) *">
            <input required type="number" step="0.01" className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0.00" />
          </Field>
          <Field label="Rate per Quintal (₹) *">
            <input required type="number" step="0.01" className={inputClass} value={form.rate_per_unit} onChange={(e) => setForm({ ...form, rate_per_unit: e.target.value })} placeholder="2400.00" />
          </Field>

          <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[13px] text-slate-600 dark:text-slate-400 font-semibold">Computed Sale Total:</span>
            <span className="text-[16px] text-emerald-700 dark:text-emerald-400 font-mono font-extrabold">₹{total.toLocaleString('en-IN')}</span>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Sale Record</Button>
          </div>
        </form>
      </Modal>

      {/* View Sale Modal */}
      <Modal open={!!viewSale} onClose={() => setViewSale(null)} title={`Mill Sale Invoice · ${viewSale?.sale_no || ''}`} wide>
        {viewSale && (
          <div className="space-y-4 text-slate-900 dark:text-slate-100">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold block">Sale Voucher</span>
                <span className="font-mono text-blue-700 dark:text-sky-400 font-bold">{viewSale.sale_no}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold block">Mill Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewSale.mill_name}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
