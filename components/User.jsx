import { useSession, signIn, signOut } from "next-auth/react"

export default function User() {
	const { data: session } = useSession()
	if(session) {
		return <span className="text-violet-200">
			Signed in as <strong>{session.user.name}</strong> (<button className="text-blue-400 hover:text-blue-500" onClick={() => signOut()}>Sign out</button>)
		</span>
	}
    return <button className="btn btn-neutral" onClick={() => signIn()}>Sign in</button>
}
