import { Link } from "react-router-dom";
import { AUTHOR } from "@/config/author";
import { REPO_URL } from "@/config/env";
import { NAV_LINKS } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

const linkClass = "text-ink-soft underline-offset-4 hover:text-ink hover:underline";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-12">
      <Container className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-ink-soft">
            Attendance from class photos and student voices, with a review step before anything is saved.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="type-heading text-base">Explore</h2>
          <ul className="mt-3 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#about" className={linkClass}>
                About
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="type-heading text-base">Project</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link to="/app" className={linkClass}>
                Open SnapClass
              </Link>
            </li>
            {REPO_URL && (
              <li>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Source code
                </a>
              </li>
            )}
            <li>
              <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {AUTHOR.name} on GitHub
              </a>
            </li>
            <li>
              <a href="/third-party-notices.txt" className={linkClass}>
                Open-source licenses
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="mt-10 flex flex-col gap-1 border-t border-line pt-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 SnapClass</p>
        <p>{AUTHOR.credit}</p>
      </Container>
    </footer>
  );
}
