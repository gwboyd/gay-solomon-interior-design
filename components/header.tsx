"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { artistConfig } from "@/lib/config"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="py-6 border-b border-gray-200">
      <div className="container flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif font-light tracking-wider">
          {artistConfig.businessName}
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-primary hover:text-secondary transition-colors">
            Home
          </Link>
          <Link href="/portfolio" className="text-primary hover:text-secondary transition-colors">
            Portfolio
          </Link>
          <Link href="/contact" className="text-primary hover:text-secondary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 md:hidden">
            <div className="container py-6 flex justify-between items-center">
              <Link href="/" className="text-2xl font-serif font-light tracking-wider">
                {artistConfig.name}
              </Link>
              <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="container flex flex-col space-y-6 py-12">
              <Link
                href="/"
                className="text-2xl text-primary hover:text-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/portfolio"
                className="text-2xl text-primary hover:text-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                href="/contact"
                className="text-2xl text-primary hover:text-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
