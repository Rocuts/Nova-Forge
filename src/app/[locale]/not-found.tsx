import Link from "next/link"

// Not-found boundaries don't receive route params, so this page is bilingual.
export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-32">
        <div className="flex items-center gap-4 mb-10">
          <span className="block w-12 h-[1px] bg-[#0a0a0a] opacity-30" />
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a] opacity-90">
            Error 404
          </p>
        </div>

        <h1 className="font-heading text-fluid-h1 font-bold tracking-tight leading-[1.05] text-[#0a0a0a] mb-8">
          Página no encontrada.
        </h1>

        <p className="text-fluid-p text-[#525252] max-w-2xl leading-relaxed mb-2">
          La ruta solicitada no existe o fue movida.
        </p>
        <p className="text-base text-[#a3a3a3] max-w-2xl leading-relaxed mb-14">
          The page you requested does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link
            href="/es"
            className="inline-flex items-center justify-center rounded-[2px] bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] transition-colors px-7 py-3 text-sm font-medium"
          >
            Volver al inicio
          </Link>
          <Link
            href="/en"
            className="inline-flex items-center gap-2 text-sm text-[#525252] hover:text-[#0a0a0a] transition-colors"
          >
            <span aria-hidden="true">&rarr;</span> Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}
