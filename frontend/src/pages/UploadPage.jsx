import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ModeSelector from "../components/ModeSelector";
import TextUpload from "../components/TextUpload";
import FileUpload from "../components/FileUpload";
import UploadButton from "../components/UploadButton";
import useUpload from "../hooks/useUpload";
import ExpiryInput from "../components/ExpiryInput";
import CopyLink from "../components/CopyLink";
import TypewriterText from "../components/TypewriterText";
import ExpiryCountdown from "../components/ExpiryCountdown";
import PasswordInput from "../components/PasswordInput";
import ConfirmPasswordInput from "../components/ConfirmPasswordInput";
import ViewOnceToggle from "../components/ViewOnceToggle";
import MaxViewsInput from "../components/MaxViewsInput";
import { showToast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";

export default function UploadPage() {
  const { user, logout } = useAuth();
  const uploadState = useUpload();
  const previousErrorRef = useRef("");

  useEffect(() => {
    if (uploadState.error && uploadState.error !== previousErrorRef.current) {
      showToast(uploadState.error, "error");
      previousErrorRef.current = uploadState.error;
      return;
    }

    if (!uploadState.error) {
      previousErrorRef.current = "";
    }
  }, [uploadState.error]);

  return (
    <div className="app-shell">
      {uploadState.loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="surface-card w-full max-w-xs">
            <div className="surface-card-inner flex items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-transparent" />
              <div>
                <p className="text-sm font-semibold text-slate-100">Securing payload...</p>
                <p className="text-xs text-cyan-100/80">Encrypting and uploading</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-[1080px] space-y-4">
        <header className="surface-card">
          <div className="surface-card-inner flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="kicker">Upload Console</p>
              <h1 className="section-title text-[2.2rem]"><TypewriterText text="LinkVault Console" speed={34} /></h1>
              <p className="section-subtitle">Create short-lived links with passwords, view limits, and optional recipient lock.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="pill pill-ghost">{uploadState.mode.toUpperCase()} mode</span>
              <span className="pill pill-soft">Signed in: {user?.email}</span>
              <Link to="/dashboard" className="pill pill-ghost">Dashboard</Link>
              <button type="button" className="pill pill-ghost" onClick={logout}>Log out</button>
            </div>
          </div>
        </header>

        <div className="surface-card">
          <section>
            <div className="surface-card-inner space-y-5">
              <div className="control-box space-y-3">
                <p className="kicker">Link name (optional)</p>
                <input
                  type="text"
                  value={uploadState.linkName}
                  onChange={(event) => uploadState.setLinkName(event.target.value)}
                  placeholder="Enter link name"
                  className="field-input"
                />
              </div>

              <div className="control-box space-y-3">
                <p className="kicker">1. Choose payload type</p>
                <ModeSelector mode={uploadState.mode} setMode={uploadState.setMode} />
                {uploadState.mode === "text" ? (
                  <TextUpload text={uploadState.text} setText={uploadState.setText} />
                ) : (
                  <FileUpload file={uploadState.file} setFile={uploadState.setFile} />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="control-box space-y-3">
                  <p className="kicker">2. Time and lock</p>
                  <div>
                    <label className="field-label">Expiry date and time (optional)</label>
                    <ExpiryInput expiry={uploadState.expiry} setExpiry={uploadState.setExpiry} />
                  </div>
                  <div>
                    <label className="field-label">Password (optional)</label>
                    <PasswordInput password={uploadState.password} setPassword={uploadState.setPassword} />
                  </div>
                  {uploadState.password && (
                    <div>
                      <label className="field-label">Confirm password</label>
                      <ConfirmPasswordInput
                        confirmPassword={uploadState.confirmPassword}
                        setConfirmPassword={uploadState.setConfirmPassword}
                      />
                    </div>
                  )}
                </div>

                <div className="control-box space-y-3">
                  <p className="kicker">3. Audience rules</p>
                  <div>
                    <label className="field-label">Allow only this user email (optional)</label>
                    <input
                      type="email"
                      value={uploadState.allowedViewerEmail}
                      onChange={(event) => uploadState.setAllowedViewerEmail(event.target.value)}
                      placeholder="user@example.com"
                      className="field-input"
                    />
                    <p className="mt-1 text-xs text-cyan-100/75">Restricted links can be opened only by this account.</p>
                  </div>

                  <div>
                    <ViewOnceToggle viewOnce={uploadState.viewOnce} setViewOnce={uploadState.setViewOnce} />
                  </div>

                  {!uploadState.viewOnce && (
                    <div>
                      <label className="field-label">Max views</label>
                      <MaxViewsInput maxViews={uploadState.maxViews} setMaxViews={uploadState.setMaxViews} />
                    </div>
                  )}
                </div>
              </div>

              <div className="control-box space-y-3">
                <p className="kicker">4. Launch link</p>
                <UploadButton onClick={uploadState.upload} loading={uploadState.loading} />
                {uploadState.error && <p className="status-danger text-sm">{uploadState.error}</p>}
              </div>
            </div>
          </section>
        </div>
      </div>

      {uploadState.link && !uploadState.loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="surface-card w-full max-w-3xl">
            <div className="surface-card-inner space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="kicker">Transmission Complete</p>
                  <h2 className="text-2xl font-semibold text-cyan-100">Secure link generated</h2>
                </div>
                <button onClick={() => uploadState.setLink("")} className="btn-ghost" aria-label="Close">Close</button>
              </div>

              <div className="rounded-xl border border-cyan-100/30 bg-slate-950/40 p-3">
                <a
                  href={uploadState.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm text-cyan-100 underline underline-offset-2"
                >
                  {uploadState.link}
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <CopyLink link={uploadState.link} />
                <ExpiryCountdown expiry={uploadState.expiry} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
