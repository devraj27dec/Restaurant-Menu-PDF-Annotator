import { Save, Edit2 } from "lucide-react";
import type { MenuItem } from "../lib/types";

interface MenuItemsProps {
  menuItems: MenuItem[],
  editingItem?: number | null; 
  setEditingItem?: (value: number | null) => void;
  updateMenuItem?: (id: number, field: keyof MenuItem, value: string) => void;
}

export default function MenuTable({menuItems ,editingItem , updateMenuItem , setEditingItem}:MenuItemsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Item Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {menuItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {editingItem === item.id ? (
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateMenuItem?.(item.id, "name", e.target.value)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="font-medium">{item.name || "—"}</span>
                )}
              </td>

              <td className="px-4 py-3">
                {editingItem === item.id ? (
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => updateMenuItem?.(item.id, "price", e.target.value)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-green-600 font-semibold">{item.price || "—"} $</span>
                )}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600">
                {editingItem === item.id ? (
                  <textarea
                    value={item.description}
                    onChange={(e) => updateMenuItem?.(item.id, "description", e.target.value)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                ) : (
                  <span className="line-clamp-2">{item.description || "—"}</span>
                )}
              </td>

              <td className="px-4 py-3">
                {editingItem === item.id ? (
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => updateMenuItem?.(item.id, "category", e.target.value)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                    {item.category || "—"}
                  </span>
                )}
              </td>

              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {editingItem === item.id ? (
                    <button
                      onClick={() => setEditingItem?.(null)}
                      className="p-1 hover:bg-green-50 rounded transition"
                      title="Save"
                    >
                      <Save className="w-4 h-4 text-green-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingItem?.(item.id)}
                      className="p-1 hover:bg-blue-50 rounded transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
