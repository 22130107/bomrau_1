"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const OLD_LOGO = "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F80db2b3de8cb58d0c798f786a4d8fa265af5886e.png?generation=1779094517541297&alt=media";

export function LogoSwitcher({
  width,
  height,
  className,
  priority,
  loading,
}: {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}) {
  const [src, setSrc] = useState(OLD_LOGO);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname.includes("hungnho")) {
      setSrc("/logo.jpg");
    }
  }, []);

  return (
    <Image
      alt="Logo"
      src={src}
      width={width || 100}
      height={height || 60}
      className={className}
      priority={priority}
      loading={loading}
      unoptimized
    />
  );
}
