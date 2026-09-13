export default function OrderSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-md flex flex-col justify-between animate-pulse">
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-3">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-8 bg-gray-200 rounded-lg"></div>
              <div className="h-8 bg-gray-200 rounded-lg"></div>
              <div className="h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
