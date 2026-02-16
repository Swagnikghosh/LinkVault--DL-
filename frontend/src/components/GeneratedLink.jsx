export default function GeneratedLink({ link }) {
  if (!link) return null;

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-1">
      <p className="text-xs font-medium text-green-700 uppercase">
        Link generated
      </p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 underline break-all"
      >
        {link}
      </a>
    </div>
  );
}
