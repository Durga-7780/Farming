import React, { useEffect, useState } from 'react'
import { Plus, Truck, Check, Eye, UserCheck, ShieldCheck, MapPin, Wheat } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'

const emptyForm = {
  farmer_id: '', mill_id: '', dispatch_bags: '', dispatch_weight: '',
  cost: '', mc_reading: '', vehicle_weight: '', vehicle_type: 'lorry',
  vehicle_number: '', driver_name: '', signature_role: 'Manager', notes: ''
}

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Dispatch() {
  const [dispatches, setDispatches] = useState([])
  const [farmers, setFarmers] = useState([])
  const [mills, setMills] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewPass, setViewPass] = useState(null)
  const [unloadModal, setUnloadModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [unloadForm, setUnloadForm] = useState({ mill_mc: '', mill_weight: '', mill_cost: '' })

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/dispatches')
      setDispatches(data)
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

  function handleFarmerChange(farmerId) {
    const f = farmers.find((item) => item.id === Number(farmerId))
    if (f) {
      setForm({
        ...form,
        farmer_id: farmerId,
        dispatch_bags: f.no_of_bags || '',
        dispatch_weight: f.total_weight || '',
        cost: f.cost || '',
        mc_reading: f.mc_reading || ''
      })
    } else {
      setForm({ ...form, farmer_id: farmerId })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await api.post('/api/dispatches', {
      ...form,
      farmer_id: Number(form.farmer_id),
      mill_id: Number(form.mill_id),
      dispatch_bags: Number(form.dispatch_bags) || 0,
      dispatch_weight: parseFloat(form.dispatch_weight) || 0,
      cost: parseFloat(form.cost) || 0,
      mc_reading: parseFloat(form.mc_reading) || 0,
      vehicle_weight: parseFloat(form.vehicle_weight) || 0,
    })
    setModalOpen(false)
    load()
  }

  async function handleUnloadSubmit(e) {
    e.preventDefault()
    if (!unloadModal) return
    await api.post(`/api/dispatches/${unloadModal.id}/unload`, {
      mill_mc: parseFloat(unloadForm.mill_mc) || 0,
      mill_weight: parseFloat(unloadForm.mill_weight) || 0,
      mill_cost: parseFloat(unloadForm.mill_cost) || 0,
    })
    setUnloadModal(null)
    load()
  }

  const columns = [
    {
      key: 'dispatch_bill_no',
      label: 'Pass No.',
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
      key: 'mill_name',
      label: 'Target Rice Mill',
      sortable: true,
      render: (val) => <span className="font-bold text-indigo-700 dark:text-indigo-400">{val || '—'}</span>
    },
    {
      key: 'dispatch_bags',
      label: 'Bags',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-900 dark:text-white font-extrabold">{val || 0}</span>
    },
    {
      key: 'dispatch_weight',
      label: 'Weight (qtl)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'cost',
      label: 'Dispatch Value (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{fmt(val)}</span>
    },
    {
      key: 'is_unloaded',
      label: 'Mill Status',
      sortable: true,
      align: 'center',
      render: (val) => (
        <Badge tone={val ? 'success' : 'warning'} size="sm">
          {val ? 'Unloaded' : 'In Transit'}
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
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setViewPass(row) }}>
            <Eye size={13} /> View
          </Button>
          {!row.is_unloaded && (
            <Button
              variant="accent"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setUnloadModal(row)
                setUnloadForm({
                  mill_mc: row.mc_reading || '',
                  mill_weight: row.dispatch_weight || '',
                  mill_cost: row.cost || ''
                })
              }}
            >
              <Check size={13} /> Unload
            </Button>
          )}
        </div>
      )
    }
  ]

  const farmerOptions = Array.from(new Set(dispatches.map((d) => d.farmer_name).filter(Boolean)))
  const millOptions = Array.from(new Set(dispatches.map((d) => d.mill_name).filter(Boolean)))

  const filterFields = [
    { key: 'farmer_name', label: 'Farmer Name', type: 'select', options: farmerOptions },
    { key: 'mill_name', label: 'Target Mill', type: 'select', options: millOptions },
    { key: 'is_unloaded', label: 'Mill Unloaded', type: 'boolean' },
    { key: 'vehicle_number', label: 'Vehicle Number', type: 'search' },
    { key: 'dispatch_bags', label: 'Min Bags', type: 'min' },
    { key: 'cost', label: 'Min Value (₹)', type: 'min' }
  ]

  const cardRender = (d) => (
    <div
      key={d.id}
      onClick={() => setViewPass(d)}
      className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-blue-600 dark:text-sky-400 font-bold text-[13px]">{d.dispatch_bill_no}</span>
          <h4 className="font-display font-700 text-[15px] text-slate-900 dark:text-white">{d.farmer_name}</h4>
        </div>
        <Badge tone={d.is_unloaded ? 'success' : 'warning'}>{d.is_unloaded ? 'Unloaded' : 'In Transit'}</Badge>
      </div>

      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800">
        <div><span className="text-slate-500 dark:text-slate-400">Mill: </span><span className="font-semibold text-indigo-700 dark:text-indigo-400">{d.mill_name}</span></div>
        <div><span className="text-slate-500 dark:text-slate-400">Bags: </span><span className="font-mono font-bold text-slate-900 dark:text-white">{d.dispatch_bags} ({d.dispatch_weight} qtl)</span></div>
        <div><span className="text-slate-500 dark:text-slate-400">Vehicle: </span><span className="font-mono text-slate-800 dark:text-slate-200">{d.vehicle_number || 'N/A'}</span></div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-[15px]">{fmt(d.cost)}</span>
        <Button variant="ghost" size="sm" onClick={() => setViewPass(d)}>
          <Eye size={14} /> Pass Details
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title="Mill Dispatch Gate Passes"
        subtitle={`${dispatches.length} gate pass dispatches issued for mill transport`}
        columns={columns}
        data={dispatches}
        searchKeys={['dispatch_bill_no', 'farmer_name', 'mill_name', 'vehicle_number', 'driver_name']}
        filterFields={filterFields}
        defaultSortKey="dispatch_bill_no"
        defaultSortOrder="desc"
        onRowClick={(d) => setViewPass(d)}
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={() => { setForm(emptyForm); setModalOpen(true) }}>
            <Plus size={16} /> Issue New Dispatch Pass
          </Button>
        }
      />

      {/* New Dispatch Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Issue Mill Dispatch Gate Pass" wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
          <Field label="Select Farmer *">
            <select required className={inputClass} value={form.farmer_id} onChange={(e) => handleFarmerChange(e.target.value)}>
              <option value="">Select Farmer</option>
              {farmers.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code}) - {f.village}</option>)}
            </select>
          </Field>
          <Field label="Target Rice Mill *">
            <select required className={inputClass} value={form.mill_id} onChange={(e) => setForm({ ...form, mill_id: e.target.value })}>
              <option value="">Select Mill</option>
              {mills.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </Field>
          <Field label="Dispatch Bags *">
            <input required type="number" className={inputClass} value={form.dispatch_bags} onChange={(e) => setForm({ ...form, dispatch_bags: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Dispatch Weight (Quintals) *">
            <input required type="number" step="0.01" className={inputClass} value={form.dispatch_weight} onChange={(e) => setForm({ ...form, dispatch_weight: e.target.value })} placeholder="0.00" />
          </Field>
          <Field label="Dispatch Total Cost (₹) *">
            <input required type="number" step="0.01" className={inputClass} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0.00" />
          </Field>
          <Field label="Moisture Content (MC %)">
            <input type="number" step="0.1" className={inputClass} value={form.mc_reading} onChange={(e) => setForm({ ...form, mc_reading: e.target.value })} placeholder="14.0" />
          </Field>
          <Field label="Vehicle Number">
            <input className={inputClass} value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} placeholder="AP 07 TH 4521" />
          </Field>
          <Field label="Driver Name">
            <input className={inputClass} value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} placeholder="K. Nageswara Rao" />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Generate Gate Pass</Button>
          </div>
        </form>
      </Modal>

      {/* Unload Modal */}
      <Modal open={!!unloadModal} onClose={() => setUnloadModal(null)} title={`Confirm Mill Unloading · ${unloadModal?.dispatch_bill_no || ''}`}>
        <form onSubmit={handleUnloadSubmit} className="space-y-4 text-slate-900 dark:text-slate-100">
          <Field label="Mill Moisture Reading (MC %)">
            <input type="number" step="0.1" className={inputClass} value={unloadForm.mill_mc} onChange={(e) => setUnloadForm({ ...unloadForm, mill_mc: e.target.value })} />
          </Field>
          <Field label="Mill Verified Weight (Quintals)">
            <input type="number" step="0.01" className={inputClass} value={unloadForm.mill_weight} onChange={(e) => setUnloadForm({ ...unloadForm, mill_weight: e.target.value })} />
          </Field>
          <Field label="Mill Settlement Cost (₹)">
            <input type="number" step="0.01" className={inputClass} value={unloadForm.mill_cost} onChange={(e) => setUnloadForm({ ...unloadForm, mill_cost: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setUnloadModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Unloading</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
