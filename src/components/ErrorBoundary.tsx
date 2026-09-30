import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Short name of the section, used in the fallback message. */
  label: string;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/** Keeps one broken widget from taking the whole page down. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.label}] failed to render`, error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-frame border border-absent/30 bg-absent-soft p-6 text-absent">
        <p className="font-semibold">The {this.props.label} could not load.</p>
        <p className="mt-1 text-sm">
          Reload the page to try again. If it keeps happening, the rest of the site still works.
        </p>
      </div>
    );
  }
}
