import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Users, Factory, ShoppingCart, TrendingUp,
  Warehouse, Wallet, Receipt, FileText, Menu, X, LogOut, Wheat, Truck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import AIChatbot from './AIChatbot.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/farmers', label: 'Farmers', icon: Users },
  { to: '/mills', label: 'Mills', icon: Factory },
  { to: '/dispatch', label: 'Dispatch', icon: Truck },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: TrendingUp },
  { to: '/stock', label: 'Stock', icon: Warehouse },
  { to: '/payments', label: 'Payments', icon: Wallet },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/reports', label: 'Reports', icon: FileText },
]

const MOBILE_ITEMS = NAV_ITEMS.filter((i) =>
  ['/', '/purchases', '/sales', '/stock', '/reports'].includes(i.to)
)

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-primary text-white relative">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] grain-rail" />
        <div className="px-6 py-6 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent/90 flex items-center justify-center">
            <Wheat size={18} className="text-primary-dark" />
          </div>
          <div>
            <div className="font-display font-800 text-[17px] tracking-tight leading-none">AgroLedger</div>
            <div className="text-[11px] text-white/50 mt-0.5">Procurement ERP</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors relative ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/65 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute left-0 top-1 bottom-1 w-[3px] bg-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon size={17} strokeWidth={2} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent/90 flex items-center justify-center text-primary-dark font-display font-700 text-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{user?.name}</div>
              <div className="text-[11px] text-white/45 capitalize">{user?.role}</div>
            </div>
            <button onClick={logout} className="text-white/50 hover:text-white transition-colors" title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-primary text-white z-50 md:hidden flex flex-col"
            >
              <div className="px-5 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/90 flex items-center justify-center">
                    <Wheat size={16} className="text-primary-dark" />
                  </div>
                  <span className="font-display font-800">AgroLedger</span>
                </div>
                <button onClick={() => setDrawerOpen(false)}><X size={20} /></button>
              </div>
              <nav className="flex-1 px-3 space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-[14px] ${
                        isActive ? 'bg-white/10 text-white font-medium' : 'text-white/65'
                      }`
                    }
                  >
                    <item.icon size={17} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="px-5 py-4 border-t border-white/10">
                <button onClick={logout} className="flex items-center gap-2 text-white/70 text-sm">
                  <LogOut size={16} /> Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-primary text-white px-4 py-3.5 flex items-center justify-between">
          <button onClick={() => setDrawerOpen(true)}><Menu size={22} /></button>
          <div className="flex items-center gap-2">
            <Wheat size={16} className="text-accent" />
            <span className="font-display font-700 text-[15px]">AgroLedger</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-accent/90 flex items-center justify-center text-primary-dark font-display font-700 text-[11px]">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-[1400px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-line px-2 py-1.5 flex items-center justify-around">
          {MOBILE_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10.5px] ${
                  isActive ? 'text-primary' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={19} strokeWidth={isActive ? 2.4 : 2} />
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
