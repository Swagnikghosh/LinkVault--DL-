import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteMyLink, getMyLinks, updateMyLink } from "../services/dashboardApi";
import { showToast } from "../utils/toast";
import TypewriterText from "../components/TypewriterText";

function toLocalDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toISO(value) {
  if (!value) return "";
  return new Date(value).toISOString();
}

function buildLinkHref(linkItem) {
  const route = linkItem.type === "text" ? "item" : "file";
  return `${import.meta.env.VITE_FRONT_END_URL}/${route}/${linkItem.id}?isProtected=${linkItem.isProtected}`;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [forms, setForms] = useState({});
  const [confirmId, setConfirmId] = useState("");
  const [confirmName, setConfirmName] = useState("");

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const response = await getMyLinks();
        const nextLinks = response.data.links;
        setLinks(nextLinks);
        if (!selectedId && nextLinks.length) {
          setSelectedId(nextLinks[0].id);
        }
      } catch (error) {
        showToast(error.message || "Failed to load links", "error");
      } finally {
        setLoading(false);
      }
    };

    loadLinks();
  }, []);

  useEffect(() => {
    const mapped = {};
    links.forEach((linkItem) => {
      mapped[linkItem.id] = {
        linkName: linkItem.linkName || "",
        expiresAt: toLocalDateInput(linkItem.expiresAt),
        maxViews: linkItem.maxViews ?? "",
        password: "",
        allowedViewerEmail: linkItem.allowedViewerEmail || "",
      };
    });
    setForms(mapped);
  }, [links]);

  const selectedLink = useMemo(
    () => links.find((item) => item.id === selectedId) || null,
    [links, selectedId],
  );

  const saveLink = async (id) => {
    try {
      setSavingId(id);
      const form = forms[id];
      const body = {
        linkName: form.linkName,
        expiresAt: form.expiresAt ? toISO(form.expiresAt) : undefined,
        maxViews: form.maxViews === "" ? null : Number(form.maxViews),
        allowedViewerEmail: form.allowedViewerEmail?.trim() || "",
      };

      if (form.password !== "") {
        body.password = form.password;
      }

      const response = await updateMyLink(id, body);
      setLinks((prev) => prev.map((item) => (item.id === id ? response.data.link : item)));
      setForms((prev) => ({
        ...prev,
        [id]: { ...prev[id], password: "" },
      }));
      showToast("Link updated", "success");
    } catch (error) {
      showToast(error.message || "Update failed", "error");
    } finally {
      setSavingId("");
    }
  };

  const removeLink = async (id) => {
    try {
      setDeletingId(id);
      await deleteMyLink(id);
      setLinks((prev) => prev.filter((item) => item.id !== id));
      setForms((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (selectedId === id) {
        setSelectedId((prev) => {
          const remaining = links.filter((item) => item.id !== id);
          return remaining.length ? remaining[0].id : "";
        });
      }
      showToast("Link deleted", "success");
    } catch (error) {
      showToast(error.message || "Delete failed", "error");
    } finally {
      setDeletingId("");
      setConfirmId("");
      setConfirmName("");
    }
  };

  return (
    <div className="app-shell">
      <div className="relative z-10 w-full max-w-[1320px] space-y-4">
        <header className="surface-card">
          <div className="surface-card-inner flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
            <p className="kicker">Vault Operations</p>
            <h1 className="section-title text-[2.2rem]">
              <TypewriterText text={`${user?.name || "Your"}'s Links`} speed={36} />
            </h1>
            <p className="section-subtitle">Review, edit, or remove your links from one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-chip">Total: {links.length}</span>
              <Link className="btn-ghost" to="/">New link</Link>
              <button type="button" className="btn-ghost" onClick={logout}>Log out</button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className="surface-card xl:col-span-5">
            <div className="surface-card-inner space-y-3">
              <p className="kicker">Link List</p>
              {loading && <p className="text-sm text-slate-100/85">Loading links...</p>}
              {!loading && !links.length && <p className="text-sm text-slate-100/85">No links yet.</p>}

              <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-1">
                {links.map((linkItem) => {
                  const active = selectedId === linkItem.id;
                  return (
                    <article
                      key={linkItem.id}
                      className={["control-box", active ? "ring-2 ring-cyan-300/60" : ""].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{linkItem.linkName || "Untitled link"}</p>
                          <p className="text-xs text-slate-200/80">{linkItem.type.toUpperCase()} | Views left: {linkItem.viewsLeft ?? "Unlimited"}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="btn-ghost" onClick={() => setSelectedId(linkItem.id)}>
                            Configure
                          </button>
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => {
                            setConfirmId(linkItem.id);
                            setConfirmName(linkItem.linkName || "this link");
                          }}
                          disabled={deletingId === linkItem.id}
                        >
                          {deletingId === linkItem.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-200/70">
                        Expires: {linkItem.expiresAt ? new Date(linkItem.expiresAt).toLocaleString() : "Not set"}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="surface-card xl:col-span-7">
            <div className="surface-card-inner space-y-4">
              <p className="kicker">Editor Pane</p>
              {!selectedLink && (
                <div className="control-box py-10 text-center">
                  <p className="text-sm text-slate-100/85">Select a link from the left to start editing.</p>
                </div>
              )}

              {selectedLink && (
                <div className="space-y-4">
                  <div className="control-box">
                    <a
                      className="block truncate text-sm text-cyan-100 underline underline-offset-2"
                      href={buildLinkHref(selectedLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {buildLinkHref(selectedLink)}
                    </a>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="control-box">
                      <label className="field-label">Link name</label>
                      <input
                        type="text"
                        className="field-input"
                        value={forms[selectedLink.id]?.linkName || ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [selectedLink.id]: { ...prev[selectedLink.id], linkName: event.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="control-box">
                      <label className="field-label">Allowed user email</label>
                      <input
                        type="email"
                        className="field-input"
                        placeholder="Leave blank for public link access"
                        value={forms[selectedLink.id]?.allowedViewerEmail || ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [selectedLink.id]: { ...prev[selectedLink.id], allowedViewerEmail: event.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="control-box">
                      <label className="field-label">Change expiry</label>
                      <input
                        type="datetime-local"
                        className="field-input"
                        value={forms[selectedLink.id]?.expiresAt || ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [selectedLink.id]: { ...prev[selectedLink.id], expiresAt: event.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="control-box">
                      <label className="field-label">Change max views</label>
                      <input
                        type="number"
                        min="1"
                        className="field-input"
                        value={forms[selectedLink.id]?.maxViews ?? ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [selectedLink.id]: { ...prev[selectedLink.id], maxViews: event.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="control-box">
                      <label className="field-label">New password</label>
                      <input
                        type="password"
                        className="field-input"
                        placeholder="Optional"
                        value={forms[selectedLink.id]?.password || ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [selectedLink.id]: { ...prev[selectedLink.id], password: event.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => saveLink(selectedLink.id)}
                      disabled={savingId === selectedLink.id}
                    >
                      {savingId === selectedLink.id ? "Saving..." : "Apply changes"}
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => setSelectedId("")}>Close editor</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {confirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="surface-card w-full max-w-md">
              <div className="surface-card-inner space-y-4">
                <p className="kicker text-center">Delete link</p>
                <p className="text-center text-lg font-semibold text-slate-100">Remove “{confirmName || "this link"}”?</p>
                <p className="text-center text-sm text-slate-200/75">This action is permanent. Users will lose access immediately.</p>

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => removeLink(confirmId)}
                    disabled={deletingId === confirmId}
                  >
                    {deletingId === confirmId ? "Deleting..." : "Delete link"}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setConfirmId("");
                      setConfirmName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
