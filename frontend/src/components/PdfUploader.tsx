import { Upload, AlertCircle } from "lucide-react";
import React, { useState } from "react";

interface UploadStepProps {
  isUploading: boolean;
  uploadProgress: number;
  error: string;
  onFileSelect: (file: File) => void;
}

export default function PdfUploader({
  isUploading,
  uploadProgress,
  error,
  onFileSelect,
}: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() =>
          !isUploading && document.getElementById("fileInput")?.click()
        }
        className={`
          border-2 border-dashed rounded-2xl p-16 text-center transition-all
          ${
            isUploading
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer"
          }
          ${
            isDragging
              ? "border-blue-500 bg-blue-50 scale-105"
              : "border-gray-300 bg-white hover:border-blue-400"
          }
        `}
      >
        <Upload
          className={`w-16 h-16 mx-auto mb-4 ${
            isDragging ? "text-blue-600" : "text-gray-400"
          }`}
        />
        <h3 className="text-xl font-semibold mb-2">
          {isUploading ? "Uploading..." : "Upload Menu PDF"}
        </h3>
        <p className="text-gray-500 mb-4">
          {isUploading
            ? "Please wait while we upload your file"
            : "Drag & drop or click to upload (Max 5MB)"}
        </p>
        {!isUploading && (
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium">
            Select PDF File
          </div>
        )}
      </div>

      {uploadProgress > 0 && (
        <div className="mt-6 bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {uploadProgress === 100 ? "Upload Complete!" : "Uploading..."}
            </span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                uploadProgress === 100 ? "bg-green-600" : "bg-blue-600"
              }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">Upload Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        accept="application/pdf"
        disabled={isUploading}
      />
    </div>
  );
}
