'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, BookOpen } from 'lucide-react'

interface HeaderProps {
    onNavigate: (sectionId: string) => void
}

export function Header({ onNavigate }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { label: 'Philosophy', id: 'problem' },
        { label: 'Ritual', id: 'solution' },
        { label: 'Features', id: 'features' },
        { label: 'Pricing', id: 'pricing' },
    ]

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-rice-paper/80 backdrop-blur-md border-b border-sumi-ink/5 py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                        <img
                            src="/logo.png"
                            alt="InkKeeper Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <span className="text-xl font-serif font-bold tracking-tight text-sumi-ink">InkKeeper</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className="text-sm font-medium text-sumi-ink/60 hover:text-sumi-ink transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                    <Link
                        href="/login"
                        className="bg-seal-rust text-rice-paper px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-sm"
                    >
                        Start a session
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-sumi-ink"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-rice-paper border-b border-sumi-ink/5 p-6 flex flex-col gap-6 md:hidden shadow-xl animate-in slide-in-from-top duration-300">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onNavigate(item.id)
                                setIsMobileMenuOpen(false)
                            }}
                            className="text-left text-lg font-serif font-bold text-sumi-ink"
                        >
                            {item.label}
                        </button>
                    ))}
                    <Link
                        href="/login"
                        className="bg-seal-rust text-rice-paper text-center py-4 rounded-full font-bold"
                    >
                        Start a session
                    </Link>
                </div>
            )}
        </header>
    )
}