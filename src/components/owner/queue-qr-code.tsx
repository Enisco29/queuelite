"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QueueQrCode({ url, name }: { url: string; name: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    void QRCode.toDataURL(url, { width: 320, margin: 2, color: { dark: "#17211b", light: "#fffef9" } }).then(setSrc);
  }, [url]);
  if (!src) return <div className="aspect-square w-40 animate-pulse rounded-xl bg-neutral-100" />;
  // A generated data URL is the intended source for this downloadable QR code.
  // eslint-disable-next-line @next/next/no-img-element
  return <a href={src} download={`${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`} title="Download QR code"><img src={src} alt={`QR code for ${name}`} className="w-40 rounded-xl border border-black/8" /></a>;
}
