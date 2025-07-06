const SkeletonClienteCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
      <div className="border-t-4 border-gray-300"></div>
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-2">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="ml-3 h-6 w-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        {/* Info boxes */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          {/* ... puedes recortar un poco aquí si quieres ... */}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm flex justify-between items-center">
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
  
  export default SkeletonClienteCard;
  