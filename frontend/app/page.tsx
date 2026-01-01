"use client";
import { useEffect, useState, useCallback } from 'react';
import { getStatus, startServer, stopServer } from './utils/api';

export default function Home() {
    const [status, setStatus] = useState<string>('loading');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const data = await getStatus();
            setStatus(data.status);
            setError(null);
        } catch (err) {
            setStatus('error'); // Assume backend is unreachable
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleStart = async () => {
        setLoading(true);
        try {
            await startServer();
            // Wait a bit for status to update
            setTimeout(fetchStatus, 1000);
        } catch (err) {
            setError('Failed to start server');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            await stopServer();
            setTimeout(fetchStatus, 1000);
        } catch (err) {
            setError('Failed to stop server');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = () => {
        switch (status) {
            case 'running': return 'status-running';
            case 'exited': return 'status-exited';
            case 'dead': return 'status-dead';
            case 'created': return 'status-created';
            case 'error': return 'status-exited';
            case 'not-found': return 'status-exited';
            default: return 'status-loading';
        }
    };

    const getStatusText = () => {
        if (status === 'error') return 'OFFLINE';
        if (status === 'not-found') return 'NOT CREATED';
        if (status === 'created') return 'STOPPED';
        return status;
    }

    return (
        <main className="container">
            <h1 className="title">PalWorld Manager</h1>

            <div className="card">
                <div className={`status-indicator ${getStatusClass()}`}>
                    {getStatusText()}
                </div>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

                <div className="controls">
                    <button
                        className="btn btn-start"
                        onClick={handleStart}
                        disabled={loading || status === 'running'}
                    >
                        {loading ? 'Processing...' : 'Start Server'}
                    </button>
                    <button
                        className="btn btn-stop"
                        onClick={handleStop}
                        disabled={loading || status === 'exited' || status === 'created' || status === 'error' || status === 'not-found'}
                    >
                        Stop Server
                    </button>
                </div>

                <div className="info-text">
                    Status updates every 5s.
                </div>

                {status === 'running' && (
                    <div className="server-address-box">
                        <div className="server-label">Server Address</div>
                        <div className="server-value">usb-harvard.gl.at.ply.gg:40012</div>
                    </div>
                )}
            </div>
        </main>
    );
}
