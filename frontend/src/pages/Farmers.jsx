import React, { useEffect, useState } from 'react'
import { Plus, Users, Phone, MapPin, Pencil, BookOpen, Wheat, X, CheckCircle, Shield } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const emptyForm = {
  name: '', aadhar: '', mobile: '', produce_variety_id: '', no_of_bags: '',
  total_weight: '', mc_reading: '', cost: '', place: '', village: '', mandal: '', district: ''
}

export default function Farmers() {
  const [farmers, setFarmers] = useState([])
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
    try {
      const { data } = await api.get('/api/farmers')
      setFarmers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadVarieties() {
    try {
      const { data } = await api.get('/api/produce-varieties')
      setVarieties(data.filter((v) => v.is_active))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
    loadVarieties()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(f, e) {
    if (e) e.stopPropagation()
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
      place: f.place || '',
      village: f.village || '',
      mandal: f.mandal || '',
      district: f.district || ''
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

  async function openLedger(f, e) {
    if (e) e.stopPropagation()
    setLedgerFarmer(f)
    try {
      const { data } = await api.get(`/api/farmers/${f.id}/ledger`)
      setLedgerData(data)
    } catch (err) {
      console.error(err)
    }
  }

  const varietyOptions = Array.from(new Set(farmers.map((f) => f.produce_variety_name).filter(Boolean)))
  const districtOptions = Array.from(new Set(farmers.map((f) => f.district).filter(Boolean)))

  const columns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold">{val || '—'}</span>
    },
    {
      key: 'name',
      label: 'Farmer Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-sky-400 font-bold flex items-center justify-center text-xs shrink-0">
            {val?.[0] || 'F'}
          </div>
          <div>
            <div className="font-bold text-slate-950 dark:text-white text-[14px]">{val}</div>
            {row.aadhar && <div className="text-[11.5px] text-slate-600 dark:text-slate-400 font-mono">Aadhaar: {row.aadhar}</div>}
          </div>
        </div>
      )
    },
    {
      key: 'mobile',
      label: 'Contact',
      sortable: true,
      render: (val) => (
        val ? (
          <a href={`tel:${val}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 hover:text-blue-700 dark:hover:text-sky-400 transition-colors font-mono">
            <Phone size={13} className="text-blue-600 dark:text-sky-400" />
            <span>{val}</span>
          </a>
        ) : <span className="text-slate-400">—</span>
      )
    },
    {
      key: 'location',
      label: 'Location / Address',
      sortable: true,
      render: (_, row) => (
        <div className="text-[12.5px] text-slate-800 dark:text-slate-200">
          <div className="font-bold text-slate-900 dark:text-white">{row.village || row.place || '—'}</div>
          {(row.mandal || row.district) && (
            <div className="text-slate-600 dark:text-slate-400 text-[11.5px] font-medium flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-slate-500 dark:text-slate-400" />
              <span>{[row.mandal, row.district].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'produce_variety_name',
      label: 'Produce Variety',
      sortable: true,
      render: (val) => (
        val ? (
          <Badge tone="info" size="sm">
            <Wheat size={11} /> {val}
          </Badge>
        ) : <span className="text-slate-400">—</span>
      )
    },
    {
      key: 'no_of_bags',
      label: 'Bags',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-900 dark:text-white font-extrabold">{val ? val.toLocaleString() : '0'}</span>
    },
    {
      key: 'total_weight',
      label: 'Weight (qtl)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'mc_reading',
      label: 'Moisture (MC)',
      sortable: true,
      align: 'right',
      render: (val) => (
        val ? (
          <span className={`font-mono text-[12px] font-bold px-2 py-0.5 rounded ${val > 16 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700'}`}>
            {val}%
          </span>
        ) : <span className="text-slate-400">—</span>
      )
    },
    {
      key: 'cost',
      label: 'Total Cost',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold text-[14px]">{fmt(val)}</span>
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (val) => (
        <Badge tone={val ? 'success' : 'default'} size="sm">
          {val ? 'Active' : 'Inactive'}
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
          <Button variant="ghost" size="sm" onClick={(e) => openEdit(row, e)} title="Edit Farmer">
            <Pencil size={13} />
          </Button>
          <Button variant="accent" size="sm" onClick={(e) => openLedger(row, e)} title="View Ledger">
            <BookOpen size={13} /> <span className="hidden lg:inline">Ledger</span>
          </Button>
        </div>
      )
    }
  ]

  // Expanded Rich Filters
  const filterFields = [
    {
      key: 'produce_variety_name',
      label: 'Produce Variety',
      type: 'select',
      options: varietyOptions
    },
    {
      key: 'district',
      label: 'District',
      type: 'select',
      options: districtOptions
    },
    {
      key: 'mandal',
      label: 'Mandal Search',
      type: 'search'
    },
    {
      key: 'village',
      label: 'Village / Town',
      type: 'search'
    },
    {
      key: 'is_active',
      label: 'Active Status',
      type: 'boolean'
    },
    {
      key: 'no_of_bags',
      label: 'Min Bags',
      type: 'min',
      placeholder: 'Min bags count'
    },
    {
      key: 'total_weight',
      label: 'Min Weight (qtl)',
      type: 'min',
      placeholder: 'Min weight'
    },
    {
      key: 'cost',
      label: 'Min Cost (₹)',
      type: 'min',
      placeholder: 'Min cost'
    }
  ]

  const cardRender = (f) => (
    <div
      key={f.id}
      onClick={() => openLedger(f)}
      className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-display font-700 text-[16px] text-slate-900 dark:text-white">{f.name}</h4>
          <span className="text-[12px] font-mono text-blue-600 dark:text-sky-400 font-bold">{f.code}</span>
        </div>
        <Badge tone={f.is_active ? 'success' : 'default'}>{f.is_active ? 'Active' : 'Inactive'}</Badge>
      </div>

      <div className="space-y-1.5 text-[13px] text-slate-700 dark:text-slate-300 border-y border-slate-100 dark:border-slate-800 py-2.5">
        {f.mobile && (
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold">
            <Phone size={14} className="text-blue-600 dark:text-sky-400" /> {f.mobile}
          </div>
        )}
        {(f.village || f.district) && (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <MapPin size={14} className="text-indigo-600 dark:text-indigo-400" /> {[f.village, f.district].filter(Boolean).join(', ')}
          </div>
        )}
        {f.produce_variety_name && (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Wheat size={14} className="text-amber-600 dark:text-amber-400" /> {f.produce_variety_name}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[12.5px]">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Total Bags: </span>
          <span className="font-mono text-slate-900 dark:text-white font-bold">{f.no_of_bags || 0}</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Value: </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{fmt(f.cost)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="ghost" className="flex-1 !py-2 text-[12.5px]" onClick={(e) => openEdit(f, e)}>
          <Pencil size={13} /> Edit
        </Button>
        <Button variant="accent" className="flex-1 !py-2 text-[12.5px]" onClick={(e) => openLedger(f, e)}>
          <BookOpen size={13} /> Ledger
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title="Farmer Directory & Ledger"
        subtitle={`${farmers.length} active registered farmers across districts`}
        columns={columns}
        data={farmers}
        searchKeys={['name', 'code', 'mobile', 'aadhar', 'village', 'mandal', 'district', 'produce_variety_name']}
        filterFields={filterFields}
        defaultSortKey="code"
        defaultSortOrder="asc"
        onRowClick={(farmer) => openLedger(farmer)}
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> Add Farmer
          </Button>
        }
      />

      {/* Add / Edit Farmer Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Farmer Details' : 'Register New Farmer'} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
          <Field label="Farmer Full Name *" className="sm:col-span-2">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Venkateswara Rao" />
          </Field>
          <Field label="Aadhaar Number (12 digits)">
            <input className={inputClass} value={form.aadhar} onChange={(e) => setForm({ ...form, aadhar: e.target.value })} placeholder="xxxx xxxx xxxx" />
          </Field>
          <Field label="Mobile Number">
            <input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="9848012345" />
          </Field>

          <Field label="Produce Variety" className="sm:col-span-2">
            <div className="flex gap-2">
              <select
                className={`${inputClass} flex-1`}
                value={form.produce_variety_id}
                onChange={(e) => setForm({ ...form, produce_variety_id: e.target.value })}
              >
                <option value="">Select Variety</option>
                {varieties.map((v) => (
                  <option key={v.id} value={v.id}>{v.name_en} ({v.category})</option>
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

          <Field label="Village / Town">
            <input className={inputClass} value={form.village || form.place} onChange={(e) => setForm({ ...form, village: e.target.value, place: e.target.value })} placeholder="e.g. Angalakuduru" />
          </Field>
          <Field label="Mandal">
            <input className={inputClass} value={form.mandal} onChange={(e) => setForm({ ...form, mandal: e.target.value })} placeholder="e.g. Tenali Mandal" />
          </Field>
          <Field label="District">
            <input className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Guntur" />
          </Field>

          <Field label="No. of Bags">
            <input type="number" className={inputClass} value={form.no_of_bags} onChange={(e) => setForm({ ...form, no_of_bags: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Total Weight (Quintals)">
            <input type="number" step="0.01" className={inputClass} value={form.total_weight} onChange={(e) => setForm({ ...form, total_weight: e.target.value })} placeholder="0.00" />
          </Field>
          <Field label="Moisture Content (MC %)">
            <input type="number" step="0.1" className={inputClass} value={form.mc_reading} onChange={(e) => setForm({ ...form, mc_reading: e.target.value })} placeholder="14.0" />
          </Field>
          <Field label="Total Estimated Cost (₹)" className="sm:col-span-2">
            <input type="number" step="0.01" className={inputClass} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0.00" />
          </Field>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editing ? 'Save Changes' : 'Register Farmer'}</Button>
          </div>
        </form>
      </Modal>

      {/* Farmer Ledger Modal */}
      <Modal open={!!ledgerFarmer} onClose={() => setLedgerFarmer(null)} title={`Farmer Ledger Statement · ${ledgerFarmer?.name || ''}`} wide>
        {ledgerData && (
          <div className="space-y-5 text-slate-900 dark:text-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[12px] text-slate-600 dark:text-slate-400 font-semibold">Total Purchase Value</div>
                <div className="font-mono text-[18px] font-extrabold text-blue-700 dark:text-sky-400 mt-1">₹{ledgerData.total_purchase_value.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[12px] text-slate-600 dark:text-slate-400 font-semibold">Total Paid Amount</div>
                <div className="font-mono text-[18px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">₹{ledgerData.total_paid.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-900">
                <div className="text-[12px] text-rose-700 dark:text-rose-400 font-semibold">Outstanding Balance</div>
                <div className="font-mono text-[18px] font-extrabold text-rose-700 dark:text-rose-400 mt-1">₹{ledgerData.outstanding.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
