import React, { createContext, useContext, useMemo, useState } from "react";
import SwipeToast from "../../components/react-bits/micro/SwipeToast.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = payload => {
    const value = typeof payload === "string" ? { title: payload } : payload;
    setToast({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: value?.title || "OMNIVEX",
      description: value?.description || "",
      actionLabel: value?.actionLabel || "",
      onAction: typeof value?.onAction === "function" ? value.onAction : undefined
    });
  };

  const dismissToast = id => {
    setToast(current => current?.id === id ? null : current);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <SwipeToast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          open
          onClose={() => dismissToast(toast.id)}
          background="#13242D"
          color="#F7F9F8"
          fuseColor="#42BFC0"
          duration={4200}
          fuse="bottom"
          closeButton
          dismissible
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}
