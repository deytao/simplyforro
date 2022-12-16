import { DarkThemeToggle, Dropdown } from "flowbite-react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { HiCalendar, HiOutlineUserCircle } from "react-icons/hi2";

export function Navbar() {
    const { data: session } = useSession();
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
                <DarkThemeToggle />
                <Link className="px-3 py-2 text-violet-200 hover:text-white" href="/calendar">
                    <HiCalendar className="h-5 w-5" />
                </Link>
                <div className="px-3 py-2">
                    <Dropdown
                        label={<HiOutlineUserCircle className="h-5 w-5 text-violet-200 hover:text-white" />}
                        inline={true}
                        arrowIcon={false}
                    >
                        {session && (
                            <>
                                <Dropdown.Header>
                                    <span className="block text-sm">Signed in as</span>
                                    <span className="block truncate text-sm font-medium">{session.user.name}</span>
                                </Dropdown.Header>
                                <Dropdown.Item>
                                    <Link href="/my">My Profile</Link>
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => signOut()} onKeyPress={() => signOut()}>
                                    Signout
                                </Dropdown.Item>
                            </>
                        )}
                        {!session && (
                            <>
                                <Dropdown.Item>
                                    <Link href="/auth/signin">Signin</Link>
                                </Dropdown.Item>
                            </>
                        )}
                    </Dropdown>
                </div>
            </div>
        </nav>
    );
}
