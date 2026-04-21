'use client'

import { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import "quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "link",
  "image",
  "align",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here...",
  minHeight = 320,
}) {
  const editorRef = useRef(null);
  const { getToken } = useAuth();

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link", "image"],
        [{ align: [] }],
        ["clean"],
      ],
      handlers: {
        image: async () => {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            try {
              const token = await getToken();
              const response = await fetch("/api/store/product/description-image", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || "Image upload failed");
              }

              const editor = editorRef.current?.getEditor();
              if (!editor) return;

              const range = editor.getSelection(true);
              const insertIndex = range ? range.index : editor.getLength();
              editor.insertEmbed(insertIndex, "image", data.url, "user");
              editor.setSelection(insertIndex + 1);
              toast.success("Đã chèn ảnh vào mô tả");
            } catch (error) {
              toast.error(error.message || "Không thể tải ảnh lên");
            }
          };
        },
      },
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
  }), [getToken]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      <style jsx global>{`
        .ql-toolbar.ql-snow {
          position: relative;
          z-index: 20;
          border: 0;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 12px;
        }

        .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          z-index: 30;
        }

        .ql-container.ql-snow {
          border: 0;
          font-size: 14px;
        }

        .ql-editor {
          min-height: ${minHeight}px;
          color: #334155;
          line-height: 1.75;
        }

        .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }

        .ql-editor h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ql-editor h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ql-editor h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ql-editor blockquote {
          border-left: 4px solid #cbd5e1;
          color: #475569;
        }

        .ql-editor img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
}
