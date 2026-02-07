export default function AgendamentosLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
                </div>
                <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>

            {/* Calendar and sidebar skeleton */}
            <div className="grid gap-6 lg:grid-cols-[1fr,350px]">
                {/* Calendar */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        <div className="flex gap-2">
                            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 bg-slate-100 dark:bg-slate-900/50 rounded animate-pulse"
                            />
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                    <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 bg-slate-100 dark:bg-slate-900/50 rounded animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
