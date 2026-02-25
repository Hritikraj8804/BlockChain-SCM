import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

export function QrCodeModal({ isOpen, onClose, orderId, orderName }) {
    const qrRef = useRef(null);

    if (!isOpen) return null;

    // URL would usually be the product tracking page
    // We'll generate a public URL based on current origin if running locally
    // E.g. http://localhost:5173/track/order/123
    const url = `${window.location.origin}/track/order/${orderId}`;

    const downloadQR = () => {
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            // Add padding and white background
            canvas.width = img.width + 40;
            canvas.height = img.height + 60;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add title
            ctx.fillStyle = "black";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(orderName, canvas.width / 2, 25);

            // Draw QR code
            ctx.drawImage(img, 20, 40);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `Waybill_${orderName.replace(/\s+/g, '_')}.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-border/60 rounded-xl shadow-2xl max-w-sm w-full border overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 border-b border-border/60 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-foreground">Waybill QR Code</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-inner" ref={qrRef}>
                        <QRCodeSVG
                            value={url}
                            size={200}
                            level={"H"}
                            includeMargin={true}
                            imageSettings={{
                                src: "/vite.svg", // Change to standard logo if you have one
                                x: undefined,
                                y: undefined,
                                height: 24,
                                width: 24,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="text-center space-y-2">
                        <h4 className="font-semibold text-foreground text-lg">{orderName}</h4>
                        <p className="text-sm text-muted-foreground break-all px-2">
                            Consumers can scan this to track this specific order and its entire supply chain journey.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full pt-2">
                        <Button className="flex-1" onClick={downloadQR}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PNG
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
