"use client"

import React, { useState } from 'react';
import { Trophy, Medal, Target, Crown, ChevronUp, Search, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useLeaderboard } from '@/hooks/queries';          // старый хук (CTF)
import { useGamificationLeaderboard } from '@/hooks/useGamification'; // новый хук (XP/Levels)
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { SkeletonLeaderboard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Типы для CTF-лидерборда (существующий)
interface LeaderboardEntry {
    rank: number;
    username: string;
    solves: number;
    points: number;
}

// Тип для нового геймификационного лидерборда
interface GamificationLeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatarUrl: string | null;
    level: number;
    xp: number;
}

// Компонент подиума для CTF (старый)
const CTPodiumSpot = ({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) => {
    const styles = {
        1: {
            height: 'md:h-64 h-48',
            glow: 'from-amber-400 to-yellow-500 shadow-yellow-500/30',
            bg: 'bg-yellow-500/10 border-yellow-500/30',
            text: 'text-amber-400',
            icon: <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
        },
        2: {
            height: 'md:h-52 h-40',
            glow: 'from-gray-300 to-gray-400 shadow-gray-400/20',
            bg: 'bg-gray-400/10 border-gray-400/30',
            text: 'text-gray-300',
            icon: <Medal className="w-7 h-7 text-gray-400 drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]" />
        },
        3: {
            height: 'md:h-44 h-32',
            glow: 'from-orange-700 to-orange-800 shadow-orange-700/20',
            bg: 'bg-orange-800/10 border-orange-800/30',
            text: 'text-orange-500',
            icon: <Medal className="w-6 h-6 text-orange-600 drop-shadow-[0_0_10px_rgba(194,65,12,0.5)]" />
        }
    };

    const currentStyle = styles[position];

    return (
        <div className={`flex flex-col items-center justify-end w-1/3 sm:w-1/4 px-1 group`}>
            <div className={`flex flex-col items-center animate-fade-in-up duration-500 translate-y-2 group-hover:-translate-y-2 transition-transform`}>
                <div className="mb-2 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        {currentStyle.icon}
                    </div>
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${currentStyle.bg} flex items-center justify-center bg-black/50 backdrop-blur-md overflow-hidden relative z-10`}>
                        <div className={`w-full h-full bg-gradient-to-br ${currentStyle.glow} opacity-20 absolute inset-0`}></div>
                        <span className={`text-xl sm:text-3xl font-bold ${currentStyle.text} z-10 uppercase`}>
                            {entry.username.charAt(0)}
                        </span>
                    </div>
                </div>
                <div className="text-center mb-3">
                    <Link href={`/user/${entry.username}`} className="font-bold text-white hover:text-orange-400 transition-colors line-clamp-1 break-all px-2">
                        {entry.username}
                    </Link>
                    <div className="text-xs sm:text-sm text-gray-400 font-medium">
                        {entry.points} pts
                    </div>
                </div>
            </div>

            <div className={`w-full ${currentStyle.height} bg-gradient-to-t ${currentStyle.glow} rounded-t-xl relative overflow-hidden backdrop-blur-md border hover:brightness-110 transition-all cursor-default`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-white/30"></div>
                <div className="absolute inset-x-0 inset-y-0 bg-white/5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:40px_40px] opacity-30"></div>
                <div className="flex flex-col items-center justify-center h-full pt-4">
                    <span className="text-4xl sm:text-6xl font-black text-white/20">{position}</span>
                </div>
            </div>
        </div>
    );
};

// Компонент подиума для геймификации (по XP/уровням)
const GamificationPodiumSpot = ({ entry, position }: { entry: GamificationLeaderboardEntry; position: 1 | 2 | 3 }) => {
    const styles = {
        1: {
            height: 'md:h-64 h-48',
            glow: 'from-amber-400 to-yellow-500 shadow-yellow-500/30',
            bg: 'bg-yellow-500/10 border-yellow-500/30',
            text: 'text-amber-400',
            icon: <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
        },
        2: {
            height: 'md:h-52 h-40',
            glow: 'from-gray-300 to-gray-400 shadow-gray-400/20',
            bg: 'bg-gray-400/10 border-gray-400/30',
            text: 'text-gray-300',
            icon: <Medal className="w-7 h-7 text-gray-400 drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]" />
        },
        3: {
            height: 'md:h-44 h-32',
            glow: 'from-orange-700 to-orange-800 shadow-orange-700/20',
            bg: 'bg-orange-800/10 border-orange-800/30',
            text: 'text-orange-500',
            icon: <Medal className="w-6 h-6 text-orange-600 drop-shadow-[0_0_10px_rgba(194,65,12,0.5)]" />
        }
    };

    const currentStyle = styles[position];

    return (
        <div className={`flex flex-col items-center justify-end w-1/3 sm:w-1/4 px-1 group`}>
            <div className={`flex flex-col items-center animate-fade-in-up duration-500 translate-y-2 group-hover:-translate-y-2 transition-transform`}>
                <div className="mb-2 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        {currentStyle.icon}
                    </div>
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${currentStyle.bg} flex items-center justify-center bg-black/50 backdrop-blur-md overflow-hidden relative z-10`}>
                        <div className={`w-full h-full bg-gradient-to-br ${currentStyle.glow} opacity-20 absolute inset-0`}></div>
                        <span className={`text-xl sm:text-3xl font-bold ${currentStyle.text} z-10 uppercase`}>
                            {entry.username.charAt(0)}
                        </span>
                    </div>
                </div>
                <div className="text-center mb-3">
                    <Link href={`/user/${entry.username}`} className="font-bold text-white hover:text-orange-400 transition-colors line-clamp-1 break-all px-2">
                        {entry.username}
                    </Link>
                    <div className="text-xs sm:text-sm text-gray-400 font-medium">
                        Level {entry.level} • {entry.xp.toLocaleString()} XP
                    </div>
                </div>
            </div>

            <div className={`w-full ${currentStyle.height} bg-gradient-to-t ${currentStyle.glow} rounded-t-xl relative overflow-hidden backdrop-blur-md border hover:brightness-110 transition-all cursor-default`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-white/30"></div>
                <div className="absolute inset-x-0 inset-y-0 bg-white/5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:40px_40px] opacity-30"></div>
                <div className="flex flex-col items-center justify-center h-full pt-4">
                    <span className="text-4xl sm:text-6xl font-black text-white/20">{position}</span>
                </div>
            </div>
        </div>
    );
};

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'ctf' | 'gamification'>('ctf');
    const [searchQuery, setSearchQuery] = useState('');
    const [gamificationFilter, setGamificationFilter] = useState<'overall' | 'ctf' | 'forum' | 'events'>('overall');
    const [gamificationPeriod, setGamificationPeriod] = useState<'all' | 'month' | 'week'>('all');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Старый хук (CTF)
    const { data: ctfData, isLoading: ctfLoading, isError: ctfError, refetch: refetchCtf } = useLeaderboard();
    const ctfLeaderboard: LeaderboardEntry[] = (() => {
        const raw = ctfData;
        return Array.isArray(raw) ? raw : raw?.data || [];
    })();

    // Новый хук (геймификация)
    const { data: gamificationData, isLoading: gamificationLoading, isError: gamificationError } = useGamificationLeaderboard(
        gamificationFilter, gamificationPeriod, page
    );
    const gamificationLeaderboard: GamificationLeaderboardEntry[] = gamificationData?.data || [];
    const gamificationPagination = gamificationData?.pagination;

    // Фильтрация по поиску для обоих режимов
    const filteredCtf = debouncedSearch
        ? ctfLeaderboard.filter(u => u.username.toLowerCase().includes(debouncedSearch.toLowerCase()))
        : ctfLeaderboard;

    const filteredGamification = debouncedSearch
        ? gamificationLeaderboard.filter(u => u.username.toLowerCase().includes(debouncedSearch.toLowerCase()))
        : gamificationLeaderboard;

    const ctfTopThree = filteredCtf.slice(0, 3);
    const ctfRest = filteredCtf.slice(3);

    const gamificationTopThree = filteredGamification.slice(0, 3);
    const gamificationRest = filteredGamification.slice(3);

    const currentUserRank = activeTab === 'ctf' && user
        ? filteredCtf.find(e => e.username === user.username)
        : activeTab === 'gamification' && user
            ? filteredGamification.find(e => e.username === user.username)
            : null;

    const isLoading = activeTab === 'ctf' ? ctfLoading : gamificationLoading;
    const isError = activeTab === 'ctf' ? ctfError : gamificationError;
    const refetch = activeTab === 'ctf' ? refetchCtf : () => {};

    if (isError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Failed to load leaderboard.</p>
                    <button onClick={() => refetch()} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            <Trophy className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-400 font-medium tracking-wide">Global Rankings</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 animate-pulse-slow drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">Fame</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            The elite hackers of TheCyberHub. Compete in challenges, conquer machines, and carve your name into history.
                        </p>
                    </div>

                    {/* Tabs for switching between CTF and Gamification */}
                    <div className="flex justify-center mb-8">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                            <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
                                <TabsTrigger value="ctf" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                    <Target className="w-4 h-4 mr-2" />
                                    CTF Rating
                                </TabsTrigger>
                                <TabsTrigger value="gamification" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                    <Award className="w-4 h-4 mr-2" />
                                    Gamification XP
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Фильтры для геймификации (только при активном табе) */}
                    {activeTab === 'gamification' && (
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            <Select value={gamificationFilter} onValueChange={(v: any) => { setGamificationFilter(v); setPage(1); }}>
                                <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="overall">Overall XP</SelectItem>
                                    <SelectItem value="ctf">CTF only</SelectItem>
                                    <SelectItem value="forum">Forum activity</SelectItem>
                                    <SelectItem value="events">Events</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={gamificationPeriod} onValueChange={(v: any) => { setGamificationPeriod(v); setPage(1); }}>
                                <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All time</SelectItem>
                                    <SelectItem value="month">This month</SelectItem>
                                    <SelectItem value="week">This week</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Your Rank + Search */}
                    {!isLoading && (activeTab === 'ctf' ? filteredCtf.length > 0 : filteredGamification.length > 0) && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                            {currentUserRank && (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                    {activeTab === 'ctf' ? (
                                        <Trophy className="w-5 h-5 text-orange-400" />
                                    ) : (
                                        <TrendingUp className="w-5 h-5 text-orange-400" />
                                    )}
                                    <span className="text-white font-medium">Your rank: #{currentUserRank.rank}</span>
                                    <span className="text-gray-400 text-sm">
                                        {activeTab === 'ctf' 
                                            ? `${(currentUserRank as LeaderboardEntry).points} pts`
                                            : `Level ${(currentUserRank as GamificationLeaderboardEntry).level} • ${(currentUserRank as GamificationLeaderboardEntry).xp} XP`}
                                    </span>
                                </div>
                            )}
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search players..."
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <SkeletonLeaderboard />
                    ) : activeTab === 'ctf' ? (
                        // CTF режим (существующий)
                        filteredCtf.length > 0 ? (
                            <>
                                <div className="flex justify-center items-end gap-2 sm:gap-4 mb-8 pt-8 px-2 sm:px-8 border-b border-white/10 pb-0">
                                    {ctfTopThree[1] && <CTPodiumSpot entry={ctfTopThree[1]} position={2} />}
                                    {ctfTopThree[0] && <CTPodiumSpot entry={ctfTopThree[0]} position={1} />}
                                    {ctfTopThree[2] && <CTPodiumSpot entry={ctfTopThree[2]} position={3} />}
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                                    <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-6">
                                            <span className="w-8 text-center">Rank</span>
                                            <span>Hacker</span>
                                        </div>
                                        <div className="flex gap-8 sm:gap-16">
                                            <span className="w-16 text-center hidden sm:block">Solves</span>
                                            <span className="w-20 text-right">Points</span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                                        {ctfRest.map((entry) => (
                                            <div key={entry.rank} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.04] transition-colors group">
                                                <div className="flex items-center gap-6">
                                                    <span className="w-8 text-center font-bold text-gray-500 group-hover:text-gray-300 transition-colors">
                                                        {entry.rank}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                                                            {entry.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <Link href={`/user/${entry.username}`} className="font-semibold text-gray-300 group-hover:text-orange-400 transition-colors">
                                                            {entry.username}
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="flex gap-8 sm:gap-16 items-center">
                                                    <div className="w-16 text-center text-gray-500 hidden sm:flex items-center justify-center gap-1.5">
                                                        <Target className="w-3.5 h-3.5" />
                                                        {entry.solves}
                                                    </div>
                                                    <div className="w-20 text-right font-bold text-orange-500/80 group-hover:text-orange-400 transition-colors flex items-center justify-end gap-1.5">
                                                        <ChevronUp className="w-4 h-4" />
                                                        {entry.points}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {ctfRest.length === 0 && (
                                            <div className="text-center py-10 text-gray-500">No more entries to display.</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={Trophy}
                                title="No leaderboard data available"
                                description="Complete challenges to appear on the leaderboard."
                                actionLabel="View Challenges"
                                actionHref="/challenges"
                            />
                        )
                    ) : (
                        // Геймификационный режим (новый)
                        filteredGamification.length > 0 ? (
                            <>
                                <div className="flex justify-center items-end gap-2 sm:gap-4 mb-8 pt-8 px-2 sm:px-8 border-b border-white/10 pb-0">
                                    {gamificationTopThree[1] && <GamificationPodiumSpot entry={gamificationTopThree[1]} position={2} />}
                                    {gamificationTopThree[0] && <GamificationPodiumSpot entry={gamificationTopThree[0]} position={1} />}
                                    {gamificationTopThree[2] && <GamificationPodiumSpot entry={gamificationTopThree[2]} position={3} />}
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                                    <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-6">
                                            <span className="w-8 text-center">Rank</span>
                                            <span>Hacker</span>
                                        </div>
                                        <div className="flex gap-8 sm:gap-16">
                                            <span className="w-24 text-center">Level</span>
                                            <span className="w-28 text-right">XP</span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                                        {gamificationRest.map((entry) => (
                                            <div key={entry.rank} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.04] transition-colors group">
                                                <div className="flex items-center gap-6">
                                                    <span className="w-8 text-center font-bold text-gray-500 group-hover:text-gray-300 transition-colors">
                                                        {entry.rank}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                                                            {entry.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <Link href={`/user/${entry.username}`} className="font-semibold text-gray-300 group-hover:text-orange-400 transition-colors">
                                                            {entry.username}
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="flex gap-8 sm:gap-16 items-center">
                                                    <div className="w-24 text-center font-mono text-amber-400">
                                                        {entry.level}
                                                    </div>
                                                    <div className="w-28 text-right font-bold text-orange-500/80 group-hover:text-orange-400 transition-colors">
                                                        {entry.xp.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {gamificationRest.length === 0 && (
                                            <div className="text-center py-10 text-gray-500">No more entries to display.</div>
                                        )}
                                    </div>
                                </div>
                                {/* Пагинация для геймификации */}
                                {gamificationPagination && gamificationPagination.totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-6">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50 hover:bg-white/20 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-4 py-2 text-gray-400">
                                            Page {page} of {gamificationPagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(gamificationPagination.totalPages, p + 1))}
                                            disabled={page === gamificationPagination.totalPages}
                                            className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50 hover:bg-white/20 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState
                                icon={Award}
                                title="No gamification data yet"
                                description="Earn XP by solving challenges, posting on forums, and participating in events."
                                actionLabel="Go to Challenges"
                                actionHref="/challenges"
                            />
                        )
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
