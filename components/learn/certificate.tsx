'use client'

import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CertificateQr } from '@/components/learn/certificate-qr'

interface CertificateProps {
  studentName: string
  courseName: string
  date?: Date
  verificationUrl: string
  certificateCode?: string
}

export function Certificate({
  studentName,
  courseName,
  date = new Date(),
  verificationUrl,
  certificateCode,
}: CertificateProps) {
  const formattedDate = format(date, "d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-white text-slate-900 shadow-2xl print:w-full print:max-w-none print:shadow-none">
      <div className="relative flex aspect-[1.414/1] w-full flex-col items-center justify-center p-4 text-center print:p-0 sm:p-8 md:p-12">
        <div className="pointer-events-none absolute inset-4 border-[12px] border-double border-slate-200 print:inset-0 sm:inset-6 sm:border-[16px] md:inset-8 md:border-[20px]" />
        <div className="pointer-events-none absolute inset-6 border border-slate-300 print:inset-2 sm:inset-8 md:inset-10" />

        <div className="absolute top-5 right-5 z-10 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg print:top-3 print:right-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <CertificateQr value={verificationUrl} />
            <p className="max-w-24 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Verificá este certificado
            </p>
            {certificateCode && (
              <p className="max-w-24 break-words text-[8px] font-semibold tracking-[0.08em] text-slate-400">
                {certificateCode}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-6 px-8 pt-28 print:px-20 print:pt-24 md:space-y-10 md:px-16 md:pt-32">
          <div className="mb-4 md:mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-slate-100 md:h-24 md:w-24">
              <span className="font-serif text-3xl font-bold text-slate-800">IA</span>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 md:text-sm md:tracking-[0.3em]">
              Certificado Oficial de Participación
            </h3>
          </div>

          <div className="space-y-2 md:space-y-4">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
              Certificado de Finalización
            </h1>
            <p className="text-sm font-medium uppercase tracking-widest text-slate-600 md:text-base">
              Este documento certifica que
            </p>
          </div>

          <div className="mt-4 mb-4 w-full max-w-2xl border-b border-slate-300 pb-2 md:mt-8 md:mb-8 md:pb-4">
            <h2 className="font-serif text-2xl font-bold italic text-primary sm:text-3xl md:text-4xl lg:text-5xl">
              {studentName}
            </h2>
          </div>

          <div className="max-w-2xl space-y-4 px-4">
            <p className="text-sm leading-relaxed text-slate-600 md:text-base lg:text-lg">
              Ha completado satisfactoriamente todos los módulos y evaluaciones del curso:
            </p>
            <h3 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl">
              {courseName}
            </h3>
          </div>

          <div className="mt-12 flex w-full items-end justify-between px-8 md:mt-24 md:px-16">
            <div className="flex flex-col items-center">
              <div className="mb-2 w-32 border-b border-slate-400 pb-2 text-center md:w-48">
                <span className="text-sm font-semibold text-slate-800 md:text-base">{formattedDate}</span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-sm">Fecha</span>
            </div>

            <div className="pointer-events-none h-16 w-16 opacity-20 md:h-24 md:w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full fill-current text-slate-900">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 2" />
                <path d="M50 20 L80 80 L20 80 Z" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-2 h-8 w-32 border-b border-slate-400 pb-2 text-center md:w-48">
                <span className="absolute right-0 bottom-1 left-0 font-serif text-lg italic text-slate-700 opacity-80 md:text-xl">
                  Dirección
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-sm">
                Firma Autorizada
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
