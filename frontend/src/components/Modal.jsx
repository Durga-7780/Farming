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
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />
          {/* Centering wrapper — always centers the modal */}
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className={`pointer-events-auto w-full sm:w-[92vw] ${
                wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
              } max-h-[90dvh] sm:max-h-[85vh] bg-surface sm:rounded-card rounded-t-[18px] shadow-card flex flex-col`}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line/40 shrink-0 relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-line rounded-full sm:hidden" />
                <h3 className="font-display font-700 text-[17px] text-ink">{title}</h3>
                <button onClick={onClose} className="text-muted hover:text-ink transition-colors -mr-1 p-1">
                  <X size={19} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
