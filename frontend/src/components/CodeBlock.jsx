import { useEffect, useRef } from "react";
import hljs from "highlight.js";

function isProbablyCode(text) {
  if (!text) {
    return false;
  }

  const lines = text.split("\n");

  if (lines.length < 2 && text.length < 80) {
    return false;
  }

  const codeSignals = [
    /\b(import|export|function|class|const|let|var|return|if|else)\b/,
    /=>/,
    /[{()}[\]]/,
    /;\s*$/,
    /^\s{2,}\S/,
    /^\s*(def|class)\s+\w+/m,
    /<\/?[a-z][\s\S]*>/i,
  ];

  return codeSignals.filter((rule) => rule.test(text)).length >= 2;
}

export default function CodeBlock({ content }) {
  const ref = useRef(null);
  const isCode = isProbablyCode(content);

  useEffect(() => {
    if (isCode && ref.current) {
      hljs.highlightElement(ref.current);
    }
  }, [content, isCode]);

  if (!isCode) {
    return (
      <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-300/15 bg-black/35 p-4 leading-relaxed text-slate-100">
        {content}
      </div>
    );
  }

  return (
    <pre className="max-h-[50vh] overflow-auto rounded-xl border border-slate-300/15 bg-[#071016] p-3">
      <code ref={ref} className="hljs whitespace-pre text-sm leading-relaxed">
        {content}
      </code>
    </pre>
  );
}
