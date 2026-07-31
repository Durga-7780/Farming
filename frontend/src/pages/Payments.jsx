import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Wallet, Edit2, Trash2, Filter } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import { Field, inputClass, Button, EmptyState, Badge } from '../components/ui.jsx'

const MONTHS = [
  { val: 'All', label: 'All Months' },
  { val: '1', label: 'January' }, { val: '2', label: 'February' },
  { val: '3', label: 'March' }, { val: '4', label: 'April' },
  { val: '5', label: 'May' }, { val: '6', label: 'June' },
  { val: '7', label: 'July' }, { val: '8', label: 'August' },
  { val: '9', label: 'September' }, { val: '10', label: 'October' },
  { val: '11', label: 'November' }, { val: '12', label: 'December' }
]

export default function Payments() {
  const [tab, setTab] = useState('farmer')
  const [farmerPayments, setFarmerPayments] = useState([])
  const [millPayments, setMillPayments] = useState([])
  const [farmers, setFarmers] = useState([])
  const [mills, setMills] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ farmer_id: '', mill_id: '', amount: '', payment_type: 'partial', payment_mode: 'cash', reference_no: '', notes: '' })
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)

  // Filters
  const [filterMonth, setFilterMonth] = useState('All')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterMode, setFilterMode] = useState('All')
  const [filterEntityId, setFilterEntityId] = useState('All')

  async function load() {
    setLoading(true)
    const [fp, mp] = await Promise.all([api.get('/api/payments/farmer'), api.get('/api/payments/mill')])
    setFarmerPayments(fp.data)
    setMillPayments(mp.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    api.get('/api/farmers', { params: { is_active: true, limit: 500 } }).then((r) => setFarmers(r.data))
    api.get('/api/mills', { params: { is_active: true, limit: 500 } }).then((r) => setMills(r.data))
  }, [])

  // Reset entity filter when tab changes
  useEffect(() => {
    setFilterEntityId('All')
  }, [tab])

  function openCreate() {
    setForm({ farmer_id: '', mill_id: '', amount: '', payment_type: 'partial', payment_mode: 'cash', reference_no: '', notes: '' })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (tab === 'farmer') {
      await api.post('/api/payments/farmer', {
        farmer_id: Number(form.farmer_id), amount: parseFloat(form.amount), payment_type: form.payment_type,
        payment_mode: form.payment_mode, reference_no: form.reference_no, notes: form.notes,
      })
    } else {
      await api.post('/api/payments/mill', {
        mill_id: Number(form.mill_id), amount: parseFloat(form.amount), payment_mode: form.payment_mode,
        reference_no: form.reference_no, notes: form.notes,
      })
    }
    setModalOpen(false)
    load()
  }

  function openEdit(p) {
    setEditForm({ ...p })
    setEditModalOpen(true)
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    if (tab === 'farmer') {
      await api.patch(`/api/payments/farmer/${editForm.id}`, {
        amount: parseFloat(editForm.amount), payment_type: editForm.payment_type,
        payment_mode: editForm.payment_mode, reference_no: editForm.reference_no, notes: editForm.notes
      })
    } else {
      await api.patch(`/api/payments/mill/${editForm.id}`, {
        amount: parseFloat(editForm.amount),
        payment_mode: editForm.payment_mode, reference_no: editForm.reference_no, notes: editForm.notes
      })
    }
    setEditModalOpen(false)
    load()
  }

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      if (tab === 'farmer') {
        await api.delete(`/api/payments/farmer/${id}`)
      } else {
        await api.delete(`/api/payments/mill/${id}`)
      }
      load()
    }
  }

  const rows = tab === 'farmer' ? farmerPayments : millPayments

  // Filtered data
  const filteredRows = rows.filter(p => {
    const d = new Date(p.payment_date)
    const m = (d.getMonth() + 1).toString()
    const y = d.getFullYear().toString()
    
    if (filterYear !== 'All' && y !== filterYear) return false
    if (filterMonth !== 'All' && m !== filterMonth) return false
    if (filterMode !== 'All' && p.payment_mode !== filterMode) return false
    
    if (filterEntityId !== 'All') {
      if (tab === 'farmer' && p.farmer_id?.toString() !== filterEntityId) return false
      if (tab === 'mill' && p.mill_id?.toString() !== filterEntityId) return false
    }

    return true
  })

  const total = filteredRows.reduce((sum, p) => sum + p.amount, 0)

  // Available years for dropdown
  const years = Array.from(new Set(rows.map(p => new Date(p.payment_date).getFullYear().toString()))).sort((a,b) => b.localeCompare(a))
  if (!years.includes(new Date().getFullYear().toString())) years.unshift(new Date().getFullYear().toString())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-800 text-[22px] text-ink">Payments</h1>
          <p className="text-muted text-[13.5px] mt-0.5">Farmer payouts and mill collections</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus size={16} /> Record payment</Button>
      </div>

      <div className="flex gap-1 bg-surfacealt rounded-lg p-1 w-fit">
        {['farmer', 'mill'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-[13px] font-medium capitalize transition-colors ${tab === t ? 'bg-surface shadow-sm text-primary' : 'text-muted'}`}
          >
            {t} payments
          </button>
        ))}
      </div>

      {/* Reports & Filters Section */}
      <div className="bg-surface rounded-card shadow-card border border-line/60 p-5">
        <h3 className="flex items-center gap-2 font-semibold text-[14px] text-ink mb-4">
          <Filter size={16} className="text-primary" /> Filters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11.5px] font-medium text-muted mb-1">
              {tab === 'farmer' ? 'Farmer' : 'Mill'}
            </label>
            <select className={inputClass} value={filterEntityId} onChange={e => setFilterEntityId(e.target.value)}>
              <option value="All">All {tab === 'farmer' ? 'Farmers' : 'Mills'}</option>
              {tab === 'farmer'
                ? farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)
                : mills.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-medium text-muted mb-1">Year</label>
            <select className={inputClass} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="All">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-medium text-muted mb-1">Month</label>
            <select className={inputClass} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-medium text-muted mb-1">Mode</label>
            <select className={inputClass} value={filterMode} onChange={e => setFilterMode(e.target.value)}>
              <option value="All">All Modes</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
            </select>
          </div>
        </div>
        <div className="pt-4 border-t border-line/40 mt-5">
          <div className="text-[12px] text-muted">Filtered Total Amount</div>
          <div className="font-mono text-[22px] font-bold text-ink">₹{total.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface rounded-lg animate-pulse border border-line/60" />)}</div>
      ) : rows.length === 0 ? (
        <div className="bg-surface rounded-card border border-line/60">
          <EmptyState icon={Wallet} title="No payments recorded" subtitle="Record a payment to see it here." action={<Button variant="accent" onClick={openCreate}><Plus size={15} /> Record payment</Button>} />
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-line/60 overflow-x-auto shadow-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted border-b border-line/60 bg-surfacealt/30">
                <th className="px-4 py-3 font-medium">{tab === 'farmer' ? 'Farmer' : 'Mill'}</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? filteredRows.map((p) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-line/40 last:border-0 hover:bg-surfacealt/10 transition-colors">
                  <td className="px-4 py-3">{p.farmer_name || p.mill_name}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><Badge tone="info">{p.payment_mode}</Badge></td>
                  <td className="px-4 py-3 text-muted">{p.reference_no || '—'}</td>
                  <td className="px-4 py-3 text-muted">{new Date(p.payment_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-muted">
                      <button onClick={() => openEdit(p)} className="hover:text-primary transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="hover:text-danger transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-[13px] text-muted">
                    No matching payments for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Record ${tab} payment`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'farmer' ? (
            <Field label="Farmer">
              <select required className={inputClass} value={form.farmer_id} onChange={(e) => setForm({ ...form, farmer_id: e.target.value })}>
                <option value="">Select farmer</option>
                {farmers.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Mill">
              <select required className={inputClass} value={form.mill_id} onChange={(e) => setForm({ ...form, mill_id: e.target.value })}>
                <option value="">Select mill</option>
                {mills.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          )}
          <Field label="Amount (₹)">
            <input required type="number" step="0.01" className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          {tab === 'farmer' && (
            <Field label="Payment type">
              <select className={inputClass} value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })}>
                <option value="advance">Advance</option>
                <option value="partial">Partial</option>
                <option value="full">Full settlement</option>
              </select>
            </Field>
          )}
          <Field label="Payment mode">
            <select className={inputClass} value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="bank">Bank transfer</option>
              <option value="upi">UPI</option>
            </select>
          </Field>
          <Field label="Reference number">
            <input className={inputClass} value={form.reference_no} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">Save payment</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editForm && (
        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit ${tab} payment`}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Field label="Amount (₹)">
              <input required type="number" step="0.01" className={inputClass} value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            </Field>
            {tab === 'farmer' && (
              <Field label="Payment type">
                <select className={inputClass} value={editForm.payment_type} onChange={(e) => setEditForm({ ...editForm, payment_type: e.target.value })}>
                  <option value="advance">Advance</option>
                  <option value="partial">Partial</option>
                  <option value="full">Full settlement</option>
                </select>
              </Field>
            )}
            <Field label="Payment mode">
              <select className={inputClass} value={editForm.payment_mode} onChange={(e) => setEditForm({ ...editForm, payment_mode: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="bank">Bank transfer</option>
                <option value="upi">UPI</option>
              </select>
            </Field>
            <Field label="Reference number">
              <input className={inputClass} value={editForm.reference_no || ''} onChange={(e) => setEditForm({ ...editForm, reference_no: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="accent">Save changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
