import { Download } from "lucide-react";
import type { MenuItem } from "../lib/types";

interface ExportedFeaturesProps {
  menuItems: MenuItem[]
}

export default function ExportedFeatures({menuItems}: ExportedFeaturesProps) {

  const exportToJSON = () => {
    console.log("menuItems", menuItems);
    const dataStr = JSON.stringify(menuItems, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "menu-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Price", "Description", "Category"];
    const rows = menuItems.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.price.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const dataBlob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "menu-data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">Extracted Menu Data</h2>
      <div className="flex gap-2">
        <button
          onClick={exportToJSON}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>
  )
}