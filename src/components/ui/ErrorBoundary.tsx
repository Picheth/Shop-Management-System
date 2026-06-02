import React, { ErrorInfo, ReactNode } from 'react';
import { supabase } from '../../utils/supabase';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    isReporting: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        isReporting: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can log the error to an error reporting service here
        console.error("Uncaught application error:", error, errorInfo);
    }

    private handleReportIssue = async () => {
        if (!this.state.error) return;
        this.setState({ isReporting: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('error_logs').insert([{
                message: this.state.error.message,
                stack: this.state.error.stack,
                component_name: 'GlobalErrorBoundary',
                url: window.location.href,
                severity: 'critical',
                user_id: user?.id || null
            }]);

            if (error) throw error;
            alert('Issue reported successfully. Thank you for your feedback!');
        } catch (err: any) {
            console.error('Failed to report issue:', err);
            alert('Could not send report: ' + err.message);
        } finally {
            this.setState({ isReporting: false });
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unexpected Crash</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                            The application encountered a critical runtime error. We've logged the incident and you can try to recover by reloading.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md active:scale-[0.98]"
                            >
                                Reload Dashboard
                            </button>
                            
                            <button
                                onClick={this.handleReportIssue}
                                disabled={this.state.isReporting}
                                className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-semibold py-2.5 px-4 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                            >
                                {this.state.isReporting ? 'Sending Report...' : 'Report Issue to Support'}
                            </button>
                        </div>

                        {this.state.error && (
                            <details className="mt-8 text-left group">
                                <summary className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-sky-500 transition-colors list-none flex items-center gap-1">
                                    <span className="group-open:rotate-90 transition-transform">▶</span> Technical Logs
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-mono text-red-600 dark:text-red-400 overflow-auto max-h-40">
                                    {this.state.error.stack || this.state.error.toString()}
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

export default ErrorBoundary;