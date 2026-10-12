import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk|ChunkLoadError/i;

const recover = () => {
  const w = window as unknown as { __fmRecover?: () => void };
  if (w.__fmRecover) w.__fmRecover();
  else window.location.reload();
};

/**
 * Last line of defence against a blank page. Out-of-date files after a
 * release trigger an automatic clean reload; any other crash shows a
 * friendly message with a reload button instead of an empty screen.
 */
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[App] render error:', error);
    if (CHUNK_ERROR.test(String(error?.message || error))) recover();
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Loading the latest version…
          </h1>
          <p className="text-muted-foreground">
            The site was just updated. If this page doesn't refresh by itself, press the button below.
          </p>
          <button
            type="button"
            onClick={recover}
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-primary-foreground font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
