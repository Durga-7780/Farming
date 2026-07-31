import React, { useEffect, useState } from 'react'
import { Plus, Wallet, Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

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

  async function load() {
    setLoading(true)
    try {
      const [fp, mp] = await Promise.all([api.get('/api/payments/farmer'), api.get('/api/payments/mill')])
      setFarmerPayments(fp.data)
      setMillPayments(mp.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    api.get('/api/farmers', { params: { is_active: true, limit: 500 } }).then((r) => setFarmers(r.data))
    api.get('/api/mills', { params: { is_active: true, limit: 500 } }).then((r) => setMills(r.data))
  }, [])

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

  function openEdit(p, e) {
    if (e) e.stopPropagation()
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

  async function handleDelete(id, e) {
    if (e) e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      if (tab === 'farmer') {
        await api.delete(`/api/payments/farmer/${id}`)
      } else {
        await api.delete(`/api/payments/mill/${id}`)
      }
      load()
    }
  }

  const activeData = tab === 'farmer' ? farmerPayments : millPayments
  const partyOptions = Array.from(new Set(activeData.map((p) => p.farmer_name || p.mill_name).filter(Boolean)))

  const columns = [
    {
      key: 'party_name',
      label: tab === 'farmer' ? 'Farmer Name' : 'Mill Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${tab === 'farmer' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {tab === 'farmer' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
          </div>
          <span className="font-bold text-slate-950">{row.farmer_name || row.mill_name || '—'}</span>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Payment Amount (₹)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className={`font-mono font-extrabold text-[14px] ${tab === 'farmer' ? 'text-rose-700' : 'text-emerald-700'}`}>
          {fmt(val)}
        </span>
      )
    },
    {
      key: 'payment_mode',
      label: 'Payment Mode',
      sortable: true,
      render: (val) => <Badge tone="info" size="sm"><span className="uppercase">{val}</span></Badge>
    },
    {
      key: 'payment_type',
      label: 'Settlement Type',
      sortable: true,
      render: (val) => val ? <Badge tone="indigo" size="sm">{val}</Badge> : '—'
    },
    {
      key: 'reference_no',
      label: 'Reference No.',
      sortable: true,
      render: (val) => val ? <span className="font-mono text-slate-900 font-bold">{val}</span> : <span className="text-slate-400">—</span>
    },
    {
      key: 'payment_date',
      label: 'Date',
      sortable: true,
      render: (val) => <span className="text-slate-700 text-[12.5px] font-medium">{new Date(val).toLocaleDateString('en-IN')}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2 text-slate-600">
          <button onClick={(e) => openEdit(row, e)} className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition-colors" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={(e) => handleDelete(row.id, e)} className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-rose-600 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  const filterFields = [
    {
      key: 'party_name',
      label: tab === 'farmer' ? 'Farmer Name' : 'Mill Name',
      type: 'select',
      options: partyOptions
    },
    {
      key: 'payment_mode',
      label: 'Payment Mode',
      type: 'select',
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'Bank Transfer', value: 'bank' },
        { label: 'UPI', value: 'upi' }
      ]
    }
  ]

  const cardRender = (p) => (
    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-display font-700 text-[15px] text-slate-900">{p.farmer_name || p.mill_name}</h4>
          <span className="text-[12px] font-mono text-slate-600 font-semibold">{new Date(p.payment_date).toLocaleDateString('en-IN')}</span>
        </div>
        <Badge tone="info">{p.payment_mode}</Badge>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span className={`font-mono text-[16px] font-extrabold ${tab === 'farmer' ? 'text-rose-700' : 'text-emerald-700'}`}>
          {fmt(p.amount)}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={(e) => openEdit(p, e)} className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700"><Edit2 size={14} /></button>
          <button onClick={(e) => handleDelete(p.id, e)} className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-rose-600"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl border border-slate-300 w-fit">
          <button
            onClick={() => setTab('farmer')}
            className={`px-4 py-2 rounded-lg text-[13.5px] font-bold transition-all ${
              tab === 'farmer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Farmer Payouts
          </button>
          <button
            onClick={() => setTab('mill')}
            className={`px-4 py-2 rounded-lg text-[13.5px] font-bold transition-all ${
              tab === 'mill' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Mill Collections
          </button>
        </div>
      </div>

      <DataTable
        title={tab === 'farmer' ? 'Farmer Disbursal Payments' : 'Mill Collection Receipts'}
        subtitle={`Tracking all financial transactions and payment receipts`}
        columns={columns}
        data={activeData}
        searchKeys={['farmer_name', 'mill_name', 'reference_no', 'payment_mode', 'notes']}
        filterFields={filterFields}
        defaultSortKey="payment_date"
        defaultSortOrder="desc"
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> Record {tab === 'farmer' ? 'Farmer Payout' : 'Mill Receipt'}
          </Button>
        }
      />

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Record ${tab === 'farmer' ? 'Farmer Payout' : 'Mill Collection Receipt'}`}>
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
          {tab === 'farmer' ? (
            <Field label="Select Farmer *">
              <select required className={inputClass} value={form.farmer_id} onChange={(e) => setForm({ ...form, farmer_id: e.target.value })}>
                <option value="">Select Farmer</option>
                {farmers.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Select Mill *">
              <select required className={inputClass} value={form.mill_id} onChange={(e) => setForm({ ...form, mill_id: e.target.value })}>
                <option value="">Select Mill</option>
                {mills.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
              </select>
            </Field>
          )}

          <Field label="Payment Amount (₹) *">
            <input required type="number" step="0.01" className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          </Field>

          {tab === 'farmer' && (
            <Field label="Payment Type">
              <select className={inputClass} value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })}>
                <option value="advance">Advance Payment</option>
                <option value="partial">Partial Payment</option>
                <option value="full">Full Settlement</option>
              </select>
            </Field>
          )}

          <Field label="Payment Mode">
            <select className={inputClass} value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer (NEFT/RTGS)</option>
              <option value="upi">UPI / GPay / PhonePe</option>
            </select>
          </Field>

          <Field label="Transaction / Reference Number">
            <input className={inputClass} value={form.reference_no} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} placeholder="e.g. UTR / Ref No." />
          </Field>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Payment Record</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editForm && (
        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit ${tab} Payment`}>
          <form onSubmit={handleEditSubmit} className="space-y-4 text-slate-900">
            <Field label="Amount (₹) *">
              <input required type="number" step="0.01" className={inputClass} value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            </Field>
            {tab === 'farmer' && (
              <Field label="Payment Type">
                <select className={inputClass} value={editForm.payment_type} onChange={(e) => setEditForm({ ...editForm, payment_type: e.target.value })}>
                  <option value="advance">Advance</option>
                  <option value="partial">Partial</option>
                  <option value="full">Full settlement</option>
                </select>
              </Field>
            )}
            <Field label="Payment Mode">
              <select className={inputClass} value={editForm.payment_mode} onChange={(e) => setEditForm({ ...editForm, payment_mode: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="bank">Bank transfer</option>
                <option value="upi">UPI</option>
              </select>
            </Field>
            <Field label="Reference Number">
              <input className={inputClass} value={editForm.reference_no || ''} onChange={(e) => setEditForm({ ...editForm, reference_no: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
