import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string; // The value to encode in the QR code
  size?: string; // Optional size of the QR code, default is 100%
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ value, size = "100%" }) => {
  return <QRCodeSVG value={value} size={size} />;
};

export default QRCodeComponent;
