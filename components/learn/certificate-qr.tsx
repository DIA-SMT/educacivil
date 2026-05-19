'use client'

import Script from 'next/script'
import { useEffect, useId, useState } from 'react'

declare global {
  interface Window {
    qrcode?: (typeNumber: number, errorCorrectionLevel: string) => {
      addData: (value: string) => void
      make: () => void
      createSvgTag: (cellSize?: number, margin?: number) => string
    }
  }
}

interface CertificateQrProps {
  value: string
}

export function CertificateQr({ value }: CertificateQrProps) {
  const qrId = useId().replace(/:/g, '')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (window.qrcode) {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !window.qrcode) return

    const element = document.getElementById(qrId)
    if (!element) return

    const qr = window.qrcode(0, 'M')
    qr.addData(value)
    qr.make()
    element.innerHTML = qr.createSvgTag(4, 0)
  }, [isLoaded, qrId, value])

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      <div
        id={qrId}
        aria-label="Código QR de verificación del certificado"
        className="h-24 w-24 md:h-28 md:w-28 [&>svg]:h-full [&>svg]:w-full"
      />
    </>
  )
}
