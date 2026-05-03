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
    window.open(`${data.website}?tracking=${order.tracking_details}`, "_blank")
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
      container.style.cssText = "position:fixed;left:-10000px;top:0;"
      document.body.appendChild(container)
      const root = createRoot(container)
      root.render(<LabelPreview order={order} />)
      await new Promise(resolve => setTimeout(resolve, 100))
      const canvas = await html2canvas(container, { scale: 2 })
      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 288, 432)
      root.unmount()
      container.remove()
    }
    pdf.save(fileName)
  }

  const allSelected = selected.length === orders.length && orders.length > 0
  const someSelected = selected.length > 0 && selected.length < orders.length

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.08)", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {/* Table toolbar */}
      {selected.length > 0 && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: "#ede9fe", borderBottom: "1px solid rgba(99,102,241,0.15)" }}
        >
          <span className="text-sm font-medium" style={{ color: "#5b21b6" }}>
            {selected.length} order{selected.length > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={bulkPrint}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "#6366f1", color: "#fff", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#4f46e5")}
            onMouseLeave={e => (e.currentTarget.style.background = "#6366f1")}
          >
            <span>🖨</span> Bulk Print
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f7ff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
              <th className="p-4 w-10">
                <label htmlFor="select-all" className="sr-only">Select all orders</label>
                <div
                  className="flex items-center justify-center w-5 h-5 rounded cursor-pointer mx-auto"
                  style={{
                    border: `2px solid ${allSelected ? "#6366f1" : someSelected ? "#6366f1" : "#d1d5db"}`,
                    background: allSelected ? "#6366f1" : "transparent",
                    position: "relative"
                  }}
                  onClick={toggleSelectAll}
                >
                  {allSelected && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
                  {someSelected && !allSelected && (
                    <span style={{ color: "#6366f1", fontSize: 14, lineHeight: 1, position: "absolute" }}>–</span>
                  )}
                  <input id="select-all" type="checkbox" className="sr-only" checked={allSelected} onChange={toggleSelectAll} />
                </div>
              </th>
              {["Date", "Order ID", "Name", "Phone", "Tracking", "Actions"].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#6b7280" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {orders.map((o, idx) => {
              const isSelected = selected.includes(o.id)
              const isCompleted = !!o.tracking_details

              return (
                <tr
                  key={o.id}
                  style={{
                    background: isSelected ? "#f5f3ff" : idx % 2 === 0 ? "#fff" : "#fafafa",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#f9f8ff" }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "#fff" : "#fafafa" }}
                >
                  {/* Checkbox */}
                  <td className="p-4 text-center">
                    <div
                      className="flex items-center justify-center w-5 h-5 rounded mx-auto cursor-pointer"
                      style={{
                        border: `2px solid ${isSelected ? "#6366f1" : "#d1d5db"}`,
                        background: isSelected ? "#6366f1" : "transparent"
                      }}
                      onClick={() => toggleSelect(o.id)}
                    >
                      {isSelected && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                      <label htmlFor={`select-${o.id}`} className="sr-only">Select order {o.order_id}</label>
                      <input id={`select-${o.id}`} type="checkbox" className="sr-only" checked={isSelected} onChange={() => toggleSelect(o.id)} />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-500">{o.date}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-gray-800">#{o.order_id}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{o.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{o.phone}</td>
                  <td className="px-4 py-3">
                    {o.tracking_details ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "#dcfce7", color: "#15803d" }}
                      >
                        <span style={{ fontSize: 8 }}>●</span> {o.tracking_details}
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "#fef3c7", color: "#92400e" }}
                      >
                        <span style={{ fontSize: 8 }}>●</span> Pending
                      </span>
                    )}
                  </td>

                  {/* Action buttons */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <ActionBtn color="#6366f1" label="View" onClick={() => onView(o)} />
                      <ActionBtn color="#f59e0b" label="Edit" onClick={() => onEdit(o)} />
                      <ActionBtn color="#3b82f6" label="Print" onClick={() => printSingle(o)} />
                      {o.tracking_details && o.couriers && (
                        <ActionBtn color="#10b981" label="Track" onClick={() => trackOrder(o)} />
                      )}
                      <ActionBtn color="#ef4444" label="Delete" onClick={() => deleteOrder(o.id)} />
                    </div>
                  </td>
                </tr>
              )
            })}

            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-14">
                  <div className="flex flex-col items-center gap-2">
                    <span style={{ fontSize: 32 }}>📦</span>
                    <p className="text-gray-400 text-sm">No orders found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActionBtn({
  color, label, onClick
}: { color: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
      style={{
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
        cursor: "pointer",
        whiteSpace: "nowrap"
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = color
        ;(e.currentTarget as HTMLElement).style.color = "#fff"
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = `${color}18`
        ;(e.currentTarget as HTMLElement).style.color = color
      }}
    >
      {label}
    </button>
  )
}
