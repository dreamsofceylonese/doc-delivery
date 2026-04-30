"use client"

import { useEffect, useState } from "react"
import { Order } from "../types/order"
import { supabase } from "../lib/supabase"
import { X, Search, Package, Calendar, Phone, MapPin, User, FileText, Truck } from "lucide-react"

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
  const [orderDate, setOrderDate] = useState(order.date || "")

  const [products, setProducts] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>(order.products || [])
  const [searchKey, setSearchKey] = useState("")

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase.from("product_costing").select("product_name")
      if (!error && data) setProducts(data.map(p => p.product_name))
    }
    loadProducts()
  }, [])

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
      couriers: '1',
      products: selectedProducts,
      date: orderDate,
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{order.id ? "Edit Order" : "New Order"}</h2>
            <p className="text-sm text-slate-500">Fill in the details below to manage your delivery.</p>
          </div>
          <button 
          type="button" // Fixes the "button-type" error
          onClick={close} 
          aria-label="Close modal" // Fixes the "discernible text" error
          title="Close" // Optional: adds a tooltip on hover
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={20} />
        </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Order ID" icon={<Package size={16}/>} value={order_id} setValue={setOrder_id} />
            <InputDate label="Order Date" icon={<Calendar size={16}/>} value={orderDate} setValue={setOrderDate} />
            <Input label="Customer Name" icon={<User size={16}/>} value={name} setValue={setName} />
            <Input label="Primary Phone" icon={<Phone size={16}/>} value={phone} setValue={setPhone} />
            <Input label="Secondary Phone" icon={<Phone size={16}/>} value={phone2} setValue={setPhone2} />
            <Input label="Tracking Details" icon={<Truck size={16}/>} value={trackingDetails} setValue={setTrackingDetails} />
          </div>

          <div className="space-y-4">
            <Input label="Shipping Address" icon={<MapPin size={16}/>} value={address} setValue={setAddress} />
            <Input label="Notes / Description" icon={<FileText size={16}/>} value={description} setValue={setDescription} />
          </div>

          <hr className="border-slate-100" />

          {/* Section: Product Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Select Products</label>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {selectedProducts.length} Selected
              </span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                value={searchKey}
                onChange={e => setSearchKey(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p, i) => (
                  <label
                    key={`${p}-${i}`} 
                    className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer text-sm ${
                      selectedProducts.includes(p) 
                        ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(p)}
                      onChange={() => toggleProduct(p)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">{p}</span>
                  </label>
                ))
              ) : (
                <div className="col-span-2 py-8 text-slate-400 text-sm text-center italic">No products matched your search.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
          <button
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            onClick={close}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
            onClick={save}
          >
            {order.id ? "Update Order" : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, setValue, icon }: { label: string; value: string; setValue: (v: string) => void; icon?: React.ReactNode }) {
  const id = label.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className={`w-full border border-slate-200 rounded-xl ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300`}
        />
      </div>
    </div>
  )
}

function InputDate({ label, value, setValue, icon }: { label: string; value: string; setValue: (v: string) => void; icon?: React.ReactNode }) {
  const id = label.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>}
        <input
          id={id}
          type="date"
          value={value}
          onChange={e => setValue(e.target.value)}
          className={`w-full border border-slate-200 rounded-xl ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
        />
      </div>
    </div>
  )
}