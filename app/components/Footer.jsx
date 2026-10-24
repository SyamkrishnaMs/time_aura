import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0b0e] text-white border-t border-white/10">

      {/* Main Footer */}
      <div className="px-6 py-16 md:px-12 lg:px-20">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-serif text-2xl font-bold tracking-[0.18em] text-white transition hover:text-amber-400"
            >
              TIME AURA
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-gray-400 font-light">
              Timeless watches crafted for modern living. Discover elegance,
              precision, and style in every second.
            </p>

            {/* Social Links */}
            <div className="mt-7 flex gap-3">

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl
                border border-white/15 bg-white/5 text-xs font-bold text-white
                transition-all duration-300 hover:border-amber-400 hover:bg-amber-400 hover:text-black"
                aria-label="Instagram"
              >
                IG
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl
                border border-white/15 bg-white/5 text-xs font-bold text-white
                transition-all duration-300 hover:border-amber-400 hover:bg-amber-400 hover:text-black"
                aria-label="Facebook"
              >
                FB
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl
                border border-white/15 bg-white/5 text-xs font-bold text-white
                transition-all duration-300 hover:border-amber-400 hover:bg-amber-400 hover:text-black"
                aria-label="X (Twitter)"
              >
                X
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">

              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 transition hover:text-amber-400"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/shop"
                  className="text-sm text-gray-400 transition hover:text-amber-400"
                >
                  Shop
                </Link>
              </li>

              <li>
                <Link
                  href="/#about"
                  className="text-sm text-gray-400 transition hover:text-amber-400"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href="/#contact"
                  className="text-sm text-gray-400 transition hover:text-amber-400"
                >
                  Contact
                </Link>
              </li>

            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Customer Care
            </h3>

            <ul className="mt-6 space-y-4">

              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-amber-400"
                >
                  Shipping & Delivery
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-amber-400"
                >
                  Returns & Exchanges
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-amber-400"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-amber-400"
                >
                  Terms & Conditions
                </Link>
              </li>

            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Stay Updated
            </h3>

            <p className="mt-6 text-sm leading-relaxed text-gray-400 font-light">
              Subscribe to receive updates about new collections and
              exclusive offers.
            </p>

            <div className="mt-6 flex border-b border-white/20 pb-3 focus-within:border-amber-400 transition">

              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent text-sm text-white
                outline-none placeholder:text-gray-500"
              />

              <button
                className="ml-2 text-amber-400 transition
                hover:translate-x-1 hover:text-amber-300"
                aria-label="Subscribe"
              >
                <ArrowUpRight size={20} />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10 px-6 py-6 md:px-12 lg:px-20 bg-black/40">

        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">

          <p className="text-xs text-gray-500">
            © 2026 Time Aura. All rights reserved.
          </p>

          <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80 font-medium">
            Crafted for every second
          </p>

        </div>

      </div>

    </footer>
  );
}