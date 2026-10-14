import React from 'react';
import Scanner from '../Scanner/Scanner';

export function QRScanner(props) {
  return <Scanner placeholder="Scan QR / 2D Barcode Code..." {...props} />;
}

export default QRScanner;
