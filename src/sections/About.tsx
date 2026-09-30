import { ArrowUpRight } from "lucide-react";
import { AUTHOR } from "@/config/author";
import { Container } from "@/components/ui/Container";
import { ScanCorners } from "@/components/ui/ScanCorners";

const linkClass =
  "inline-flex items-center gap-1.5 font-semibold text-brand-deep underline decoration-2 underline-offset-4 hover:text-ink";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-line bg-sheet py-20 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 id="about-title" className="type-title">
            About this project
          </h2>
        </div>

        <div className="relative lg:col-span-8">
          <ScanCorners className="-inset-3" />
          <div className="rounded-sheet bg-paper p-8 sm:p-10">
            <p className="type-heading text-[1.5rem] sm:text-[1.75rem]">
              SnapClass is designed and built by {AUTHOR.name}.
            </p>
            <p className="mt-4 max-w-[38rem] text-ink-soft">
              {AUTHOR.name} is an MCA student specialising in AI/ML and Data Science. The interface, the front-end and
              back-end engineering, and the documentation are their work, made as a portfolio project.
            </p>
            <p className="mt-4 max-w-[38rem] text-ink-soft">
              Face recognition uses face-api.js, voice matching uses Meyda with FFmpeg, and the server is built on Express and SQLite,
              among other open-source libraries. Each remains the work of its own authors and is used under its own licence.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <li>
                <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  GitHub
                  <ArrowUpRight aria-hidden className="size-4" strokeWidth={2.5} />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
              {AUTHOR.linkedin && (
                <li>
                  <a href={AUTHOR.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    LinkedIn
                    <ArrowUpRight aria-hidden className="size-4" strokeWidth={2.5} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              )}
              <li>
                <a href="/third-party-notices.txt" className={linkClass}>
                  Open-source licenses
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
