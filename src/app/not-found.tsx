import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">404</p>
        <h1 className="mt-4 text-4xl font-bold text-white">That route is not part of the demo.</h1>
        <p className="mt-4 leading-7 text-slate-400">
          Keep the golden path small. Return to the starter and choose the next deliberate step.
        </p>
        <Link
          className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          href="/"
        >
          Back to the starter
        </Link>
      </div>
    </main>
  );
}
