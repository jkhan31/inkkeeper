'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-rice-paper border-t border-sumi-ink/5 py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">

                    {/* Brand Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 opacity-40">
                            <BookOpen size={18} className="text-sumi-ink" />
                            <span className="font-serif font-bold tracking-tight text-sumi-ink">InkKeeper</span>
                        </div>
                        <p className="text-sm text-sumi-ink/40 max-w-xs leading-relaxed font-sans">
                            A professional tool for intentional readers. Built with soul in Jakarta, Indonesia.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-wrap gap-x-12 gap-y-4">
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-sumi-ink/30">Legal</p>
                            <Link href="/privacy" className="text-sm text-sumi-ink/60 hover:text-sumi-ink">Privacy Policy</Link>
                            <Link href="/terms" className="text-sm text-sumi-ink/60 hover:text-sumi-ink">Terms of Service</Link>
                            <Link href="/eula" className="text-sm text-sumi-ink/60 hover:text-sumi-ink">EULA</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-sumi-ink/30">Connect</p>
                            <a href="https://linkedin.com/in/jasonkhanani" target="_blank" className="text-sm text-sumi-ink/60 hover:text-sumi-ink">LinkedIn</a>
                            <a href="https://jasonkhanani.com" target="_blank" className="text-sm text-sumi-ink/60 hover:text-sumi-ink">Personal Site</a>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-sumi-ink/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-sumi-ink/30">
                    <p>© {currentYear} InkKeeper Archive</p>
                    <p>Read. Reflect. Remember.</p>
                </div>
            </div>
        </footer>
    )
}