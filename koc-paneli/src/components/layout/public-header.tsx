'use client'

import { useState } from 'react'
import Link from 'next/link'

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-16 px-margin-x bg-surface/80 backdrop-blur-xl border-b border-outline-variant">
      <Link href="/" className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight uppercase hover:opacity-85 transition-opacity">
        KİNETİK PERFORMANCE
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-stack-lg">
        <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#hakkimda">
          Hakkımda
        </a>
        <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#paketler">
          Paketler
        </a>
        <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#referanslar">
          Referanslar
        </a>
        <Link
          href="/giris"
          className="px-6 py-2 bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-bright transition-all active:opacity-70"
        >
          Giriş Yap
        </Link>
      </nav>

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden text-on-surface hover:text-[#abd600] transition-colors p-1"
        aria-label="Menüyü aç/kapat"
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-surface border-b border-outline-variant flex flex-col p-6 gap-4 md:hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <a 
            onClick={() => setIsOpen(false)} 
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2 border-b border-outline-variant/35" 
            href="#hakkimda"
          >
            Hakkımda
          </a>
          <a 
            onClick={() => setIsOpen(false)} 
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2 border-b border-outline-variant/35" 
            href="#paketler"
          >
            Paketler
          </a>
          <a 
            onClick={() => setIsOpen(false)} 
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2 border-b border-outline-variant/35" 
            href="#referanslar"
          >
            Referanslar
          </a>
          <Link
            onClick={() => setIsOpen(false)}
            href="/giris"
            className="px-6 py-3 bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-lg text-center hover:opacity-90 active:scale-95 transition-all mt-2"
          >
            Giriş Yap
          </Link>
        </div>
      )}
    </header>
  )
}
