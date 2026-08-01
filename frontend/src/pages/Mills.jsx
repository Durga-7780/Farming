import React, { useEffect, useState } from 'react'
import { Plus, Factory, MapPin, Phone, Building, Edit2, Trash2 } from 'lucide-react'
import api from '../api/client'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import { Field, Button, Badge, inputClass } from '../components/ui.jsx'
import TransliterateInput from '../components/TransliterateInput.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const emptyMill = {
  name: '', code: '', contact_person: '', mobile: '', address: '', place: '', district: '', gstin: '', capacity_qtl: 0, bank_account_no: '', bank_name: '', ifsc_code: ''
}

export default function Mills() {
  const { t } = useLanguage()
  const [mills, setMills] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyMill)

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

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyMill)
    setModalOpen(true)
  }

  function openEdit(m, e) {
    if (e) e.stopPropagation()
    setEditing(m)
    setForm({
      name: m.name || '',
      code: m.code || '',
      contact_person: m.contact_person || '',
      mobile: m.mobile || '',
      address: m.address || '',
      place: m.place || '',
      district: m.district || '',
      gstin: m.gstin || '',
      capacity_qtl: m.capacity_qtl || 0,
      bank_account_no: m.bank_account_no || '',
      bank_name: m.bank_name || '',
      ifsc_code: m.ifsc_code || ''
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      capacity_qtl: form.capacity_qtl ? Number(form.capacity_qtl) : 0
    }
    if (editing) {
      await api.put(`/api/mills/${editing.id}`, payload)
    } else {
      await api.post('/api/mills', payload)
    }
    setModalOpen(false)
    load()
  }

  const columns = [
    {
      key: 'code',
      label: t('code_col'),
      sortable: true,
      render: (val) => <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold">{val}</span>
    },
    {
      key: 'name',
      label: t('mill_col'),
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
            <Building size={16} />
          </div>
          <span className="font-extrabold text-slate-950 dark:text-white text-[14px]">{t(val)}</span>
        </div>
      )
    },
    {
      key: 'contact_person',
      label: t('contact_person_col'),
      sortable: true,
      render: (val) => <span className="font-extrabold text-slate-900 dark:text-slate-100">{t(val) || '—'}</span>
    },
    {
      key: 'mobile',
      label: t('contact_col'),
      sortable: true,
      render: (val) => (
        val ? (
          <a href={`tel:${val}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 hover:text-blue-700 dark:hover:text-sky-400 font-mono">
            <Phone size={13} className="text-blue-600 dark:text-sky-400" />
            <span>{val}</span>
          </a>
        ) : <span className="text-slate-400">—</span>
      )
    },
    {
      key: 'address',
      label: t('location_col'),
      sortable: true,
      render: (val, row) => (
        <span className="text-slate-800 dark:text-slate-200 font-semibold text-[13px]">
          {t(val || [row.place, row.district].filter(Boolean).join(', ') || '—')}
        </span>
      )
    },
    {
      key: 'bank_account_no',
      label: t('bank_account_col'),
      sortable: true,
      render: (val, row) => (
        val ? (
          <div>
            <div className="font-mono font-bold text-slate-900 dark:text-white text-[13px]">{val}</div>
            {row.ifsc_code && <div className="text-[11px] text-slate-500 font-mono">IFSC: {row.ifsc_code}</div>}
          </div>
        ) : <span className="text-slate-400">—</span>
      )
    },
    {
      key: 'actions',
      label: t('actions'),
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <button onClick={(e) => openEdit(row, e)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Edit Mill">
          <Edit2 size={15} />
        </button>
      )
    }
  ]

  const cardRender = (m) => (
    <div key={m.id} onClick={(e) => openEdit(m, e)} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 cursor-pointer space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-blue-600 dark:text-sky-400 font-bold text-[12px]">{m.code}</span>
          <h4 className="font-display font-800 text-[16px] text-slate-950 dark:text-white">{t(m.name)}</h4>
          <span className="text-[12.5px] text-slate-600 dark:text-slate-400 font-semibold">{t(m.address || m.place)}</span>
        </div>
      </div>
      <div className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1 py-2 border-y border-slate-100 dark:border-slate-800">
        <div><span className="text-slate-500">Contact Person: </span><span className="font-bold text-slate-900 dark:text-white">{t(m.contact_person)}</span></div>
        <div><span className="text-slate-500">Phone: </span><span className="font-mono font-bold text-slate-900 dark:text-white">{m.mobile}</span></div>
      </div>
    </div>
  )

  return (
    <div>
      <DataTable
        title={t('mill_directory')}
        subtitle={t('mill_subtitle')}
        columns={columns}
        data={mills}
        searchKeys={['name', 'code', 'contact_person', 'mobile', 'address']}
        defaultSortKey="name"
        onRowClick={(m) => openEdit(m)}
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> {t('add_mill')}
          </Button>
        }
      />

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('edit_mill') : t('add_mill')} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
          <Field label={t('mill_name_req')}>
            <TransliterateInput required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('mill_name_ph')} />
          </Field>
          <Field label={t('contact_person')}>
            <TransliterateInput className={inputClass} value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder={t('person_name_ph')} />
          </Field>
          <Field label={t('mobile_no')}>
            <input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder={t('mobile_ph')} />
          </Field>
          <Field label={t('address')}>
            <TransliterateInput className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={t('address_ph')} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>{t('cancel')}</Button>
            <Button variant="primary" type="submit">{t('save_mill')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
