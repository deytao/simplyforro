import type { NextPage } from 'next'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">SimplyForro</h1>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <a
            href="https://simplyforro.notion.site/42f9fe6ead9544338eb4d5ee5c85e13e"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Calendar &rarr;</h3>
            <p className="mt-4 text-xl">
              Find in-depth information about Next.js features and its API.
            </p>
          </a>

          <Link href="/calendar/form">
              <a
                className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
              >
                <h3 className="text-2xl font-bold">Add events &rarr;</h3>
                <p className="mt-4 text-xl">
                  Learn about Next.js in an interactive course with quizzes!
                </p>
              </a>
          </Link>

        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
      </footer>
    </div>
  )
}

export default Home
