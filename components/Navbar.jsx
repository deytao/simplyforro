import Link from 'next/link'
import { useState } from "react"
import { Bars3Icon } from '@heroicons/react/24/outline'

import User from "components/User"


export function Navbar() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)

  return (
    <nav className="bg-menu flex items-center justify-between flex-wrap p-4 md:p-6 z-50 sticky top-0 right-0 left-0">
      <div className="flex items-center flex-shrink-0 text-white md:mr-6">
        <Link href="/">
            <img src="/simplyforro.gif" alt="SimpyForró" title="SimpyForró" className="object-scale-down h-8 inline mr-2 -mt-1" />
            <span className="font-semibold text-xl tracking-tight">SimplyForró</span>
        </Link>
      </div>
      <div className="block lg:hidden">
        <button
            className="flex items-center px-3 py-2 border rounded text-violet-200 border-violet-400 hover:text-white hover:border-white"
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
        >
          <Bars3Icon className="h-4 w-4"/>
        </button>
      </div>
      <div className={`w-full block ${isNavbarOpen ? "flex" : "hidden"} flex-grow items-center lg:flex lg:w-auto`}>
        <div className="text-sm flex-row-reverse pt-4 lg:pt-0 pr-4">
          <Link href="/calendar" className="block lg:inline-block text-violet-200 hover:text-white">
              Calendar
          </Link>
        </div>
        <div className="hidden lg:block lg:flex-grow"></div>
        <div className="text-sm flex-row-reverse pt-4 lg:pt-0 pr-4">
          <User />
        </div>
      </div>
    </nav>
  )
}
