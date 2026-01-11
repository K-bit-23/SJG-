import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
                    <h1 style={{ color: '#ef4444' }}>Something went wrong.</h1>
                    <p>Please check the console for details.</p>
                    <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', textAlign: 'left', overflow: 'auto' }}>
                        <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                        <pre style={{ fontSize: '0.8rem' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
