"use client";

import { type Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Undo,
    Redo,
    RemoveFormatting,
    Wand2,
    ImagePlus,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditorToolbarProps {
    editor: Editor | null;
    onReorganize?: () => void;
    onTranscribe?: () => void;
    isAIProcessing?: boolean;
}

export function EditorToolbar({ editor, onReorganize, onTranscribe, isAIProcessing }: EditorToolbarProps) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-slate-50 dark:bg-slate-900/50 rounded-t-lg">
            {/* Undo/Redo */}
            <Toggle
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                <Undo className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                <Redo className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Headings */}
            <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
            >
                <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 3 })}
                onPressedChange={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
            >
                <Heading3 className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Text formatting */}
            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("underline")}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            >
                <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("highlight")}
                onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
            >
                <Highlighter className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Lists */}
            <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Alignment */}
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "left" })}
                onPressedChange={() =>
                    editor.chain().focus().setTextAlign("left").run()
                }
            >
                <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "center" })}
                onPressedChange={() =>
                    editor.chain().focus().setTextAlign("center").run()
                }
            >
                <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "right" })}
                onPressedChange={() =>
                    editor.chain().focus().setTextAlign("right").run()
                }
            >
                <AlignRight className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Clear formatting */}
            <Toggle
                size="sm"
                onClick={() =>
                    editor.chain().focus().clearNodes().unsetAllMarks().run()
                }
            >
                <RemoveFormatting className="h-4 w-4" />
            </Toggle>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* AI Features */}
            {onReorganize && (
                <Toggle
                    size="sm"
                    onClick={onReorganize}
                    disabled={isAIProcessing}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    title="Reorganizar Texto (IA)"
                >
                    {isAIProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="h-4 w-4" />
                    )}
                </Toggle>
            )}
            {onTranscribe && (
                <Toggle
                    size="sm"
                    onClick={onTranscribe}
                    disabled={isAIProcessing}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    title="Transcrever Manuscrito (OCR)"
                >
                    <ImagePlus className="h-4 w-4" />
                </Toggle>
            )}
        </div>
    );
}
