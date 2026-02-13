import Link from 'next/link'

export default function Log() {
    return (
        <main>
            <h1>Log Session</h1>

            <Link href="/dashboard">
                <button>Save</button>
            </Link>
        </main>
    )
}
