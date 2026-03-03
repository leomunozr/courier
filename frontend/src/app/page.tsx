export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-4xl font-bold mb-4 text-[var(--color-primary)]">Sistema Courier</h1>
      <p className="text-xl text-[var(--color-text-muted)]">Esquema de Despacho Simplificado</p>
      <div className="mt-8 flex gap-4">
        <a href="/login" className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--color-text-muted)] transition shadow-md">Iniciar Sesión</a>
        <a href="/track" className="bg-white text-[var(--color-primary)] px-6 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-background)] transition shadow-sm">Tracking Público</a>
      </div>
    </main>
  );
}