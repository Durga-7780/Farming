import React, { useEffect, useState, useMemo } from 'react'
import { Plus, ShoppingCart, Check, X as XIcon, Eye, Wheat, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'

const emptyForm = {
  farmer_id: '', produce_variety_id: '', vehicle_id: '', driver_id: '',
  quantity: '', weight_kg: '', rate_per_unit: '', quality_grade: '',
  commission_amount: '0', additional_charges: '0', discount: '0', notes: ''
}

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const statusTone = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'default',
  draft: 'default'
}

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [farmers, setFarmers] = useState([])
  const [varieties, setVarieties] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewPurchase, setViewPurchase] = useState(null)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/purchases')
      setPurchases(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    api.get('/api/farmers', { params: { is_active: true, limit: 500 } }).then((r) => setFarmers(r.data))
    api.get('/api/produce-varieties').then((r) => setVarieties(r.data))
    api.get('/api/vehicles').then((r) => setVehicles(r.data))
    api.get('/api/drivers').then((r) => setDrivers(r.data))
  }, [])

  const preview = useMemo(() => {
    const qty = parseFloat(form.quantity) || 0
    const rate = parseFloat(form.rate_per_unit) || 0
    const gross = qty * rate
    const net = gross + (parseFloat(form.additional_charges) || 0) - (parseFloat(form.commission_amount) || 0) - (parseFloat(form.discount) || 0)
    return { gross, net }
  }, [form])

  function openCreate() { setForm(emptyForm); setModalOpen(true) }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      farmer_id: Number(form.farmer_id),
      produce_variety_id: Number(form.produce_variety_id),
      vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
      driver_id: form.driver_id ? Number(form.driver_id) : null,
      quantity: parseFloat(form.quantity) || 0,
      weight_kg: parseFloat(form.weight_kg) || 0,
      rate_per_unit: parseFloat(form.rate_per_unit) || 0,
      commission_amount: parseFloat(form.commission_amount) || 0,
      additional_charges: parseFloat(form.additional_charges) || 0,
      discount: parseFloat(form.discount) || 0,
    }
    await api.post('/api/purchases', payload)
    setModalOpen(false)
    load()
  }

  async function approve(id, e) {
    if (e) e.stopPropagation()
    await api.post(`/api/purchases/${id}/approve`)
    load()
  }
  async function cancel(id, e) {
    if (e) e.stopPropagation()
    await api.delete(`/api/purchases/${id}`)
    load()
  }

  const varietyOptions = Array.from(new Set(purchases.map((p) => p.produce_variety_name).filter(Boolean)))
  const farmerOptions = Array.from(new Set(purchases.map((p) => p.farmer_name).filter(Boolean)))

  const columns = [
    {
      key: 'purchase_no',
      label: 'Purchase No.',
      sortable: true,
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold">{val}</span>
    },
    {
      key: 'farmer_name',
      label: 'Farmer',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900 dark:text-white">{val || '—'}</span>
    },
    {
      key: 'produce_variety_name',
      label: 'Variety',
      sortable: true,
      render: (val) => val ? <Badge tone="info" size="sm"><Wheat size={11} /> {val}</Badge> : '—'
    },
    {
      key: 'quantity',
      label: 'Quantity (Bags)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-900 dark:text-white font-bold">{val ? val.toLocaleString() : 0}</span>
    },
    {
      key: 'rate_per_unit',
      label: 'Rate / Unit (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">₹{val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'gross_amount',
      label: 'Gross Amt',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{fmt(val)}</span>
    },
    {
      key: 'net_payable',
      label: 'Net Payable (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{fmt(val)}</span>
    },
    {
      key: 'status',
      label: 'Approval Status',
      sortable: true,
      align: 'center',
      render: (val) => (
        <Badge tone={statusTone[val] || 'default'} size="sm">
          {val}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setViewPurchase(row) }}>
            <Eye size={13} /> View
          </Button>
          {row.status === 'pending' && (
            <>
              <button
                onClick={(e) => approve(row.id, e)}
                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors"
                title="Approve Purchase"
              >
                <Check size={14} />
              </button>
              <button
                onClick={(e) => cancel(row.id, e)}
                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 hover:bg-rose-600 hover:text-white transition-colors"
                title="Cancel Purchase"
              >
                <XIcon size={14} />
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  const filterFields = [
    { key: 'farmer_name', label: 'Farmer Name', type: 'select', options: farmerOptions },
    { key: 'produce_variety_name', label: 'Produce Variety', type: 'select', options: varietyOptions },
    { key: 'status', label: 'Approval Status', type: 'select', options: [ { label: 'Pending Approval', value: 'pending' }, { label: 'Approved Order', value: 'approved' }, { label: 'Cancelled Order', value: 'cancelled' } ] },
    { key: 'quality_grade', label: 'Quality Grade', type: 'search', placeholder: 'Search grade A, B...' },
    { key: 'quantity', label: 'Min Quantity (Bags)', type: 'min', placeholder: 'Min bags' },
    { key: 'net_payable', label: 'Min Net Payable (₹)', type: 'min', placeholder: 'Min amount' }
  ]

  const cardRender = (p) => (
    <div
      key={p.id}
      onClick={() => setViewPurchase(p)}
      className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-blue-600 dark:text-sky-400 font-bold text-[13px]">{p.purchase_no}</span>
          <h4 className="font-display font-700 text-[15px] text-slate-900 dark:text-white">{p.farmer_name}</h4>
        </div>
        <Badge tone={statusTone[p.status]}>{p.status}</Badge>
      </div>
      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800">
        <div><span className="text-slate-500 dark:text-slate-400">Variety: </span><span className="font-semibold text-slate-900 dark:text-white">{p.produce_variety_name}</span></div>
        <div><span className="text-slate-500 dark:text-slate-400">Quantity: </span><span className="font-mono font-bold text-slate-900 dark:text-white">{p.quantity} bags</span></div>
        <div><span className="text-slate-500 dark:text-slate-400">Rate: </span><span className="font-mono text-slate-800 dark:text-slate-200">₹{p.rate_per_unit}</span></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-[15px]">{fmt(p.net_payable)}</span>
        <Button variant="ghost" size="sm" onClick={() => setViewPurchase(p)}>
          <Eye size={14} /> Details
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title="Procurement & Purchases"
        subtitle={`${purchases.length} purchase vouchers recorded from farmers`}
        columns={columns}
        data={purchases}
        searchKeys={['purchase_no', 'farmer_name', 'produce_variety_name', 'quality_grade']}
        filterFields={filterFields}
        defaultSortKey="purchase_no"
        defaultSortOrder="desc"
        onRowClick={(p) => setViewPurchase(p)}
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> New Purchase Order
          </Button>
        }
      />

      {/* New Purchase Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Farmer Purchase Order" wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
          <Field label="Farmer *">
            <select required className={inputClass} value={form.farmer_id} onChange={(e) => setForm({ ...form, farmer_id: e.target.value })}>
              <option value="">Select Farmer</option>
              {farmers.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
            </select>
          </Field>
          <Field label="Produce Variety *">
            <select required className={inputClass} value={form.produce_variety_id} onChange={(e) => setForm({ ...form, produce_variety_id: e.target.value })}>
              <option value="">Select Variety</option>
              {varieties.map((v) => <option key={v.id} value={v.id}>{v.name_en}</option>)}
            </select>
          </Field>
          <Field label="Quantity (Bags / Units) *">
            <input required type="number" step="0.01" className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Rate per Unit (₹) *">
            <input required type="number" step="0.01" className={inputClass} value={form.rate_per_unit} onChange={(e) => setForm({ ...form, rate_per_unit: e.target.value })} placeholder="2200.00" />
          </Field>

          <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[13px] text-slate-600 dark:text-slate-400 font-semibold">Net Payable:</span>
            <span className="text-[16px] text-emerald-700 dark:text-emerald-400 font-mono font-extrabold">₹{preview.net.toLocaleString('en-IN')}</span>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Purchase Order</Button>
          </div>
        </form>
      </Modal>

      {/* View Purchase Modal */}
      <Modal open={!!viewPurchase} onClose={() => setViewPurchase(null)} title={`Purchase Order · ${viewPurchase?.purchase_no || ''}`} wide>
        {viewPurchase && (
          <div className="space-y-4 text-slate-900 dark:text-slate-100">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold block">Purchase Voucher</span>
                <span className="font-mono text-blue-700 dark:text-sky-400 font-bold">{viewPurchase.purchase_no}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold block">Farmer Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewPurchase.farmer_name}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold block">Produce Variety</span>
                <span className="text-slate-900 dark:text-slate-200 font-medium">{viewPurchase.produce_variety_name}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold block">Status</span>
                <Badge tone={statusTone[viewPurchase.status]}>{viewPurchase.status}</Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
