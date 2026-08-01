import React, { useEffect, useState } from 'react'
import { Plus, Truck, Check, Eye, UserCheck, ShieldCheck, MapPin, Wheat, Edit2 } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const emptyForm = {
  farmer_id: '', mill_id: '', dispatch_bags: '', dispatch_weight: '',
  cost: '', mc_reading: '', vehicle_weight: '', vehicle_type: 'lorry',
  vehicle_number: '', driver_name: '', signature_role: 'Manager', notes: ''
}

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Dispatch() {
  const { t } = useLanguage()
  const [dispatches, setDispatches] = useState([])
  const [farmers, setFarmers] = useState([])
  const [mills, setMills] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
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
    const payload = {
      ...form,
      farmer_id: Number(form.farmer_id),
      mill_id: Number(form.mill_id),
      dispatch_bags: Number(form.dispatch_bags) || 0,
      dispatch_weight: parseFloat(form.dispatch_weight) || 0,
      cost: parseFloat(form.cost) || 0,
      mc_reading: parseFloat(form.mc_reading) || 0,
      vehicle_weight: parseFloat(form.vehicle_weight) || 0,
    }
    
    if (editing) {
      await api.put(`/api/dispatches/${editing}`, payload)
    } else {
      await api.post('/api/dispatches', payload)
    }
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
      label: t('gate_pass_no'),
      sortable: true,
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold">{val}</span>
    },
    {
      key: 'farmer_name',
      label: t('farmer'),
      sortable: true,
      render: (val) => <span className="font-extrabold text-slate-950 dark:text-white">{t(val) || '—'}</span>
    },
    {
      key: 'mill_name',
      label: t('target_mill_col'),
      sortable: true,
      render: (val) => <span className="font-extrabold text-indigo-700 dark:text-indigo-400">{t(val) || '—'}</span>
    },
    {
      key: 'dispatch_bags',
      label: t('bags'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-900 dark:text-white font-extrabold">{val || 0}</span>
    },
    {
      key: 'dispatch_weight',
      label: t('weight_qtl'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'cost',
      label: t('amount'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{fmt(val)}</span>
    },
    {
      key: 'is_unloaded',
      label: t('status'),
      sortable: true,
      align: 'center',
      render: (val) => (
        <Badge tone={val ? 'success' : 'warning'} size="sm">
          {val ? t('unloaded') : t('in_transit')}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: t('actions'),
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setForm(row); setEditing(row.id); setModalOpen(true); }}>
            <Edit2 size={13} /> {t('edit') || 'Edit'}
          </Button>
          {!row.is_unloaded && (
            <Button variant="accent" size="sm" onClick={(e) => { e.stopPropagation(); setUnloadModal(row) }}>
              Unload
            </Button>
          )}
        </div>
      )
    }
  ]

  const cardRender = (d) => (
    <div key={d.id} onClick={() => setViewPass(d)} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-blue-600 dark:text-sky-400 font-bold text-[12px]">{d.dispatch_bill_no}</span>
          <h4 className="font-display font-800 text-[16px] text-slate-950 dark:text-white">{t(d.farmer_name)}</h4>
          <span className="text-[12.5px] text-indigo-600 dark:text-indigo-400 font-bold">&rarr; {t(d.mill_name)}</span>
        </div>
        <Badge tone={d.is_unloaded ? 'success' : 'warning'}>{d.is_unloaded ? t('unloaded') : t('in_transit')}</Badge>
      </div>
      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800 font-mono">
        <div><span className="text-slate-500 font-sans">Bags: </span><span className="font-bold text-slate-900 dark:text-white">{d.dispatch_bags}</span></div>
        <div><span className="text-slate-500 font-sans">Weight: </span><span className="font-bold text-emerald-600 dark:text-emerald-400">{d.dispatch_weight} qtl</span></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-[15px]">{fmt(d.cost)}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setForm(d); setEditing(d.id); setModalOpen(true); }}>
            <Edit2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title={t('dispatch_title')}
        subtitle={t('dispatch_sub')}
        columns={columns}
        data={dispatches}
        searchKeys={['dispatch_bill_no', 'farmer_name', 'mill_name', 'vehicle_number', 'driver_name']}
        defaultSortKey="dispatch_bill_no"
        defaultSortOrder="desc"
        onRowClick={(d) => setViewPass(d)}
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={() => { setForm(emptyForm); setEditing(false); setModalOpen(true) }}>
            <Plus size={16} /> {t('new_dispatch_pass')}
          </Button>
        }
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('edit_dispatch_pass') || 'Edit Dispatch Pass' : t('new_dispatch_pass')} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
          <Field label={t('farmer_req') || 'Farmer *'}>
            <select required className={inputClass} value={form.farmer_id} onChange={(e) => handleFarmerChange(e.target.value)}>
              <option value="">{t('select_farmer') || 'Select Farmer'}</option>
              {farmers.map(f => (
                <option key={f.id} value={f.id}>{t(f.name)} - {f.village}</option>
              ))}
            </select>
          </Field>
          <Field label={t('mill_req') || 'Mill *'}>
            <select required className={inputClass} value={form.mill_id} onChange={(e) => setForm({ ...form, mill_id: e.target.value })}>
              <option value="">{t('select_mill') || 'Select Mill'}</option>
              {mills.map(m => (
                <option key={m.id} value={m.id}>{t(m.name)} - {m.address}</option>
              ))}
            </select>
          </Field>
          <Field label={t('dispatch_bags') || 'Dispatch Bags'}>
            <input type="number" required className={inputClass} value={form.dispatch_bags} onChange={(e) => setForm({ ...form, dispatch_bags: e.target.value })} />
          </Field>
          <Field label={t('dispatch_weight') || 'Dispatch Weight (qtl)'}>
            <input type="number" step="0.01" required className={inputClass} value={form.dispatch_weight} onChange={(e) => setForm({ ...form, dispatch_weight: e.target.value })} />
          </Field>
          <Field label={t('cost') || 'Cost (₹)'}>
            <input type="number" step="0.01" required className={inputClass} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </Field>
          <Field label={t('mc_reading') || 'MC Reading'}>
            <input type="number" step="0.01" className={inputClass} value={form.mc_reading} onChange={(e) => setForm({ ...form, mc_reading: e.target.value })} />
          </Field>
          <Field label={t('vehicle_type') || 'Vehicle Type'}>
            <select className={inputClass} value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
              <option value="lorry">Lorry</option>
              <option value="tractor">Tractor</option>
            </select>
          </Field>
          <Field label={t('vehicle_number') || 'Vehicle Number'}>
            <input className={inputClass} value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
          </Field>
          <Field label={t('driver_name') || 'Driver Name'}>
            <input className={inputClass} value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} />
          </Field>
          <Field label={t('signature_role') || 'Signature Role'}>
            <input className={inputClass} value={form.signature_role} onChange={(e) => setForm({ ...form, signature_role: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>{t('cancel')}</Button>
            <Button variant="primary" type="submit">{editing ? t('save_changes') || 'Save Changes' : t('new_dispatch_pass')}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!unloadModal} onClose={() => setUnloadModal(null)} title={t('unload_mill') || 'Unload at Mill'}>
        <form onSubmit={handleUnloadSubmit} className="space-y-4 text-slate-900 dark:text-slate-100">
          <Field label={t('mill_mc') || 'Mill MC'}>
            <input type="number" step="0.01" className={inputClass} value={unloadForm.mill_mc} onChange={(e) => setUnloadForm({ ...unloadForm, mill_mc: e.target.value })} />
          </Field>
          <Field label={t('mill_weight') || 'Mill Weight (qtl)'}>
            <input type="number" step="0.01" className={inputClass} value={unloadForm.mill_weight} onChange={(e) => setUnloadForm({ ...unloadForm, mill_weight: e.target.value })} />
          </Field>
          <Field label={t('mill_cost') || 'Mill Cost (₹)'}>
            <input type="number" step="0.01" className={inputClass} value={unloadForm.mill_cost} onChange={(e) => setUnloadForm({ ...unloadForm, mill_cost: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setUnloadModal(null)}>{t('cancel')}</Button>
            <Button variant="accent" type="submit">{t('unload') || 'Unload'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewPass} onClose={() => setViewPass(null)} title={t('dispatch_details') || 'Dispatch Details'}>
        {viewPass && (
          <div className="space-y-4 text-[14px] text-slate-900 dark:text-slate-100">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div>
                <span className="text-slate-500 block text-[12px]">{t('gate_pass_no')}</span>
                <span className="font-bold">{viewPass.dispatch_bill_no}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[12px]">{t('farmer')}</span>
                <span className="font-bold">{t(viewPass.farmer_name)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[12px]">{t('mill')}</span>
                <span className="font-bold">{t(viewPass.mill_name)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[12px]">{t('status')}</span>
                <Badge tone={viewPass.is_unloaded ? 'success' : 'warning'}>{viewPass.is_unloaded ? t('unloaded') : t('in_transit')}</Badge>
              </div>
              <div>
                <span className="text-slate-500 block text-[12px]">{t('dispatch_bags')}</span>
                <span className="font-bold">{viewPass.dispatch_bags}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[12px]">{t('dispatch_weight')}</span>
                <span className="font-bold">{viewPass.dispatch_weight} qtl</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[12px]">{t('vehicle_number')}</span>
                <span className="font-bold">{viewPass.vehicle_number || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[12px]">{t('driver_name')}</span>
                <span className="font-bold">{viewPass.driver_name || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
