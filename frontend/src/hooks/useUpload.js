import { useEffect, useState } from "react";
import { uploadFile, uploadText } from "../services/uploadApi";

export default function useUpload() {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [linkName, setLinkName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [allowedViewerEmail, setAllowedViewerEmail] = useState("");
  const [viewOnce, setViewOnce] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (viewOnce) {
      setMaxViews("");
    }
  }, [viewOnce]);

  const buildShareLink = (sourceUrl, currentMode, isProtected) => {
    const id = sourceUrl.split("?")[0].split("/").pop();
    const route = currentMode === "text" ? "item" : "file";

    return `${import.meta.env.VITE_FRONT_END_URL}/${route}/${id}?isProtected=${isProtected}`;
  };

  const validateBeforeUpload = () => {
    if (expiry && new Date(expiry) <= new Date()) {
      return "Expiry time must be greater than current time";
    }

    if (password && !confirmPassword) {
      return "Please confirm your password";
    }

    if (password && password !== confirmPassword) {
      return "Passwords do not match";
    }

    if (mode === "text" && !text.trim()) {
      return "Text cannot be empty";
    }

    if (mode === "file" && !file) {
      return "Please select a file";
    }

    if (allowedViewerEmail) {
      const normalized = allowedViewerEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalized)) {
        return "Allowed user email is invalid";
      }
    }

    return "";
  };

  const upload = async () => {
    const validationError = validateBeforeUpload();
    if (validationError) {
      setError(validationError);
      return;
    }

    const startedAt = Date.now();
    const expiresAtISO = expiry ? new Date(expiry).toISOString() : "";

    try {
      setLoading(true);
      setError("");

      const data =
        mode === "text"
          ? await uploadText(text, expiresAtISO, password, viewOnce, maxViews, allowedViewerEmail, linkName)
          : await uploadFile(file, expiresAtISO, password, viewOnce, maxViews, allowedViewerEmail, linkName);

      const sourceUrl = mode === "text" ? data.data.url : data.data.localUrl;
      const isProtected = Boolean(password);

      setLink(buildShareLink(sourceUrl, mode, isProtected));

      const elapsed = Date.now() - startedAt;
      const minLoaderMs = 2000;
      const remaining = Math.max(0, minLoaderMs - elapsed);

      setTimeout(() => {
        setLoading(false);
      }, remaining);
    } catch (err) {
      setError(err.message || "Upload failed");
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    text,
    setText,
    file,
    setFile,
    linkName,
    setLinkName,
    expiry,
    setExpiry,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    allowedViewerEmail,
    setAllowedViewerEmail,
    viewOnce,
    setViewOnce,
    maxViews,
    setMaxViews,
    link,
    setLink,
    loading,
    error,
    upload,
  };
}
