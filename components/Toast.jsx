'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

let toastId = 0;
let listeners = [];

export function showToast(message, type = 'success') {
  const id = ++toastId;
  listeners.forEach((fn) => fn({ id, message, type }));
  setTimeout(() => {
    listeners.forEach((fn) => fn({ id, remove: true }));
  }, 3000);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      if (toast.remove) {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      } else {
        setToasts((prev) => [...prev, toast]);
      }
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((fn) => fn !== handler); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-bold animate-slide-in ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-700'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
          <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
