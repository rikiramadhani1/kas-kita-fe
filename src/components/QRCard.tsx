import "./QRCard.css";

export default function QRCard({ qrUrl }: { qrUrl: string }) {
  return (
    <div className="qr-card">
      <img src={qrUrl} alt="QRIS" className="qr-image" />
    </div>
  );
}
