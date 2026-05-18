'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity"
    >
      <Printer className="w-4 h-4" />
      Descargar PDF / Imprimir
    </button>
  )
}
