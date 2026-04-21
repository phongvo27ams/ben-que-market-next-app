export default function LoadingProductPage() {
  return (
    <div className="px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 mt-6 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:mt-8 sm:text-sm">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <span>/</span>
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <span>/</span>
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200 sm:h-24 sm:w-24" />
              ))}
            </div>

            <div className="flex h-[20rem] w-full items-center justify-center rounded-2xl bg-slate-100 p-6 sm:h-[24rem] lg:w-[30rem] lg:max-w-[30rem]">
              <div className="h-40 w-40 animate-pulse rounded-3xl bg-slate-200 sm:h-52 sm:w-52" />
            </div>
          </div>

          <div className="flex-1">
            <div className="h-8 w-4/5 animate-pulse rounded bg-slate-200 sm:h-10 sm:w-3/5" />

            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
                ))}
              </div>
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="my-5 flex items-end gap-3">
              <div className="h-8 w-28 animate-pulse rounded bg-slate-200 sm:h-10 sm:w-36" />
              <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-14 w-full animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-8 h-12 w-full animate-pulse rounded-xl bg-slate-200 sm:w-44" />

            <div className="my-6 h-px bg-slate-200" />

            <div className="flex flex-col gap-4">
              <div className="h-4 w-52 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="my-14 text-sm text-slate-600 sm:my-18">
          <div className="mb-6 flex max-w-full gap-3 overflow-x-auto border-b border-slate-200 sm:max-w-2xl">
            <div className="h-11 w-24 animate-pulse rounded-t-lg bg-slate-200" />
            <div className="h-11 w-24 animate-pulse rounded-t-lg bg-slate-200" />
          </div>

          <div className="max-w-4xl space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-10/12 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-9/12 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mt-10 flex items-start gap-3 sm:mt-14">
            <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
