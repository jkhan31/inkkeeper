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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#FAF5F0]/80 backdrop-blur-md border-b border-[#1A1A1A]/5 py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 bg-[#1A1A1A] rounded-full flex items-center justify-center transition-transform group-hover:rotate-12">
                        <BookOpen size={18} className="text-[#FAF5F0]" />
                    </div>
                    <span className="text-xl font-serif font-bold tracking-tight text-[#1A1A1A]">InkKeeper</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className="text-sm font-medium text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                    <Link
                        href="/login"
                        className="bg-[#6A7F70] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#5A6F60] transition-colors shadow-sm"
                    >
                        Start a session
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-[#1A1A1A]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-[#FAF5F0] border-b border-[#1A1A1A]/5 p-6 flex flex-col gap-6 md:hidden shadow-xl animate-in slide-in-from-top duration-300">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onNavigate(item.id)
                                setIsMobileMenuOpen(false)
                            }}
                            className="text-left text-lg font-serif font-bold text-[#1A1A1A]"
                        >
                            {item.label}
                        </button>
                    ))}
                    <Link
                        href="/login"
                        className="bg-[#1A1A1A] text-white text-center py-4 rounded-full font-bold"
                    >
                        Start a session
                    </Link>
                </div>
            )}
        </header>
    )
}