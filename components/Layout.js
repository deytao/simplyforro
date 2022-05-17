import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <>
      <h1 className="text-6xl font-bold py-4 text-center">
        <Link href="/">
            <a>SimplyForro</a>
        </Link>
      </h1>
      <main className="flex min-h-screen flex-col items-center justify-center py-2">
        {children}
      </main>
    </>
  )
}
