import Link from 'next/link'

export default function Active() {
    return (
        <main>
            <h1>Active Session</h1>

            <Link href="/session/log">
                <button>End Session</button>
            </Link>
        </main>
    )
}
