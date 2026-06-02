import React, { ErrorInfo, ReactNode } from 'react';
import { supabase } from '../../utils/supabase';

interface Props {
    children: ReactNode;
    title?: string;
    skeleton?: ReactNode;
}

interface State {
    hasError: boolean;
    retryCount: number;
    error: Error | null;
    isReporting: boolean;
}

/**
 * A localized error boundary specifically for dashboard widgets.
 * Prevents a single widget failure from crashing the entire dashboard and
 * automatically attempts to reload up to 3 times.
 */
class WidgetErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        retryCount: 0,
        error: null,
        isReporting: false,
    };

    private retryTimer: any = null;
    private readonly MAX_RETRIES = 3;

    public static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log widget-specific error for debugging
        console.error(`Error in widget "${this.props.title || 'Unknown'}":`, error, errorInfo);

        // If we haven't reached the limit, trigger an automatic retry after a delay
        if (this.state.retryCount < this.MAX_RETRIES) {
            this.retryTimer = setTimeout(() => {
                this.setState(prevState => ({
                    hasError: false,
                    retryCount: prevState.retryCount + 1
                }));
            }, 2000); // 2-second delay between retries to avoid rapid cycling
        }
    }

    public componentWillUnmount() {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
        }
    }

    private handleReportIssue = async () => {
        if (!this.state.error) return;
        this.setState({ isReporting: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('error_logs').insert([{
                message: this.state.error.message,
                stack: this.state.error.stack,
                component_name: `Widget:${this.props.title || 'Unknown'}`,
                url: window.location.href,
                severity: 'warning',
                user_id: user?.id || null
            }]);

            if (error) throw error;
            alert('Widget error reported.');
        } catch (err: any) {
            console.error('Failed to report widget issue:', err);
            alert('Reporting failed.');
        } finally {
            this.setState({ isReporting: false });
        }
    };

    private handleRetry = () => {
        this.setState({ hasError: false, retryCount: 0, error: null });
    };

    public render() {
        if (this.state.hasError) {
            const isAutomaticRetry = this.state.retryCount < this.MAX_RETRIES;

            if (isAutomaticRetry) {
                return (
                    <div className="h-full min-h-[160px] flex flex-col items-center justify-center bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 relative overflow-hidden">
                        {this.props.skeleton || (
                            <div className="w-full animate-pulse space-y-4">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                </div>
                                <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
                            </div>
                        )}
                        <div className="absolute bottom-3 right-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></div>
                            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-tighter">
                                Auto-Retrying ({this.state.retryCount + 1}/{this.MAX_RETRIES})
                            </span>
                        </div>
                    </div>
                );
            }

            return (
                <div className="h-full min-h-[160px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/40 border-2 border-dashed border-red-200 dark:border-red-900/30 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Widget Failed</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 px-2">
                        The "{this.props.title || 'Component'}" encountered a persistent error and could not be displayed.
                    </p>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={this.handleRetry} 
                            className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors"
                        >
                            Retry Load
                        </button>
                        <button 
                            onClick={this.handleReportIssue}
                            disabled={this.state.isReporting}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                        >
                            {this.state.isReporting ? 'Reporting...' : 'Report Issue'}
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default WidgetErrorBoundary;