import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Truck, Package, User, Phone, Wheat, Scale, DollarSign, Clock, Printer, ChevronDown, LayoutGrid, List } from 'lucide-react'
import api from '../api/client'
import Modal from '../components/Modal.jsx'
import { Field, inputClass, Button, EmptyState, Badge } from '../components/ui.jsx'

const SIGNATURE_ROLES = ['Manager', 'Supervisor', 'Owner']

const emptyForm = {
  farmer_id: '', mill_id: '', dispatch_bags: '', dispatch_weight: '',
  cost: '', mc_reading: '', vehicle_weight: '', vehicle_type: 'lorry',
  vehicle_number: '', engine_number: '', trailer_number: '',
  driver_name: '', signature_role: '',
  dispatch_datetime: new Date().toISOString().slice(0, 16)
}

export default function Dispatch() {
  const [dispatches, setDispatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState(null)
  const [editMillData, setEditMillData] = useState({})
  const [savingMillData, setSavingMillData] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [farmers, setFarmers] = useState([])
  const [mills, setMills] = useState([])
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [farmerSearch, setFarmerSearch] = useState('')
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const dropdownRef = useRef(null)

  async function loadDispatches() {
    setLoading(true)
    const { data } = await api.get('/api/dispatches')
    setDispatches(data)
    setLoading(false)
  }

  async function loadFarmers() {
    const { data } = await api.get('/api/farmers')
    setFarmers(data.filter(f => f.is_active && (f.no_of_bags || 0) > 0))
  }

  async function loadMills() {
    const { data } = await api.get('/api/mills')
    setMills(data.filter(m => m.is_active))
  }

  useEffect(() => { loadDispatches(); loadFarmers(); loadMills() }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFarmerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredFarmers = farmers.filter(f => {
    if (!farmerSearch) return true
    const q = farmerSearch.toLowerCase()
    return (
      (f.name || '').toLowerCase().includes(q) ||
      (f.mobile || '').includes(q) ||
      (f.aadhar || '').includes(q) ||
      (f.produce_variety_name || '').toLowerCase().includes(q)
    )
  })

  function selectFarmer(f) {
    setSelectedFarmer(f)
    setFarmerSearch(f.name)
    setShowFarmerDropdown(false)
    setForm({
      ...form,
      farmer_id: f.id,
      cost: f.cost || '',
      mc_reading: f.mc_reading || '',
    })
  }

  function openView(dispatch) {
    setSelectedDispatch(dispatch)
    setEditMillData({
      mill_mc: dispatch.mill_mc || '',
      mill_weight: dispatch.mill_weight || '',
      mill_cost: dispatch.mill_cost || '',
      is_unloaded: dispatch.is_unloaded || false
    })
    setViewModalOpen(true)
  }

  async function handleSaveMillData() {
    setSavingMillData(true)
    try {
      await api.patch(`/api/dispatches/${selectedDispatch.id}`, {
        mill_mc: editMillData.mill_mc ? Number(editMillData.mill_mc) : 0,
        mill_weight: editMillData.mill_weight ? Number(editMillData.mill_weight) : 0,
        mill_cost: editMillData.mill_cost ? Number(editMillData.mill_cost) : 0,
        is_unloaded: editMillData.is_unloaded
      })
      setViewModalOpen(false)
      loadDispatches()
    } catch (err) {
      console.error(err)
      alert('Failed to save mill data')
    } finally {
      setSavingMillData(false)
    }
  }

  function openCreate() {
    setForm({ ...emptyForm, dispatch_datetime: new Date().toISOString().slice(0, 16) })
    setSelectedFarmer(null)
    setFarmerSearch('')
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const e = {}
    if (!form.farmer_id) e.farmer_id = 'Select a farmer'
    if (!form.mill_id) e.mill_id = 'Select a mill'
    if (!form.dispatch_bags || Number(form.dispatch_bags) <= 0) e.dispatch_bags = 'Must be > 0'
    if (selectedFarmer && Number(form.dispatch_bags) > (selectedFarmer.no_of_bags || 0)) {
      e.dispatch_bags = `Exceeds available (${selectedFarmer.no_of_bags})`
    }
    if (!form.driver_name?.trim()) e.driver_name = 'Required'
    if (!form.signature_role) e.signature_role = 'Required'
    if (form.vehicle_type === 'lorry' && !form.vehicle_number?.trim()) e.vehicle_number = 'Required for lorry'
    if (form.vehicle_type === 'tractor') {
      if (!form.engine_number?.trim()) e.engine_number = 'Required for tractor'
      if (!form.trailer_number?.trim()) e.trailer_number = 'Required for tractor'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        farmer_id: Number(form.farmer_id),
        mill_id: Number(form.mill_id),
        dispatch_bags: Number(form.dispatch_bags),
        dispatch_weight: Number(form.dispatch_weight) || 0,
        cost: Number(form.cost) || 0,
        mc_reading: Number(form.mc_reading) || 0,
        vehicle_weight: Number(form.vehicle_weight) || 0,
        vehicle_type: form.vehicle_type,
        vehicle_number: form.vehicle_number || null,
        engine_number: form.engine_number || null,
        trailer_number: form.trailer_number || null,
        driver_name: form.driver_name,
        signature_role: form.signature_role,
        dispatch_datetime: form.dispatch_datetime ? new Date(form.dispatch_datetime).toISOString() : null,
      }
      await api.post('/api/dispatches', payload)
      setModalOpen(false)
      loadDispatches()
      loadFarmers() // refresh farmer stock
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (detail) {
        setErrors({ submit: detail })
      }
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(dt) {
    if (!dt) return '-'
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-800 text-[22px] text-ink">Mill Dispatch</h1>
          <p className="text-muted text-[13.5px] mt-0.5">{dispatches.length} dispatch{dispatches.length !== 1 ? 'es' : ''} recorded</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surfacealt p-1 rounded-lg border border-line/40">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface shadow-sm text-ink' : 'text-muted hover:text-ink'}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface shadow-sm text-ink' : 'text-muted hover:text-ink'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <Button variant="accent" onClick={openCreate}><Plus size={16} /> New Dispatch</Button>
        </div>
      </div>

      {/* Dispatch list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-surface rounded-card animate-pulse border border-line/60" />
          ))}
        </div>
      ) : dispatches.length === 0 ? (
        <div className="bg-surface rounded-card border border-line/60">
          <EmptyState
            icon={Truck}
            title="No dispatches yet"
            subtitle="Create your first dispatch to send stock to a mill."
            action={<Button variant="accent" onClick={openCreate}><Plus size={15} /> New Dispatch</Button>}
          />
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
          {dispatches.map((d, i) => (
            <motion.div
              key={d.id}
              onClick={() => openView(d)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className={`bg-surface rounded-card shadow-card border border-line/60 p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all ${viewMode === 'grid' ? 'flex flex-col h-full' : ''}`}
            >
              <div className={`flex flex-1 justify-between gap-2 ${viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[12px] text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded">{d.dispatch_bill_no}</span>
                    <Badge tone="info">{d.vehicle_type}</Badge>
                    {d.is_unloaded && <Badge tone="success">Unloaded</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                    <span className="flex items-center gap-1 text-ink font-medium">
                      <User size={13} /> {d.farmer_name}
                    </span>
                    <span className="flex items-center gap-1 text-muted">
                      <Truck size={13} /> {d.mill_name}
                    </span>
                    {d.variety_name && (
                      <span className="flex items-center gap-1 text-muted">
                        <Wheat size={13} /> {d.variety_name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] mt-2">
                    <span className="text-muted">Mill MC: <strong className="font-mono text-ink font-medium">{d.mill_mc || '-'}</strong></span>
                    <span className="text-muted">Mill Wt: <strong className="font-mono text-ink font-medium">{d.mill_weight ? `${d.mill_weight} kg` : '-'}</strong></span>
                    <span className="text-muted">Mill Cost: <strong className="font-mono text-ink font-medium">{d.mill_cost ? `₹${d.mill_cost}` : '-'}</strong></span>
                  </div>
                </div>
                <div className={`flex items-center gap-4 text-[13px] shrink-0 ${viewMode === 'grid' ? 'justify-between w-full pt-3 border-t border-line/40 mt-auto' : ''}`}>
                  <div className={viewMode === 'grid' ? 'text-left' : 'text-right'}>
                    <div className="font-mono font-semibold text-ink">{d.dispatch_bags} bags</div>
                    {d.dispatch_weight > 0 && <div className="text-[11px] text-muted">{d.dispatch_weight} kg</div>}
                  </div>
                  <div className="text-right">
                    {d.cost > 0 && <div className="font-mono font-semibold text-ink">₹{d.cost}</div>}
                    <div className="text-[11px] text-muted">{formatDate(d.dispatch_datetime)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dispatch Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Dispatch Bill" wide>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Farmer Search */}
          <div ref={dropdownRef} className="relative">
            <Field label="Select Farmer *">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className={`${inputClass} pl-9 pr-8 ${errors.farmer_id ? '!border-danger' : ''}`}
                  placeholder="Search by name, mobile, aadhar, variety..."
                  value={farmerSearch}
                  onChange={(e) => { setFarmerSearch(e.target.value); setShowFarmerDropdown(true); setSelectedFarmer(null); setForm({ ...form, farmer_id: '' }) }}
                  onFocus={() => setShowFarmerDropdown(true)}
                />
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.farmer_id && <span className="text-danger text-[11px] mt-1 block">{errors.farmer_id}</span>}
            </Field>
            {showFarmerDropdown && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface border border-line rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {filteredFarmers.length === 0 ? (
                  <div className="px-4 py-3 text-[13px] text-muted">No farmers with available stock</div>
                ) : (
                  filteredFarmers.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => selectFarmer(f)}
                      className="w-full text-left px-4 py-2.5 hover:bg-surfacealt transition-colors border-b border-line/40 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[13px] font-medium text-ink">{f.name}</div>
                          <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5">
                            {f.mobile && <span><Phone size={10} className="inline mr-0.5" />{f.mobile}</span>}
                            {f.produce_variety_name && <span><Wheat size={10} className="inline mr-0.5" />{f.produce_variety_name}</span>}
                          </div>
                        </div>
                        <div className="text-right text-[11px]">
                          <div className="font-mono text-ink">{f.no_of_bags || 0} bags</div>
                          <div className="text-muted">{f.total_weight || 0} kg</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Farmer Info Card */}
          {selectedFarmer && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-lg p-3"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px]">
                <div>
                  <div className="text-muted text-[11px]">Farmer</div>
                  <div className="font-medium text-ink">{selectedFarmer.name}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Mobile</div>
                  <div className="font-mono text-ink">{selectedFarmer.mobile || '-'}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Variety</div>
                  <div className="text-ink">{selectedFarmer.produce_variety_name || '-'}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">MC Reading</div>
                  <div className="font-mono text-ink">{selectedFarmer.mc_reading || '-'}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Available Bags</div>
                  <div className="font-mono text-ink font-semibold">{selectedFarmer.no_of_bags || 0}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Available Weight</div>
                  <div className="font-mono text-ink">{selectedFarmer.total_weight || 0} kg</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Cost</div>
                  <div className="font-mono text-ink">₹{selectedFarmer.cost || 0}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dispatch Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Dispatch Bags *">
              <input
                type="number"
                className={`${inputClass} ${errors.dispatch_bags ? '!border-danger' : ''}`}
                value={form.dispatch_bags}
                onChange={(e) => setForm({ ...form, dispatch_bags: e.target.value })}
                placeholder={selectedFarmer ? `Max: ${selectedFarmer.no_of_bags || 0}` : ''}
              />
              {errors.dispatch_bags && <span className="text-danger text-[11px] mt-1 block">{errors.dispatch_bags}</span>}
              {selectedFarmer && form.dispatch_bags && Number(form.dispatch_bags) <= (selectedFarmer.no_of_bags || 0) && (
                <span className="text-success text-[11px] mt-1 block">
                  Remaining: {(selectedFarmer.no_of_bags || 0) - Number(form.dispatch_bags)} bags
                </span>
              )}
            </Field>

            <Field label="Dispatch Weight (kg)">
              <input type="number" step="0.01" className={inputClass} value={form.dispatch_weight}
                onChange={(e) => setForm({ ...form, dispatch_weight: e.target.value })} />
            </Field>

            <Field label="Cost (₹)">
              <input type="number" step="0.01" className={inputClass} value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </Field>

            <Field label="MC Reading">
              <input type="number" step="0.01" className={inputClass} value={form.mc_reading}
                onChange={(e) => setForm({ ...form, mc_reading: e.target.value })} />
            </Field>
          </div>

          {/* Mill Selection */}
          <Field label="Mill *">
            <select
              className={`${inputClass} ${errors.mill_id ? '!border-danger' : ''}`}
              value={form.mill_id}
              onChange={(e) => setForm({ ...form, mill_id: e.target.value })}
            >
              <option value="">Select mill</option>
              {mills.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {errors.mill_id && <span className="text-danger text-[11px] mt-1 block">{errors.mill_id}</span>}
          </Field>

          {/* Vehicle Details */}
          <div className="space-y-3">
            <Field label="Vehicle Type *">
              <div className="flex gap-4">
                {['lorry', 'tractor'].map(vt => (
                  <label key={vt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="vehicle_type"
                      value={vt}
                      checked={form.vehicle_type === vt}
                      onChange={(e) => setForm({ ...form, vehicle_type: e.target.value, vehicle_number: '', engine_number: '', trailer_number: '' })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-[13.5px] capitalize text-ink">{vt}</span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {form.vehicle_type === 'lorry' ? (
                <Field label="Vehicle Number *">
                  <input
                    className={`${inputClass} ${errors.vehicle_number ? '!border-danger' : ''}`}
                    value={form.vehicle_number}
                    onChange={(e) => setForm({ ...form, vehicle_number: e.target.value.toUpperCase() })}
                    placeholder="AP09AB1234"
                  />
                  {errors.vehicle_number && <span className="text-danger text-[11px] mt-1 block">{errors.vehicle_number}</span>}
                </Field>
              ) : (
                <>
                  <Field label="Engine Number *">
                    <input
                      className={`${inputClass} ${errors.engine_number ? '!border-danger' : ''}`}
                      value={form.engine_number}
                      onChange={(e) => setForm({ ...form, engine_number: e.target.value.toUpperCase() })}
                      placeholder="AP09TR1234"
                    />
                    {errors.engine_number && <span className="text-danger text-[11px] mt-1 block">{errors.engine_number}</span>}
                  </Field>
                  <Field label="Trailer Number *">
                    <input
                      className={`${inputClass} ${errors.trailer_number ? '!border-danger' : ''}`}
                      value={form.trailer_number}
                      onChange={(e) => setForm({ ...form, trailer_number: e.target.value.toUpperCase() })}
                      placeholder="AP09TL5678"
                    />
                    {errors.trailer_number && <span className="text-danger text-[11px] mt-1 block">{errors.trailer_number}</span>}
                  </Field>
                </>
              )}

              <Field label="Total Vehicle Weight (kg)">
                <input type="number" className={inputClass} value={form.vehicle_weight}
                  onChange={(e) => setForm({ ...form, vehicle_weight: e.target.value })}
                  placeholder="24560"
                />
              </Field>
            </div>
          </div>

          {/* Driver & Signature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Driver Name *">
              <input
                className={`${inputClass} ${errors.driver_name ? '!border-danger' : ''}`}
                value={form.driver_name}
                onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
              />
              {errors.driver_name && <span className="text-danger text-[11px] mt-1 block">{errors.driver_name}</span>}
            </Field>

            <Field label="Digital Signature *">
              <select
                className={`${inputClass} ${errors.signature_role ? '!border-danger' : ''}`}
                value={form.signature_role}
                onChange={(e) => setForm({ ...form, signature_role: e.target.value })}
              >
                <option value="">Select signer</option>
                {SIGNATURE_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.signature_role && <span className="text-danger text-[11px] mt-1 block">{errors.signature_role}</span>}
            </Field>
          </div>

          {/* Date/Time */}
          <Field label="Dispatch Date & Time">
            <input
              type="datetime-local"
              className={inputClass}
              value={form.dispatch_datetime}
              onChange={(e) => setForm({ ...form, dispatch_datetime: e.target.value })}
            />
          </Field>

          {/* Errors & Submit */}
          {errors.submit && (
            <div className="bg-danger/10 text-danger text-[13px] p-3 rounded-lg">{errors.submit}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? 'Saving...' : 'Create Dispatch'}
            </Button>
          </div>
        </form>
      </Modal>
      {/* View Dispatch Modal */}
      {selectedDispatch && (
        <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Dispatch Details" wide>
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-muted text-[11px]">Dispatch Bill No</div>
                <div className="font-mono font-medium text-ink">{selectedDispatch.dispatch_bill_no}</div>
              </div>
              <div>
                <div className="text-muted text-[11px]">Date & Time</div>
                <div className="text-ink">{formatDate(selectedDispatch.dispatch_datetime)}</div>
              </div>
              <div>
                <div className="text-muted text-[11px]">Farmer</div>
                <div className="text-ink">{selectedDispatch.farmer_name}</div>
              </div>
              <div>
                <div className="text-muted text-[11px]">Mill</div>
                <div className="text-ink">{selectedDispatch.mill_name}</div>
              </div>
              <div>
                <div className="text-muted text-[11px]">Variety</div>
                <div className="text-ink">{selectedDispatch.variety_name || '-'}</div>
              </div>
            </div>

            <div className="border-t border-line/40 pt-4">
              <h4 className="text-[13px] font-semibold text-ink mb-3">Dispatch Details</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-muted text-[11px]">Dispatch Bags</div>
                  <div className="font-mono text-ink">{selectedDispatch.dispatch_bags}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Dispatch Weight (kg)</div>
                  <div className="font-mono text-ink">{selectedDispatch.dispatch_weight || '-'}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Cost (₹)</div>
                  <div className="font-mono text-ink">{selectedDispatch.cost || '-'}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">MC Reading</div>
                  <div className="font-mono text-ink">{selectedDispatch.mc_reading || '-'}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-line/40 pt-4">
              <h4 className="text-[13px] font-semibold text-ink mb-3">Mill Data</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Mill MC">
                  <input type="number" step="0.01" className={inputClass} value={editMillData.mill_mc} onChange={e => setEditMillData({...editMillData, mill_mc: e.target.value})} />
                </Field>
                <Field label="Mill Weight (kg)">
                  <input type="number" step="0.01" className={inputClass} value={editMillData.mill_weight} onChange={e => setEditMillData({...editMillData, mill_weight: e.target.value})} />
                </Field>
                <Field label="Mill Cost (₹)">
                  <input type="number" step="0.01" className={inputClass} value={editMillData.mill_cost} onChange={e => setEditMillData({...editMillData, mill_cost: e.target.value})} />
                </Field>
                <Field label="Unloaded">
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" className="w-4 h-4 accent-primary" checked={editMillData.is_unloaded} onChange={e => setEditMillData({...editMillData, is_unloaded: e.target.checked})} />
                    <span className="text-[13.5px] text-ink">Yes</span>
                  </label>
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" onClick={handleSaveMillData} disabled={savingMillData}>
                  {savingMillData ? 'Saving...' : 'Save Mill Data'}
                </Button>
              </div>
            </div>

            <div className="border-t border-line/40 pt-4">
              <h4 className="text-[13px] font-semibold text-ink mb-3">Vehicle & Driver Details</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-muted text-[11px]">Vehicle Type</div>
                  <div className="capitalize text-ink">{selectedDispatch.vehicle_type}</div>
                </div>
                {selectedDispatch.vehicle_type === 'lorry' ? (
                  <div>
                    <div className="text-muted text-[11px]">Vehicle Number</div>
                    <div className="font-mono text-ink">{selectedDispatch.vehicle_number || '-'}</div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="text-muted text-[11px]">Engine Number</div>
                      <div className="font-mono text-ink">{selectedDispatch.engine_number || '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted text-[11px]">Trailer Number</div>
                      <div className="font-mono text-ink">{selectedDispatch.trailer_number || '-'}</div>
                    </div>
                  </>
                )}
                <div>
                  <div className="text-muted text-[11px]">Vehicle Weight (kg)</div>
                  <div className="font-mono text-ink">{selectedDispatch.vehicle_weight || '-'}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Driver Name</div>
                  <div className="text-ink">{selectedDispatch.driver_name || '-'}</div>
                </div>
                <div>
                  <div className="text-muted text-[11px]">Signature Role</div>
                  <div className="text-ink">{selectedDispatch.signature_role || '-'}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
