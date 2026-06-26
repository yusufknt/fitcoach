import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'Kinetic Performance | Elite Coaching Dashboard',
  description: 'Online elite coaching platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${montserrat.variable} dark`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-white antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
