"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-lokus-text/70">{error.message}</p>
      <button className="mt-4 rounded-full bg-lokus-text px-5 py-2 text-white" onClick={reset}>Try again</button>
    </div>
  );
}
