import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-[40px] shadow-xl border border-red-100">
            <h2 className="text-2xl font-serif font-bold text-red-800 mb-4">Something went wrong</h2>
            <div className="bg-red-50 p-4 rounded-2xl mb-6">
              <p className="text-sm text-red-700 font-mono break-all">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
