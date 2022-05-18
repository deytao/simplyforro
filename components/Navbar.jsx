import Link from 'next/link'
import { useState } from "react"

export { Navbar }

function Navbar() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)

  return (
    <nav className="flex items-center justify-between flex-wrap bg-menu p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/">
          <a>
            <img src="/simplyforro.gif" alt="SimpyForró" title="SimpyForró" className="object-scale-down h-8 inline mr-2" />
            <span className="font-semibold text-xl tracking-tight">SimplyForró</span>
          </a>
        </Link>
      </div>
      <div className="block lg:hidden">
        <button
            className="flex items-center px-3 py-2 border rounded text-violet-200 border-violet-400 hover:text-white hover:border-white"
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
        >
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
        </button>
      </div>
      <div className={`w-full block ${isNavbarOpen ? "flex" : "hidden"} flex-grow items-center lg:flex lg:w-auto`}>
        <div className="text-sm lg:flex-grow flex-row-reverse">
          <Link href="/school">
              <a className="block mt-4 lg:inline-block lg:mt-0 text-violet-200 hover:text-white mr-4">
                The school
              </a>
          </Link>
          <a className="block mt-4 lg:inline-block lg:mt-0 text-violet-200 hover:text-white mr-4">
            Blog
          </a>
          <a href="https://simplyforro.notion.site/42f9fe6ead9544338eb4d5ee5c85e13e" className="block mt-4 lg:inline-block lg:mt-0 text-violet-200 hover:text-white mr-4" target="_blank">
            Calendar
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  )
}
