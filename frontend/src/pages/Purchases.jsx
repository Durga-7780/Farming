import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, ShoppingCart, Check, X as XIcon } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import { Field, inputClass, Button, EmptyState, Badge } from '../components/ui.jsx'

const emptyForm = {
  farmer_id: '', produce_variety_id: '', vehicle_id: '', driver_id: '',
  quantity: '', weight_kg: '', rate_per_unit: '', quality_grade: '',
  commission_amount: '0', additional_charges: '0', discount: '0', notes: ''
}

const statusTone = { pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default', draft: 'default' }

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [farmers, setFarmers] = useState([])
  const [varieties, setVarieties] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setLoading(true)
    const { data } = await api.get('/api/purchases')
    setPurchases(data)
    setLoading(false)
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

  async function approve(id) { await api.post(`/api/purchases/${id}/approve`); load() }
  async function cancel(id) { await api.delete(`/api/purchases/${id}`); load() }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-800 text-[22px] text-ink">Purchases</h1>
          <p className="text-muted text-[13.5px] mt-0.5">Record procurement from farmers</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus size={16} /> New purchase</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-surface rounded-lg animate-pulse border border-line/60" />)}</div>
      ) : purchases.length === 0 ? (
        <div className="bg-surface rounded-card border border-line/60">
          <EmptyState icon={ShoppingCart} title="No purchases yet" subtitle="Record your first purchase from a farmer." action={<Button variant="accent" onClick={openCreate}><Plus size={15} /> New purchase</Button>} />
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-line/60 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted border-b border-line/60">
                <th className="px-4 py-3 font-medium">No.</th>
                <th className="px-4 py-3 font-medium">Farmer</th>
                <th className="px-4 py-3 font-medium">Variety</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Rate</th>
                <th className="px-4 py-3 font-medium text-right">Net payable</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-line/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{p.purchase_no}</td>
                  <td className="px-4 py-3">{p.farmer_name}</td>
                  <td className="px-4 py-3">{p.produce_variety_name}</td>
                  <td className="px-4 py-3 text-right font-mono">{p.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{p.rate_per_unit}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">₹{p.net_payable.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[p.status]}>{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    {p.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => approve(p.id)} className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success hover:text-white transition-colors" title="Approve"><Check size={13} /></button>
                        <button onClick={() => cancel(p.id)} className="p-1.5 rounded-md bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors" title="Cancel"><XIcon size={13} /></button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New purchase" wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Farmer">
            <select required className={inputClass} value={form.farmer_id} onChange={(e) => setForm({ ...form, farmer_id: e.target.value })}>
              <option value="">Select farmer</option>
              {farmers.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
            </select>
          </Field>
          <Field label="Produce variety">
            <select required className={inputClass} value={form.produce_variety_id} onChange={(e) => setForm({ ...form, produce_variety_id: e.target.value })}>
              <option value="">Select variety</option>
              {varieties.map((v) => <option key={v.id} value={v.id}>{v.name_en}</option>)}
            </select>
          </Field>
          <Field label="Vehicle (optional)">
            <select className={inputClass} value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">—</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.number_plate}</option>)}
            </select>
          </Field>
          <Field label="Driver (optional)">
            <select className={inputClass} value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
              <option value="">—</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Quantity (quintal)">
            <input required type="number" step="0.01" className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" step="0.01" className={inputClass} value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
          </Field>
          <Field label="Rate per unit (₹)">
            <input required type="number" step="0.01" className={inputClass} value={form.rate_per_unit} onChange={(e) => setForm({ ...form, rate_per_unit: e.target.value })} />
          </Field>
          <Field label="Quality grade">
            <input className={inputClass} value={form.quality_grade} onChange={(e) => setForm({ ...form, quality_grade: e.target.value })} />
          </Field>
          <Field label="Commission (₹)">
            <input type="number" step="0.01" className={inputClass} value={form.commission_amount} onChange={(e) => setForm({ ...form, commission_amount: e.target.value })} />
          </Field>
          <Field label="Additional charges (₹)">
            <input type="number" step="0.01" className={inputClass} value={form.additional_charges} onChange={(e) => setForm({ ...form, additional_charges: e.target.value })} />
          </Field>
          <Field label="Discount (₹)">
            <input type="number" step="0.01" className={inputClass} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          </Field>
          <Field label="Notes">
            <input className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          <div className="sm:col-span-2 bg-primary-soft rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <span className="text-[12.5px] text-primary font-medium">Gross: ₹{preview.gross.toLocaleString('en-IN')}</span>
            <span className="text-[14px] text-primary font-mono font-bold">Net payable: ₹{preview.net.toLocaleString('en-IN')}</span>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">Save purchase</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
