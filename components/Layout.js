import Link from 'next/link'

import { Navbar } from 'components/Navbar'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center py-2">
        {children}
      </main>
    </>
  )
}
