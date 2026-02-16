export default function UploadButton({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} type="button" className="btn-primary">
      <span className="relative z-10">{loading ? "Uploading..." : "Create secure link"}</span>
    </button>
  );
}
