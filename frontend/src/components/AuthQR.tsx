import React, { useState } from "react";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
import { Container, Alert } from "@mantine/core";

export interface AuthQRProps {
  /** This component will submit the QR Code scan result this way.
   * The parent component should control operations (e.g., prevent input while async is in progress)
   */
  onScan: (data: string) => void;
}

const AuthQR: React.FC<AuthQRProps> = ({ onScan }) => {
  const [error, setError] = useState<string>();

  const hints = new Map<DecodeHintType, unknown>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

  return (
    <>
      <Container size="xs">
        <QrScanner
          onDecode={(result: string) => {
            setError(undefined);
            onScan(result);
          }}
          onError={(error: Error) => {
            setError(error.name + ": " + error.message);
          }}
          hints={hints}
        />
        {error && (
          <Alert title="QR Scan Error" color="red">
            {error}
          </Alert>
        )}
      </Container>
    </>
  );
};

export default AuthQR;
