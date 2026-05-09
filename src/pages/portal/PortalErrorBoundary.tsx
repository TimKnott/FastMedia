import { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches any uncaught error inside the client portal subtree so the page
 * never renders as a blank white screen. Falls back to a branded error card
 * with a reload action and a support contact.
 */
export default class PortalErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // eslint-disable-next-line no-console
    console.error('[ClientPortal] uncaught render error:', error, info.componentStack);
  }

  handleReload = () => {
    // Hard reload to clear any corrupt in-memory state
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      const message = this.state.error.message || 'Something went wrong loading the portal.';
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-display font-semibold text-foreground">
                Portal unavailable
              </h1>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
              <Button onClick={this.handleReload} size="sm">
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Reload portal
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="mailto:support@fastmedia.pro?subject=Portal%20issue">
                  <Mail className="w-4 h-4 mr-1.5" />
                  Contact support
                </a>
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
