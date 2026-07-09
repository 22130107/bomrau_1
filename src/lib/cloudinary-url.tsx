import Image from "next/image";
import type { ImageProps } from "next/image";

export function cloudinaryUrl(url: string): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto/"
  );
}

export function CldImage({ loading = "eager", ...props }: ImageProps) {
  if (!props.src || props.src === "") return null;
  return <Image {...props} loading={loading} unoptimized />;
}
