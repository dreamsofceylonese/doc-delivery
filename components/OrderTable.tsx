"use client"

import { Order } from "../types/order"
import { supabase } from "../lib/supabase"
import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import LabelPreview from "./PrintLable"
import { createRoot } from "react-dom/client"

interface Props {
  orders: Order[]
  reload: () => void
  onView: (order: Order) => void
  onEdit: (order: Order) => void
}

export default function OrderTable({ orders, reload, onView, onEdit }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  function toggleSelect(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (selected.length === orders.length) {
      setSelected([])
    } else {
      setSelected(orders.map(o => o.id))
    }
  }

  async function deleteOrder(id: string) {
    if (!confirm("Are you sure you want to delete this order?")) return
    await supabase.from("prompt_express").delete().eq("id", id)
    reload()
  }

  async function trackOrder(order: Order) {
    if (!order.tracking_details || !order.couriers) return
    const { data } = await supabase
      .from("couriers")
      .select("*")
      .eq("companyid", order.couriers)
      .single()
    if (!data) return
    const url = `${data.website}?tracking=${order.tracking_details}`
    window.open(url, "_blank")
  }

  async function printSingle(order: Order) {
    await printOrderPDF([order], `label_${order.order_id}.pdf`)
  }

  async function bulkPrint() {
    const selectedOrders = orders.filter(o => selected.includes(o.id))
    if (!selectedOrders.length) return alert("No orders selected")
    await printOrderPDF(selectedOrders, "bulk_labels.pdf")
  }

  async function printOrderPDF(ordersToPrint: Order[], fileName: string) {
    const pdf = new jsPDF({ unit: "pt", format: [288, 432] })

    for (let i = 0; i < ordersToPrint.length; i++) {
      const order = ordersToPrint[i]

      const container = document.createElement("div")
      container.style.position = "fixed"
      container.style.left = "-10000px"
      container.style.top = "0"
      document.body.appendChild(container)

      const root = createRoot(container)
      root.render(<LabelPreview order={order} />)

      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(container, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      if (i > 0) pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, 0, 288, 432)

      root.unmount()
      container.remove()
    }

    pdf.save(fileName)
  }

  return (
    <div>
      <div className="mb-4 flex items-center space-x-2">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={bulkPrint}
          disabled={!selected.length}
        >
          Bulk Print
        </button>
      </div>

      <table className="w-full border border-gray-300 rounded overflow-hidden bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border-b">
              <label htmlFor="select-all" className="sr-only">Select all orders</label>
              <input
                id="select-all"
                type="checkbox"
                checked={selected.length === orders.length && orders.length > 0}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="p-2 border-b">Date</th>
            <th className="p-2 border-b">OrderID</th>
            <th className="p-2 border-b">Name</th>
            <th className="p-2 border-b">Phone</th>
            <th className="p-2 border-b">Tracking</th>
            <th className="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-b last:border-b-0">
              <td className="text-center">
               <label htmlFor={`select-${o.id}`} className="sr-only">
                  Select order {o.order_id}
                </label>
                <input
                  id={`select-${o.id}`}
                  type="checkbox"
                  checked={selected.includes(o.id)}
                  onChange={() => toggleSelect(o.id)}
                />
              </td>
              <td className="p-2">{o.date}</td>
              <td className="p-2">{o.order_id}</td>
              <td className="p-2">{o.name}</td>
              <td className="p-2">{o.phone}</td>
              <td className="p-2">{o.tracking_details || ""}</td>
              <td className="p-2 space-x-1">
                <button className="bg-gray-500 text-white px-2 py-1 rounded" onClick={() => onView(o)}>View</button>
                <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => onEdit(o)}>Edit</button>
                <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => printSingle(o)}>Print</button>
                <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => trackOrder(o)}>Track</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => deleteOrder(o.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-4 text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
