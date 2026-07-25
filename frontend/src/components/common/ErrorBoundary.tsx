import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6 text-white">
          <div className="max-w-md w-full p-8 bg-surface-900 border border-surface-800 rounded-xl shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-sm text-surface-400 leading-relaxed">
                An unexpected application error occurred. We can clear local session storage and restart the app for you.
              </p>
              {this.state.error && (
                <p className="text-xs font-mono bg-surface-950 p-3 rounded-lg border border-surface-800 text-red-300 mt-4 text-left overflow-x-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 bg-surface-800 hover:bg-surface-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-md"
              >
                Clear & Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
