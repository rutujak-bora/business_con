import './globals.css'

export const metadata = {
  title: 'House of Parise Reed | Business Strategy Consultant',
  description: 'Transforming businesses with strategic consulting, digital transformation, and growth strategies. Expert guidance for startups and enterprises.',
  keywords: 'business consultant, strategy, digital transformation, startup consulting, growth strategy',
  openGraph: {
    title: 'House of Parise Reed | Business Strategy Consultant',
    description: 'Transforming businesses with strategy, innovation & growth',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
