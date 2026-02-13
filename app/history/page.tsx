import Link from 'next/link'

export default function History() {
    return (
        <main>
            <h1>History</h1>

            <Link href="/dashboard">
                <button>Back</button>
            </Link>
        </main>
    )
}
