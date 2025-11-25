import { Loader2, Trash2, Square, AlignLeft, DollarSign, Layers, Tag } from "lucide-react";
import  type{ Annotation, Group } from "../lib/types";


type IconComponent = typeof Tag;

interface AnnotationType {
  id: string;
  label: string;
  color: string;
  icon: IconComponent;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ANNOTATION_TYPES: AnnotationType[] = [
  { id: "item", label: "Item Name", color: "#3b82f6", icon: Tag },
  { id: "price", label: "Price", color: "#10b981", icon: DollarSign },
  {
    id: "description",
    label: "Description",
    color: "#f59e0b",
    icon: AlignLeft,
  },
  { id: "category", label: "Category", color: "#8b5cf6", icon: Layers },
];

interface AnnotationsListProps {
  annotations: Annotation[];
  setAnnotations: (value:any)=> void
  setStep: (value:number)=> void
  groups:Group[]
}

export default function AnnotationsList({ annotations , setAnnotations , groups, setStep}: AnnotationsListProps) {

  const deleteAnnotation = (id: number) => {
    console.log("Deleted ")
    setAnnotations(annotations.filter((a) => a.id !== id));
  };

  const updateAnnotationText = (id: number, text: string) => {
    setAnnotations(annotations.map((a) => (a.id === id ? { ...a, text } : a)));
  };

  console.log("Grops Lengtht" , groups.length)

  return (
    <div className="bg-white rounded-xl shadow p-4 max-h-[700px] overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Annotations ({annotations.length})</h3>
        <button
          onClick={() => setStep(3)}
          disabled={groups.length === 0}
          className={`px-3 py-1 text-white text-sm rounded transition ${
            groups.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Review
        </button>
      </div>
      <div className="space-y-2">
        {annotations.map((ann) => {
          const type = ANNOTATION_TYPES.find((t) => t.id === ann.type);
          const group = groups.find((g) => g.id === ann.groupId);
          if (!type) return null;
          return (
            <div
              key={ann.id}
              className="p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  {group && (
                    <div className="text-xs text-gray-500 mb-2">
                      {group.name}
                    </div>
                  )}
                  {ann.isExtracting ? (
                    <div className="flex items-center gap-2 px-2 py-1 text-sm text-blue-600 bg-blue-50 rounded">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Extracting text...</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={ann.text}
                      onChange={(e) =>
                        updateAnnotationText(ann.id, e.target.value)
                      }
                      placeholder="Enter text..."
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
                <button
                  onClick={() => deleteAnnotation(ann.id)}
                  className="ml-2 p-1 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          );
        })}
        {annotations.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Square className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No annotations yet</p>
            <p className="text-xs mt-1">Start by creating a group</p>
          </div>
        )}
      </div>
    </div>
  );
}
