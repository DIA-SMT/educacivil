'use client'

import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CertificateProps {
  studentName: string
  studentDni?: string
  courseName: string
  date?: Date
}

export function Certificate({ studentName, studentDni, courseName, date = new Date() }: CertificateProps) {
  const formattedDate = format(date, "d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-slate-900 overflow-hidden shadow-2xl print:shadow-none print:max-w-none print:w-full">
      {/* 
        This wrapper sets the aspect ratio to A4 landscape (297/210 = ~1.414).
        We use padding-bottom trick or aspect-ratio if supported.
      */}
      <div className="relative w-full aspect-[1.414/1] p-4 sm:p-8 md:p-12 print:p-0 flex flex-col justify-center items-center text-center">
        
        {/* Decorative borders */}
        <div className="absolute inset-4 sm:inset-6 md:inset-8 print:inset-0 border-[12px] sm:border-[16px] md:border-[20px] border-double border-slate-200 pointer-events-none" />
        <div className="absolute inset-6 sm:inset-8 md:inset-10 print:inset-2 border border-slate-300 pointer-events-none" />

        {/* Inner Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-8 md:px-16 print:px-20 space-y-6 md:space-y-10">
          
          {/* Logo / Header Area */}
          <div className="mb-4 md:mb-8">
            {/* Si tienes un logo, lo puedes colocar aquí. Usaremos texto por defecto */}
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
              <span className="font-serif text-3xl font-bold text-slate-800">IA</span>
            </div>
            <h3 className="uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm font-semibold text-slate-500">
              Certificado Oficial de Participación
            </h3>
          </div>

          <div className="space-y-2 md:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight">
              Certificado de Finalización
            </h1>
            <p className="text-sm md:text-base text-slate-600 font-medium uppercase tracking-widest">
              Este documento certifica que
            </p>
          </div>

          <div className="w-full max-w-2xl border-b border-slate-300 pb-2 md:pb-4 mt-4 md:mt-8 mb-4 md:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary italic">
              {studentName}
            </h2>
            {studentDni && (
              <p className="text-xs md:text-sm text-slate-500 mt-2 tracking-wider">
                DNI {studentDni}
              </p>
            )}
          </div>

          <div className="max-w-2xl px-4 space-y-4">
            <p className="text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed">
              Ha completado satisfactoriamente todos los módulos y evaluaciones del curso:
            </p>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
              {courseName}
            </h3>
          </div>

          {/* Footer with date and signature */}
          <div className="w-full flex justify-between items-end mt-12 md:mt-24 px-8 md:px-16">
            <div className="flex flex-col items-center">
              <div className="w-32 md:w-48 border-b border-slate-400 pb-2 mb-2 text-center">
                <span className="text-sm md:text-base font-semibold text-slate-800">{formattedDate}</span>
              </div>
              <span className="text-xs md:text-sm text-slate-500 uppercase tracking-wider font-semibold">Fecha</span>
            </div>

            <div className="w-16 h-16 md:w-24 md:h-24 opacity-20 pointer-events-none">
              {/* Sello de agua simulado */}
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-slate-900">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 2" />
                <path d="M50 20 L80 80 L20 80 Z" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 md:w-48 border-b border-slate-400 pb-2 mb-2 text-center h-8 relative">
                {/* Simulated signature graphic could go here */}
                <span className="absolute bottom-1 left-0 right-0 font-serif text-lg md:text-xl text-slate-700 italic opacity-80">
                  Dirección
                </span>
              </div>
              <span className="text-xs md:text-sm text-slate-500 uppercase tracking-wider font-semibold">Firma Autorizada</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
