import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          {/* Centering wrapper */}
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className={`pointer-events-auto w-full sm:w-[92vw] ${
                wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
              } max-h-[90dvh] sm:max-h-[85vh] bg-white border border-slate-200 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 relative bg-slate-50/80">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-300 rounded-full sm:hidden" />
                <h3 className="font-display font-700 text-[17px] text-slate-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-lg transition-colors -mr-1"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 pb-6 text-slate-800">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
