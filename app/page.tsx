import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 text-center">
      <div className="space-y-6 max-w-lg animated-fade-in-up">
        <h1 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Namaste
        </h1>
        <p className="text-xl text-muted-foreground">
          Welcome to your AI Pharmacy Auditor. <br />
          Ensure safety with every strip.
        </p>

        <div className="pt-8">
          <Link href="/verify">
            <Button size="lg" className="h-16 px-8 text-lg gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-indigo-600 hover:bg-indigo-700">
              <ShieldCheck className="w-6 h-6" />
              Verify Medicine
            </Button>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-4 text-sm text-gray-500">
        Powered by Gemini 3.0 & Google Sheets
      </footer>
    </main>
  );
}
