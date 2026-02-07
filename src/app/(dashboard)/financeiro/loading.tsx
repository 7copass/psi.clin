export default function FinanceiroLoading() {
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

            {/* Cards skeleton */}
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-800 rounded-xl border p-6"
                    >
                        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-4" />
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border p-6">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-1">
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border">
                    <div className="p-6 border-b">
                        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                    <div className="p-6 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
