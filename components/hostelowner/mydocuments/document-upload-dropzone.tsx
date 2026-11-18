"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadVerificationDocument } from "@/services/document-verification.service";
import type { DocumentTypeOption } from "@/types/document-verification.types";

interface DocumentUploadDropzoneProps {
    remainingSlots: number;
    allowedTypes?: DocumentTypeOption[];
    onSuccess: () => void;
}

const DEFAULT_DOCUMENT_TYPES: DocumentTypeOption[] = [
    { value: "property_deed", label: "Property Ownership / Lease Deed", description: "Title deed, registered lease agreement, or property tax receipt" },
    { value: "business_license", label: "Trade / Business License", description: "Municipal trade license, shop & establishment certificate" },
    { value: "tax_pan", label: "PAN / GSTIN Document", description: "Business or owner PAN card, GST registration certificate" },
    { value: "utility_bill", label: "Utility / Electricity Bill", description: "Recent electricity, water, or commercial broadband bill (within 3 months)" },
    { value: "govt_id", label: "Owner Govt ID (Aadhaar / Passport)", description: "Government issued identity proof of the primary owner" },
    { value: "other", label: "Other Supporting Document", description: "NOC, fire safety certificate, or tourism department approval" },
];

export function DocumentUploadDropzone({ remainingSlots, allowedTypes, onSuccess }: DocumentUploadDropzoneProps) {
    const documentTypes = allowedTypes && allowedTypes.length > 0 ? allowedTypes : DEFAULT_DOCUMENT_TYPES;

    const [title, setTitle] = useState("");
    const [docType, setDocType] = useState<string>(documentTypes[0].value);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (documentTypes.length > 0 && !documentTypes.some((dt) => dt.value === docType)) {
            setDocType(documentTypes[0].value);
        }
    }, [documentTypes, docType]);

    const handleFileValidation = (file: File): boolean => {
        const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            toast.error("Unsupported file type. Please upload a PDF, JPG, PNG, or WebP document.");
            return false;
        }

        // 5MB limit
        const MAX_SIZE_BYTES = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            toast.error(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a file under 5MB.`);
            return false;
        }

        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (handleFileValidation(file)) {
                setSelectedFile(file);
                if (!title.trim()) {
                    const rawName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
                    setTitle(rawName.replace(/[_-]/g, " "));
                }
            } else {
                e.target.value = "";
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (handleFileValidation(file)) {
                setSelectedFile(file);
                if (!title.trim()) {
                    const rawName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
                    setTitle(rawName.replace(/[_-]/g, " "));
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please choose a file to upload.");
            return;
        }
        if (remainingSlots <= 0) {
            toast.error("Maximum 5 documents limit reached.");
            return;
        }

        const autoTitle = title.trim() || selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")).replace(/[_-]/g, " ") || "Verification Document";
        const autoType = docType || documentTypes[0]?.value || "property_deed";

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("title", autoTitle);
            formData.append("document_type", autoType);
            formData.append("file", selectedFile);

            await uploadVerificationDocument(formData);
            toast.success("Document uploaded to Bunny CDN successfully for review!");
            setTitle("");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onSuccess();
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.file?.[0] || err?.message || "Failed to upload document.";
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    if (remainingSlots <= 0) {
        return (
            <div className="bg-card dark:bg-slate-900/80 border border-border dark:border-slate-800 rounded-md p-5 text-center space-y-2 w-full">
                <CheckCircle2 size={30} className="mx-auto text-primary dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-foreground">Upload Limit Reached (5 of 5 Uploaded)</h4>
                <p className="text-xs text-muted-foreground dark:text-slate-400 max-w-md mx-auto">
                    You have uploaded the maximum allowed limit of 5 documents. If you need to replace a document, you can delete a pending or rejected document below.
                </p>
            </div>
        );
    }

    const currentDescription = documentTypes.find((d) => d.value === docType)?.description;

    return (
        <form onSubmit={handleSubmit} className="bg-card dark:bg-slate-900/90 border border-border dark:border-slate-800 rounded-md p-4 sm:p-5 shadow-xs space-y-4 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-slate-800">
                <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">Upload Verification Document</h3>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">
                        Stored on Bunny CDN • Accepted: PDF, JPG, PNG, WebP • Max size: <span className="font-semibold text-foreground">5MB</span>
                    </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-sm bg-muted dark:bg-slate-800 border border-border dark:border-slate-700 text-foreground dark:text-slate-200">
                    {remainingSlots} {remainingSlots === 1 ? "Slot" : "Slots"} Remaining
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Type Selector (Optional) */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Document Type</span>
                        <span className="text-[11px] text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full h-10 px-3 bg-muted/30 dark:bg-slate-950 border border-border dark:border-slate-800 rounded-sm text-xs font-medium text-foreground focus:border-primary dark:focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        {documentTypes.map((dt) => (
                            <option key={dt.value} value={dt.value} className="bg-popover dark:bg-slate-900 text-foreground">
                                {dt.label}
                            </option>
                        ))}
                    </select>
                    {currentDescription && (
                        <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                            {currentDescription}
                        </p>
                    )}
                </div>

                {/* Document Title (Optional) */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Document Title / Label</span>
                        <span className="text-[11px] text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <Input
                        placeholder="e.g. Registered Sale Deed 2024 (auto-named if empty)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-10 text-xs font-medium bg-muted/30 dark:bg-slate-950 border border-border dark:border-slate-800 rounded-sm text-foreground placeholder:text-muted-foreground focus:border-primary dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Drag & Drop File Zone - Minimal Soft Corners */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-sm p-5 sm:p-6 text-center cursor-pointer transition-all ${
                    isDragOver
                        ? "border-primary dark:border-indigo-400 bg-muted/60 dark:bg-slate-800/80"
                        : selectedFile
                        ? "border-primary/60 dark:border-indigo-500/60 bg-muted/40 dark:bg-slate-800/50"
                        : "border-border dark:border-slate-800 bg-muted/20 dark:bg-slate-950/60 hover:bg-muted/40 dark:hover:bg-slate-900/60 hover:border-primary/40 dark:hover:border-slate-700"
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {selectedFile ? (
                    <div className="flex items-center justify-between max-w-md mx-auto bg-card dark:bg-slate-900 border border-border dark:border-slate-800 p-2.5 rounded-sm shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-sm bg-muted dark:bg-slate-800 border border-border dark:border-slate-700 flex items-center justify-center shrink-0">
                                <FileText size={18} className="text-primary dark:text-indigo-400" />
                            </div>
                            <div className="text-left min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{selectedFile.name}</p>
                                <p className="text-[10px] text-muted-foreground dark:text-slate-400">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="p-1.5 rounded-sm hover:bg-muted dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
                            title="Remove file"
                        >
                            <X size={15} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="w-10 h-10 rounded-sm bg-muted dark:bg-slate-800 border border-border dark:border-slate-700 flex items-center justify-center mx-auto text-primary dark:text-indigo-400">
                            <UploadCloud size={20} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-bold text-foreground">
                                Drag & drop document here, or <span className="underline">browse files</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                                Supports PDF, JPG, PNG, WebP (Strictly $\le$ 5MB per document)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground dark:text-slate-400">
                    <AlertCircle size={13} />
                    <span>Documents are securely stored on Bunny CDN with 10-minute edit grace period.</span>
                </div>
                <Button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="h-10 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white rounded-sm shadow-xs transition-all gap-1.5 cursor-pointer"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={13} className="animate-spin text-primary-foreground" />
                            Uploading to Bunny CDN...
                        </>
                    ) : (
                        <>
                            <UploadCloud size={14} />
                            Submit Document
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
