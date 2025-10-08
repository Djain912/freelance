import './globals.css'

export const metadata = {
  title: 'Freelance Project Tracker',
  description: 'A complete platform for managing freelance projects',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
