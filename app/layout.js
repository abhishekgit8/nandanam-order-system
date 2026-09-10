import './globals.css'

export const metadata = {
  title: 'Nandanam Restaurant - Order System',
  description: 'Nostalgic Taste of Kerala - Electronic City, Bengaluru',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
