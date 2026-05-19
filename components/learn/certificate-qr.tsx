'use client'

import QRCode from 'react-qr-code'

interface CertificateQrProps {
  value: string
}

export function CertificateQr({ value }: CertificateQrProps) {
  return (
    <div
      aria-label="Código QR de verificación del certificado"
      className="flex h-24 w-24 items-center justify-center md:h-28 md:w-28"
    >
      <QRCode
        value={value}
        size={112}
        bgColor="transparent"
        fgColor="#0f172a"
        level="M"
        className="h-full w-full"
      />
    </div>
  )
}
