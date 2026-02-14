"use client";

import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, CheckCircle, XCircle, Calendar, Globe, Monitor } from 'lucide-react';

interface LoginLog {
    id: string;
    email: string;
    success: boolean;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export default function AdminPage() {
    const [logs, setLogs] = useState<LoginLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [total, setTotal] = useState(0);

    const fetchLogs = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/admin/logins');
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch logs');
            }
            
            setLogs(data.logs);
            setTotal(data.total);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getBrowserInfo = (userAgent: string | null) => {
        if (!userAgent) return 'Unknown';
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Other';
    };

    return (
        <div className="min-h-screen pt-16 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/20 rounded-xl">
                                <Shield className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                    Admin Dashboard
                                </h1>
                                <p className="text-slate-400">Login Activity Monitor</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchLogs}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl text-indigo-400 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                    <div className="glass-panel p-4">
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Total Login Attempts</p>
                                <p className="text-2xl font-bold text-white">{total}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Successful Logins</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {logs.filter(log => log.success).length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Failed Logins</p>
                                <p className="text-2xl font-bold text-red-400">
                                    {logs.filter(log => !log.success).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                {/* Login Logs Table */}
                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700/50">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">IP Address</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Browser</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center gap-3 text-slate-400">
                                                <RefreshCw className="h-5 w-5 animate-spin" />
                                                <span>Loading login logs...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No login logs found
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {log.success ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-400" />
                                                            <span className="text-sm text-green-400">Success</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4 text-red-400" />
                                                            <span className="text-sm text-red-400">Failed</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{log.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Globe className="h-4 w-4" />
                                                    <span className="text-sm">{log.ipAddress || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Monitor className="h-4 w-4" />
                                                    <span className="text-sm">{getBrowserInfo(log.userAgent)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="text-sm">{formatDate(log.createdAt)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

