export default function MenuSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center animate-pulse">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
        </div>
      ))}
    </div>
  );
}
