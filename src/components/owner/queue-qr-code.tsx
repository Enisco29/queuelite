"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QueueQrCode({ url, name }: { url: string; name: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    void QRCode.toDataURL(url, { width: 320, margin: 2, color: { dark: "#17211b", light: "#fffef9" } }).then(setSrc);
  }, [url]);
  if (!src) return <div className="flex aspect-square w-40 items-center justify-center rounded-xl border border-[#dde3dd] bg-[#f6f7f5] text-xs text-[#667069]" aria-label="Generating QR code">Generating QR…</div>;
  // A generated data URL is the intended source for this downloadable QR code.
  // eslint-disable-next-line @next/next/no-img-element
  return <a className="interactive rounded-xl focus-visible:outline-none" href={src} download={`${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`} title="Download QR code"><img src={src} alt={`QR code for ${name}`} className="w-40 rounded-xl border border-[#dde3dd]" /></a>;
}
