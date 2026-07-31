import React, { useEffect, useState } from 'react'
import { Plus, Download, Edit2, Phone, MapPin, Wheat, Eye, FileText, CheckCircle, XCircle, X } from 'lucide-react'
import api from '../api/client'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const emptyFarmer = {
  name: '', code: '', mobile: '', aadhar: '', village: '', mandal: '', district: '', place: '',
  bank_account_no: '', bank_name: '', ifsc_code: '', produce_variety_id: '',
  no_of_bags: 0, total_weight: 0, mc_reading: 0, cost: 0, is_active: true
}

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

function InlineFarmerLedgerModal({ farmer, data, onClose }) {
  const { t } = useLanguage()
  const purchases = data?.purchases || []
  const payments = data?.payments || []

  const totalPurchases = purchases.reduce((acc, p) => acc + (p.net_payable || 0), 0)
  const totalPayments = payments.reduce((acc, p) => acc + (p.amount || 0), 0)
  const balance = totalPurchases - totalPayments

  return (
    <Modal open={!!farmer} onClose={onClose} title={`${farmer.name} (${farmer.code}) — Farmer Ledger`} wide>
      <div className="space-y-4 text-slate-900 dark:text-slate-100 font-sans">
        {/* KPI Balance Banner */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[12px] text-slate-500 font-bold">Total Harvest Purchases</div>
            <div className="font-mono text-[17px] font-extrabold text-blue-700 dark:text-sky-400">{fmt(totalPurchases)}</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-bold">Total Paid Disbursals</div>
            <div className="font-mono text-[17px] font-extrabold text-emerald-700 dark:text-emerald-400">{fmt(totalPayments)}</div>
          </div>
          <div>
            <div className="text-[12px] text-slate-500 font-bold">Outstanding Balance</div>
            <div className={`font-mono text-[17px] font-extrabold ${balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {fmt(balance)}
            </div>
          </div>
        </div>

        {/* Purchases History */}
        <div>
          <h4 className="font-display font-800 text-[15px] mb-2 text-slate-950 dark:text-white">Procurement Purchase Orders ({purchases.length})</h4>
          {purchases.length === 0 ? (
            <p className="text-[13px] text-slate-500 italic">No purchase vouchers recorded yet.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 uppercase">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Purchase No.</th>
                    <th className="p-2.5">Variety</th>
                    <th className="p-2.5 text-right">Bags</th>
                    <th className="p-2.5 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono">{new Date(p.created_at || Date.now()).toLocaleDateString('en-IN')}</td>
                      <td className="p-2.5 font-mono text-blue-600 dark:text-sky-400 font-bold">{p.purchase_no}</td>
                      <td className="p-2.5 font-bold">{t(p.produce_variety_name)}</td>
                      <td className="p-2.5 text-right font-mono font-bold">{p.quantity}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{fmt(p.net_payable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payments History */}
        <div>
          <h4 className="font-display font-800 text-[15px] mb-2 text-slate-950 dark:text-white">Disbursal Payout Receipts ({payments.length})</h4>
          {payments.length === 0 ? (
            <p className="text-[13px] text-slate-500 italic">No payment receipts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 uppercase">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Ref No.</th>
                    <th className="p-2.5">Mode</th>
                    <th className="p-2.5 text-right">Paid Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((pm) => (
                    <tr key={pm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono">{new Date(pm.payment_date).toLocaleDateString('en-IN')}</td>
                      <td className="p-2.5 font-mono text-slate-900 dark:text-sky-300 font-bold">{pm.reference_no || '—'}</td>
                      <td className="p-2.5 font-bold uppercase">{pm.payment_mode}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{fmt(pm.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>Close Ledger</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Farmers() {
  const { t } = useLanguage()
  const [farmers, setFarmers] = useState([])
  const [varieties, setVarieties] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyFarmer)
  const [ledgerFarmer, setLedgerFarmer] = useState(null)
  const [ledgerData, setLedgerData] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/farmers', { params: { limit: 1000 } })
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
      setVarieties(data)
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
    setForm(emptyFarmer)
    setModalOpen(true)
  }

  function openEdit(f, e) {
    if (e) e.stopPropagation()
    setEditing(f)
    setForm({
      name: f.name || '',
      code: f.code || '',
      mobile: f.mobile || '',
      aadhar: f.aadhar || '',
      village: f.village || '',
      mandal: f.mandal || '',
      district: f.district || '',
      place: f.place || '',
      bank_account_no: f.bank_account_no || '',
      bank_name: f.bank_name || '',
      ifsc_code: f.ifsc_code || '',
      produce_variety_id: f.produce_variety_id || '',
      no_of_bags: f.no_of_bags || 0,
      total_weight: f.total_weight || 0,
      mc_reading: f.mc_reading || 0,
      cost: f.cost || 0,
      is_active: f.is_active !== undefined ? f.is_active : true
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
      label: t('code'),
      sortable: true,
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold">{val || '—'}</span>
    },
    {
      key: 'name',
      label: t('farmer'),
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-sky-400 font-bold flex items-center justify-center text-xs shrink-0">
            {val?.[0] || 'F'}
          </div>
          <div>
            <div className="font-extrabold text-slate-950 dark:text-white text-[14px]">{val}</div>
            {row.aadhar && <div className="text-[11.5px] text-slate-600 dark:text-slate-400 font-mono">Aadhaar: {row.aadhar}</div>}
          </div>
        </div>
      )
    },
    {
      key: 'mobile',
      label: t('contact'),
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
      label: t('location_address'),
      sortable: true,
      render: (_, row) => (
        <div className="text-[12.5px] text-slate-800 dark:text-slate-200">
          <div className="font-extrabold text-slate-950 dark:text-white">{t(row.village) || t(row.place) || '—'}</div>
          {(row.mandal || row.district) && (
            <div className="text-slate-600 dark:text-slate-400 text-[11.5px] font-semibold flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-slate-500 dark:text-slate-400" />
              <span>{[row.mandal ? `${t(row.mandal)} ${t('Mandal')}` : null, t(row.district)].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'produce_variety_name',
      label: t('produce_variety'),
      sortable: true,
      render: (val) => (
        val ? (
          <Badge tone="info" size="sm">
            <Wheat size={11} /> {t(val)}
          </Badge>
        ) : <span className="text-slate-400">—</span>
      )
    },
    {
      key: 'no_of_bags',
      label: t('bags'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-slate-900 dark:text-white font-extrabold">{val ? val.toLocaleString() : '0'}</span>
    },
    {
      key: 'total_weight',
      label: t('weight_qtl'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{val ? val.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'cost',
      label: t('total_cost'),
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold text-[14px]">{fmt(val)}</span>
    },
    {
      key: 'is_active',
      label: t('status'),
      sortable: true,
      align: 'center',
      render: (val) => (
        <Badge tone={val ? 'success' : 'default'} size="sm">
          {val ? t('active') : t('inactive')}
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
          <Button variant="ghost" size="sm" onClick={(e) => openLedger(row, e)} title="View Farmer Ledger">
            <FileText size={13} /> {t('ledger')}
          </Button>
          <button onClick={(e) => openEdit(row, e)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Edit">
            <Edit2 size={15} />
          </button>
        </div>
      )
    }
  ]

  const filterFields = [
    { key: 'district', label: 'District', type: 'select', options: districtOptions },
    { key: 'produce_variety_name', label: t('produce_variety'), type: 'select', options: varietyOptions },
    { key: 'is_active', label: t('status'), type: 'boolean' }
  ]

  const cardRender = (f) => (
    <div key={f.id} onClick={(e) => openLedger(f, e)} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-blue-600 dark:text-sky-400 font-bold text-[12px]">{f.code}</span>
          <h4 className="font-display font-800 text-[16px] text-slate-950 dark:text-white">{f.name}</h4>
          <span className="text-[12px] text-slate-600 dark:text-slate-400 font-medium">{f.village}, {f.district}</span>
        </div>
        <Badge tone={f.is_active ? 'success' : 'default'}>{f.is_active ? t('active') : t('inactive')}</Badge>
      </div>
      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800">
        <div><span className="text-slate-500">Variety: </span><span className="font-bold text-slate-900 dark:text-white">{t(f.produce_variety_name)}</span></div>
        <div><span className="text-slate-500">Total Bags: </span><span className="font-mono font-bold text-slate-900 dark:text-white">{f.no_of_bags}</span></div>
        <div><span className="text-slate-500">Total Weight: </span><span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{f.total_weight} qtl</span></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-blue-600 dark:text-sky-400 font-extrabold text-[15px]">{fmt(f.cost)}</span>
        <Button variant="ghost" size="sm" onClick={(e) => openLedger(f, e)}>
          <FileText size={14} /> {t('ledger')}
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title={t('farmer_directory')}
        subtitle={t('farmer_subtitle')}
        columns={columns}
        data={farmers}
        searchKeys={['name', 'code', 'mobile', 'village', 'mandal', 'district', 'produce_variety_name']}
        filterFields={filterFields}
        defaultSortKey="name"
        onRowClick={(f) => openLedger(f)}
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> {t('add_farmer')}
          </Button>
        }
      />

      {/* Register/Edit Farmer Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Farmer Details' : t('add_farmer')} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
          <Field label="Farmer Name *">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </Field>

          <Field label="Mobile Number">
            <input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit mobile" />
          </Field>

          <Field label="Village / Mandal">
            <input className={inputClass} value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} placeholder="Village or Mandal" />
          </Field>

          <Field label="District">
            <input className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="District name" />
          </Field>

          <Field label="Produce Variety">
            <select className={inputClass} value={form.produce_variety_id} onChange={(e) => setForm({ ...form, produce_variety_id: e.target.value })}>
              <option value="">Select Variety</option>
              {varieties.map((v) => <option key={v.id} value={v.id}>{v.name_en}</option>)}
            </select>
          </Field>

          <Field label="Total Weight (Quintals)">
            <input type="number" step="0.01" className={inputClass} value={form.total_weight} onChange={(e) => setForm({ ...form, total_weight: e.target.value })} placeholder="Weight in qtl" />
          </Field>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Farmer Record</Button>
          </div>
        </form>
      </Modal>

      {/* Inline Ledger Modal */}
      {ledgerFarmer && (
        <InlineFarmerLedgerModal
          farmer={ledgerFarmer}
          data={ledgerData}
          onClose={() => { setLedgerFarmer(null); setLedgerData(null) }}
        />
      )}
    </div>
  )
}
