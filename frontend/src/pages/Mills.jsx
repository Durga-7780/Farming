import React, { useEffect, useState } from 'react'
import { Plus, Factory, Phone, Pencil, BookOpen, MapPin, Building, CreditCard } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'

const emptyForm = { name: '', contact_person: '', mobile: '', gst_number: '', address: '', bank_account: '', bank_ifsc: '' }
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Mills() {
  const [mills, setMills] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [ledgerMill, setLedgerMill] = useState(null)
  const [ledgerData, setLedgerData] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/mills')
      setMills(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(m, e) {
    if (e) e.stopPropagation()
    setEditing(m)
    setForm({ ...emptyForm, ...m })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editing) await api.put(`/api/mills/${editing.id}`, form)
    else await api.post('/api/mills', form)
    setModalOpen(false)
    load()
  }

  async function openLedger(m, e) {
    if (e) e.stopPropagation()
    setLedgerMill(m)
    try {
      const { data } = await api.get(`/api/mills/${m.id}/ledger`)
      setLedgerData(data)
    } catch (err) {
      console.error(err)
    }
  }

  const columns = [
    {
      key: 'code',
      label: 'Mill Code',
      sortable: true,
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold">{val}</span>
    },
    {
      key: 'name',
      label: 'Rice Mill Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
            <Building size={15} />
          </div>
          <div>
            <div className="font-bold text-slate-950 dark:text-white text-[14px]">{val}</div>
            {row.gst_number && <div className="text-[11.5px] font-mono text-slate-600 dark:text-slate-400">GST: {row.gst_number}</div>}
          </div>
        </div>
      )
    },
    {
      key: 'contact_person',
      label: 'Contact Person',
      sortable: true,
      render: (val) => <span className="text-slate-900 dark:text-slate-100 font-bold">{val || '—'}</span>
    },
    {
      key: 'mobile',
      label: 'Mobile',
      sortable: true,
      render: (val) => (
        val ? (
          <a href={`tel:${val}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 font-mono text-slate-900 dark:text-slate-100 font-bold hover:text-blue-700 dark:hover:text-sky-400">
            <Phone size={12} className="text-blue-600 dark:text-sky-400" /> {val}
          </a>
        ) : '—'
      )
    },
    {
      key: 'address',
      label: 'Location Address',
      sortable: true,
      render: (val) => val ? <div className="text-[12.5px] text-slate-800 dark:text-slate-300 font-medium truncate max-w-xs">{val}</div> : '—'
    },
    {
      key: 'bank_account',
      label: 'Bank Account',
      sortable: true,
      render: (val, row) => (
        val ? (
          <div className="font-mono text-[12.5px] text-slate-900 dark:text-slate-100 font-bold">
            <div>{val}</div>
            {row.bank_ifsc && <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">IFSC: {row.bank_ifsc}</div>}
          </div>
        ) : '—'
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (val) => <Badge tone={val ? 'success' : 'default'} size="sm">{val ? 'Active' : 'Inactive'}</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={(e) => openEdit(row, e)}>
            <Pencil size={13} />
          </Button>
          <Button variant="accent" size="sm" onClick={(e) => openLedger(row, e)}>
            <BookOpen size={13} /> <span className="hidden lg:inline">Ledger</span>
          </Button>
        </div>
      )
    }
  ]

  // Rich Filter Fields for Mills Page
  const filterFields = [
    {
      key: 'is_active',
      label: 'Mill Active Status',
      type: 'boolean'
    },
    {
      key: 'contact_person',
      label: 'Contact Person Name',
      type: 'search',
      placeholder: 'Search manager name...'
    },
    {
      key: 'address',
      label: 'Location / City Address',
      type: 'search',
      placeholder: 'Search city/mandal...'
    },
    {
      key: 'gst_number',
      label: 'GST Number Search',
      type: 'search',
      placeholder: 'Search GST #'
    }
  ]

  const cardRender = (m) => (
    <div
      key={m.id}
      onClick={() => openLedger(m)}
      className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-blue-600 dark:text-sky-400 text-[13px] font-bold">{m.code}</span>
          <h4 className="font-display font-700 text-[15px] text-slate-900 dark:text-white">{m.name}</h4>
        </div>
        <Badge tone={m.is_active ? 'success' : 'default'}>{m.is_active ? 'Active' : 'Inactive'}</Badge>
      </div>
      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800">
        {m.contact_person && <div><span className="text-slate-500 dark:text-slate-400">Contact: </span><span className="font-semibold text-slate-900 dark:text-white">{m.contact_person}</span></div>}
        {m.mobile && <div><span className="text-slate-500 dark:text-slate-400">Mobile: </span><span className="font-mono font-bold text-slate-900 dark:text-white">{m.mobile}</span></div>}
        {m.address && <div><span className="text-slate-500 dark:text-slate-400">Address: </span><span>{m.address}</span></div>}
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="ghost" className="flex-1 !py-2 text-[12.5px]" onClick={(e) => openEdit(m, e)}>
          <Pencil size={13} /> Edit
        </Button>
        <Button variant="accent" className="flex-1 !py-2 text-[12.5px]" onClick={(e) => openLedger(m, e)}>
          <BookOpen size={13} /> Ledger
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title="Rice Mill Partners Directory"
        subtitle={`${mills.length} processing and storage mills associated`}
        columns={columns}
        data={mills}
        searchKeys={['name', 'code', 'contact_person', 'mobile', 'gst_number', 'address']}
        filterFields={filterFields}
        defaultSortKey="code"
        defaultSortOrder="asc"
        onRowClick={(m) => openLedger(m)}
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> Register New Mill
          </Button>
        }
      />

      {/* Add / Edit Mill Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Rice Mill' : 'Register New Rice Mill'} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
          <Field label="Rice Mill Name *" className="sm:col-span-2">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sri Lakshmi Venkateswara Rice Mill" />
          </Field>
          <Field label="Contact Person Name">
            <input className={inputClass} value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder="Manager / Owner Name" />
          </Field>
          <Field label="Mobile Number">
            <input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="9848012345" />
          </Field>
          <Field label="GST Registration Number">
            <input className={inputClass} value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} placeholder="e.g. 37AAAAA0000A1Z5" />
          </Field>
          <Field label="Location Address" className="sm:col-span-2">
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Industrial Area, Tenali, AP" />
          </Field>
          <Field label="Bank Account Number">
            <input className={inputClass} value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} placeholder="Bank Account Number" />
          </Field>
          <Field label="IFSC Code">
            <input className={inputClass} value={form.bank_ifsc} onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} placeholder="SBIN0001423" />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editing ? 'Save Changes' : 'Register Mill'}</Button>
          </div>
        </form>
      </Modal>

      {/* Mill Ledger Modal */}
      <Modal open={!!ledgerMill} onClose={() => setLedgerMill(null)} title={`Mill Financial Ledger · ${ledgerMill?.name || ''}`} wide>
        {ledgerData && (
          <div className="space-y-4 text-slate-900 dark:text-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[12px] text-slate-600 dark:text-slate-400 font-semibold">Total Dispatch Sales</div>
                <div className="font-mono text-[18px] font-extrabold text-blue-700 dark:text-sky-400 mt-1">₹{ledgerData.total_sale_value.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[12px] text-slate-600 dark:text-slate-400 font-semibold">Total Collected</div>
                <div className="font-mono text-[18px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">₹{ledgerData.total_collected.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-900">
                <div className="text-[12px] text-rose-700 dark:text-rose-400 font-semibold">Outstanding Receivable</div>
                <div className="font-mono text-[18px] font-extrabold text-rose-700 dark:text-rose-400 mt-1">₹{ledgerData.outstanding.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
