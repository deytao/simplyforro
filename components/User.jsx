import { useSession, signIn, signOut } from "next-auth/react"

export default function User() {
	const { data: session } = useSession()
	if(session) {
		return <>
			Signed in as {session.user.name} <br/>
			<button className="btn btn-neutral" onClick={() => signOut()}>Sign out</button>
		</>
	}
	return <>
		<button className="btn btn-neutral" onClick={() => signIn()}>Sign in</button>
	</>
}
