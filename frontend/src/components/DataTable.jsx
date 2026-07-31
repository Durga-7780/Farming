import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, X, RotateCcw,
  Download, LayoutGrid, List, ChevronLeft, ChevronRight, SlidersHorizontal, Check
} from 'lucide-react'
import { Button, inputClass, Badge } from './ui.jsx'

export default function DataTable({
  columns = [],
  data = [],
  searchKeys = [],
  filterFields = [],
  onRowClick,
  title,
  subtitle,
  action,
  defaultSortKey = '',
  defaultSortOrder = 'desc',
  pageSizeOptions = [10, 25, 50, 100],
  cardRender,
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(defaultSortKey || (columns[0]?.key || ''))
  const [sortOrder, setSortOrder] = useState(defaultSortOrder)
  const [showFilters, setShowFilters] = useState(false)
  const [filterValues, setFilterValues] = useState({})
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[1] || 25)

  // Handle Sort Toggle from Header
  const handleSort = (key) => {
    if (!key) return
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  // Count active filters (excluding search and sort)
  const activeFilterCount = useMemo(() => {
    return Object.values(filterValues).filter(
      (v) => v !== '' && v !== null && v !== undefined && v !== 'all'
    ).length
  }, [filterValues])

  // Reset all filters and search
  const handleResetFilters = () => {
    setSearch('')
    setFilterValues({})
    setCurrentPage(1)
  }

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Global Text Search
      if (search.trim()) {
        const query = search.toLowerCase().trim()
        const matchesSearch = searchKeys.some((key) => {
          const val = item[key]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(query)
        })
        if (!matchesSearch) return false
      }

      // 2. Custom Advanced Filters
      for (const field of filterFields) {
        const val = filterValues[field.key]
        if (val === undefined || val === '' || val === 'all' || val === null) continue

        const itemVal = item[field.key]

        if (field.type === 'select') {
          if (String(itemVal) !== String(val)) return false
        } else if (field.type === 'boolean') {
          if (Boolean(itemVal) !== (val === 'true')) return false
        } else if (field.type === 'min') {
          if (Number(itemVal || 0) < Number(val)) return false
        } else if (field.type === 'max') {
          if (Number(itemVal || 0) > Number(val)) return false
        } else if (field.type === 'search') {
          if (!String(itemVal || '').toLowerCase().includes(String(val).toLowerCase())) return false
        }
      }
      return true
    })
  }, [data, search, searchKeys, filterFields, filterValues])

  // Sort Logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey]
      let bVal = b[sortKey]

      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      const strA = String(aVal).toLowerCase()
      const strB = String(bVal).toLowerCase()
      if (strA < strB) return sortOrder === 'asc' ? -1 : 1
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortKey, sortOrder])

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  // CSV Export
  const exportToCSV = () => {
    if (!sortedData.length) return
    const headers = columns.map((c) => `"${c.label}"`).join(',')
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          let val = row[c.key]
          if (val === null || val === undefined) val = ''
          return `"${String(val).replace(/"/g, '""')}"`
        })
        .join(',')
    )
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${title || 'agroledger_export'}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const sortableColumns = columns.filter((c) => c.sortable !== false && c.key)

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header / Title & Primary Action */}
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            {title && <h1 className="font-display font-800 text-[23px] text-slate-950 dark:text-slate-100 tracking-tight">{title}</h1>}
            {subtitle && <p className="text-slate-600 dark:text-slate-400 font-medium text-[13.5px] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Control Bar: Search + Filter Drawer Toggle + Export + View Switch */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          {/* Global Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={`Search ${title ? title.toLowerCase() : 'records'}...`}
              className={`${inputClass} pl-10 pr-8 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-[14px] min-h-[42px] py-2`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filters Toggle Button */}
          <Button
            variant={showFilters || activeFilterCount > 0 ? 'accent' : 'ghost'}
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            className="!min-h-[42px] !py-2 shrink-0 relative font-semibold"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center -mr-1 shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Reset button */}
          {(search || activeFilterCount > 0) && (
            <button
              onClick={handleResetFilters}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 font-semibold text-[12.5px] flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export */}
          <Button
            variant="ghost"
            size="md"
            onClick={exportToCSV}
            className="!min-h-[42px] !py-2 text-[13px] font-semibold shrink-0"
            title="Export data to CSV"
          >
            <Download size={15} />
            <span className="hidden md:inline">Export</span>
          </Button>

          {/* View Mode Toggle */}
          {cardRender && (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                }`}
                title="Table view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                }`}
                title="Card grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-blue-800 dark:text-sky-400 font-display font-800 text-[15px]">
                  <SlidersHorizontal size={17} />
                  <span>Filters &amp; Sorting Options</span>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Grid of Advanced Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* 1. Sorting Control Dropdown */}
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block">Sort By Column</label>
                  <div className="flex gap-1.5">
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value)}
                      className={`${inputClass} bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 py-1.5 text-[13px] min-h-[40px] text-slate-900 dark:text-slate-100 font-semibold flex-1`}
                    >
                      {sortableColumns.map((col) => (
                        <option key={col.key} value={col.key}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-blue-700 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-700 font-bold transition-colors shrink-0 flex items-center justify-center"
                      title={sortOrder === 'asc' ? 'Ascending Order' : 'Descending Order'}
                    >
                      {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* 2. Custom Filter Fields */}
                {filterFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 block">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={filterValues[field.key] || ''}
                        onChange={(e) => {
                          setFilterValues({ ...filterValues, [field.key]: e.target.value })
                          setCurrentPage(1)
                        }}
                        className={`${inputClass} bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 py-1.5 text-[13px] min-h-[40px] text-slate-900 dark:text-slate-100 font-medium`}
                      >
                        <option value="">All {field.label}s</option>
                        {field.options?.map((opt) => {
                          const val = typeof opt === 'object' ? opt.value : opt
                          const lbl = typeof opt === 'object' ? opt.label : opt
                          return (
                            <option key={val} value={val}>
                              {lbl}
                            </option>
                          )
                        })}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <select
                        value={filterValues[field.key] || ''}
                        onChange={(e) => {
                          setFilterValues({ ...filterValues, [field.key]: e.target.value })
                          setCurrentPage(1)
                        }}
                        className={`${inputClass} bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 py-1.5 text-[13px] min-h-[40px] text-slate-900 dark:text-slate-100 font-medium`}
                      >
                        <option value="">All Statuses</option>
                        <option value="true">Yes / Active / True</option>
                        <option value="false">No / Inactive / False</option>
                      </select>
                    ) : field.type === 'min' || field.type === 'max' ? (
                      <input
                        type="number"
                        placeholder={field.placeholder || field.label}
                        value={filterValues[field.key] || ''}
                        onChange={(e) => {
                          setFilterValues({ ...filterValues, [field.key]: e.target.value })
                          setCurrentPage(1)
                        }}
                        className={`${inputClass} bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 py-1.5 text-[13px] min-h-[40px] text-slate-900 dark:text-slate-100 font-medium`}
                      />
                    ) : (
                      <input
                        placeholder={field.placeholder || `Filter by ${field.label.toLowerCase()}...`}
                        value={filterValues[field.key] || ''}
                        onChange={(e) => {
                          setFilterValues({ ...filterValues, [field.key]: e.target.value })
                          setCurrentPage(1)
                        }}
                        className={`${inputClass} bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 py-1.5 text-[13px] min-h-[40px] text-slate-900 dark:text-slate-100 font-medium`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[12px] text-slate-500 dark:text-slate-400">
                  Found <strong className="text-slate-950 dark:text-slate-100 font-bold">{sortedData.length}</strong> matching records
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                    <RotateCcw size={13} /> Reset Filters
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setShowFilters(false)}>
                    <Check size={13} /> Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table / Grid Container */}
      {paginatedData.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3 text-blue-700 dark:text-sky-400">
            <Search size={22} />
          </div>
          <h4 className="font-display font-700 text-[16px] text-slate-900 dark:text-slate-100">No records found</h4>
          <p className="text-[13.5px] text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {search || activeFilterCount > 0
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'There are no items recorded in this section yet.'}
          </p>
          {(search || activeFilterCount > 0) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="mt-4">
              <RotateCcw size={13} /> Reset Filters
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Data Table with Dark / Light Mode Support */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-extrabold text-[11.5px] select-none">
                  {columns.map((col) => {
                    const isSorted = sortKey === col.key
                    const isSortable = col.sortable !== false
                    return (
                      <th
                        key={col.key}
                        onClick={() => isSortable && handleSort(col.key)}
                        className={`py-3.5 px-4 transition-colors ${
                          isSortable ? 'cursor-pointer hover:text-blue-700 dark:hover:text-sky-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50' : ''
                        } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                      >
                        <div
                          className={`inline-flex items-center gap-1.5 ${
                            col.align === 'right' ? 'justify-end w-full' : ''
                          }`}
                        >
                          <span>{col.label}</span>
                          {isSortable && (
                            <span className="text-slate-500 dark:text-slate-400">
                              {isSorted ? (
                                sortOrder === 'asc' ? (
                                  <ArrowUp size={14} className="text-blue-700 dark:text-sky-400 font-extrabold" />
                                ) : (
                                  <ArrowDown size={14} className="text-blue-700 dark:text-sky-400 font-extrabold" />
                                )
                              ) : (
                                <ArrowUpDown size={12} className="opacity-60" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-blue-50/70 dark:hover:bg-slate-800/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    } ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-950/40'}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 text-slate-900 dark:text-slate-100 font-medium ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                        }`}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-slate-700 dark:text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-100 text-[12.5px] font-semibold"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
              <span>
                Showing <strong className="text-slate-950 dark:text-slate-100 font-bold">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-950 dark:text-slate-100 font-bold">
                  {Math.min(currentPage * pageSize, sortedData.length)}
                </strong>{' '}
                of <strong className="text-slate-950 dark:text-slate-100 font-bold">{sortedData.length}</strong> entries
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-slate-900 dark:text-slate-100 font-mono font-bold text-[13px]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Card Grid View Alternative */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map((row, idx) => (
              <React.Fragment key={row.id || idx}>
                {cardRender(row, idx)}
              </React.Fragment>
            ))}
          </div>

          {/* Card Pagination Footer */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between text-[13px] text-slate-700 dark:text-slate-300 font-medium">
            <span>
              Showing {sortedData.length} total entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-slate-900 dark:text-slate-100 font-mono font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
