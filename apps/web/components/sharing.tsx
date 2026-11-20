"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, Share2, Check } from "lucide-react";
import { Modal } from "./ui";
export function ShareModal({
  title,
  path,
  onClose,
}: {
  title: string;
  path: string;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(""),
    [qr, setQr] = useState(""),
    [copied, setCopied] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const u = new URL(path, window.location.origin).href;
    setUrl(u);
    QRCode.toDataURL(u, {
      width: 600,
      margin: 3,
      color: { dark: "#173f35", light: "#fafaf2" },
      errorCorrectionLevel: "M",
    })
      .then(setQr)
      .catch(() =>
        setError(
          "The QR code could not be created. You can still copy the link.",
        ),
      );
  }, [path]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError(
        "Copy is unavailable in this browser. Select and copy the address below.",
      );
    }
  }
  return (
    <Modal title="Good golf is worth sharing." onClose={onClose}>
      <p className="muted">{title}</p>
      {qr && (
        <img
          className="share-qr"
          src={qr}
          alt={`QR code linking to ${title}`}
        />
      )}
      <div className="share-url">
        <span>{url}</span>
        <button
          className="icon-button"
          aria-label="Copy event link"
          onClick={copy}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
      {qr && (
        <a
          className="button primary full"
          href={qr}
          download="ForeCircle-Event-QR.png"
        >
          <Download size={16} />
          Download QR code
        </a>
      )}
      <button
        className="button secondary full"
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title, url });
            } catch (e) {
              if (e instanceof Error && e.name !== "AbortError")
                setError("Sharing is unavailable. Copy the link instead.");
            }
          } else await copy();
        }}
      >
        <Share2 size={16} />
        {copied ? "Link copied" : "Share event"}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="notice">
        This link opens a sample event. The current site is private to its
        owner.
      </p>
    </Modal>
  );
}
