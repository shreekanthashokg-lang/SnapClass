import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { About } from "@/sections/About";
import { Capabilities } from "@/sections/Capabilities";
import { Faq } from "@/sections/Faq";
import { FinalCta } from "@/sections/FinalCta";
import { Hero } from "@/sections/Hero";
import { Records } from "@/sections/Records";
import { Roles } from "@/sections/Roles";
import { Tour } from "@/sections/Tour";
import { UnderTheHood } from "@/sections/UnderTheHood";

export function MarketingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2.5 focus:font-semibold focus:text-paper"
      >
        Skip to content
      </a>
      <div id="top" />
      <Header />
      <main id="main">
        <Hero />
        <Capabilities />
        <Roles />
        <ErrorBoundary label="product tour">
          <Tour />
        </ErrorBoundary>
        <Records />
        <UnderTheHood />
        <Faq />
        <About />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
