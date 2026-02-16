import { useParams, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import CopyLink from "../components/CopyLink";
import CodeBlock from "../components/CodeBlock";
import TypewriterText from "../components/TypewriterText";
import { showToast } from "../utils/toast";

function extractFilename(url) {
  try {
    return decodeURIComponent(url.split("/").pop().split("?")[0]);
  } catch {
    return "download";
  }
}

export default function ItemPage() {
  const { id } = useParams();
  const location = useLocation();

  const isFileRoute = location.pathname.startsWith("/file");
  const searchParams = new URLSearchParams(location.search);
  const urlSaysProtected = searchParams.get("isProtected") === "true";

  const [text, setText] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showImgPreview, setShowImgPreview] = useState(true);

  const fetchItem = async (providedPassword) => {
    try {
      setError("");
      setPasswordError("");

      const baseUrl = isFileRoute
        ? `${import.meta.env.VITE_BACK_END_URL}/api/v1/item/file/${id}`
        : `${import.meta.env.VITE_BACK_END_URL}/api/v1/item/plainText/${id}`;

      const url = new URL(baseUrl);

      if (providedPassword) {
        url.searchParams.set("isProtected", "true");
        url.searchParams.set("password", providedPassword);
      }

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      const message = payload?.message || "";

      if (response.status === 401) {
        if (message.toLowerCase().includes("password")) {
          setNeedsPassword(true);
          setPasswordError(providedPassword ? "Incorrect password" : "");
          return;
        }

        throw new Error(message || "Please log in as the authorized user");
      }

      if (response.status === 403 && message.toLowerCase().includes("not authorized")) {
        throw new Error("You are not authorized to view this link");
      }

      if (response.status === 403 && message.toLowerCase().includes("view limit")) {
        throw new Error("View limit reached for this link");
      }

      if (response.status === 404) {
        throw new Error("This link has expired or is invalid");
      }

      if (!response.ok || !payload) {
        throw new Error("This link has expired or is invalid");
      }

      if (isFileRoute) {
        setShowImgPreview(true);
        setFileUrl(payload.data.downloadUrl);
      } else {
        setText(payload.data.text);
      }

      setNeedsPassword(false);
      setPassword("");
      setPasswordError("");
    } catch (err) {
      setError(err.message || "This link has expired or is invalid");
    }
  };

  useEffect(() => {
    if (urlSaysProtected) {
      setNeedsPassword(true);
      return;
    }

    fetchItem();
  }, [id, isFileRoute]);

  useEffect(() => {
    if (passwordError) {
      showToast(passwordError, "error");
    }
  }, [passwordError]);

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("download");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = blobUrl;
      anchor.download = extractFilename(fileUrl);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch {
      showToast("Download failed", "error");
    }
  };

  if (error) {
    const isUnauthorized = error.toLowerCase().includes("authorized");

    return (
      <div className="app-shell">
        <div className="surface-card w-full max-w-xl">
          <div className="surface-card-inner text-center">
            <p className="kicker">Access Report</p>
            <h1 className="mt-2 text-3xl font-semibold status-danger">
              {isUnauthorized ? "Access denied" : "Link unavailable"}
            </h1>
            <p className="mt-3 text-sm text-slate-100/85">{error}</p>
            <p className="mt-1 text-xs text-slate-200/70">
              {isUnauthorized ? "Sign in with the authorized account and retry." : "Ask the sender for a fresh link."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="app-shell">
        <div className="surface-card w-full max-w-md">
          <div className="surface-card-inner space-y-4">
            <p className="kicker text-center">Protected Retrieval</p>
            <h2 className="text-center text-2xl font-semibold">Enter vault password</h2>
            <p className="text-center text-sm text-slate-100/85">This shared link is locked behind a password.</p>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="field-input"
            />

            {passwordError && <p className="status-danger text-center text-sm">{passwordError}</p>}

            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (!password) {
                  setPasswordError("Password is required");
                  return;
                }

                fetchItem(password);
              }}
            >
              Unlock content
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="relative z-10 w-full max-w-[1320px] space-y-4">
        <header className="surface-card">
          <div className="surface-card-inner flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="kicker">Secure Access</p>
              <h1 className="section-title text-[2rem]">
                <TypewriterText text={isFileRoute ? "File view" : "Text view"} speed={34} />
              </h1>
              <p className="section-subtitle">Access ends when the expiry or view limit is reached.</p>
            </div>
            <div className="badge-row">
              <span className="badge-chip">{isFileRoute ? "FILE" : "TEXT"}</span>
              <span className="badge-chip">Encrypted transfer</span>
            </div>
          </div>
        </header>

        {!isFileRoute && text && (
          <section className="surface-card">
            <div className="surface-card-inner space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-100">Shared text payload</p>
                <CopyLink link={text} />
              </div>

              <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-cyan-100/30 bg-slate-950/45 p-1">
                <CodeBlock content={text} />
              </div>
            </div>
          </section>
        )}

        {isFileRoute && fileUrl && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className="surface-card lg:col-span-8">
              <div className="surface-card-inner">
                <div className="overflow-hidden rounded-xl border border-cyan-100/30 bg-slate-950/45">
                  {showImgPreview ? (
                    <img
                      src={fileUrl}
                      alt="Uploaded"
                      className="max-h-[72vh] w-full object-contain"
                      onError={() => setShowImgPreview(false)}
                    />
                  ) : (
                    <iframe src={fileUrl} title="File preview" className="h-[72vh] w-full" />
                  )}
                </div>
              </div>
            </section>

            <aside className="surface-card lg:col-span-4">
              <div className="surface-card-inner space-y-4">
                <p className="kicker">Actions</p>
                <div className="control-box space-y-3">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-block w-full text-center">
                    Open Preview
                  </a>
                  <button onClick={handleDownload} type="button" className="btn-primary">
                    Download File
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
