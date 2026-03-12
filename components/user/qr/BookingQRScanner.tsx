"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

interface BookingQRScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BookingQRScanner({ onScan, onClose }: BookingQRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const initScanner = () => {
            if (isCancelled) return;

            // Failsafe to guarantee zero duplication if DOM wasn't magically cleared
            const readerEl = document.getElementById("reader");
            if (readerEl && readerEl.innerHTML) {
                readerEl.innerHTML = ""; 
            }

            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            
            scannerRef.current = scanner;

            scanner.render(
                (decodedText) => {
                    // Successful scan
                    if (scannerRef.current) {
                        try {
                            scannerRef.current.clear().catch(() => {});
                        } catch (e) {
                            // Ignored
                        }
                        scannerRef.current = null;
                    }
                    onScan(decodedText);
                },
                (error) => {
                    // Ignore regular scanning errors
                }
            );
        };

        // Delay initialization to completely bypass React 18 Strict Mode instant Mount-Unmount cycle
        const timeoutId = setTimeout(initScanner, 150);

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);

            // Clean up when truly unmounted
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(() => {});
                } catch (error) {
                    // Suppress transition errors
                }
                scannerRef.current = null;
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-all backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">Scan Booking QR</h3>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-4 text-center">
                        Align the guest's QR code within the frame to check them in.
                    </p>
                    
                    {/* Scanner container provided to html5-qrcode */}
                    <div id="reader" className="w-full bg-white rounded-lg overflow-hidden border border-gray-200 [&_button]:bg-blue-600 [&_button]:text-white [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-md [&_button]:mt-2 [&_a]:text-blue-600 [&_select]:p-2 [&_select]:border [&_select]:rounded-md"></div>
                </div>
            </div>
        </div>
    );
}
