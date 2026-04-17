'use client'

import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    [{ align: [] }],
    ["clean"],
  ],
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "link",
  "align",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here...",
  minHeight = 320,
}) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <ReactQuill
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
      `}</style>
    </div>
  );
}
