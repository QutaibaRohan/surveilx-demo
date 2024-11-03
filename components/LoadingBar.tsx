"use client";

import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function LoadingBar() {
  const isMutating = useIsMutating();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isMutating) {
      setProgress(10);

      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev < 20) return prev + 2;
          if (prev < 40) return prev + 1;
          if (prev < 60) return prev + 0.5;
          if (prev < 80) return prev + 0.2;
          if (prev < 90) return prev + 0.1;
          return prev;
        });
      }, 150);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timer);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMutating]);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-primary transition-all duration-300 z-50"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
}
