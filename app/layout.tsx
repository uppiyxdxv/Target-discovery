import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Upload files',
  description: 'A simple, accessible file upload workspace.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
