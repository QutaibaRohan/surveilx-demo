export default function Loading() {
  return (
    <div className="space-y-6 mt-8">
      {/* <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg overflow-hidden shadow-sm border"
          >
            <div className="aspect-video bg-muted animate-pulse" />
            <div className="p-4">
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
