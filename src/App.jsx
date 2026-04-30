import React from "react";
import "./App.css";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 inline-block rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
          GuidedWork AI — Beta
        </p>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight">
          AI-assisted work systems for people who carry real responsibility.
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-slate-300">
          GuidedWork AI helps professionals turn repeatable knowledge work into
          structured AI-assisted workflows. The system drafts, compares,
          organizes, and prepares the work — while you keep control of final
          judgment and action.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="#beta"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950"
          >
            Join the Beta
          </a>

          <a
            href="#packages"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white"
          >
            View Packages
          </a>
        </div>
      </section>

      <section id="packages" className="bg-white px-6 py-16 text-slate-950">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold">Beta Package</h2>

          <div className="mt-8 rounded-2xl border border-slate-200 p-8 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-500">
              FIRST PRODUCT
            </p>

            <h3 className="text-2xl font-bold">CareerCommand AI</h3>

            <p className="mt-4 max-w-3xl text-slate-700">
              A guided AI workspace for serious job seekers. Upload a resume,
              paste a target role, and generate stronger resume bullets,
              recruiter messages, interview prep, and a job tracker — with
              human approval before anything is sent or submitted.
            </p>

            <ul className="mt-6 grid gap-3 text-slate-700">
              <li>✓ Resume-to-job alignment</li>
              <li>✓ Proof-based bullet strengthening</li>
              <li>✓ Recruiter outreach drafts</li>
              <li>✓ STAR interview prep</li>
              <li>✓ Human approval gates</li>
            </ul>

            <p className="mt-8 text-3xl font-bold">$49/month beta</p>
          </div>
        </div>
      </section>

      <section id="beta" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold">Mission</h2>

          <p className="mt-4 max-w-3xl text-slate-300">
            We build AI work systems for professionals, operators, and business
            owners who need to move faster without lowering their standards. AI
            should help produce better work, while people keep control of
            judgment, approval, and final action.
          </p>

          <div className="mt-8 rounded-2xl bg-slate-900 p-6">
            <h3 className="text-xl font-bold">Beta intake</h3>
            <p className="mt-3 text-slate-300">
              Next step: connect this button to a Tally, Airtable, Google Form,
              or Stripe payment link.
            </p>

            <a
              href="mailto:you@example.com?subject=GuidedWork AI Beta"
              className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-slate-950"
            >
              Request Beta Access
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}