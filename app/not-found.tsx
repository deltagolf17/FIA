import Link from "next/link";
import { Flame, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-authority flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Flame className="w-8 h-8 text-fire-400" />
        </div>
        <h1 className="text-6xl font-black text-white mb-3">404</h1>
        <p className="text-xl font-semibold text-white mb-2">Page not found</p>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">
          This case file doesn&apos;t exist or you don&apos;t have permission to access it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-fire-600 hover:bg-fire-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
