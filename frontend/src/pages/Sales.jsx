import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import { Field, inputClass, Button, EmptyState } from '../components/ui.jsx'

const emptyForm = { mill_id: '', produce_variety_id: '', quantity: '', rate_per_unit: '', invoice_number: '', vehicle_number: '', notes: '' }

export default function Sales() {
  const [sales, setSales] = useState([])
  const [mills, setMills] = useState([])
  const [varieties, setVarieties] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setLoading(true)
    const { data } = await api.get('/api/sales')
    setSales(data)
    setLoading(false)
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-800 text-[22px] text-ink">Sales</h1>
          <p className="text-muted text-[13.5px] mt-0.5">Dispatch and sales to mills</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus size={16} /> New sale</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-surface rounded-lg animate-pulse border border-line/60" />)}</div>
      ) : sales.length === 0 ? (
        <div className="bg-surface rounded-card border border-line/60">
          <EmptyState icon={TrendingUp} title="No sales yet" subtitle="Record a dispatch to a mill to see it here." action={<Button variant="accent" onClick={openCreate}><Plus size={15} /> New sale</Button>} />
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-line/60 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted border-b border-line/60">
                <th className="px-4 py-3 font-medium">No.</th>
                <th className="px-4 py-3 font-medium">Mill</th>
                <th className="px-4 py-3 font-medium">Variety</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Rate</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-line/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{s.sale_no}</td>
                  <td className="px-4 py-3">{s.mill_name}</td>
                  <td className="px-4 py-3">{s.produce_variety_name}</td>
                  <td className="px-4 py-3 text-right font-mono">{s.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{s.rate_per_unit}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">₹{s.total_amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-muted">{s.invoice_number || '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New sale" wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mill">
            <select required className={inputClass} value={form.mill_id} onChange={(e) => setForm({ ...form, mill_id: e.target.value })}>
              <option value="">Select mill</option>
              {mills.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </Field>
          <Field label="Produce variety">
            <select required className={inputClass} value={form.produce_variety_id} onChange={(e) => setForm({ ...form, produce_variety_id: e.target.value })}>
              <option value="">Select variety</option>
              {varieties.map((v) => <option key={v.id} value={v.id}>{v.name_en}</option>)}
            </select>
          </Field>
          <Field label="Quantity (quintal)">
            <input required type="number" step="0.01" className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </Field>
          <Field label="Rate per unit (₹)">
            <input required type="number" step="0.01" className={inputClass} value={form.rate_per_unit} onChange={(e) => setForm({ ...form, rate_per_unit: e.target.value })} />
          </Field>
          <Field label="Invoice number">
            <input className={inputClass} value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
          </Field>
          <Field label="Vehicle number">
            <input className={inputClass} value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <input className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          <div className="sm:col-span-2 bg-accent-soft rounded-lg p-3 flex items-center justify-end">
            <span className="text-[14px] text-accent-dark font-mono font-bold">Total: ₹{total.toLocaleString('en-IN')}</span>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">Save sale</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
