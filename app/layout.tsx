// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { ClientOnlySocketProvider } from "@/components/token-wrapper";

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientOnlySocketProvider>
          {children}
        </ClientOnlySocketProvider>
      </body>
    </html>
  )
}
