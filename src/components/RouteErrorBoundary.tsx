import { Component, type ReactNode } from 'react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="content-page" role="alert">
          <p className="eyebrow">Something went wrong</p>
          <h1>We couldn’t load this page.</h1>
          <p className="page-description">
            Try reloading the page. Your personal checklist stays on this
            device.
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
