import Link from "next/link"
import { artistConfig } from "@/lib/config"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-12 border-t border-gray-200">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <p className="text-sm text-secondary">
              {artistConfig.siteConfig.copyright}
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/portfolio" className="text-sm text-secondary hover:text-primary transition-colors">
              Portfolio
            </Link>
            <Link href="/contact" className="text-sm text-secondary hover:text-primary transition-colors">
              Contact
            </Link>
            <Link
              href="/admin"
              className="text-sm text-secondary hover:text-primary transition-colors"
              aria-hidden="true"
              tabIndex={-1}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
