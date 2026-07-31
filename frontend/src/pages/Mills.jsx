import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Factory, Phone, Pencil, BookOpen } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import { Field, inputClass, Button, EmptyState, Badge } from '../components/ui.jsx'

const emptyForm = { name: '', contact_person: '', mobile: '', gst_number: '', address: '', bank_account: '', bank_ifsc: '' }

export default function Mills() {
  const [mills, setMills] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [ledgerMill, setLedgerMill] = useState(null)
  const [ledgerData, setLedgerData] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await api.get('/api/mills', { params: { search: search || undefined } })
    setMills(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search])

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(m) { setEditing(m); setForm({ ...emptyForm, ...m }); setModalOpen(true) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editing) await api.put(`/api/mills/${editing.id}`, form)
    else await api.post('/api/mills', form)
    setModalOpen(false)
    load()
  }

  async function openLedger(m) {
    setLedgerMill(m)
    const { data } = await api.get(`/api/mills/${m.id}/ledger`)
    setLedgerData(data)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-800 text-[22px] text-ink">Mills</h1>
          <p className="text-muted text-[13.5px] mt-0.5">{mills.length} mill{mills.length !== 1 ? 's' : ''} on record</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus size={16} /> Add mill</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, mobile, or code" className={`${inputClass} pl-9`} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-surface rounded-card animate-pulse border border-line/60" />)}
        </div>
      ) : mills.length === 0 ? (
        <div className="bg-surface rounded-card border border-line/60">
          <EmptyState icon={Factory} title="No mills yet" subtitle="Add a mill to start recording sales." action={<Button variant="accent" onClick={openCreate}><Plus size={15} /> Add mill</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mills.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="bg-surface rounded-card shadow-card border border-line/60 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-display font-700 text-[15px] text-ink">{m.name}</h4>
                  <span className="text-[11px] font-mono text-muted">{m.code}</span>
                </div>
                <Badge tone={m.is_active ? 'success' : 'default'}>{m.is_active ? 'active' : 'inactive'}</Badge>
              </div>
              <div className="space-y-1 mb-3">
                {m.contact_person && <div className="text-[12.5px] text-muted">{m.contact_person}</div>}
                {m.mobile && <div className="flex items-center gap-1.5 text-[12.5px] text-muted"><Phone size={12} /> {m.mobile}</div>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 !py-2 text-[12.5px]" onClick={() => openEdit(m)}><Pencil size={13} /> Edit</Button>
                <Button variant="ghost" className="flex-1 !py-2 text-[12.5px]" onClick={() => openLedger(m)}><BookOpen size={13} /> Ledger</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit mill' : 'Add mill'} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mill name" className="sm:col-span-2">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Contact person">
            <input className={inputClass} value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          </Field>
          <Field label="Mobile number">
            <input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </Field>
          <Field label="GST number">
            <input className={inputClass} value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Bank account number">
            <input className={inputClass} value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} />
          </Field>
          <Field label="IFSC">
            <input className={inputClass} value={form.bank_ifsc} onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">{editing ? 'Save changes' : 'Add mill'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!ledgerMill} onClose={() => setLedgerMill(null)} title={`Ledger · ${ledgerMill?.name || ''}`} wide>
        {ledgerData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surfacealt rounded-lg p-3">
                <div className="text-[11px] text-muted">Sold</div>
                <div className="font-mono text-[15px] font-semibold">₹{ledgerData.total_sale_value.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-surfacealt rounded-lg p-3">
                <div className="text-[11px] text-muted">Collected</div>
                <div className="font-mono text-[15px] font-semibold">₹{ledgerData.total_collected.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-danger/10 rounded-lg p-3">
                <div className="text-[11px] text-danger">Outstanding</div>
                <div className="font-mono text-[15px] font-semibold text-danger">₹{ledgerData.outstanding.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
