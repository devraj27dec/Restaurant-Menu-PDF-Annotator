/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";
import {
  Loader2,
  AlertCircle,
  RefreshCcw,
  Undo,
  Redo,
  RotateCcw,
} from "lucide-react";
import Header from "./Header";
import MenuTable from "./MenuTable";
import type { Annotation, Box, MenuItem, Position } from "../lib/types";
import axios from "axios";
import PdfUploader from "./PdfUploader";
import Stepper from "./Stepper";
import { useAnnotations } from "../hooks/useAnnotations";
import { API_BACKEND_URL } from "../lib/config";
import ExportedFeatures from "./ExportedFeatures";
import toast from "react-hot-toast";
import AnnotationsToolBar from "./AnnotationsToolBar";
import ScaleController from "./ScaleController";
import AnnotationsList, { ANNOTATION_TYPES } from "./AnnotationsList";
import {recognize} from 'tesseract.js'
import InstructionsPannel from "./InstructionsPannel";


export default function PdfUploadPreview() {
  const [step, setStep] = useState<number>(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadedMenuId, setUploadedMenuId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSavingAnnotations, setIsSavingAnnotations] =
    useState<boolean>(false);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [pdfCanvas, setPdfCanvas] = useState<HTMLCanvasElement | null>(null);
  // const [tesseractLoaded, setTesseractLoaded] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedType, setSelectedType] = useState<string>("item");

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [isSavingMenuItems, setIsSavingMenuItems] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<"single" | "all">("all");

  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);

  const { createGroup, groups, setGroups, finalizeGroup, currentGroup } =
    useAnnotations();


  function AllPages() {
    Object.entries(canvasRefs.current).forEach(([pageNum, canvas]) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = pageWidth;
      canvas.height = pageHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pageAnnotations = annotations.filter(
        (a) => a.pageNumber === parseInt(pageNum)
      );

      pageAnnotations.forEach((ann) => {
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

      if (currentBox && pageNumber === parseInt(pageNum)) {
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
    });
  }

  function renderSinglePage() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas(canvas);

    const pageAnnotations = annotations.filter(
      (a) => a.pageNumber === pageNumber
    );

    drawAnnotations(ctx, pageAnnotations);
    drawCurrentBox(ctx, pageNumber);
  }

  function drawAnnotations(ctx: CanvasRenderingContext2D, items: any) {
    items.forEach((ann: Annotation) => {
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
  }

  function drawCurrentBox(ctx: CanvasRenderingContext2D, pg: number) {
    if (!currentBox || pg !== pageNumber) return;

    const type = ANNOTATION_TYPES.find((t) => t.id === selectedType);
    if (!type) return;

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

  function resizeCanvas(canvas: HTMLCanvasElement) {
    canvas.width = pageWidth;
    canvas.height = pageHeight;
  }

  useEffect(() => {
    if (viewMode === "all") {
      AllPages();
    } else {
      if (canvasRef.current && pageWidth && pageHeight) {
        renderSinglePage();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    annotations,
    currentBox,
    selectedType,
    pageWidth,
    pageHeight,
    viewMode,
    pageNumber,
  ]);

  const FILE_SIZE = 5 * 1024 * 1024;
  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploadProgress(0);

    if (file.size > FILE_SIZE) {
      toast.error("File Size is too larged");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await axios.post(
        `${API_BACKEND_URL}/api/menus/upload`,
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
    if (!currentGroup) {
      toast.error("Please Create a Group First");
      // setAnnotations([]);
      return;
    }

    if (!pdfCanvas) return;

    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === annotation.id ? { ...a, isExtracting: true } : a
      )
    );

    try {
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
        } = await recognize(cropCanvas.toDataURL(), "eng", {
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
      setUndoStack((prev) => [...prev, annotations]);
      setAnnotations([...annotations, newAnnotation]);

      setTimeout(() => extractTextFromBox(newAnnotation), 100);
    }

    setIsDrawing(false);
    setCurrentBox(null);
    setStartPos(null);
  };

  const handlUndo = () => {
    if (undoStack.length === 0) return;
    const prevShapes = undoStack[undoStack.length - 1];

    setRedoStack((prev) => [...prev, annotations]);
    setAnnotations(prevShapes);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, annotations]);
    setAnnotations(next);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // const extractData = () => {
  //   const extractedItems: MenuItem[] = groups.map((group) => {
  //     const groupAnnotations = annotations.filter(
  //       (a) => a.groupId === group.id
  //     );
  //     const item: MenuItem = {
  //       id: group.id,
  //       name: groupAnnotations.find((a) => a.type === "name")?.text || "",
  //       price: groupAnnotations.find((a) => a.type === "price")?.text || "",
  //       description:
  //         groupAnnotations.find((a) => a.type === "description")?.text || "",
  //       category:
  //         groupAnnotations.find((a) => a.type === "category")?.text || "",
  //     };
  //     return item;
  //   });
  //   setMenuItems(extractedItems);

  // };

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

    try {
      const response = await axios.post(
        `${API_BACKEND_URL}/api/menus/${uploadedMenuId}/annotations`,
        payload
      );
      await saveMenuItems();
      // setAnnotations(response.data)
      
      console.log("Annotations saved:", response.data);
      // extractData();
      setStep(4);
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
        `${API_BACKEND_URL}/api/menus/${uploadedMenuId}/extract`
      );

      setMenuItems(response.data);

      console.log("Saved:", response.data);
    } catch (error: any) {
      console.error("Save annotations error:", error);
      setError(error);
    } finally {
      setIsSavingMenuItems(false);
      setIsSavingAnnotations(false);
    }
  };


  const fetchMenuItems = async () => {
    if (!uploadedMenuId) {
      setError("No menu ID found");
      return;
    }

    try {
      setIsSavingMenuItems(true);
      const response = await axios.get(
        `${API_BACKEND_URL}/api/menus/${uploadedMenuId}/items`
      );

      console.log("Fetched menuItems:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setMenuItems(response.data);
      } else {
        setError("No menu items found.");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch menu items");

    } finally {
      setIsSavingMenuItems(false);
    }
  };
  
  useEffect(() => {
    if (!uploadedMenuId || step !== 4) return;
    
    const timer = setTimeout(() => {
      fetchMenuItems();
    }, 500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, uploadedMenuId]);

  const updateMenuItem = (id: number, field: keyof MenuItem, value: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleReset = () => {
    setAnnotations([]);
    setGroups([]);
    finalizeGroup();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    }
  };

  const handleRefresh = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <Stepper step={step} />

      <div className="max-w-7xl mx-auto p-6">
        {step === 1 && (
          <PdfUploader
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            error={error}
            onFileSelect={handleFileSelect}
          />
        )}

        {step === 2 && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3 space-y-4">
              <AnnotationsToolBar
                selectedType={selectedType}
                onSelectType={setSelectedType}
              />

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

              <ScaleController
                pageNumber={pageNumber}
                numPages={numPages}
                setPageNumber={setPageNumber}
                scale={scale}
                setScale={setScale}
              />

              <InstructionsPannel/>
              
            </div>
            <div className="col-span-6">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("single")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        viewMode === "single"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      Single Page
                    </button>
                    <button
                      onClick={() => setViewMode("all")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        viewMode === "all"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      All Pages ({numPages})
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlUndo}
                      disabled={undoStack.length === 0}
                      className="text-sm border p-0.5 rounded-md "
                    >
                      <Undo />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      className="text-sm border p-0.5 rounded-md"
                    >
                      <Redo />
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="flex items-center text-sm border p-1 rounded-md ml-2"
                    >
                      <RefreshCcw className="size-4 mr-1" /> Refresh
                    </button>
                    <button
                      className="flex items-center text-sm border p-1 rounded-md ml-2"
                      onClick={handleReset}
                    >
                      <RotateCcw className="size-4 mr-1" /> Reset
                    </button>
                  </div>

                  {viewMode === "single" && (
                    <div className="text-sm text-gray-600 font-medium">
                      Page {pageNumber} of {numPages}
                    </div>
                  )}
                </div>

                <div
                  className="overflow-auto max-h-[700px] border border-gray-200 rounded-lg bg-gray-50"
                  ref={containerRef}
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
                    {viewMode === "all" ? (
                      <div className="space-y-6 p-4">
                        {Array.from(
                          { length: numPages },
                          (_, index) => index + 1
                        ).map((pageNum) => (
                          <div
                            key={pageNum}
                            id={`page-${pageNum}`}
                            className="relative bg-white shadow-lg rounded-lg overflow-hidden scroll-mt-4"
                          >
                            {/* Page Header */}
                            <div className="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-10">
                              <span className="font-semibold">
                                Page {pageNum}
                              </span>
                              <span className="text-sm">
                                {
                                  annotations.filter(
                                    (a) => a.pageNumber === pageNum
                                  ).length
                                }{" "}
                                annotations
                              </span>
                            </div>
                            <div
                              style={{
                                position: "relative",
                                display: "inline-block",
                              }}
                            >
                              <Page
                                pageNumber={pageNum}
                                scale={scale}
                                onLoadSuccess={(page) => {
                                  if (pageNum === 1) onPageLoadSuccess(page);
                                }}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                              />

                              {/* Canvas overlay for this page */}
                              <canvas
                                ref={(ref) => {
                                  canvasRefs.current[pageNum] = ref;
                                  if (
                                    pageNum === pageNumber &&
                                    viewMode === "all"
                                  ) {
                                    canvasRef.current = ref;
                                  }
                                }}
                                onMouseDown={(e) => {
                                  setPageNumber(pageNum);
                                  handleMouseDown(e);
                                }}
                                onMouseMove={(e) => {
                                  if (pageNumber === pageNum) {
                                    handleMouseMove(e);
                                  }
                                }}
                                onMouseUp={(e) => {
                                  if (pageNumber === pageNum) {
                                    handleMouseUp(e);
                                  }
                                }}
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
                        ))}
                      </div>
                    ) : (
                      /* SINGLE PAGE MODE - Show only current page */
                      <div className="p-4">
                        <div
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            onLoadSuccess={onPageLoadSuccess}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
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
                    )}
                  </Document>
                </div>
              </div>
            </div>
            <div className="col-span-3 space-y-4">
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold mb-3 text-sm">
                  Pages ({numPages})
                </h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map(
                    (pageNum) => {
                      const pageAnnotationCount = annotations.filter(
                        (a) => a.pageNumber === pageNum
                      ).length;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setPageNumber(pageNum);
                            if (viewMode === "all") {
                              document
                                .getElementById(`page-${pageNum}`)
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            } else {
                              setViewMode("single");
                            }
                          }}
                          className={`w-full border-2 rounded-lg p-2 text-left transition-all hover:border-blue-400 ${
                            pageNumber === pageNum
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Page {pageNum}
                            </span>
                            {pageAnnotationCount > 0 && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                {pageAnnotationCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
              <div className="col-span-3">
                <AnnotationsList
                  groups={groups}
                  setStep={setStep}
                  annotations={annotations}
                  setAnnotations={setAnnotations}
                />
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
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">{error}</div>
                </div>
              )}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6">
              {isSavingMenuItems ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading menu items...</span>
                </div>
              ) : (
                <>
                  <ExportedFeatures menuItems={menuItems} />
                  <MenuTable
                    menuItems={menuItems}
                    setEditingItem={setEditingItem}
                    editingItem={editingItem}
                    updateMenuItem={updateMenuItem}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
