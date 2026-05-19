'use client'

import React from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CertificateQr } from '@/components/learn/certificate-qr'

interface CertificateProps {
  studentName: string
  studentDni?: string
  courseName: string
  date?: Date
  verificationUrl: string
  certificateCode?: string
}

export function Certificate({
  studentName,
  studentDni,
  courseName,
  date = new Date(),
  verificationUrl,
  certificateCode,
}: CertificateProps) {
  const formattedDate = format(date, "d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-white text-slate-900 shadow-2xl print:w-full print:max-w-none print:break-inside-avoid print:shadow-none">
      <div className="relative flex aspect-[1.414/1] w-full flex-col items-center justify-center p-4 text-center print:p-0 sm:p-8 md:p-12">
        <div className="pointer-events-none absolute inset-4 border-[12px] border-double border-slate-200 print:inset-0 sm:inset-6 sm:border-[16px] md:inset-8 md:border-[20px]" />
        <div className="pointer-events-none absolute inset-6 border border-slate-300 print:inset-2 sm:inset-8 md:inset-10" />

        <div className="absolute top-4 right-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg print:top-3 print:right-3 print:p-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <CertificateQr value={verificationUrl} />
            <p className="max-w-20 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 print:max-w-24 print:text-[9px] print:tracking-[0.18em]">
              Verificá este certificado
            </p>
            {certificateCode && (
              <p className="max-w-20 break-words text-[7px] font-semibold tracking-[0.06em] text-slate-400 print:max-w-24 print:text-[8px] print:tracking-[0.08em]">
                {certificateCode}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-4 px-10 pt-20 print:space-y-6 print:px-20 print:pt-24 md:px-14 md:pt-24 md:space-y-6">
          <div className="mb-2 print:mb-4 md:mb-4">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white p-2 shadow-sm print:mb-4 print:h-20 print:w-20 md:h-20 md:w-20 md:print:h-24 md:print:w-24">
              <Image
                src="/logoMuni-sm.png"
                alt="Municipalidad de San Miguel de Tucumán"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 print:text-xs print:tracking-[0.2em] md:text-xs md:tracking-[0.22em] md:print:text-sm md:print:tracking-[0.3em]">
              Certificado Oficial de Participación
            </h3>
          </div>

          <div className="space-y-2 print:space-y-2 md:space-y-3">
            <h1 className="font-serif text-[2.65rem] font-bold leading-[0.96] tracking-tight text-slate-900 print:text-3xl sm:print:text-4xl md:text-5xl lg:text-[5.2rem] md:print:text-5xl lg:print:text-6xl">
              Certificado de Finalización
            </h1>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 print:text-sm print:tracking-widest md:text-sm md:print:text-base">
              Este documento certifica que
            </p>
          </div>

          <div className="mt-2 mb-2 w-full max-w-2xl border-b border-slate-300 pb-2 print:mt-4 print:mb-4 md:mt-4 md:mb-4 md:print:mt-8 md:print:mb-8 md:pb-3 md:print:pb-4">
            <h2 className="font-serif text-3xl font-bold italic text-primary md:text-4xl lg:text-[4rem] print:text-2xl sm:print:text-3xl md:print:text-4xl lg:print:text-5xl">
              {studentName}
            </h2>
            {studentDni && (
              <p className="mt-1 text-[11px] tracking-wider text-slate-500 print:mt-2 print:text-xs md:text-xs md:print:text-sm">
                DNI {studentDni}
              </p>
            )}
          </div>

          <div className="max-w-2xl space-y-3 px-4 print:space-y-4">
            <p className="text-sm leading-relaxed text-slate-600 print:text-sm md:text-base lg:print:text-lg">
              Ha completado satisfactoriamente todos los módulos y evaluaciones del curso:
            </p>
            <h3 className="text-2xl font-bold text-slate-800 md:text-3xl print:text-xl sm:print:text-2xl md:print:text-3xl">
              {courseName}
            </h3>
          </div>

          <div className="mt-8 flex w-full items-end justify-between px-10 print:mt-12 print:px-8 md:mt-12 md:px-12 md:print:mt-24 md:print:px-16">
            <div className="flex flex-col items-center">
              <div className="mb-2 w-28 border-b border-slate-400 pb-2 text-center print:w-32 md:w-40 md:print:w-48">
                <span className="text-xs font-semibold text-slate-800 print:text-sm md:text-sm md:print:text-base">{formattedDate}</span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 print:text-xs md:text-xs md:print:text-sm">Fecha</span>
            </div>

            <div className="pointer-events-none h-12 w-12 opacity-20 print:h-16 print:w-16 md:h-16 md:w-16 md:print:h-24 md:print:w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full fill-current text-slate-900">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 2" />
                <path d="M50 20 L80 80 L20 80 Z" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-2 h-8 w-28 border-b border-slate-400 pb-2 text-center print:w-32 md:w-40 md:print:w-48">
                <span className="absolute right-0 bottom-1 left-0 font-serif text-base italic text-slate-700 opacity-80 print:text-lg md:text-lg md:print:text-xl">
                  Dirección
                </span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 print:text-xs md:text-xs md:print:text-sm">
                Firma Autorizada
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
