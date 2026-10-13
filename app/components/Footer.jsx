
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white">

      {/* Main Footer */}
      <div className="px-6 py-16 md:px-12 lg:px-20">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-2xl font-semibold tracking-[0.18em] text-white"
            >
              TIME AURA
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-400">
              Timeless watches crafted for modern living. Discover elegance,
              precision, and style in every second.
            </p>

            {/* Social Links */}
            <div className="mt-7 flex gap-3">

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center
                border border-gray-700 text-xs font-medium text-white
                transition-all duration-300 hover:bg-white hover:text-black"
              >
                IG
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center
                border border-gray-700 text-xs font-medium text-white
                transition-all duration-300 hover:bg-white hover:text-black"
              >
                FB
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center
                border border-gray-700 text-xs font-medium text-white
                transition-all duration-300 hover:bg-white hover:text-black"
              >
                X
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">

              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/shop"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Shop
                </Link>
              </li>

              <li>
                <Link
                  href="/#about"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href="/#contact"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Contact
                </Link>
              </li>

            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Customer Care
            </h3>

            <ul className="mt-6 space-y-4">

              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Shipping & Delivery
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Returns & Exchanges
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Terms & Conditions
                </Link>
              </li>

            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Stay Updated
            </h3>

            <p className="mt-6 text-sm leading-7 text-gray-400">
              Subscribe to receive updates about new collections and
              exclusive offers.
            </p>

            <div className="mt-6 flex border-b border-gray-600 pb-3">

              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent text-sm text-white
                outline-none placeholder:text-gray-500"
              />

              <button
                className="ml-2 text-white transition
                hover:translate-x-1"
                aria-label="Subscribe"
              >
                <ArrowUpRight size={20} />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 px-6 py-6 md:px-12 lg:px-20">

        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">

          <p className="text-xs text-gray-500">
            © 2026 Time Aura. All rights reserved.
          </p>

          <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
            Crafted for every second
          </p>

        </div>

      </div>

    </footer>
  );
}

