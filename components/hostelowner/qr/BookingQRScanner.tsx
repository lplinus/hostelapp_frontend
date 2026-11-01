"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import { X, Camera, Upload, Loader2, AlertCircle } from "lucide-react";

interface BookingQRScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BookingQRScanner({ onScan, onClose }: BookingQRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;

    const [mode, setMode] = useState<"camera" | "file">("camera");
    const [fileError, setFileError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [cameraStarting, setCameraStarting] = useState(false);

    // Stop camera helper
    const stopCamera = async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                // 2 = SCANNING, 3 = PAUSED
                if (state === 2 || state === 3) {
                    await scannerRef.current.stop();
                }
            } catch (e) {
                // Ignored — html5-qrcode throws on state transitions
            }
        }
    };

    // Start camera helper — always re-initializes the scanner for a clean state
    const startCamera = async () => {
        setCameraStarting(true);
        setFileError(null);

        // Clean up any existing scanner instance
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === 2 || state === 3) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (e) {
                // ignore
            }
            scannerRef.current = null;
        }

        // Clear the reader element
        const readerEl = document.getElementById("qr-reader");
        if (readerEl) readerEl.innerHTML = "";

        try {
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    // Stop scanner and notify parent
                    scanner.stop().catch(() => {});
                    onScanRef.current(decodedText);
                },
                () => {
                    // Ignore per-frame scan misses
                }
            );
            setCameraStarting(false);
        } catch (err: any) {
            setCameraStarting(false);
            setFileError("Camera access denied or unavailable. Try uploading a QR image instead.");
            setMode("file");
        }
    };

    // Start camera on initial mount
    useEffect(() => {
        let cancelled = false;

        const timeout = setTimeout(async () => {
            if (cancelled) return;
            await startCamera();
        }, 200);

        return () => {
            cancelled = true;
            clearTimeout(timeout);

            // Full cleanup on unmount
            if (scannerRef.current) {
                try {
                    const state = scannerRef.current.getState();
                    if (state === 2 || state === 3) {
                        scannerRef.current.stop().catch(() => {});
                    }
                    scannerRef.current.clear();
                } catch (e) { /* ignore */ }
                scannerRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleModeSwitch = async (newMode: "camera" | "file") => {
        if (newMode === mode) return;
        setFileError(null);
        setPreviewUrl(null);

        if (newMode === "file") {
            await stopCamera();
        }

        setMode(newMode);

        if (newMode === "camera") {
            // Small delay for DOM to update (unhide the reader div)
            setTimeout(() => startCamera(), 150);
        }
    };

    /**
     * Decode QR code from an image file using jsQR (canvas-based, very reliable).
     */
    const decodeQRFromFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Canvas not supported"));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    resolve(code.data);
                } else {
                    reject(new Error("No QR code found"));
                }
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileError(null);
        setIsProcessing(true);
        setPreviewUrl(URL.createObjectURL(file));

        await stopCamera();

        try {
            const decodedText = await decodeQRFromFile(file);
            setIsProcessing(false);
            onScan(decodedText);
        } catch (err: any) {
            setIsProcessing(false);
            setFileError("Could not detect a QR code in this image. Please try a clearer image or use the camera.");
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-all backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">Scan Booking QR</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => handleModeSwitch("camera")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                            mode === "camera"
                                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <Camera size={16} />
                        Camera
                    </button>
                    <button
                        onClick={() => handleModeSwitch("file")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                            mode === "file"
                                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <Upload size={16} />
                        Upload Image
                    </button>
                </div>

                <div className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-4 text-center">
                        {mode === "camera"
                            ? "Align the guest's QR code within the frame to check them in."
                            : "Upload a screenshot or photo of the booking QR code."}
                    </p>

                    {/* Camera scanner container — always in DOM for html5-qrcode */}
                    <div
                        id="qr-reader"
                        className={`w-full bg-white rounded-lg overflow-hidden border border-gray-200 ${
                            mode === "camera" ? "" : "!hidden"
                        }`}
                        style={{ minHeight: mode === "camera" ? 280 : 0 }}
                    />

                    {/* Camera loading state */}
                    {mode === "camera" && cameraStarting && (
                        <div className="flex items-center justify-center gap-2 py-8 text-blue-600">
                            <Loader2 className="animate-spin" size={20} />
                            <span className="text-sm font-semibold">Starting camera...</span>
                        </div>
                    )}

                    {/* File upload UI */}
                    {mode === "file" && (
                        <div className="space-y-4">
                            {previewUrl ? (
                                <div className="relative bg-white rounded-xl border-2 border-gray-200 p-3 flex items-center justify-center">
                                    <img
                                        src={previewUrl}
                                        alt="QR Preview"
                                        className="max-h-[250px] max-w-full object-contain rounded-lg"
                                    />
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                                            <div className="flex items-center gap-2 text-blue-600 font-semibold">
                                                <Loader2 className="animate-spin" size={20} />
                                                Scanning...
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <label
                                    htmlFor="qr-file-input"
                                    className="flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-gray-300 rounded-xl bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <Upload size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-700">
                                            Click to upload QR image
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PNG, JPG, or screenshot
                                        </p>
                                    </div>
                                </label>
                            )}

                            <input
                                id="qr-file-input"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />

                            {previewUrl && !isProcessing && (
                                <button
                                    onClick={() => {
                                        setPreviewUrl(null);
                                        setFileError(null);
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    Choose Another Image
                                </button>
                            )}
                        </div>
                    )}

                    {/* Error message */}
                    {fileError && (
                        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p>{fileError}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
