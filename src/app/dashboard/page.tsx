"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, LogOut, Trophy, Clock, BookOpen,
    Activity, Calendar, ChevronRight, Star, X, Save, Lock
} from 'lucide-react';

interface DashboardData {
    user: {
        id: string;
        name: string;
        email: string;
        points: number;
        createdAt: string;
    };
    stats: {
        masteredCount: number;
        totalViewed: number;
        totalDurationSeconds: number;
        totalPointsEarned: number;
    };
    recentActivity: {
        id: string;
        type: string;
        item: string;
        action: string;
        timestamp: string;
    }[];
    recentSessions: {
        id: string;
        duration: number;
        itemsLearned: number;
        pointsEarned: number;
        createdAt: string;
    }[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Edit Profile State
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [editError, setEditError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const userDataStr = localStorage.getItem('user');

            if (!isLoggedIn || !userDataStr) {
                router.push('/login');
                return;
            }

            try {
                const user = JSON.parse(userDataStr);
                if (!user.id) throw new Error('Invalid user data');

                const response = await fetch(`/api/dashboard/${user.id}`);

                if (response.ok) {
                    const dashboardData = await response.json();
                    setData(dashboardData);
                    setEditName(dashboardData.user.name || '');
                    setEditEmail(dashboardData.user.email || '');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch dashboard data');
                }
            } catch (error: any) {
                console.error('Error fetching dashboard:', error);
                setError(error.message || 'An error occurred while loading the dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setEditError('');

        try {
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: data?.user.id,
                    name: editName,
                    email: editEmail,
                    currentPassword: currentPassword || undefined,
                    newPassword: newPassword || undefined,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update profile');
            }

            // Update local state
            setData(prev => prev ? { ...prev, user: { ...prev.user, ...result.user } } : null);
            localStorage.setItem('user', JSON.stringify(result.user));
            setIsEditing(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            setEditError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center px-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
                    <p className="text-slate-300 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, <span className="text-indigo-400">{data.user.name || 'Learner'}</span>!
                    </h1>
                    <p className="text-slate-400">Here's an overview of your sign language journey.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-xl transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Star className="w-24 h-24 text-yellow-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Star className="w-6 h-6 text-yellow-400" />
                            </div>
                            <h3 className="text-slate-300 font-medium">Total Points</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">{data.user.points || 0}</p>
                        <p className="text-sm text-slate-400">
                            {data.stats.totalPointsEarned > 0
                                ? `${data.stats.totalPointsEarned} from sessions`
                                : 'Earned from learning'}
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-24 h-24 text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Trophy className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-slate-300 font-medium">Mastered Items</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">{data.stats.masteredCount}</p>
                        <p className="text-sm text-slate-400">Signs fully learned</p>
                    </div>
                </div>

                <div className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-24 h-24 text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-slate-300 font-medium">Learning Time</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">{formatDuration(data.stats.totalDurationSeconds)}</p>
                        <p className="text-sm text-slate-400">Total time spent practicing</p>
                    </div>
                </div>

                <div className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen className="w-24 h-24 text-purple-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <BookOpen className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-slate-300 font-medium">Total Viewed</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">{data.stats.totalViewed}</p>
                        <p className="text-sm text-slate-400">Signs explored</p>
                    </div>
                </div>
            </div>

            {/* Points Info */}
            <div className="glass-panel p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    How Points Work
                </h2>
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-bold text-lg">+5 points</span>
                        </div>
                        <p className="text-sm text-slate-300">Every time you click on an alphabet or word</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        Recent Activity
                    </h2>
                    <div className="glass-panel p-6">
                        {data.recentActivity && data.recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {data.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${activity.type === 'alphabet' ? 'bg-indigo-500/20' : 'bg-purple-500/20'}`}>
                                                {activity.type === 'alphabet' ? (
                                                    <span className="text-lg font-bold text-indigo-400 w-5 h-5 flex items-center justify-center">{activity.item}</span>
                                                ) : (
                                                    <BookOpen className="w-5 h-5 text-purple-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">
                                                    {activity.action} {activity.type === 'alphabet' ? `Letter "${activity.item}"` : `Word "${activity.item}"`}
                                                </p>
                                                <p className="text-sm text-slate-400">{formatDate(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span>+5 pts</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p>No recent activity found. Start learning today!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile & Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-400" />
                        Your Profile
                    </h2>
                    <div className="glass-panel p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg shadow-indigo-500/20">
                                {data.user.name && data.user.name.length > 0
                                    ? data.user.name[0].toUpperCase()
                                    : data.user.email[0].toUpperCase()}
                            </div>
                            <h3 className="text-lg font-bold text-white">{data.user.name || data.user.email.split('@')[0] || 'User'}</h3>
                            <p className="text-sm text-slate-400">{data.user.email}</p>
                            <div className="mt-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300">
                                Member since {new Date(data.user.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/learn')}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 group"
                            >
                                <Star className="w-4 h-4" />
                                Continue Learning
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all border border-slate-700"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="Close edit profile"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            {editError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {editError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="edit-name" className="text-sm font-medium text-slate-300">Full Name</label>
                                <input
                                    id="edit-name"
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="edit-email" className="text-sm font-medium text-slate-300">Email Address</label>
                                <input
                                    id="edit-email"
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            <div className="border-t border-slate-800 my-4 pt-4">
                                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Change Password (Optional)
                                </h4>
                                <div className="space-y-3">
                                    <input
                                        type="password"
                                        placeholder="Current Password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600"
                                        aria-label="Current Password"
                                    />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600"
                                        aria-label="New Password"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
