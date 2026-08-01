import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Users, Factory, ShoppingCart, TrendingUp,
  Warehouse, Wallet, Receipt, FileText, Menu, X, LogOut, Wheat, Truck,
  ChevronLeft, ChevronRight, Sun, Moon, PanelLeftClose, PanelLeftOpen, Clock, Bell, AlertTriangle, Check, Globe
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import AIChatbot from './AIChatbot.jsx'

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('agroledger_sidebar_collapsed') === 'true'
  })
  const [now, setNow] = useState(new Date())

  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const notifRef = useRef(null)

  const NAV_ITEMS = [
    { to: '/', label: t('dashboard'), icon: LayoutGrid, end: true },
    { to: '/farmers', label: t('farmers'), icon: Users },
    { to: '/mills', label: t('mills'), icon: Factory },
    { to: '/dispatch', label: t('dispatch'), icon: Truck },
    { to: '/purchases', label: t('purchases'), icon: ShoppingCart },
    { to: '/sales', label: t('sales'), icon: TrendingUp },
    { to: '/stock', label: t('stock'), icon: Warehouse },
    { to: '/payments', label: t('payments'), icon: Wallet },
    { to: '/expenses', label: t('expenses'), icon: Receipt },
    { to: '/reports', label: t('reports'), icon: FileText },
  ]

  const MOBILE_ITEMS = NAV_ITEMS.filter((i) =>
    ['/', '/farmers', '/dispatch', '/purchases', '/sales', '/payments'].includes(i.to)
  )

  const notifications = [
    {
      id: 1,
      title: t('notif_1_title'),
      message: t('notif_1_msg'),
      time: '10 min ago',
      type: 'danger',
      unread: true,
      to: '/stock'
    },
    {
      id: 2,
      title: t('notif_2_title'),
      message: t('notif_2_msg'),
      time: '25 min ago',
      type: 'warning',
      unread: true,
      to: '/dispatch'
    },
    {
      id: 3,
      title: t('notif_3_title'),
      message: t('notif_3_msg'),
      time: '1 hr ago',
      type: 'info',
      unread: true,
      to: '/payments'
    }
  ]

  useEffect(() => {
    localStorage.setItem('agroledger_sidebar_collapsed', isCollapsed)
  }, [isCollapsed])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex md:flex-col shrink-0 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-white sticky top-0 h-screen z-30 shadow-xl transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`px-4 py-5 flex items-center justify-between border-b border-slate-800/90 bg-slate-950/40 ${isCollapsed ? 'justify-center' : ''}`}>
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => navigate('/')}
            title="AgroLedger ERP"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 border border-blue-400/30">
              <Wheat size={26} className="text-white drop-shadow-md" />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap">
                <div className="font-display font-800 text-[20px] tracking-tight leading-none text-white">AgroLedger</div>
                <div className="text-[11.5px] text-sky-400 font-extrabold mt-1 tracking-wider uppercase">Enterprise ERP</div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="px-3 py-2 flex justify-center border-b border-slate-800">
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors w-full flex items-center justify-center"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all relative ${
                  isCollapsed ? 'justify-center px-0' : ''
                } ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 text-white z-50 md:hidden flex flex-col"
            >
              <div className="px-5 py-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3" onClick={() => { navigate('/'); setDrawerOpen(false) }}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Wheat size={22} className="text-white" />
                  </div>
                  <span className="font-display font-800 text-[18px] text-white">AgroLedger</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-medium ${
                        isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="px-5 py-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-display font-800 text-sm flex items-center justify-center shadow-md">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-[14px] leading-tight">{user?.name || 'Admin'}</div>
                    <div className="text-[12px] text-blue-400 font-bold capitalize">{user?.role || 'Administrator'}</div>
                  </div>
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-bold transition-colors w-full">
                  <LogOut size={16} /> Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#090d16] transition-colors duration-200">
        {/* Sleek Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm transition-colors">
          {/* Mobile Drawer Button + Live Time Widget */}
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="md:hidden text-slate-700 dark:text-slate-300">
              <Menu size={22} />
            </button>
            <div className="hidden md:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <div className="font-mono text-[13px] font-extrabold text-slate-950 dark:text-white">
                  {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls: Language Selector + Notifications Bell + ICON-ONLY Theme Toggle + Admin Profile */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown (English vs Telugu) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-extrabold transition-all ${
                  lang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="English Language"
              >
                EN
              </button>
              <button
                onClick={() => setLang('te')}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-extrabold transition-all ${
                  lang === 'te'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="తెలుగు భాష"
              >
                తెలుగు
              </button>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400 transition-colors shadow-sm"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-mono font-extrabold text-[10.5px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-[340px] sm:w-[370px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
                  >
                    <div className="bg-slate-900 dark:bg-slate-950 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-blue-400" />
                        <span className="font-display font-800 text-[15px]">{t('notif_title')}</span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[340px] overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifOpen(false)
                            if (n.to) navigate(n.to)
                          }}
                          className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            <AlertTriangle size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[13.5px] font-extrabold text-slate-950 dark:text-white">{n.title}</span>
                              <span className="text-[10.5px] font-mono text-slate-500">{n.time}</span>
                            </div>
                            <p className="text-[12.5px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ICON-ONLY Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400 transition-colors shadow-sm"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun size={18} className="text-amber-400 shrink-0" /> : <Moon size={18} className="text-sky-400 shrink-0" />}
            </button>

            {/* Admin Profile Pill */}
            <div className="hidden md:flex items-center gap-2.5 pl-2.5 border-l border-slate-200 dark:border-slate-800">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-display font-800 text-xs flex items-center justify-center shadow-md shadow-blue-500/20">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>

              <div className="text-left">
                <div className="font-extrabold text-slate-950 dark:text-white text-[13.5px] leading-tight">{user?.name || 'Admin'}</div>
                <div className="text-[11px] text-blue-600 dark:text-sky-400 font-bold capitalize">{user?.role || 'Administrator'}</div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-[1500px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-start sm:justify-center overflow-x-auto shadow-lg gap-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          {MOBILE_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 min-w-[72px] shrink-0 rounded-lg text-[10.5px] ${
                  isActive ? 'text-blue-600 dark:text-sky-400 font-bold bg-blue-50 dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <AIChatbot />
    </div>
  )
}
