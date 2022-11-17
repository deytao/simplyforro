import Link from "next/link";
import { CalendarIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export function Navbar() {
    return (
        <nav className="bg-menu flex items-center justify-between flex-wrap p-4 md:p-6 z-50 sticky top-0 right-0 left-0">
            <div className="flex items-center flex-shrink-0 text-white md:mr-6">
                <Link href="/">
                    <img
                        src="/simplyforro.gif"
                        alt="SimpyForró"
                        title="SimpyForró"
                        className="object-scale-down h-8 inline mr-2 -mt-1"
                    />
                    <span className="font-semibold text-xl tracking-tight">SimplyForró</span>
                </Link>
            </div>
            <div className="flex">
                <Link className="px-3 py-2 text-violet-200 hover:text-white" href="/calendar">
                    <CalendarIcon className="h-5 w-5" />
                </Link>
                <Link className="px-3 py-2 text-violet-200 hover:text-white" href="/my">
                    <UserCircleIcon className="h-5 w-5" />
                </Link>
            </div>
        </nav>
    );
}
