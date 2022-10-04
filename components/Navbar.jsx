import Link from 'next/link'
import { useState } from "react"
import { MenuIcon } from '@heroicons/react/outline'


export function Navbar() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)

  return (
    <nav className="bg-menu flex items-center justify-between flex-wrap p-4 md:p-6 z-50 sticky top-0 right-0 left-0">
      <div className="flex items-center flex-shrink-0 text-white md:mr-6">
        <Link href="/">
          <a>
            <img src="/simplyforro.gif" alt="SimpyForró" title="SimpyForró" className="object-scale-down h-8 inline mr-2 -mt-1" />
            <span className="font-semibold text-xl tracking-tight">SimplyForró</span>
          </a>
        </Link>
      </div>
      <div className="block lg:hidden">
        <button
            className="flex items-center px-3 py-2 border rounded text-violet-200 border-violet-400 hover:text-white hover:border-white"
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
        >
          <MenuIcon className="fill-current h-3 w-3"/>
        </button>
      </div>
      <div className={`w-full block ${isNavbarOpen ? "flex" : "hidden"} flex-grow items-center lg:flex lg:w-auto`}>
        <div className="text-sm lg:flex-grow flex-row-reverse">
          <Link href="/calendar">
            <a className="block mt-4 lg:inline-block lg:mt-0 text-violet-200 hover:text-white mr-4">
              Calendar
            </a>
          </Link>
        </div>
      </div>
    </nav>
  )
}
