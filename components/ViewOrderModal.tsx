"use client"

import { Order } from "../types/order"

interface Props {
  order: Order
  close: () => void
}

export default function ViewOrderModal({ order, close }: Props) {
  const initials = order.name
    ? order.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  const isCompleted = !!order.tracking_details

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* Header band */}
        <div
          className="px-6 pt-6 pb-5"
          style={{
            background: "linear-gradient(135deg, #f8f7ff 0%, #ede9fe 100%)",
            borderBottom: "1px solid rgba(99,102,241,0.12)"
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="flex items-center justify-center rounded-full font-semibold text-sm"
                style={{
                  width: 44, height: 44,
                  background: "#6366f1",
                  color: "#fff",
                  letterSpacing: "0.05em"
                }}
              >
                {initials}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-base leading-tight">{order.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Order #{order.order_id}</p>
              </div>
            </div>

            {/* Status badge */}
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={isCompleted
                ? { background: "#dcfce7", color: "#15803d" }
                : { background: "#fef3c7", color: "#92400e" }
              }
            >
              {isCompleted ? "Completed" : "Pending"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Two-column info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Date" value={order.date || "—"} />
            <InfoCard label="Phone" value={order.phone || "—"} />
            {order.phone2 && <InfoCard label="Alt. Phone" value={order.phone2} />}
            <InfoCard
              label="Tracking"
              value={order.tracking_details || "Not assigned"}
              highlight={!!order.tracking_details}
            />
          </div>

          {/* Address */}
          <div
            className="rounded-xl p-3"
            style={{ background: "#f9fafb", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Delivery Address</p>
            <p className="text-sm text-gray-700 leading-relaxed">{order.address || "—"}</p>
          </div>

          {/* Products */}
          {order.products && order.products.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Products</p>
              <div className="flex flex-wrap gap-1.5">
                {order.products.map((p, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "#ede9fe", color: "#5b21b6" }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "#fafafa" }}
        >
          <button
            onClick={close}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#4f46e5")}
            onMouseLeave={e => (e.currentTarget.style.background = "#6366f1")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "#f9fafb", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p
        className="text-sm font-medium leading-tight"
        style={{ color: highlight ? "#5b21b6" : "#1f2937" }}
      >
        {value}
      </p>
    </div>
  )
}