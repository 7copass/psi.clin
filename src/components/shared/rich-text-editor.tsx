"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
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
}

export function RichTextEditor({
    content = "",
    onChange,
    placeholder = "Digite aqui...",
    autoFocus = false,
    editable = true,
    className,
    minHeight = "300px",
}: RichTextEditorProps) {
    const editor = useEditor({
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
        ],
        content,
        editable,
        autofocus: autoFocus,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-slate dark:prose-invert max-w-none focus:outline-none",
                    "prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-white",
                    "prose-p:text-slate-700 dark:prose-p:text-slate-300",
                    "prose-strong:text-slate-900 dark:prose-strong:text-white",
                    "prose-ul:list-disc prose-ol:list-decimal",
                    "prose-li:text-slate-700 dark:prose-li:text-slate-300"
                ),
            },
        },
    });

    return (
        <div
            className={cn(
                "rounded-lg border bg-white dark:bg-slate-800 overflow-hidden",
                className
            )}
        >
            {editable && <EditorToolbar editor={editor} />}
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
