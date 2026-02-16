const TOAST_DURATION_MS = 2200;

function getToastStack() {
  let stack = document.getElementById("copy-toast-stack");

  if (!stack) {
    stack = document.createElement("div");
    stack.id = "copy-toast-stack";
    stack.className = "copy-toast-stack";
    document.body.appendChild(stack);
  }

  return stack;
}

export function showToast(message, tone = "success") {
  if (!message) {
    return;
  }

  const stack = getToastStack();
  const toast = document.createElement("div");
  toast.className = `copy-toast copy-toast-${tone}`;

  const row = document.createElement("div");
  row.className = "copy-toast-row";

  const icon = document.createElement("span");
  icon.className = "copy-toast-icon";

  const text = document.createElement("p");
  text.className = "copy-toast-text";
  text.textContent = message;

  const progress = document.createElement("span");
  progress.className = "copy-toast-progress";

  row.appendChild(icon);
  row.appendChild(text);
  toast.appendChild(row);
  toast.appendChild(progress);
  stack.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("copy-toast-visible");
  });

  setTimeout(() => {
    toast.classList.remove("copy-toast-visible");
    toast.classList.add("copy-toast-hide");
    setTimeout(() => toast.remove(), 260);
  }, TOAST_DURATION_MS);
}
