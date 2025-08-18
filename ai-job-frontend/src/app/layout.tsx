import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Job Application Assistant",
  description: "Otimiza currículo, carta e entrevista com IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 antialiased">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              AI Job Application Assistant
            </h1>
            <p className="text-slate-300">Otimize currículo, carta e simule entrevistas com IA</p>
          </header>
          {children}
          <footer className="mt-16 text-xs text-slate-400 text-center">
  Feito por Thales Fiscus —{" "}
  <a
    href="https://www.linkedin.com/in/thalesf01/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-300 hover:text-slate-100 underline"
  >
    LinkedIn
  </a>
</footer>

        </div>
      </body>
    </html>
  );
}