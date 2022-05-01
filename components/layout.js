import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>SimplyForró</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
      <footer className="flex h-24 w-full items-center justify-center border-t">
      </footer>
    </>
  )
}
