import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-300">
          Arqivo AI
        </Link>

        <div className="flex gap-4 text-sm text-slate-300">
          <Link href="/" className="hover:text-white">
            Demo
          </Link>
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/agents" className="hover:text-white">
            Agents
          </Link>
          <Link href="/review-queue" className="hover:text-white">
            Review Queue
          </Link>
          <Link href="/architecture" className="hover:text-white">
            Architecture
          </Link>
        </div>
      </div>
    </nav>
  );
}