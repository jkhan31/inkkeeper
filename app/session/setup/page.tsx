import Link from 'next/link'

export default function Setup() {
    return (
        <main>
            <h1>Session Setup</h1>

            <Link href="/session/active">
                <button>Confirm Duration</button>
            </Link>

            <Link href="/dashboard">
                <button>Cancel</button>
            </Link>
        </main>
    )
}
