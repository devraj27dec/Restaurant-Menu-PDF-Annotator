import { useEffect, useState } from 'react'
import Header from './components/Header'
import axios from 'axios'
import type { MenuData } from './lib/types'
import { API_BACKEND_URL } from './lib/config'
import { FilterMenuTable } from './components/FilterMenuTable'

export default function Menus() {
  const [menus, setMenus] = useState<MenuData[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    async function fetchMenuList() {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BACKEND_URL}/api/menus/items`)
        const data = response.data
        setMenus(data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchMenuList()
  }, [])

 const sortedMenus = [...menus].sort(
  (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="text-slate-600 font-medium">Loading menu items...</p>
            </div>
          </div>
        ) : menus && menus.length > 0 ? (
         <div className="backdrop-blur-lg bg-white/60 rounded-2xl border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden p-4 space-y-4">
          {/* <ExportedFeatures menuItems={menuItems} /> */}
          <FilterMenuTable menus={sortedMenus} />
        </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4 bg-white rounded-xl shadow-lg border border-slate-200 p-12">
              <div className="text-slate-400">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">No Records Found</h3>
                <p className="text-slate-500 mt-1">There are no menu items available at the moment.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}