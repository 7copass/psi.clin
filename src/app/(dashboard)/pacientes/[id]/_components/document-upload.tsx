"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadProps {
    patientId: string;
}

export function DocumentUpload({ patientId }: DocumentUploadProps) {
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setProgress(0);

        // Simulate progress for better UX since Server Actions don't support real-time progress yet
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 300);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("patientId", patientId);

            const result = await uploadDocument(formData);

            clearInterval(interval);
            setProgress(100);

            if (result.error) {
                toast.error(result.error);
                setIsUploading(false);
            } else {
                toast.success("Documento enviado com sucesso!");
                setFile(null);
                setIsUploading(false);
                setProgress(0);
                router.refresh();
            }
        } catch {
            clearInterval(interval);
            toast.error("Erro no upload");
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {!file ? (
                <div
                    className={`relative p-8 border-2 border-dashed rounded-xl transition-all ${dragActive
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                            : "border-slate-300 dark:border-slate-700 hover:border-purple-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                        <Upload className="h-10 w-10 text-slate-400 mb-4" />
                        <h3 className="font-semibold text-lg mb-1">
                            Arraste arquivos ou clique para selecionar
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                            Suporta PDF, JPG, PNG e DOCX até 10MB
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                <p className="text-sm text-slate-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        {!isUploading && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setFile(null)}
                                className="text-slate-500 hover:text-red-500"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {isUploading && (
                        <div className="space-y-2 mb-4">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-right text-slate-500">{progress}%</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setFile(null)}
                            disabled={isUploading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Enviar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
