import { Tag, DollarSign, AlignLeft, Layers, Square } from "lucide-react";

const ANNOTATION_TYPES = [
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

interface AnnotationToolbarProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export default function AnnotationsToolBar({
  selectedType,
  onSelectType,
}: AnnotationToolbarProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Square className="w-5 h-5" />
        Annotation Tools
      </h3>
      <div className="space-y-2">
        {ANNOTATION_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                selectedType === type.id
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: type.color }}
              />
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
