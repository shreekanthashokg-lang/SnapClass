import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ink" | "outline" | "paper";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control border-2 font-semibold whitespace-nowrap " +
  "transition-[background-color,color,transform] duration-150 active:translate-y-px " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "border-brand bg-brand text-white hover:border-brand-deep hover:bg-brand-deep",
  ink: "border-ink bg-ink text-paper hover:bg-[#153a42]",
  outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
  paper: "border-paper bg-paper text-ink hover:bg-white",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function buttonClasses({ variant = "primary", size = "md", className }: Omit<CommonProps, "children">) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({ variant, size, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    /** Opens in a new tab and adds the arrow icon plus a screen-reader hint. */
    external?: boolean;
  };

export function ButtonLink({ variant, size, className, children, external, ...rest }: ButtonLinkProps) {
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a className={buttonClasses({ variant, size, className })} {...externalProps} {...rest}>
      {children}
      {external && (
        <>
          <ArrowUpRight aria-hidden className="size-[1.1em]" strokeWidth={2.5} />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}

type RouterButtonLinkProps = CommonProps & Omit<LinkProps, "className" | "children">;

/** Same look as ButtonLink, but for internal client-side routes (uses react-router's Link). */
export function RouterButtonLink({ variant, size, className, children, ...rest }: RouterButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}

type AppLinkProps = Omit<CommonProps, "children"> & { label?: string };

/** Primary call to action: opens the real, working SnapClass app built into this site. */
export function AppLink({ label = "Open SnapClass", ...style }: AppLinkProps) {
  return (
    <RouterButtonLink to="/app" {...style}>
      {label}
    </RouterButtonLink>
  );
}
