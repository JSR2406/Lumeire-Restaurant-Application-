import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { ErrorReporter } from "@/components/error-reporter"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Lumière | Fine Dining Experience",
  description:
    "Celebrating the grand Art Deco tradition with exceptional cuisine. Reserve your table for an unforgettable dining experience.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Navigation />
        {children}
        <Footer />
        <Toaster />
        <Analytics />
        <ErrorReporter />
      </body>
    </html>
  )
}
