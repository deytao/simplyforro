import Head from 'next/head'
import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>SimplyForró</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center py-2">
        <Link href="/">
            <a>
              <h1 className="text-6xl font-bold">SimplyForro</h1>
            </a>
        </Link>
        {children}
      </main>
      <footer className="flex h-24 w-full items-center justify-center border-t">
      </footer>
    </>
  )
}
