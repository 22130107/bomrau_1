"use client";

import { useEffect, useState } from "react";

const DEFAULT = {
  name: "Shop TFT",
  tagline: "Shop TFT chuyên cung cấp tài khoản game TFT giá rẻ.",
  copyright: "© 2026 - Bản quyền thuộc về Shop TFT",
};

const HUNGN_HO = {
  name: "Hung Nho",
  tagline: "Hung Nho - Shop TFT uy tín, giá rẻ, đa dạng, đầy đủ Mobile và PC.",
  copyright: "© 2026 - Bản quyền thuộc về Hung Nho",
};

export function useSiteInfo() {
  const [info, setInfo] = useState(DEFAULT);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname.includes("hungnho")) {
      setInfo(HUNGN_HO);
    }
  }, []);

  return info;
}
