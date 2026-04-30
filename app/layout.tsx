import "./globals.css"
import { ReactNode } from "react"
import Link from "next/link"
import { LayoutDashboard, Phone, MapPin } from "lucide-react"

export const metadata = { 
  title: "DOC Delivery | Order Management", 
  description: "Advanced Delivery Order Management System" 
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        {/* Modern Sticky Header */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-6 h-20 flex justify-between items-center">
            
            {/* Branding */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <img src="/assets/logo.png" alt="DOC Delivery Logo" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-tight">
                  Dreams of Ceylonese <span className="text-blue-600 font-medium text-sm block md:inline">Pvt Ltd</span>
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 uppercase tracking-widest">
                    <Phone size={12} className="text-slate-400" />
                    +94 77 100 41 53
                  </div>
                  <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-green-600 uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    System Live
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg transition-all"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              {/* Future links can go here (e.g., Settings, Inventory) */}
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Modern Footer */}
        <footer className="bg-white border-t border-slate-200 py-8">
          <div className="max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium">
              © {new Date().getFullYear()} Dreams of Ceylonese. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
              <span>Powered by</span>
              <span className="text-slate-800 font-bold tracking-tight">Squarea<span className="text-blue-600">Soft</span></span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}