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
    const today = new Date()
    const past7Days = new Date()
    past7Days.setDate(today.getDate() - 7)

    const { data, error } = await supabase
      .from("prompt_express")
      .select("*")
      .gte("date", past7Days.toISOString().split("T")[0])
      .order("date", { ascending: false })

    if (!error && data) {
      setOrders(data as Order[])
      setFilteredOrders(data as Order[])
      setCurrentPage(1)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    async function applyFilters() {
      let query = supabase.from("prompt_express").select("*")

      if (dateFrom) query = query.gte("date", dateFrom)
      if (dateTo) query = query.lte("date", dateTo)

      const { data, error } = await query.order("date", { ascending: false })

      if (!error && data) {
        let filtered = [...data]

        if (search) {
          filtered = filtered.filter(o =>
            `${o.order_id} ${o.name} ${o.phone}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
        }

        if (status === "Pending Orders") filtered = filtered.filter(o => !o.tracking_details)
        if (status === "Completed Orders") filtered = filtered.filter(o => o.tracking_details)

        setOrders(data as Order[])
        setFilteredOrders(filtered as Order[])
        setCurrentPage(1)
      }
    }

    if (!dateFrom && !dateTo) {
      loadOrders()
    } else {
      applyFilters()
    }
  }, [search, status, dateFrom, dateTo])

  function exportExcel() {
    const data = filteredOrders.map(o => ({
      Date: o.date,
      OrderID: o.order_id,
      Name: o.name,
      Address: o.address,
      Phone: o.phone,
      Phone2: o.phone2,
      Tracking: o.tracking_details
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Orders")
    XLSX.writeFile(wb, "orders.xlsx")
  }

  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const currentOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="p-10 bg-gray-50 min-h-screen space-y-6">

      <h1 className="text-3xl font-bold text-gray-800">DOC Delivery Dashboard</h1>

      <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded shadow">

        <div>
          <label htmlFor="search" className="block text-sm text-gray-700">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search order / name / phone"
            className="border p-2 rounded w-48"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="dateFrom" className="block text-sm text-gray-700">From Date</label>
          <input
            id="dateFrom"
            type="date"
            className="border p-2 rounded"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="dateTo" className="block text-sm text-gray-700">To Date</label>
          <input
            id="dateTo"
            type="date"
            className="border p-2 rounded"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm text-gray-700">Status</label>
          <select
            id="status"
            className="border p-2 rounded"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option>All Orders</option>
            <option>Pending Orders</option>
            <option>Completed Orders</option>
          </select>
        </div>

        <div>
          <label htmlFor="rows" className="block text-sm text-gray-700">Rows</label>
          <select
            id="rows"
            className="border p-2 rounded"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={exportExcel}
        >
          Export Excel
        </button>

        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={() => setShowAddEdit({} as Order)}
        >
          Add Order
        </button>

      </div>

      <OrderTable
        orders={currentOrders}
        reload={loadOrders}
        onView={o => setShowView(o)}
        onEdit={o => setShowAddEdit(o)}
      />

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showAddEdit && <AddEditOrderModal order={showAddEdit} close={() => setShowAddEdit(null)} reload={loadOrders} />}
      {showView && <ViewOrderModal order={showView} close={() => setShowView(null)} />}
    </div>
  )
}
