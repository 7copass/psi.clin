"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { EditorToolbar } from "./editor-toolbar";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    content?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    editable?: boolean;
    className?: string;
    minHeight?: string;
    onReorganize?: () => void;
    onTranscribe?: () => void;
    isAIProcessing?: boolean;
}

export function RichTextEditor({
    content = "",
    onChange,
    placeholder = "Digite aqui...",
    autoFocus = false,
    editable = true,
    className,
    minHeight = "300px",
    onReorganize,
    onTranscribe,
    isAIProcessing,
}: RichTextEditorProps) {
    const prevContentRef = useRef(content);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            Image,
            Underline,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content,
        editable,
        autofocus: autoFocus,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            prevContentRef.current = html;
            onChange?.(html);
        },
    });

    // Sync external content changes (e.g. AI generation) into the editor
    useEffect(() => {
        if (editor && content !== prevContentRef.current) {
            prevContentRef.current = content;
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [editor, content]);

    return (
        <div
            className={cn(
                "rounded-lg border bg-white dark:bg-slate-800 overflow-hidden",
                className
            )}
        >
            {editable && (
                <EditorToolbar
                    editor={editor}
                    onReorganize={onReorganize}
                    onTranscribe={onTranscribe}
                    isAIProcessing={isAIProcessing}
                />
            )}
            <div
                className="p-4 overflow-y-auto"
                style={{ minHeight }}
                onClick={() => editor?.chain().focus().run()}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
