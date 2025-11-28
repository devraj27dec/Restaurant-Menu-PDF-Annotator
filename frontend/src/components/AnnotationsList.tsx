import { Loader2, Trash2 } from "lucide-react";
import type { Annotation } from "../lib/types";

export default function AnnotationsList({
  annotations,
  setAnnotations,
  setStep,
}: {
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  setStep: (step: number) => void;
}) {

  const deleteAnnotation = (id: number) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const updateAnnotation = (
    id: number,
    field: keyof Omit<Annotation, "id" | "x" | "y" | "width" | "height" | "pageNumber" | "groupId">,
    value: string
  ) => {
    setAnnotations(
      annotations.map(a => a.id === id ? { ...a, [field]: value } : a)
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Extracted Items ({annotations.length})</h3>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {annotations.map((ann) => (
          <div key={ann.id} className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
            {ann.isExtracting ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Extracting...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <input
                    type="text"
                    value={ann.category || ""}
                    onChange={(e) => updateAnnotation(ann.id, "category", e.target.value)}
                    placeholder="Category"
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium flex-1"
                  />
                  <button
                    onClick={() => deleteAnnotation(ann.id)}
                    className="ml-2 text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={ann.name || ""}
                  onChange={(e) => updateAnnotation(ann.id, "name", e.target.value)}
                  placeholder="Item name"
                  className="w-full px-2 py-1 font-semibold text-gray-900 border border-gray-300 rounded"
                />

                <input
                  type="text"
                  value={ann.price || ""}
                  onChange={(e) => updateAnnotation(ann.id, "price", e.target.value)}
                  placeholder="Price"
                  className="w-full px-2 py-1 text-green-600 font-bold border border-gray-300 rounded"
                />

                <textarea
                  value={ann.description || ""}
                  onChange={(e) => updateAnnotation(ann.id, "description", e.target.value)}
                  placeholder="Description"
                  className="w-full px-2 py-1 text-sm text-gray-600 border border-gray-300 rounded resize-none"
                  rows={2}
                />

                <div className="text-xs text-gray-500">
                  Page {ann.pageNumber}
                </div>
              </div>
            )}
          </div>
        ))}

        {annotations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No items yet</p>
            <p className="text-xs mt-1">Draw boxes to extract menu items</p>
          </div>
        )}
      </div>

      {annotations.length > 0 && (
        <button
          onClick={() => setStep(3)}
          className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Continue to Review ({annotations.length} items)
        </button>
      )}
    </div>
  );
}
