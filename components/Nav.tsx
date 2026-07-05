"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "🏠 홈" },
  { href: "/plants/new", label: "🌱 식물 등록" },
  { href: "/recommend", label: "🔍 식물 추천" },
  { href: "/consult", label: "💬 AI 상담" },
  { href: "/recipes", label: "🍳 레시피" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="bg-leaf-600 text-white shadow">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
        <Link href="/" className="mr-2 text-lg font-bold">
          🌿 Lea
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-1 transition ${
                  active
                    ? "bg-white text-leaf-700 font-semibold"
                    : "hover:bg-leaf-700"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
