import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// lightweight pointer parallax for background
let frame = null;
window.addEventListener("pointermove", (event) => {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    const x = (event.clientX / window.innerWidth - 0.5) * 20; // px offset
    const y = (event.clientY / window.innerHeight - 0.5) * 20;
    document.documentElement.style.setProperty("--pointer-x", `${x}px`);
    document.documentElement.style.setProperty("--pointer-y", `${y}px`);
    frame = null;
  });
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);
