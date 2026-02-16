import { showToast } from "../utils/toast";

export default function CopyLink({ link }) {
  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        showToast("Copied to clipboard");
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = link;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  return (
    <button type="button" onClick={handleCopy} className="btn-ghost">
      Copy
    </button>
  );
}
