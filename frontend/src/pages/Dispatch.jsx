import React, { useEffect, useState } from 'react'
import { Plus, Truck, Check, Eye, UserCheck, ShieldCheck, MapPin, Wheat } from 'lucide-react'
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
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setViewPass(row) }}>
            <Eye size={13} /> {t('view')}
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
        <Button variant="ghost" size="sm" onClick={() => setViewPass(d)}>
          <Eye size={14} /> {t('view')}
        </Button>
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
          <Button variant="primary" onClick={() => { setForm(emptyForm); setModalOpen(true) }}>
            <Plus size={16} /> {t('new_dispatch_pass')}
          </Button>
        }
      />
    </div>
  )
}
