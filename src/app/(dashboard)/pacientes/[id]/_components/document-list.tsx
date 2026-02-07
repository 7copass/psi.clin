"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDocument, renameDocument } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    FileText,
    MoreHorizontal,
    Trash2,
    Edit,
    ExternalLink,
    Image as ImageIcon,
    File as FileIcon,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Document {
    id: string;
    name: string;
    file_type: string;
    file_size: number;
    created_at: string;
    url?: string;
    downloadUrl?: string;
    file_path: string;
}

interface DocumentListProps {
    documents: Document[];
    patientId: string;
}

export function DocumentList({ documents, patientId }: DocumentListProps) {
    const router = useRouter();
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const getFileIcon = (type: string) => {
        if (type?.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
        if (type?.includes("image")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
        return <FileIcon className="h-5 w-5 text-slate-500" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleRenameClick = (doc: Document) => {
        setSelectedDoc(doc);
        setNewName(doc.name);
        setIsRenameOpen(true);
    };

    const handleDeleteClick = (doc: Document) => {
        setSelectedDoc(doc);
        setIsDeleteOpen(true);
    };

    const handleRenameSubmit = async () => {
        if (!selectedDoc) return;
        setIsLoading(true);
        try {
            const result = await renameDocument(selectedDoc.id, newName, patientId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Documento renomeado!");
                setIsRenameOpen(false);
                router.refresh();
            }
        } catch {
            toast.error("Erro ao renomear");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedDoc) return;
        setIsLoading(true);
        try {
            const result = await deleteDocument(selectedDoc.id, selectedDoc.file_path, patientId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Documento excluído!");
                setIsDeleteOpen(false);
                router.refresh();
            }
        } catch {
            toast.error("Erro ao excluir");
        } finally {
            setIsLoading(false);
        }
    };

    if (documents.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 border rounded-xl bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
                <FileIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum documento encontrado</p>
                <p className="text-sm">Faça o upload do primeiro documento acima</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tamanho</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell>{getFileIcon(doc.file_type)}</TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{doc.name}</span>
                                        <span className="text-xs text-slate-500 md:hidden">
                                            {formatSize(doc.file_size)} •{" "}
                                            {format(new Date(doc.created_at), "dd/MM/yyyy", {
                                                locale: ptBR,
                                            })}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {formatSize(doc.file_size)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", {
                                        locale: ptBR,
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => window.open(doc.url, "_blank")}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Visualizar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => window.open(doc.downloadUrl, "_blank")}
                                            >
                                                <div className="flex items-center">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="mr-2 h-4 w-4"
                                                    >
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" x2="12" y1="15" y2="3" />
                                                    </svg>
                                                    Baixar
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRenameClick(doc)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Renomear
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteClick(doc)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Rename Dialog */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renomear Documento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Novo nome</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Digite o novo nome"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRenameOpen(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRenameSubmit}
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Documento</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-slate-600 dark:text-slate-300">
                            Tem certeza que deseja excluir o documento{" "}
                            <span className="font-semibold">{selectedDoc?.name}</span>? Esta ação
                            não pode ser desfeita.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteSubmit}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
