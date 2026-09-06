import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#fcf9f3] dark:bg-[#141311] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                Something went wrong
              </h2>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596] leading-relaxed">
                An unexpected error occurred while rendering this section. You can retry or return to the main portal.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#f6f3ed] dark:bg-[#151411] rounded-xl text-left border border-[#cdc6b3]/50 dark:border-[#423e35] overflow-x-auto text-[11px] font-mono text-red-600 dark:text-red-400 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#eedc82] text-[#1c1c18] text-xs font-bold shadow-xs hover:bg-[#e2ce6d] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] text-[#1c1c18] dark:text-[#fcfbf7] text-xs font-bold hover:bg-[#f6f3ed] dark:hover:bg-[#2e2c26] transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
