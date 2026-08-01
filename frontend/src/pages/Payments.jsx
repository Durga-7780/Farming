import React, { useEffect, useState } from 'react'
import { Plus, Download, Edit2, Trash2, Wallet, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react'
import api from '../api/client'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import { Button, Badge, inputClass, selectClass } from '../components/ui.jsx'
import TransliterateInput from '../components/TransliterateInput.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function PaymentForm({ initialData, paymentType, onSuccess, onCancel }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    farmer_name: initialData?.farmer_name || '',
    mill_name: initialData?.mill_name || '',
    amount: initialData?.amount || '',
    payment_mode: initialData?.payment_mode || 'bank',
    payment_type: initialData?.payment_type || 'Partial',
    reference_no: initialData?.reference_no || '',
    payment_date: initialData?.payment_date ? initialData.payment_date.split('T')[0] : new Date().toISOString().split('T')[0]
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        amount: Number(form.amount) || 0
      }
      if (initialData) {
        const endpoint = paymentType === 'farmer' ? `/api/payments/farmer/${initialData.id}` : `/api/payments/mill/${initialData.id}`
        await api.put(endpoint, payload)
      } else {
        const endpoint = paymentType === 'farmer' ? '/api/payments/farmer' : '/api/payments/mill'
        await api.post(endpoint, payload)
      }
      onSuccess()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to save payment record')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      <div>
        <label className="block text-[13px] font-bold text-slate-900 dark:text-white mb-1">
          {paymentType === 'farmer' ? t('farmer_col') + ' *' : t('mill_col') + ' *'}
        </label>
        <TransliterateInput
          required
          value={paymentType === 'farmer' ? form.farmer_name : form.mill_name}
          onChange={(e) => setForm({ ...form, [paymentType === 'farmer' ? 'farmer_name' : 'mill_name']: e.target.value })}
          placeholder={paymentType === 'farmer' ? t('farmer_col') : t('mill_col')}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-slate-900 dark:text-white mb-1">{t('amount')} *</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-slate-900 dark:text-white mb-1">{t('payment_mode')}</label>
          <select
            value={form.payment_mode}
            onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
            className={selectClass}
          >
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI / Online</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-slate-900 dark:text-white mb-1">{t('settlement_type_col')}</label>
          <select
            value={form.payment_type}
            onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
            className={selectClass}
          >
            <option value="Advance">Advance</option>
            <option value="Partial">Partial Payment</option>
            <option value="Full Settlement">Full Settlement</option>
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-slate-900 dark:text-white mb-1">{t('date')} *</label>
          <input
            type="date"
            required
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-slate-900 dark:text-white mb-1">{t('reference_no')}</label>
        <TransliterateInput
          value={form.reference_no}
          onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
          placeholder={t('ref_ph')}
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
        <Button type="button" variant="ghost" onClick={onCancel} className="font-bold">
          {t('cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={submitting} className="font-bold">
          {submitting ? '...' : t('save_payment')}
        </Button>
      </div>
    </form>
  )
}

export default function Payments() {
  const { t } = useLanguage()
  const [tab, setTab] = useState('farmer') // 'farmer' | 'mill'
  const [farmerPayments, setFarmerPayments] = useState([])
  const [millPayments, setMillPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const [fRes, mRes] = await Promise.all([
        api.get('/api/payments/farmer'),
        api.get('/api/payments/mill')
      ])
      setFarmerPayments(fRes.data)
      setMillPayments(mRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleCreate() {
    setEditingItem(null)
    setModalOpen(true)
  }

  function openEdit(item, e) {
    if (e) e.stopPropagation()
    setEditingItem(item)
    setModalOpen(true)
  }

  async function handleDelete(id, e) {
    if (e) e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this payment record?')) return
    try {
      const endpoint = tab === 'farmer' ? `/api/payments/farmer/${id}` : `/api/payments/mill/${id}`
      await api.delete(endpoint)
      loadData()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to delete payment record')
    }
  }

  const activeData = tab === 'farmer' ? farmerPayments : millPayments
  const partyOptions = Array.from(new Set(activeData.map((p) => p.farmer_name || p.mill_name).filter(Boolean)))

  const columns = [
    {
      key: 'party_name',
      label: tab === 'farmer' ? t('farmer') : t('mill'),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${tab === 'farmer' ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'}`}>
            {tab === 'farmer' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
          </div>
          <span className="font-extrabold text-slate-950 dark:text-slate-100">{t(row.farmer_name) || t(row.mill_name) || '—'}</span>
        </div>
      )
    },
    {
      key: 'amount',
      label: t('amount'),
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className={`font-mono font-extrabold text-[14px] ${tab === 'farmer' ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {fmt(val)}
        </span>
      )
    },
    {
      key: 'payment_mode',
      label: t('payment_mode'),
      sortable: true,
      render: (val) => <Badge tone="info" size="sm"><span className="uppercase font-bold">{val}</span></Badge>
    },
    {
      key: 'payment_type',
      label: t('settlement_type'),
      sortable: true,
      render: (val) => val ? <Badge tone="indigo" size="sm">{val}</Badge> : '—'
    },
    {
      key: 'reference_no',
      label: t('reference_no'),
      sortable: true,
      render: (val) => val ? <span className="font-mono text-slate-900 dark:text-sky-300 font-extrabold">{val}</span> : <span className="text-slate-400">—</span>
    },
    {
      key: 'payment_date',
      label: t('date'),
      sortable: true,
      render: (val) => <span className="text-slate-800 dark:text-slate-200 text-[12.5px] font-bold">{new Date(val).toLocaleDateString('en-IN')}</span>
    },
    {
      key: 'actions',
      label: t('actions'),
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2 text-slate-700 dark:text-slate-300">
          <button onClick={(e) => openEdit(row, e)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-sky-400 transition-colors" title="Edit">
            <Edit2 size={15} />
          </button>
          <button onClick={(e) => handleDelete(row.id, e)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ]

  const filterFields = [
    {
      key: 'party_name',
      label: tab === 'farmer' ? t('farmer_name') : t('mill_name'),
      type: 'select',
      options: partyOptions
    },
    {
      key: 'payment_mode',
      label: t('payment_mode'),
      type: 'select',
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'Bank Transfer', value: 'bank' },
        { label: 'UPI', value: 'upi' }
      ]
    }
  ]

  const cardRender = (p) => (
    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-display font-800 text-[15px] text-slate-950 dark:text-white">{p.farmer_name || p.mill_name}</h4>
          <span className="text-[12px] font-mono text-slate-600 dark:text-slate-400 font-bold">{new Date(p.payment_date).toLocaleDateString('en-IN')}</span>
        </div>
        <Badge tone="info">{p.payment_mode}</Badge>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
        <span className={`font-mono text-[16px] font-extrabold ${tab === 'farmer' ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {fmt(p.amount)}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={(e) => openEdit(p, e)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-700 dark:text-sky-400"><Edit2 size={15} /></button>
          <button onClick={(e) => handleDelete(p.id, e)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400"><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 w-fit">
          <button
            onClick={() => setTab('farmer')}
            className={`px-4 py-2 rounded-xl text-[13.5px] font-extrabold transition-all ${
              tab === 'farmer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Farmer Payouts
          </button>
          <button
            onClick={() => setTab('mill')}
            className={`px-4 py-2 rounded-xl text-[13.5px] font-extrabold transition-all ${
              tab === 'mill' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Mill Collections
          </button>
        </div>

        <Button variant="primary" size="md" onClick={handleCreate} className="font-bold">
          <Plus size={16} /> {tab === 'farmer' ? 'Record Farmer Payment' : 'Record Mill Collection'}
        </Button>
      </div>

      {/* Main Table */}
      <DataTable
        title={tab === 'farmer' ? 'Farmer Disbursal Payments' : 'Mill Receipt Collections'}
        subtitle="Tracking all financial transactions and payment receipts"
        data={activeData}
        columns={columns}
        searchKeys={['farmer_name', 'mill_name', 'reference_no', 'payment_mode']}
        filterFields={filterFields}
        cardRender={cardRender}
      />

      {/* Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Payment Record' : tab === 'farmer' ? 'Record Farmer Payout' : 'Record Mill Collection'}
      >
        <PaymentForm
          initialData={editingItem}
          paymentType={tab}
          onSuccess={() => {
            setModalOpen(false)
            loadData()
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
