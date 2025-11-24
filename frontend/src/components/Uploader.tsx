/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";
import {
  Upload,
  Square,
  Tag,
  DollarSign,
  AlignLeft,
  Layers,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Header from "./Header";
import MenuTable from "./MenuTable";
import type { Annotation, Box, Group, MenuItem, Position } from "../lib/types";
import axios from "axios";

declare global {
  interface Window {
    Tesseract: any;
  }
}

type IconComponent = typeof Tag;

interface AnnotationType {
  id: string;
  label: string;
  color: string;
  icon: IconComponent;
}

const ANNOTATION_TYPES: AnnotationType[] = [
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

export default function PdfUploadPreview() {
  const [step, setStep] = useState<number>(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadedMenuId, setUploadedMenuId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSavingAnnotations, setIsSavingAnnotations] =
    useState<boolean>(false);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [pdfCanvas, setPdfCanvas] = useState<HTMLCanvasElement | null>(null);
  const [tesseractLoaded, setTesseractLoaded] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedType, setSelectedType] = useState<string>("item");
  const [currentGroup, setCurrentGroup] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);


  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [_, setIsSavingMenuItems] = useState<boolean>(false);

  // Load Tesseract.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js";
    script.async = true;
    script.onload = () => setTesseractLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);


  useEffect(() => {
    if (canvasRef.current && pageWidth && pageHeight) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = pageWidth;
      canvas.height = pageHeight;


      ctx.clearRect(0, 0, canvas.width, canvas.height);


      annotations.forEach((ann) => {
        const type = ANNOTATION_TYPES.find((t) => t.id === ann.type);
        if (!type) return;


        ctx.strokeStyle = type.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);


        ctx.fillStyle = type.color;
        ctx.fillRect(ann.x, Math.max(0, ann.y - 25), 120, 25);

        ctx.fillStyle = "white";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(type.label, ann.x + 5, Math.max(17, ann.y - 8));
      });

      // Draw current box being drawn
      if (currentBox) {
        const type = ANNOTATION_TYPES.find((t) => t.id === selectedType);
        if (type) {
          ctx.strokeStyle = type.color;
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            currentBox.x,
            currentBox.y,
            currentBox.width,
            currentBox.height
          );
          ctx.setLineDash([]);
        }
      }
    }
  }, [annotations, currentBox, selectedType, pageWidth, pageHeight]);

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploadProgress(0);

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed!");
      return;
    }

    // if (!axios) {
    //   setError("Please wait, loading required libraries...");
    //   setTimeout(() => handleFileSelect(file), 1000);
    //   return;
    // }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await axios.post(
        "http://localhost:7000/api/menus/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent: any) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(progress);
          },
        }
      );

      const menuId =
        response.data?.id || response.data?.menuId || response.data?.data?.id;

      if (menuId) {
        setUploadedMenuId(menuId);
        console.log("Menu ID set:", menuId);
      } else {
        console.warn("No menu ID in response. Response data:", response.data);
        setError(
          "Upload successful but no menu ID received. Please check backend response."
        );
      }

      setPdfFile(file);
      setIsUploading(false);

      setTimeout(() => setStep(2), 500);
    } catch (err: any) {
      console.error("Upload error:", err);
      setIsUploading(false);
      setUploadProgress(0);

      if (err.response) {
        setError(
          `Upload failed: ${
            err.response.data?.message || err.response.statusText
          }`
        );
      } else if (err.request) {
        setError(
          "Cannot reach server. Please check if the backend is running."
        );
      } else {
        setError("Upload failed. Please try again.");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale });
    setPageWidth(viewport.width);
    setPageHeight(viewport.height);

    const hiddenCanvas = document.createElement("canvas");
    const context = hiddenCanvas.getContext("2d");
    hiddenCanvas.width = viewport.width;
    hiddenCanvas.height = viewport.height;

    if (context) {
      page
        .render({
          canvasContext: context,
          viewport: viewport,
        })
        .promise.then(() => {
          setPdfCanvas(hiddenCanvas);
        });
    }
  };

  const extractTextFromBox = async (annotation: Annotation) => {
    if (!pdfCanvas || !tesseractLoaded || !window.Tesseract) return;

    // Update annotation to show loading state
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === annotation.id ? { ...a, isExtracting: true } : a
      )
    );

    try {
      // Get the context from the PDF canvas
      const ctx = pdfCanvas.getContext("2d");
      if (!ctx) return;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = Math.abs(annotation.width);
      cropCanvas.height = Math.abs(annotation.height);
      const cropCtx = cropCanvas.getContext("2d");

      if (cropCtx) {
        cropCtx.drawImage(
          pdfCanvas,
          annotation.x,
          annotation.y,
          annotation.width,
          annotation.height,
          0,
          0,
          annotation.width,
          annotation.height
        );

        const {
          data: { text },
        } = await window.Tesseract.recognize(cropCanvas.toDataURL(), "eng", {
          logger: (m: any) => console.log(m),
        });

        const cleanedText = text
          .trim()
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ");

        setAnnotations((prev) =>
          prev.map((a) =>
            a.id === annotation.id
              ? { ...a, text: cleanedText, isExtracting: false }
              : a
          )
        );
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === annotation.id ? { ...a, isExtracting: false } : a
        )
      );
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (step !== 2 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStartPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || step !== 2 || !canvasRef.current || !startPos) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentBox({
      x: startPos.x,
      y: startPos.y,
      width: x - startPos.x,
      height: y - startPos.y,
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || step !== 2 || !canvasRef.current || !startPos) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);

    if (width > 20 && height > 20) {
      const newAnnotation: Annotation = {
        id: Date.now(),
        type: selectedType,
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        width: width,
        height: height,
        text: "",
        groupId: currentGroup,
        isExtracting: false,
        pageNumber: pageNumber,
      };

      setAnnotations([...annotations, newAnnotation]);

      setTimeout(() => extractTextFromBox(newAnnotation), 100);
    }

    setIsDrawing(false);
    setCurrentBox(null);
    setStartPos(null);
  };

  const deleteAnnotation = (id: number) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
  };

  const createGroup = () => {
    const groupId = Date.now();
    setCurrentGroup(groupId);
    setGroups([
      ...groups,
      { id: groupId, name: `Item Group ${groups.length + 1}` },
    ]);
  };

  const finalizeGroup = () => {
    setCurrentGroup(null);
  };

  const extractData = () => {
    const extractedItems: MenuItem[] = groups.map((group) => {
      const groupAnnotations = annotations.filter(
        (a) => a.groupId === group.id
      );
      const item: MenuItem = {
        id: group.id,
        name: groupAnnotations.find((a) => a.type === "name")?.text || "",
        price: groupAnnotations.find((a) => a.type === "price")?.text || "",
        description:
          groupAnnotations.find((a) => a.type === "description")?.text || "",
        category:
          groupAnnotations.find((a) => a.type === "category")?.text || "",
      };
      return item;
    });
    setMenuItems(extractedItems);
    setStep(4);
  };

  const payload = {
    annotations: annotations.map((a) => ({
      pageNumber: a.pageNumber!,
      type: a.type,
      groupId: a.groupId,
      boundingBox: {
        x: a.x / scale,
        y: a.y / scale,
        width: a.width / scale,
        height: a.height / scale,
      },
      text: a.text?.trim() || "",
    })),
  };

  const saveAnnotationsToBackend = async () => {
    if (!uploadedMenuId) return setError("Upload PDF first.");

    setIsSavingAnnotations(true);

    console.log("Sending annotations:", payload);

    try {
      const response = await axios.post(
        `http://localhost:7000/api/menus/${uploadedMenuId}/annotations`,
        payload
      );

      await saveMenuItems();

      console.log("Annotations saved:", response.data);
      extractData();
    } catch (err: any) {
      console.error("Save annotations error:", err);
      setError("Failed to save annotations.");
    } finally {
      setIsSavingAnnotations(false);
    }
  };

  const saveMenuItems = async () => {
    if (!uploadedMenuId) {
      setError("Upload PDF first.");
      setIsSavingAnnotations(false);
      return;
    }

    try {
      setIsSavingMenuItems(true);

      const response = await axios.post(
        `http://localhost:7000/api/menus/${uploadedMenuId}/extract`
      );

      setMenuItems(response.data);

      console.log("Saved:", response.data);
    } catch (error: any) {
      console.error("Save annotations error:", error);
      setError("Failed to save annotations.", error);
    } finally {
      setIsSavingMenuItems(false);
      setIsSavingAnnotations(false);
    }
  };

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

  const updateAnnotationText = (id: number, text: string) => {
    const updated = annotations.map((a) => (a.id === id ? { ...a, text } : a));
    setAnnotations(updated);
  };

  const updateMenuItem = (id: number, field: keyof MenuItem, value: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 h-1 bg-gray-200 top-5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {[
                { number: 1, label: 'Upload', description: 'Select your PDF file' },
                { number: 2, label: 'Annotate', description: 'Mark menu items' },
                { number: 3, label: 'Review', description: 'Verify extracted data' },
                { number: 4, label: 'Export', description: 'Download your data' }
              ].map((s) => (
                <div key={s.number} className="flex flex-col items-center" style={{ flex: 1 }}>
                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 relative z-10 ${
                      s.number < step
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : s.number === step
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110 ring-4 ring-blue-200'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {s.number < step ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{s.number}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <div
                      className={`text-sm font-semibold transition-colors ${
                        s.number <= step ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {s.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 px-2">
                      {s.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {step === 1 && (
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
                  : "Drag and drop or click to browse"}
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
                    {uploadProgress === 100
                      ? "Upload Complete!"
                      : "Uploading..."}
                  </span>
                  <span className="text-sm text-gray-600">
                    {uploadProgress}%
                  </span>
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
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              accept="application/pdf"
              disabled={isUploading}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Tools */}
            <div className="col-span-3 space-y-4">
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
                        onClick={() => setSelectedType(type.id)}
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
                        <span className="text-sm font-medium">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold mb-3">Grouping</h3>
                {uploadedMenuId && (
                  <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                    <span className="text-gray-600">Menu ID: </span>
                    <span className="font-mono text-blue-600">
                      {uploadedMenuId}
                    </span>
                  </div>
                )}
                {currentGroup ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                      <div className="font-medium text-green-800">
                        Active Group
                      </div>
                      <div className="text-green-600">
                        {groups.find((g) => g.id === currentGroup)?.name}
                      </div>
                    </div>
                    <button
                      onClick={finalizeGroup}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Finish Group
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={createGroup}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Start New Group
                  </button>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  Groups: {groups.length}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold mb-3">View Controls</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Zoom
                    </label>
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
                          onClick={() =>
                            setPageNumber(Math.max(1, pageNumber - 1))
                          }
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

              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold mb-3 text-sm">📝 Instructions</h3>
                <ol className="text-xs text-gray-600 space-y-2">
                  <li>1. Select annotation type</li>
                  <li>2. Click "Start New Group"</li>
                  <li>3. Draw boxes on menu items</li>
                  <li>4. Enter extracted text</li>
                  <li>5. Click "Finish Group"</li>
                  <li>6. Repeat for all items</li>
                </ol>
              </div>
            </div>

            <div className="col-span-6">
              <div className="bg-white rounded-xl shadow p-4">
                <div
                  className="overflow-auto max-h-[700px] border border-gray-200 rounded-lg bg-gray-50"
                  ref={containerRef}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Document
                      file={pdfFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center h-96">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading PDF...</p>
                          </div>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        onLoadSuccess={onPageLoadSuccess}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      className="cursor-crosshair"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        pointerEvents: "auto",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-3">
              <div className="bg-white rounded-xl shadow p-4 max-h-[700px] overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">
                    Annotations ({annotations.length})
                  </h3>
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
                    const type = ANNOTATION_TYPES.find(
                      (t) => t.id === ann.type
                    );
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
                              <span className="text-sm font-medium">
                                {type.label}
                              </span>
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
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Review Annotations</h2>
              <div className="space-y-4 mb-6">
                {groups.map((group) => {
                  const groupAnnotations = annotations.filter(
                    (a) => a.groupId === group.id
                  );
                  return (
                    <div
                      key={group.id}
                      className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50"
                    >
                      <h3 className="font-semibold text-lg mb-3">
                        {group.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {ANNOTATION_TYPES.map((type) => {
                          const ann = groupAnnotations.find(
                            (a) => a.type === type.id
                          );
                          return (
                            <div
                              key={type.id}
                              className="bg-white p-3 rounded shadow-sm"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded"
                                  style={{ backgroundColor: type.color }}
                                />
                                <span className="text-sm font-medium">
                                  {type.label}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700">
                                {ann?.text || "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={isSavingAnnotations}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back to Annotate
                </button>
                <button
                  onClick={saveAnnotationsToBackend}
                  disabled={isSavingAnnotations}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingAnnotations ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    "Save to Database"
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">{error}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6">
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

              <MenuTable
                menuItems={menuItems}
                setEditingItem={setEditingItem}
                editingItem={editingItem}
                updateMenuItem={updateMenuItem}
              />

              {menuItems.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>No menu items extracted yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
