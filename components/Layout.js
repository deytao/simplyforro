import { Navbar } from 'components/Navbar'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center">
        {children}
      </main>
    </>
  )
}
