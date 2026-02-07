export default function AssistenteLoading() {
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
                </div>
                <div className="h-10 w-52 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>

            {/* Chat skeleton */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border overflow-hidden flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="h-20 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mx-auto mb-4" />
                        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto mb-2" />
                        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
                    </div>
                </div>
                <div className="border-t p-4">
                    <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}
