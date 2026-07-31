import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Users, Phone, MapPin, Pencil, BookOpen, Wheat, X } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import { Field, inputClass, Button, EmptyState, Badge } from '../components/ui.jsx'

const emptyForm = {
  name: '', aadhar: '', mobile: '', produce_variety_id: '', no_of_bags: '',
  total_weight: '', mc_reading: '', cost: '', place: ''
}

export default function Farmers() {
  const [farmers, setFarmers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [varieties, setVarieties] = useState([])
  const [newVariety, setNewVariety] = useState('')
  const [showNewVariety, setShowNewVariety] = useState(false)
  const [ledgerFarmer, setLedgerFarmer] = useState(null)
  const [ledgerData, setLedgerData] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await api.get('/api/farmers', { params: { search: search || undefined } })
    setFarmers(data)
    setLoading(false)
  }

  async function loadVarieties() {
    const { data } = await api.get('/api/produce-varieties')
    setVarieties(data.filter(v => v.is_active))
  }

  useEffect(() => { load(); loadVarieties() }, [])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(f) {
    setEditing(f)
    setForm({
      name: f.name || '',
      aadhar: f.aadhar || '',
      mobile: f.mobile || '',
      produce_variety_id: f.produce_variety_id || '',
      no_of_bags: f.no_of_bags || '',
      total_weight: f.total_weight || '',
      mc_reading: f.mc_reading || '',
      cost: f.cost || '',
      place: f.place || ''
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      produce_variety_id: form.produce_variety_id ? Number(form.produce_variety_id) : null,
      no_of_bags: form.no_of_bags ? Number(form.no_of_bags) : 0,
      total_weight: form.total_weight ? Number(form.total_weight) : 0,
      mc_reading: form.mc_reading ? Number(form.mc_reading) : 0,
      cost: form.cost ? Number(form.cost) : 0,
    }
    if (editing) {
      await api.put(`/api/farmers/${editing.id}`, payload)
    } else {
      await api.post('/api/farmers', payload)
    }
    setModalOpen(false)
    load()
  }

  async function handleAddVariety() {
    if (!newVariety.trim()) return
    const { data } = await api.post('/api/produce-varieties', { name_en: newVariety.trim() })
    await loadVarieties()
    setForm({ ...form, produce_variety_id: data.id })
    setNewVariety('')
    setShowNewVariety(false)
  }

  async function openLedger(f) {
    setLedgerFarmer(f)
    const { data } = await api.get(`/api/farmers/${f.id}/ledger`)
    setLedgerData(data)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-800 text-[22px] text-ink">Farmers</h1>
          <p className="text-muted text-[13.5px] mt-0.5">{farmers.length} farmer{farmers.length !== 1 ? 's' : ''} on record</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus size={16} /> Add farmer</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, mobile, or code"
          className={`${inputClass} pl-9`}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-surface rounded-card animate-pulse border border-line/60" />
          ))}
        </div>
      ) : farmers.length === 0 ? (
        <div className="bg-surface rounded-card border border-line/60">
          <EmptyState
            icon={Users}
            title="No farmers yet"
            subtitle="Add your first farmer to start recording purchases against them."
            action={<Button variant="accent" onClick={openCreate}><Plus size={15} /> Add farmer</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmers.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="bg-surface rounded-card shadow-card border border-line/60 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-display font-700 text-[15px] text-ink">{f.name}</h4>
                  <span className="text-[11px] font-mono text-muted">{f.code}</span>
                </div>
                <Badge tone={f.is_active ? 'success' : 'default'}>{f.is_active ? 'active' : 'inactive'}</Badge>
              </div>
              <div className="space-y-1 mb-3">
                {f.mobile && (
                  <div className="flex items-center gap-1.5 text-[12.5px] text-muted"><Phone size={12} /> {f.mobile}</div>
                )}
                {f.place && (
                  <div className="flex items-center gap-1.5 text-[12.5px] text-muted"><MapPin size={12} /> {f.place}</div>
                )}
                {f.produce_variety_name && (
                  <div className="flex items-center gap-1.5 text-[12.5px] text-muted"><Wheat size={12} /> {f.produce_variety_name}</div>
                )}
                {(f.no_of_bags > 0 || f.total_weight > 0) && (
                  <div className="flex items-center gap-3 text-[12.5px] text-muted">
                    {f.no_of_bags > 0 && <span>{f.no_of_bags} bags</span>}
                    {f.total_weight > 0 && <span>{f.total_weight} kg</span>}
                    {f.mc_reading > 0 && <span>MC: {f.mc_reading}</span>}
                    {f.cost > 0 && <span>₹{f.cost}</span>}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 !py-2 text-[12.5px]" onClick={() => openEdit(f)}>
                  <Pencil size={13} /> Edit
                </Button>
                <Button variant="ghost" className="flex-1 !py-2 text-[12.5px]" onClick={() => openLedger(f)}>
                  <BookOpen size={13} /> Ledger
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit farmer' : 'Add farmer'} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Farmer name" className="sm:col-span-2">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Aadhar (optional)">
            <input className={inputClass} value={form.aadhar} onChange={(e) => setForm({ ...form, aadhar: e.target.value })} placeholder="xxxx xxxx xxxx" />
          </Field>
          <Field label="Mobile number">
            <input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </Field>
          <Field label="Variety" className="sm:col-span-2">
            <div className="flex gap-2">
              <select
                className={`${inputClass} flex-1`}
                value={form.produce_variety_id}
                onChange={(e) => setForm({ ...form, produce_variety_id: e.target.value })}
              >
                <option value="">Select variety</option>
                {varieties.map(v => (
                  <option key={v.id} value={v.id}>{v.name_en}</option>
                ))}
              </select>
              <Button type="button" variant="ghost" onClick={() => setShowNewVariety(!showNewVariety)} className="shrink-0">
                <Plus size={15} />
              </Button>
            </div>
            {showNewVariety && (
              <div className="flex gap-2 mt-2">
                <input
                  className={`${inputClass} flex-1`}
                  placeholder="New variety name"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariety())}
                />
                <Button type="button" variant="accent" onClick={handleAddVariety} className="shrink-0">Add</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowNewVariety(false); setNewVariety('') }} className="shrink-0">
                  <X size={15} />
                </Button>
              </div>
            )}
          </Field>
          <Field label="No. of bags">
            <input type="number" className={inputClass} value={form.no_of_bags} onChange={(e) => setForm({ ...form, no_of_bags: e.target.value })} />
          </Field>
          <Field label="Total weight (kg)">
            <input type="number" step="0.01" className={inputClass} value={form.total_weight} onChange={(e) => setForm({ ...form, total_weight: e.target.value })} />
          </Field>
          <Field label="MC reading">
            <input type="number" step="0.01" className={inputClass} value={form.mc_reading} onChange={(e) => setForm({ ...form, mc_reading: e.target.value })} />
          </Field>
          <Field label="Place">
            <input className={inputClass} value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
          </Field>
          <Field label="Cost (₹)">
            <input type="number" step="0.01" className={inputClass} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">{editing ? 'Save changes' : 'Add farmer'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!ledgerFarmer} onClose={() => setLedgerFarmer(null)} title={`Ledger · ${ledgerFarmer?.name || ''}`} wide>
        {ledgerData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surfacealt rounded-lg p-3">
                <div className="text-[11px] text-muted">Purchased</div>
                <div className="font-mono text-[15px] font-semibold">₹{ledgerData.total_purchase_value.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-surfacealt rounded-lg p-3">
                <div className="text-[11px] text-muted">Paid</div>
                <div className="font-mono text-[15px] font-semibold">₹{ledgerData.total_paid.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-danger/10 rounded-lg p-3">
                <div className="text-[11px] text-danger">Outstanding</div>
                <div className="font-mono text-[15px] font-semibold text-danger">₹{ledgerData.outstanding.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div>
              <h5 className="text-[12.5px] font-medium text-muted mb-2">Purchases</h5>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {ledgerData.purchases.length === 0 && <p className="text-[12.5px] text-muted">None yet</p>}
                {ledgerData.purchases.map((p) => (
                  <div key={p.id} className="flex justify-between text-[12.5px] py-1 border-b border-line/60">
                    <span className="font-mono">{p.purchase_no}</span>
                    <span>₹{p.net_payable.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
