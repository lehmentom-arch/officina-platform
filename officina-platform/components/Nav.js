"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  {
    href: "/jobs",
    label: "Jobs",
  },
  {
    href: "/pricing",
    label: "Preise",
  },
  {
    href: "/employer",
    label: "Arbeitgeber",
  },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
        >
          Officina
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition hover:text-emerald-300 ${
                pathname === link.href
                  ? "text-emerald-400"
                  : "text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="btn-secondary"
          >
            Login
          </Link>

          <Link
            href="/employer/jobs/new"
            className="btn-primary"
          >
            Job inserieren
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-white/10 p-2 md:hidden"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#0b1220] md:hidden">
          <div className="container flex flex-col gap-4 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`${
                  pathname === link.href
                    ? "text-emerald-400"
                    : "text-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn-secondary text-center"
            >
              Login
            </Link>

            <Link
              href="/employer/jobs/new"
              onClick={() => setOpen(false)}
              className="btn-primary text-center"
            >
              Job inserieren
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
