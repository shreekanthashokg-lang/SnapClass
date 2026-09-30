import { AppLink, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ScanCorners } from "@/components/ui/ScanCorners";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="on-dark bg-brand py-20 text-white lg:py-28">
      <Container>
        <div className="relative px-6 py-10 sm:px-12 sm:py-14">
          <ScanCorners />
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h2 id="cta-title" className="type-title">
                Run your next class through SnapClass.
              </h2>
              <p className="type-lede mt-5 max-w-[34rem] text-white">
                Create a subject, share the QR code, and take attendance from a photo. You confirm every report before
                it is saved.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <AppLink variant="paper" size="lg" />
              <ButtonLink href="#tour" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-ink">
                Walk through the flow
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
