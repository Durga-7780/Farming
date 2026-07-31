import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Receipt, Edit2, Trash2, Filter, PieChart as PieChartIcon } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import { Field, inputClass, Button, EmptyState, Badge } from '../components/ui.jsx'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const CATEGORIES = ['Transport', 'Labour', 'Fuel', 'Office', 'Miscellaneous']
const MONTHS = [
  { val: 'All', label: 'All Months' },
  { val: '1', label: 'January' }, { val: '2', label: 'February' },
  { val: '3', label: 'March' }, { val: '4', label: 'April' },
  { val: '5', label: 'May' }, { val: '6', label: 'June' },
  { val: '7', label: 'July' }, { val: '8', label: 'August' },
  { val: '9', label: 'September' }, { val: '10', label: 'October' },
  { val: '11', label: 'November' }, { val: '12', label: 'December' }
]
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ category: 'Transport', amount: '', description: '' })
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)

  // Filters
  const [filterMonth, setFilterMonth] = useState('All')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterCategory, setFilterCategory] = useState('All')

  async function load() {
    setLoading(true)
    const { data } = await api.get('/api/expenses')
    setExpenses(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setForm({ category: 'Transport', amount: '', description: '' }); setModalOpen(true) }

  async function handleSubmit(e) {
    e.preventDefault()
    await api.post('/api/expenses', { ...form, amount: parseFloat(form.amount) })
    setModalOpen(false)
    load()
  }

  function openEdit(exp) {
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

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await api.delete(`/api/expenses/${id}`)
      load()
    }
  }

  // Filtered data
  const filteredExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date)
    const m = (d.getMonth() + 1).toString()
    const y = d.getFullYear().toString()
    
    if (filterYear !== 'All' && y !== filterYear) return false
    if (filterMonth !== 'All' && m !== filterMonth) return false
    if (filterCategory !== 'All' && e.category !== filterCategory) return false
    return true
  })

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  // Graph Data
  const categoryData = CATEGORIES.map(c => {
    return {
      name: c,
      value: filteredExpenses.filter(e => e.category === c).reduce((sum, e) => sum + e.amount, 0)
    }
  }).filter(c => c.value > 0)

  // Available years for dropdown
  const years = Array.from(new Set(expenses.map(e => new Date(e.expense_date).getFullYear().toString()))).sort((a,b) => b.localeCompare(a))
  if (!years.includes(new Date().getFullYear().toString())) years.unshift(new Date().getFullYear().toString())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-800 text-[22px] text-ink">Expenses</h1>
          <p className="text-muted text-[13.5px] mt-0.5">Track and analyze your spending.</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus size={16} /> Add expense</Button>
      </div>

      {/* Reports & Filters Section */}
      <div className="bg-surface rounded-card shadow-card border border-line/60 p-5">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-[14px] text-ink">
              <Filter size={16} className="text-primary" /> Filters
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[11.5px] font-medium text-muted mb-1">Year</label>
                <select className={inputClass} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                  <option value="All">All Years</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[11.5px] font-medium text-muted mb-1">Month</label>
                <select className={inputClass} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                  {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-muted mb-1">Category</label>
                <select className={inputClass} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-line/40 mt-4">
              <div className="text-[12px] text-muted">Filtered Total</div>
              <div className="font-mono text-xl font-bold text-ink">₹{total.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Graph Area */}
          <div className="flex-1 flex flex-col md:border-l md:border-line/40 md:pl-6 min-h-[250px]">
             <h3 className="flex items-center gap-2 font-semibold text-[14px] text-ink mb-4">
              <PieChartIcon size={16} className="text-primary" /> Expense Breakdown
            </h3>
            
            {categoryData.length > 0 ? (
              <div className="flex-1 flex items-center justify-center -ml-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[13px] text-muted bg-surfacealt/50 rounded-lg border border-dashed border-line">
                No expenses found for these filters.
              </div>
            )}
          </div>

        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface rounded-lg animate-pulse border border-line/60" />)}</div>
      ) : expenses.length === 0 ? (
        <div className="bg-surface rounded-card border border-line/60">
          <EmptyState icon={Receipt} title="No expenses logged" subtitle="Track transport, labour, and other operational costs here." action={<Button variant="accent" onClick={openCreate}><Plus size={15} /> Add expense</Button>} />
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-line/60 overflow-x-auto shadow-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted border-b border-line/60 bg-surfacealt/30">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? filteredExpenses.map((e) => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-line/40 last:border-0 hover:bg-surfacealt/10 transition-colors">
                  <td className="px-4 py-3"><Badge tone="info">{e.category}</Badge></td>
                  <td className="px-4 py-3 text-muted">{e.description || '—'}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">₹{e.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-muted">{new Date(e.expense_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-muted">
                      <button onClick={() => openEdit(e)} className="hover:text-primary transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="hover:text-danger transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-[13px] text-muted">
                    No matching expenses for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Amount (₹)">
            <input required type="number" step="0.01" className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Description">
            <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent">Save expense</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editForm && (
        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit expense">
          <form onSubmit={handleEditSubmit} className="space-y-4">
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
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="accent">Save changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
