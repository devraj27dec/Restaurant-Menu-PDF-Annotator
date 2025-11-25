import { ZoomOut, ZoomIn } from "lucide-react";


type Props = {
  pageNumber: number;
  numPages: number;
  setPageNumber: (value: number) => void;
  scale: number;
  setScale: (value: number) => void;
};

export default function ScaleController({pageNumber , numPages , setPageNumber , scale , setScale}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">View Controls</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Zoom</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.25))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="flex-1 text-center text-sm font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(3, scale + 0.25))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
        {numPages > 1 && (
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Page {pageNumber} of {numPages}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber === 1}
                className="flex-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPageNumber(Math.min(numPages, pageNumber + 1))
                }
                disabled={pageNumber === numPages}
                className="flex-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
