import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Error Boundary caught an error:', error, errorInfo);
    
    // You could send this to an error reporting service
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-bold text-red-800 mb-4">
              🚨 Game Error
            </h2>
            <p className="text-red-600 mb-4">
              Something went wrong with the game. Please try refreshing the page.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-red-700 font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-red-100 rounded text-sm overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}