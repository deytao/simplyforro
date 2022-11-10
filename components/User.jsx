import { useSession, signIn, signOut } from "next-auth/react";

export default function User() {
    const { data: session } = useSession();
    if (session) {
        return (
            <span className="text-violet-200 py-1 md:py-2 px-2 md:px-4 ">
                Signed in as <strong>{session.user.name}</strong> (
                <button
                    className="text-blue-400 hover:text-blue-500"
                    onKeyPress={() => signOut()}
                    onClick={() => signOut()}
                >
                    Sign out
                </button>
                )
            </span>
        );
    }
    return (
        <button className="btn btn-neutral" onClick={() => signIn()} onKeyPress={() => signIn()}>
            Sign in
        </button>
    );
}
