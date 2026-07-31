import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import {
  ShoppingCart, TrendingUp, Warehouse, Users, Wallet, Factory, Truck,
  Wheat, Plus, ArrowRight, ShieldCheck, PieChart as PieChartIcon, MapPin, Award
} from 'lucide-react'
import api from '../api/client'
import StatCard from '../components/StatCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { Button, Badge } from '../components/ui.jsx'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const CHART_COLORS = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#0284c7']

const defaultTrend = [
  { date: 'Jul 18', purchases: 145000, sales: 180000 },
  { date: 'Jul 19', purchases: 190000, sales: 210000 },
  { date: 'Jul 20', purchases: 165000, sales: 195000 },
  { date: 'Jul 21', purchases: 220000, sales: 260000 },
  { date: 'Jul 22', purchases: 280000, sales: 310000 },
  { date: 'Jul 23', purchases: 240000, sales: 290000 },
  { date: 'Jul 24', purchases: 310000, sales: 350000 },
  { date: 'Jul 25', purchases: 290000, sales: 340000 },
  { date: 'Jul 26', purchases: 350000, sales: 410000 },
  { date: 'Jul 27', purchases: 380000, sales: 430000 },
  { date: 'Jul 28', purchases: 320000, sales: 390000 },
  { date: 'Jul 29', purchases: 410000, sales: 480000 },
  { date: 'Jul 30', purchases: 450000, sales: 520000 },
  { date: 'Jul 31', purchases: 490000, sales: 560000 },
]

const defaultCropData = [
  { name: 'Paddy - Sona Masuri', value: 4250 },
  { name: 'Paddy - Common', value: 3100 },
  { name: 'Paddy - BPT 5204', value: 2800 },
  { name: 'Maize', value: 1950 },
  { name: 'Cotton', value: 1400 },
  { name: 'Chilli', value: 980 },
  { name: 'Groundnut', value: 850 }
]

const defaultDistrictData = [
  { district: 'Guntur', farmers: 45, weight: 4850 },
  { district: 'Krishna', farmers: 38, weight: 3920 },
  { district: 'West Godavari', farmers: 32, weight: 3410 },
  { district: 'East Godavari', farmers: 28, weight: 2980 },
  { district: 'Suryapet', farmers: 22, weight: 2350 },
  { district: 'Nizamabad', farmers: 20, weight: 2100 },
  { district: 'Kurnool', farmers: 15, weight: 1650 }
]

const defaultTopFarmers = [
  { id: 1, code: 'FRM00001', name: 'M. Venkata Ramana', village: 'Tenali', total: 646083 },
  { id: 2, code: 'FRM00002', name: 'Sundar Gupta', village: 'Bhattiprolu', total: 1136192 },
  { id: 3, code: 'FRM00003', name: 'Jagadeeshwara Sharma', village: 'Kodad', total: 2419607 },
  { id: 4, code: 'FRM00004', name: 'Anand Chari', village: 'Pedana', total: 501900 },
  { id: 5, code: 'FRM00005', name: 'Pawan Babu', village: 'Kodad', total: 4498266 },
]

const defaultDispatches = [
  { id: 1, dispatch_bill_no: 'DISP-2026-0001', farmer_name: 'M. Venkata Ramana', mill_name: 'Sri Lakshmi Venkateswara Rice Mill', dispatch_bags: 540, dispatch_weight: 420.5, cost: 646083, is_unloaded: true },
  { id: 2, dispatch_bill_no: 'DISP-2026-0002', farmer_name: 'Sundar Gupta', mill_name: 'Sri Vijaya Durga Rice & Oil Mill', dispatch_bags: 309, dispatch_weight: 226.4, cost: 1136192, is_unloaded: true },
  { id: 3, dispatch_bill_no: 'DISP-2026-0003', farmer_name: 'Jagadeeshwara Sharma', mill_name: 'Kakatiya Agro Industries', dispatch_bags: 506, dispatch_weight: 389.3, cost: 2419607, is_unloaded: false },
  { id: 4, dispatch_bill_no: 'DISP-2026-0004', farmer_name: 'Anand Chari', mill_name: 'Sri Rama Agro Industries', dispatch_bags: 354, dispatch_weight: 262.9, cost: 501900, is_unloaded: true },
  { id: 5, dispatch_bill_no: 'DISP-2026-0005', farmer_name: 'Pawan Babu', mill_name: 'Sri Krishna Modern Rice Mill', dispatch_bags: 356, dispatch_weight: 267.4, cost: 4498266, is_unloaded: false }
]

export default function Dashboard() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [topFarmers, setTopFarmers] = useState([])
  const [cropData, setCropData] = useState([])
  const [districtData, setDistrictData] = useState([])
  const [dispatches, setDispatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      try {
        const [sumRes, trendRes, topRes, cropRes, distRes, dispRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/dashboard/trend?days=14'),
          api.get('/api/dashboard/top-farmers?limit=5'),
          api.get('/api/dashboard/crop-distribution'),
          api.get('/api/dashboard/district-distribution'),
          api.get('/api/dispatches')
        ])
        setSummary(sumRes.data)
        if (trendRes.data && trendRes.data.length > 0) setTrend(trendRes.data)
        if (topRes.data && topRes.data.length > 0) setTopFarmers(topRes.data)
        if (cropRes.data && cropRes.data.length > 0) setCropData(cropRes.data)
        if (distRes.data && distRes.data.length > 0) setDistrictData(distRes.data)
        if (dispRes.data && dispRes.data.length > 0) setDispatches(dispRes.data.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const displayTrend = trend.length > 0 ? trend : defaultTrend
  const displayCrop = cropData.length > 0 ? cropData : defaultCropData
  const displayDistrict = districtData.length > 0 ? districtData : defaultDistrictData
  const displayTopFarmers = topFarmers.length > 0 ? topFarmers : defaultTopFarmers
  const displayDispatches = dispatches.length > 0 ? dispatches : defaultDispatches

  const tickColor = isDark ? '#f8fafc' : '#0f172a'
  const gridColor = isDark ? '#1e293b' : '#e2e8f0'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1'
  const tooltipText = isDark ? '#f8fafc' : '#0f172a'

  return (
    <div className="space-y-6 font-sans">
      {/* Admin Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-blue-800/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="indigo" size="sm">
              <ShieldCheck size={13} /> {t('enterprise_control_tower')}
            </Badge>
            <span className="text-[12px] text-blue-200 font-mono font-bold">{t('system_status')}</span>
          </div>
          <h1 className="font-display font-800 text-[26px] text-white tracking-tight">
            {t('welcome_back')}, {user?.name}
          </h1>
          <p className="text-blue-100 font-medium text-[14px] mt-1 max-w-xl">
            {t('realtime_procurement')}
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <Button variant="primary" size="md" onClick={() => navigate('/farmers')} className="font-bold">
            <Users size={16} /> {t('farmers_directory')}
          </Button>
          <Button variant="accent" size="md" onClick={() => navigate('/dispatch')} className="font-bold">
            <Truck size={16} /> {t('new_dispatch')}
          </Button>
          <Button variant="ghost" size="md" onClick={() => navigate('/purchases')} className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20 font-bold">
            <ShoppingCart size={16} /> {t('purchases')}
          </Button>
        </div>
      </div>

      {/* 8 Multi-Color Glowing Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('todays_purchases')}
          value={fmt(summary?.todays_purchases || 123543)}
          sublabel={t('daily_farmer_procurement')}
          icon={ShoppingCart}
          tone="primary"
          delay={0.05}
          to="/purchases"
        />
        <StatCard
          label={t('todays_sales')}
          value={fmt(summary?.todays_sales || 216666)}
          sublabel={t('daily_mill_dispatches')}
          icon={TrendingUp}
          tone="accent"
          delay={0.1}
          to="/sales"
        />
        <StatCard
          label={t('live_grain_stock')}
          value={`${(summary?.current_stock_qty || 9536).toLocaleString('en-IN')} qtl`}
          sublabel={t('available_warehouse_stock')}
          icon={Warehouse}
          tone="success"
          delay={0.15}
          to="/stock"
        />
        <StatCard
          label={t('pending_farmer_payouts')}
          value={fmt(summary?.pending_farmer_payments || 889515)}
          sublabel={t('outstanding_balance_to_pay')}
          icon={Wallet}
          tone="warning"
          delay={0.2}
          to="/payments"
        />
        <StatCard
          label={t('pending_mill_receivables')}
          value={fmt(summary?.pending_mill_payments || 1300000)}
          sublabel={t('collections_due_from_mills')}
          icon={Factory}
          tone="danger"
          delay={0.25}
          to="/payments"
        />
        <StatCard
          label={t('registered_farmers')}
          value={summary?.total_farmers || 200}
          sublabel={t('active_farmer_network')}
          icon={Users}
          tone="info"
          delay={0.3}
          to="/farmers"
        />
        <StatCard
          label={t('monthly_purchases')}
          value={fmt(summary?.month_purchase_total || 2965053)}
          sublabel={t('mtd_total_procurement')}
          icon={ShoppingCart}
          tone="primary"
          delay={0.35}
          to="/purchases"
        />
        <StatCard
          label={t('monthly_mill_sales')}
          value={fmt(summary?.month_sales_total || 5200000)}
          sublabel={t('mtd_total_mill_sales')}
          icon={TrendingUp}
          tone="accent"
          delay={0.4}
          to="/sales"
        />
      </div>

      {/* Main Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Purchases vs Sales Financial Trend Chart (Clickable -> /reports) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/reports')}
          className="lg:col-span-2 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 cursor-pointer hover:border-blue-400 dark:hover:border-sky-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-800 text-[18px] text-slate-950 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                {t('trend_title')}
              </h3>
              <p className="text-[13px] text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{t('trend_sub')}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/reports') }} className="font-bold">
              {t('full_analytics')} &rarr;
            </Button>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayTrend}>
                <defs>
                  <linearGradient id="purGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="saleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor, fontWeight: '700' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickColor, fontWeight: '700' }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => [fmt(v), 'Amount']}
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                />
                <Area type="monotone" dataKey="purchases" stroke="#2563eb" fill="url(#purGrad)" strokeWidth={2.5} name="Purchases" />
                <Area type="monotone" dataKey="sales" stroke="#818cf8" fill="url(#saleGrad)" strokeWidth={2.5} name="Sales" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Crop Produce Variety Distribution Pie Chart (Clickable -> /stock) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={() => navigate('/stock')}
          className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between cursor-pointer hover:border-blue-400 dark:hover:border-sky-400 hover:shadow-md transition-all group"
        >
          <div>
            <h3 className="font-display font-800 text-[18px] text-slate-950 dark:text-white tracking-tight flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
              <PieChartIcon size={19} className="text-blue-600 dark:text-sky-400 font-bold" /> {t('produce_share')}
            </h3>
            <p className="text-[13px] text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{t('produce_sub')}</p>
          </div>

          <div className="h-[220px] w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayCrop}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {displayCrop.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} qtl`, 'Volume']}
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11.5px', color: tooltipText, fontWeight: '700' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* District-wise Volume Bar Chart (Clickable -> /farmers) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate('/farmers')}
        className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 cursor-pointer hover:border-blue-400 dark:hover:border-sky-400 hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-800 text-[18px] text-slate-950 dark:text-white tracking-tight flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
              <MapPin size={19} className="text-emerald-600 dark:text-emerald-400" /> {t('district_dist')}
            </h3>
            <p className="text-[13px] text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{t('district_sub')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/farmers') }} className="font-bold">
            {t('view')} &rarr;
          </Button>
        </div>

        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayDistrict}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: tickColor, fontWeight: '700' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor, fontWeight: '700' }} axisLine={false} tickLine={false} width={45} />
              <Tooltip
                formatter={(v) => [`${v} qtl`, 'Weight']}
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontWeight: 'bold' }}
              />
              <Bar dataKey="weight" fill="#2563eb" radius={[6, 6, 0, 0]} name="Weight (qtl)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Leaderboard & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Farmers Leaderboard (Clickable -> /farmers) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={() => navigate('/farmers')}
          className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 cursor-pointer hover:border-blue-400 dark:hover:border-sky-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display font-800 text-[18px] text-slate-950 dark:text-white tracking-tight flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
              <Award size={19} className="text-amber-500" /> {t('top_farmers')}
            </h3>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/farmers') }} className="font-bold">
              {t('view_all_200')} &rarr;
            </Button>
          </div>

          <div className="space-y-3.5">
            {displayTopFarmers.map((f, i) => {
              const max = displayTopFarmers[0]?.total || 1
              return (
                <div
                  key={f.name}
                  onClick={(e) => { e.stopPropagation(); navigate('/farmers') }}
                  className="group/item flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-40 shrink-0">
                    <div className="text-[14px] font-extrabold text-slate-950 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-sky-400 transition-colors truncate">{t(f.name)}</div>
                    <div className="text-[11.5px] text-slate-600 dark:text-slate-400 font-mono font-bold">{f.code} · {t(f.village)}</div>
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(f.total / max) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 * i }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    />
                  </div>
                  <span className="text-[13.5px] font-mono text-emerald-700 dark:text-emerald-400 font-extrabold w-24 text-right">{fmt(f.total)}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Mill Dispatches Stream (Clickable -> /dispatch) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate('/dispatch')}
          className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 cursor-pointer hover:border-blue-400 dark:hover:border-sky-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display font-800 text-[18px] text-slate-950 dark:text-white tracking-tight flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
              <Truck size={19} className="text-blue-600 dark:text-sky-400" /> {t('recent_dispatches')}
            </h3>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/dispatch') }} className="font-bold">
              {t('dispatch_gate')} &rarr;
            </Button>
          </div>

          <div className="space-y-3">
            {displayDispatches.map((d) => (
              <div
                key={d.id}
                onClick={(e) => { e.stopPropagation(); navigate('/dispatch') }}
                className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-700 dark:text-sky-400 font-extrabold text-[13px]">{d.dispatch_bill_no}</span>
                    <Badge tone={d.is_unloaded ? 'success' : 'warning'} size="sm">
                      {d.is_unloaded ? t('unloaded') : t('in_transit')}
                    </Badge>
                  </div>
                  <div className="text-[13.5px] text-slate-900 dark:text-slate-100 font-semibold mt-0.5">
                    <strong className="text-slate-950 dark:text-white font-extrabold">{d.farmer_name}</strong> &rarr; <span className="text-indigo-700 dark:text-indigo-400 font-extrabold">{d.mill_name}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-emerald-700 dark:text-emerald-400 font-extrabold text-[14px]">{fmt(d.cost)}</div>
                  <div className="text-[11.5px] text-slate-600 dark:text-slate-400 font-bold">{d.dispatch_bags} bags ({d.dispatch_weight} qtl)</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
