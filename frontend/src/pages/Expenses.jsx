import React, { useEffect, useState } from 'react'
import { Plus, Receipt, Edit2, Trash2, PieChart as PieChartIcon } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import { Field, inputClass, Button, Badge } from '../components/ui.jsx'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CATEGORIES = ['Transport', 'Labour', 'Fuel', 'Office', 'Miscellaneous']
const COLORS = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b', '#e11d48']
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ category: 'Transport', amount: '', description: '' })

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/expenses')
      setExpenses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setForm({ category: 'Transport', amount: '', description: '' }); setModalOpen(true) }

  async function handleSubmit(e) {
    e.preventDefault()
    await api.post('/api/expenses', { ...form, amount: parseFloat(form.amount) })
    setModalOpen(false)
    load()
  }

  function openEdit(exp, e) {
    if (e) e.stopPropagation()
    setEditForm({ ...exp })
    setEditModalOpen(true)
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    await api.patch(`/api/expenses/${editForm.id}`, {
      category: editForm.category,
      amount: parseFloat(editForm.amount),
      description: editForm.description
    })
    setEditModalOpen(false)
    load()
  }

  async function handleDelete(id, e) {
    if (e) e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this expense entry?")) {
      await api.delete(`/api/expenses/${id}`)
      load()
    }
  }

  const categoryData = CATEGORIES.map((c) => ({
    name: c,
    value: expenses.filter((e) => e.category === c).reduce((sum, e) => sum + e.amount, 0)
  })).filter((c) => c.value > 0)

  const columns = [
    {
      key: 'category',
      label: 'Expense Category',
      sortable: true,
      render: (val) => <Badge tone="info" size="sm">{val}</Badge>
    },
    {
      key: 'description',
      label: 'Description / Notes',
      sortable: true,
      render: (val) => <span className="text-slate-900 font-bold">{val || '—'}</span>
    },
    {
      key: 'amount',
      label: 'Amount (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono text-rose-700 font-extrabold text-[14px]">{fmt(val)}</span>
    },
    {
      key: 'expense_date',
      label: 'Expense Date',
      sortable: true,
      render: (val) => <span className="text-slate-700 text-[12.5px] font-medium">{new Date(val).toLocaleDateString('en-IN')}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2 text-slate-600">
          <button onClick={(e) => openEdit(row, e)} className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition-colors" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={(e) => handleDelete(row.id, e)} className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-rose-600 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  const filterFields = [
    {
      key: 'category',
      label: 'Expense Category',
      type: 'select',
      options: CATEGORIES
    }
  ]

  const cardRender = (e) => (
    <div key={e.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <Badge tone="info">{e.category}</Badge>
        <span className="font-mono text-rose-700 font-extrabold text-[15px]">{fmt(e.amount)}</span>
      </div>
      <p className="text-[13px] text-slate-900 font-semibold">{e.description || 'No description provided'}</p>
      <div className="flex items-center justify-between text-[12px] text-slate-600 font-medium pt-2 border-t border-slate-100">
        <span>{new Date(e.expense_date).toLocaleDateString('en-IN')}</span>
        <div className="flex items-center gap-2">
          <button onClick={(ev) => openEdit(e, ev)} className="hover:text-blue-700"><Edit2 size={14} /></button>
          <button onClick={(ev) => handleDelete(e.id, ev)} className="hover:text-rose-600"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Category Breakdown Graph */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-display font-700 text-[15px] text-slate-900 mb-2">
            <PieChartIcon size={17} className="text-blue-600" /> Operational Expense Distribution
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <DataTable
        title="Operational Expenses Log"
        subtitle={`${expenses.length} transport, labour, and office cost records`}
        columns={columns}
        data={expenses}
        searchKeys={['category', 'description']}
        filterFields={filterFields}
        defaultSortKey="expense_date"
        defaultSortOrder="desc"
        cardRender={cardRender}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> Log New Expense
          </Button>
        }
      />

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Operational Expense">
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
          <Field label="Category *">
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Expense Amount (₹) *">
            <input required type="number" step="0.01" className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          </Field>
          <Field label="Description / Reason">
            <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Lorry diesel, labour charges" />
          </Field>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Expense Log</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editForm && (
        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Expense Entry">
          <form onSubmit={handleEditSubmit} className="space-y-4 text-slate-900">
            <Field label="Category">
              <select className={inputClass} value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Amount (₹)">
              <input required type="number" step="0.01" className={inputClass} value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            </Field>
            <Field label="Description">
              <input className={inputClass} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
