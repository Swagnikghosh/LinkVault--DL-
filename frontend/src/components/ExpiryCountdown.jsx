import { useEffect, useState } from "react";

export default function ExpiryCountdown({ expiry }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!expiry) {
      setRemaining("10m default");
      return;
    }

    const timer = setInterval(() => {
      const diff = new Date(expiry) - new Date();

      if (diff <= 0) {
        setRemaining("Expired");
        clearInterval(timer);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  return (
    <p className="text-sm text-slate-300">
      Expires in <span className="font-semibold text-cyan-300">{remaining}</span>
    </p>
  );
}
