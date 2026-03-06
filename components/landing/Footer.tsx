'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-[#F3EFEA] border-t border-[#1A1A1A]/5 py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">

                    {/* Brand Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 opacity-40">
                            <BookOpen size={18} />
                            <span className="font-serif font-bold tracking-tight">InkKeeper</span>
                        </div>
                        <p className="text-sm text-[#1A1A1A]/40 max-w-xs leading-relaxed">
                            A professional tool for intentional readers. Built with soul in Jakarta, Indonesia.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-wrap gap-x-12 gap-y-4">
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/30">Legal</p>
                            <Link href="/privacy" className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A]">Privacy Policy</Link>
                            <Link href="/terms" className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A]">Terms of Service</Link>
                            <Link href="/eula" className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A]">EULA</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/30">Connect</p>
                            <a href="https://linkedin.com/in/jasonkhanani" target="_blank" className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A]">LinkedIn</a>
                            <a href="https://jasonkhanani.com" target="_blank" className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A]">Personal Site</a>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-[#1A1A1A]/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/30">
                    <p>© {currentYear} InkKeeper Archive</p>
                    <p>Read. Reflect. Remember.</p>
                </div>
            </div>
        </footer>
    )
}