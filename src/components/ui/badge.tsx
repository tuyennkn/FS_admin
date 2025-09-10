import * as React from "react";

export function Badge({ variant = "default", className = "", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "destructive" }) {
  const styles =
    variant === "success"
      ? "bg-green-100 text-green-700"
      : variant === "destructive"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";
  return <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${styles} ${className}`} {...props} />;
}
