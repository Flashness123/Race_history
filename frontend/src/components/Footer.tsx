import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[rgba(248,242,234,0.76)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--paper-strong)]">
                DR
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.05em] text-[var(--ink)]">
                Downhill Radar
              </h3>
            </div>
            <p className="max-w-md leading-relaxed text-[var(--ink-soft)]">
              Track and discover downhill longboard races around the world. 
              Submit races, view results, and connect with the community of passionate riders.
            </p>
          </div>
          
          <div>
            <h3 className="eyebrow mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="flex items-center text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]">
                  <span className="mr-2 h-1 w-1 rounded-full bg-[var(--muted-soft)]"></span>
                  Map
                </Link>
              </li>
              <li>
                <Link href="/riders" className="flex items-center text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]">
                  <span className="mr-2 h-1 w-1 rounded-full bg-[var(--muted-soft)]"></span>
                  Riders
                </Link>
              </li>
              <li>
                <Link href="/submit" className="flex items-center text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]">
                  <span className="mr-2 h-1 w-1 rounded-full bg-[var(--muted-soft)]"></span>
                  Submit Race
                </Link>
              </li>
              <li>
                <Link href="/login" className="flex items-center text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]">
                  <span className="mr-2 h-1 w-1 rounded-full bg-[var(--muted-soft)]"></span>
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="eyebrow mb-4">Info</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="flex items-center text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]">
                  <span className="mr-2 h-1 w-1 rounded-full bg-[var(--muted-soft)]"></span>
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]">
                  <span className="mr-2 h-1 w-1 rounded-full bg-[var(--muted-soft)]"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-[var(--border)] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[var(--muted)]">
              &copy; 2024 Downhill Radar. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-[var(--muted)] transition-colors duration-200 hover:text-[var(--ink)]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-[var(--muted)] transition-colors duration-200 hover:text-[var(--ink)]">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
