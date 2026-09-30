import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLink, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RegisterDemo } from "@/features/register-demo/RegisterDemo";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* A soft tinted panel behind the demo gives the register some depth. */}
      <div aria-hidden className="absolute top-16 right-0 bottom-0 hidden w-[46%] rounded-tl-[3rem] bg-brand-soft lg:block" />
      <Container className="relative grid items-center gap-12 pt-12 pb-20 lg:grid-cols-12 lg:gap-10 lg:pt-20 lg:pb-28">
        <div className="lg:col-span-6">
          <h1 id="hero-title" className="type-display">
            Take attendance from a single class photo.
          </h1>
          <p className="type-lede mt-6 max-w-[34rem] text-ink-soft">
            Or have each student say “I am present” to the device. SnapClass matches enrolled faces and voices, shows you the
            report, and saves nothing until you confirm.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <AppLink size="lg" />
            <ButtonLink href="#tour" variant="outline" size="lg">
              See how it works
            </ButtonLink>
          </div>
          <p className="mt-6 max-w-[30rem] text-[0.9375rem] text-ink-soft">
            Everyone signs in with a username and password. Students enroll their face and voice once.
          </p>
        </div>

        <div className="lg:col-span-6">
          <ErrorBoundary label="attendance demo">
            <RegisterDemo />
          </ErrorBoundary>
        </div>
      </Container>
    </section>
  );
}
