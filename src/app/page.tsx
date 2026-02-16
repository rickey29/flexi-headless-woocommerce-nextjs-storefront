export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-sm dark:bg-zinc-900">
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            FlexiWoo Rendering Engine
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Running
          </span>
        </div>

        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          API Endpoints
        </h2>
        <ul className="space-y-2">
          {[
            { method: 'GET', path: '/api/health', label: 'Health check' },
            { method: 'POST', path: '/api/v1/account', label: 'Account page rendering' },
            { method: 'POST', path: '/api/v1/product', label: 'Product page rendering' },
          ].map(({ method, path, label }) => (
            <li key={path} className="flex items-baseline gap-2 text-sm">
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {method}
              </code>
              <code className="font-mono text-zinc-900 dark:text-zinc-100">{path}</code>
              <span className="text-zinc-400 dark:text-zinc-500">&mdash; {label}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
