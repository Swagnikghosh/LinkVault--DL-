import { useEffect, useState } from "react";

export default function FileUpload({ file, setFile }) {
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewKind, setPreviewKind] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setPreviewKind("");
  };

  const onSelectFile = (selectedFile) => {
    if (selectedFile) {
      resetPreview();
      setFile(selectedFile);

      const name = selectedFile.name.toLowerCase();
      const type = selectedFile.type;

      if (type.startsWith("image/")) {
        setPreviewKind("image");
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else if (type === "application/pdf" || name.endsWith(".pdf")) {
        setPreviewKind("pdf");
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else if (name.endsWith(".ppt") || name.endsWith(".pptx")) {
        setPreviewKind("ppt");
      } else {
        setPreviewKind("");
      }
    }
  };

  return (
    <div className="w-full">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onSelectFile(event.dataTransfer.files?.[0]);
        }}
        className={[
          "flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition",
          dragging
            ? "border-orange-300 bg-orange-300/15"
            : "border-orange-200/25 bg-black/20 hover:border-orange-300/70 hover:bg-orange-300/8",
        ].join(" ")}
      >
        <input
          type="file"
          className="hidden"
          onChange={(event) => onSelectFile(event.target.files?.[0])}
        />

        <p className="text-base font-semibold text-orange-50">Drop a file here</p>
        <p className="mt-1 text-xs text-orange-100/70">or click to browse your device</p>
      </label>

      {file && <p className="mt-2 truncate text-xs text-orange-100/80">Selected: {file.name}</p>}

      {previewKind === "image" && previewUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-cyan-100/30 bg-slate-950/40 p-2">
          <img src={previewUrl} alt="Selected preview" className="max-h-72 w-full object-contain" />
        </div>
      )}

      {previewKind === "pdf" && previewUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-cyan-100/30 bg-slate-950/40">
          <iframe src={previewUrl} title="PDF preview" className="h-72 w-full" />
        </div>
      )}

      {previewKind === "ppt" && (
        <div className="mt-3 rounded-xl border border-cyan-100/30 bg-slate-950/40 p-3 text-sm text-slate-200/85">
          Preview for .ppt/.pptx isn&apos;t supported here. The file will still upload and can be opened after download.
        </div>
      )}
    </div>
  );
}
