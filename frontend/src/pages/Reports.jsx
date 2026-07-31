import React from 'react'
import { FileText } from 'lucide-react'
import { EmptyState, Button } from '../components/ui.jsx'

export default function Reports() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <FileText size={18} className="text-accent" />
        </div>
        <div>
          <h1 className="font-display font-800 text-[22px] text-ink">Reports</h1>
          <p className="text-muted text-[13.5px] mt-0.5">Advanced business reporting and analytics</p>
        </div>
      </div>

      <div className="bg-surface rounded-card border border-line/60 mt-6">
        <EmptyState 
          icon={FileText} 
          title="Reports coming soon" 
          subtitle="Detailed PDF and Excel reports for sales, purchases, and inventory will be available here soon."
        />
      </div>
    </div>
  )
}
