"use client"

import { useEffect, useState } from "react"
import { Order } from "../types/order"
import { supabase } from "../lib/supabase"

interface Props {
  order: Order
  close: () => void
  reload: () => void
}

export default function AddEditOrderModal({ order, close, reload }: Props) {
  const [order_id, setOrder_id] = useState(order.order_id || "")
  const [name, setName] = useState(order.name || "")
  const [address, setAddress] = useState(order.address || "")
  const [phone, setPhone] = useState(order.phone || "")
  const [phone2, setPhone2] = useState(order.phone2 || "")
  const [description, setDescription] = useState(order.description || "")
  const [trackingDetails, setTrackingDetails] = useState(order.tracking_details || "")

  const [products, setProducts] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>(order.products || [])
  const [searchKey, setSearchKey] = useState("")

  // Load products from supabase
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase.from("product_costing").select("product_name")
      if (!error && data) setProducts(data.map(p => p.product_name))
    }
    loadProducts()
  }, [])

  // Toggle product selection
  function toggleProduct(p: string) {
    setSelectedProducts(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function save() {
    const data: Partial<Order> = {
      order_id,
      name,
      address,
      phone,
      phone2,
      description,
      tracking_details: trackingDetails,
      couriers: '1', // auto set
      products: selectedProducts,
    }

    if (order.id) {
      await supabase.from("prompt_express").update(data).eq("id", order.id)
    } else {
      await supabase.from("prompt_express").insert(data)
    }

    reload()
    close()
  }

  const filteredProducts = products.filter(p =>
    p.toLowerCase().includes(searchKey.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-5 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-100 max-h-[90vh] overflow-y-auto space-y-4 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-3">{order.id ? "Edit Order" : "Add Order"}</h2>

        {/* Inputs */}
        <div className="space-y-2">
          <Input label="Order ID" value={order_id} setValue={setOrder_id} />
          <Input label="Name" value={name} setValue={setName} />
          <Input label="Address" value={address} setValue={setAddress} />
          <Input label="Phone" value={phone} setValue={setPhone} />
          <Input label="Phone 2" value={phone2} setValue={setPhone2} />
          <Input label="Description" value={description} setValue={setDescription} />
          <Input label="Tracking Details" value={trackingDetails} setValue={setTrackingDetails} />
        </div>

        {/* Product search */}
        <div className="mt-2">
          <label htmlFor="product-search" className="block mb-1 font-semibold text-sm">
            Search Products
          </label>
          <input
            id="product-search"
            type="text"
            placeholder="Search product"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            value={searchKey}
            onChange={e => setSearchKey(e.target.value)}
          />
        </div>

        {/* Product checkboxes */}
        <div className="max-h-44 overflow-y-auto gap-2 mt-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p, i) => (
              <label
                key={`${p}-${i}`} // unique key
                className={`flex items-center space-x-2 p-2  hover:bg-gray-50 cursor-pointer ${
                  selectedProducts.includes(p) ? "bg-blue-50 border-blue-300" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(p)}
                  onChange={() => toggleProduct(p)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span>{p}</span>
              </label>
            ))
          ) : (
            <div className="col-span-2 text-gray-400 text-sm text-center">No products found</div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={close}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// Accessible Input component
function Input({
  label,
  value,
  setValue,
}: {
  label: string
  value: string
  setValue: (v: string) => void
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).substr(2, 5)

  return (
    <div>
      <label htmlFor={id} className="block mb-1 font-semibold text-sm">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
      />
    </div>
  )
}