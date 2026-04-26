"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleOffline = () => { setOffline(true); setVisible(true); };
    const handleOnline = () => {
      setOffline(false);
      // Keep "back online" state briefly then hide
      setTimeout(() => setVisible(false), 3000);
    };

    // Set initial state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOffline(true);
      setVisible(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-300 ${
        offline
          ? "bg-amber-500 text-white"
          : "bg-green-500 text-white"
      }`}
    >
      {offline ? (
        <>
          <WifiOff className="w-4 h-4 shrink-0" />
          You are offline — some features may be unavailable. Changes will sync when reconnected.
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-white inline-block" />
          Connection restored
        </>
      )}
    </div>
  );
}
