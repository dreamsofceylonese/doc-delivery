"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import OrderTable from "../components/OrderTable"
import { Order } from "../types/order"
import AddEditOrderModal from "../components/AddEditOrderModal"
import ViewOrderModal from "../components/ViewOrderModal"
import * as XLSX from "xlsx"

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])


  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All Orders")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [showAddEdit, setShowAddEdit] = useState<null | Order>(null)
  const [showView, setShowView] = useState<null | Order>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  async function loadOrders() {
    const { data, error } = await supabase
      .from("prompt_express")
      .select("*")
      .order("date", { ascending: false })
    if (!error && data) setOrders(data as Order[])
  }

  useEffect(() => { loadOrders() }, [])

  useEffect(() => {
    let filtered = [...orders]
    if (dateFrom) filtered = filtered.filter(o => o.date >= dateFrom)
    if (dateTo) filtered = filtered.filter(o => o.date <= dateTo)
    if (search) {
      filtered = filtered.filter(o =>
        `${o.order_id} ${o.name} ${o.phone}`.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (status === "Pending Orders") filtered = filtered.filter(o => !o.tracking_details)
    if (status === "Completed Orders") filtered = filtered.filter(o => o.tracking_details)
    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [orders, search, status, dateFrom, dateTo])

  function exportExcel() {
    const data = filteredOrders.map(o => ({
      Date: o.date, OrderID: o.order_id, Name: o.name,
      Address: o.address, Phone: o.phone, Phone2: o.phone2,
      Tracking: o.tracking_details
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Orders")
    XLSX.writeFile(wb, "orders.xlsx")
  }

  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const currentOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function getPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | "...")[] = []
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", total)
    } else if (current >= total - 3) {
      pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", total)
    }
    return pages
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages)
  const pendingCount = orders.filter(o => !o.tracking_details).length
  const completedCount = orders.filter(o => o.tracking_details).length

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Top nav bar */}
      <nav className="px-8 py-4 flex items-center justify-between bg-white border-b border-black/5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500">
            <span className="text-white text-sm">📦</span>
          </div>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">DOC Delivery</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
          >
            ↓ Export Excel
          </button>
          <button
            onClick={() => setShowAddEdit({} as Order)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all bg-indigo-500 text-white hover:bg-indigo-600 border-none"
          >
            + Add Order
          </button>
        </div>
      </nav>

      <div className="px-8 py-6 space-y-5 max-w-screen-xl mx-auto">

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Orders" value={orders.length} colorClass="text-indigo-600" bgClass="bg-indigo-100" />
          <StatCard label="Pending" value={pendingCount} colorClass="text-amber-600" bgClass="bg-amber-100" />
          <StatCard label="Completed" value={completedCount} colorClass="text-green-700" bgClass="bg-green-100" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-end p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
          <FilterField label="Search" id="search-input">
            <input
              id="search-input"
              type="text"
              placeholder="Order / name / phone..."
              className="border rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </FilterField>

          <FilterField label="From Date" id="date-from">
            <input
              id="date-from"
              type="date"
              title="Select start date"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </FilterField>

          <FilterField label="To Date" id="date-to">
            <input
              id="date-to"
              type="date"
              title="Select end date"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </FilterField>

          <FilterField label="Status" id="status-select">
            <select
              id="status-select"
              title="Filter by order status" 
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option>All Orders</option>
              <option>Pending Orders</option>
              <option>Completed Orders</option>
            </select>
          </FilterField>

          <FilterField label="Rows per page" id="page-size">
            <select
              id="page-size"
              title="Select number of rows to display"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </FilterField>

          {(search || dateFrom || dateTo || status !== "All Orders") && (
            <button
              onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setStatus("All Orders") }}
              className="text-sm px-3 py-2 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredOrders.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">{filteredOrders.length}</span> orders
          </p>
        </div>

        <OrderTable
          orders={currentOrders}
          reload={loadOrders}
          onView={o => setShowView(o)}
          onEdit={o => setShowAddEdit(o)}
        />

        {/* Smart Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 py-2">
            <PaginationBtn
              label="← Prev"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
            />

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                    currentPage === p
                      ? "bg-indigo-500 text-white border-none"
                      : "bg-white text-gray-700 border border-black/10 hover:bg-indigo-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <PaginationBtn
              label="Next →"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
            />
          </div>
        )}
      </div>

      {showAddEdit && (
        <AddEditOrderModal order={showAddEdit} close={() => setShowAddEdit(null)} reload={loadOrders} />
      )}
      {showView && (
        <ViewOrderModal order={showView} close={() => setShowView(null)} />
      )}
    </div>
  )
}

function StatCard({ label, value, colorClass, bgClass }: { label: string; value: number; colorClass: string; bgClass: string }) {
  return (
    <div className="rounded-2xl p-5 bg-white border border-black/5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${bgClass}`}>
          {label === "Total Orders" ? "📦" : label === "Pending" ? "⏳" : "✅"}
        </div>
      </div>
    </div>
  )
}

function FilterField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}

function PaginationBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 h-9 rounded-lg text-sm font-medium transition-all bg-white border border-black/10 
        ${disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-indigo-50 cursor-pointer"}`}
    >
      {label}
    </button>
  )
}