import type { NextPage } from 'next'
import Link from 'next/link'

const School: NextPage = () => {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 max-w-4xl sm:w-full">

      <Link href="/school/course">
        <a
          className="rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
        >
          <h3 className="text-2xl font-bold">Course &rarr;</h3>
          <p className="mt-4 text-xl">
              Study
          </p>
        </a>
      </Link>

      <a
        className="rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
      >
        <h3 className="text-2xl font-bold">Pratica &rarr;</h3>
        <p className="mt-4 text-xl">
            Train
        </p>
      </a>

      <a
        className="col-span-2 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
      >
        <h3 className="text-2xl font-bold">Enroll &rarr;</h3>
        <p className="mt-4 text-xl">
            Join us and dance
        </p>
      </a>

    </div>
  )
}

export default School
