import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ value, size = 100 }) => {
  return <QRCodeSVG value={value} size={size} />;
};

export default QRCodeComponent;
