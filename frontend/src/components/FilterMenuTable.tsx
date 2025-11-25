import { useState } from "react";
import { format } from "date-fns";
import type { MenuData } from "../lib/types";



interface MenuTableProps {
  menus: MenuData[];
}

export const FilterMenuTable = ({ menus }: MenuTableProps) => {
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMenus = menus.filter(
    (menu) => statusFilter === "all" || menu.status === statusFilter
  );

  const toggleExpand = (menuId: string) => {
    setExpandedMenuId(expandedMenuId === menuId ? null : menuId);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "extracted":
        return "bg-green-100 text-green-700";
      case "annotated":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryClass = (category: string) => {
    const colors: { [key: string]: string } = {
      APPETIZERS: "bg-orange-100 text-orange-700",
      ENTREES: "bg-green-100 text-green-700",
      DESSERTS: "bg-yellow-100 text-yellow-700",
      BEVERAGES: "bg-blue-100 text-blue-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Menu Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all uploaded menus
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="extracted">Extracted</option>
          <option value="annotated">Annotated</option>
          <option value="uploaded">Uploaded</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12"></th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Filename</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Upload Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMenus.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No menus found
                  </td>
                </tr>
              ) : (
                filteredMenus.map((menu) => (
                  <>
                    <tr key={menu.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExpand(menu.id)}
                          className="p-1 hover:bg-gray-100 rounded transition"
                        >
                          <svg
                            className={`w-5 h-5 text-gray-600 transition-transform ${
                              expandedMenuId === menu.id ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{menu.filename}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(menu.uploadDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(menu.status)}`}>
                          {menu.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {menu.menuItems.length} items
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleExpand(menu.id)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium inline-flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Items
                        </button>
                      </td>
                      
                    </tr>
                    {expandedMenuId === menu.id && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 p-6">
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 text-lg mb-4">
                              Menu Items ({menu.menuItems.length})
                            </h3>
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {menu.menuItems.map((item) => (
                                      <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                          <span className="font-medium text-gray-900">{item.name || "—"}</span>
                                        </td>
                                        
                                        <td className="px-4 py-3">
                                          <span className="text-orange-600 font-semibold">${item.price || "—"}</span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-600">
                                          <span className="line-clamp-2">{item.description || "—"}</span>
                                        </td>

                                        <td className="px-4 py-3">
                                          <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryClass(item.category)}`}>
                                            {item.category || "—"}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
