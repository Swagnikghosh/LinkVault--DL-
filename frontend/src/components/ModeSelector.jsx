export default function ModeSelector({ mode, setMode }) {
  const options = [
    { id: "text", label: "Text vault", hint: "Snippets, notes, code" },
    { id: "file", label: "File vault", hint: "Any uploadable file" },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const active = mode === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={[
              "rounded-xl border p-3 text-left transition",
              active
                ? "border-orange-300/70 bg-orange-300/16 shadow-[0_0_0_1px_rgba(255,176,108,0.4)]"
                : "border-orange-200/20 bg-black/22 hover:border-orange-300/45 hover:bg-orange-300/10",
            ].join(" ")}
          >
            <p className={active ? "text-sm font-semibold text-orange-100" : "text-sm font-semibold text-orange-100/85"}>
              {option.label}
            </p>
            <p className={active ? "mt-1 text-xs text-orange-100/85" : "mt-1 text-xs text-orange-100/60"}>
              {option.hint}
            </p>
          </button>
        );
      })}
    </div>
  );
}
