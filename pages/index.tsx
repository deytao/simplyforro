import type { NextPage } from 'next'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 max-w-4xl sm:w-full">

      <Link href="/school">
        <a
          className="col-span-2 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
        >
          <h3 className="text-2xl font-bold">The school &rarr;</h3>
          <p className="mt-4 text-xl">
              Understand what
          </p>
        </a>
      </Link>

      <a
        href="https://simplyforro.notion.site/42f9fe6ead9544338eb4d5ee5c85e13e"
        className="rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
      >
        <h3 className="text-2xl font-bold">Calendar &rarr;</h3>
        <p className="mt-4 text-xl">
          Keep yourself up to date with the Forró events in the world.
        </p>
      </a>

      <Link href="/calendar/form">
          <a
            className="rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Add events &rarr;</h3>
            <p className="mt-4 text-xl">
                Help us inform the community about the next dances.
            </p>
          </a>
      </Link>

    </div>
  )
}

export default Home
