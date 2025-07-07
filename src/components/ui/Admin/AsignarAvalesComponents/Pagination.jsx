import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
  onPageChange 
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const paginate = (pageNumber) => onPageChange(pageNumber);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 space-y-2 md:space-y-0">
      <div className="text-sm text-gray-700">
        MOSTRANDO <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
        <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> de{' '}
        <span className="font-medium">{totalItems}</span> RESULTADOS
      </div>
      
      <div className="flex flex-wrap gap-1">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ANTERIOR
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {number}
          </button>
        ))}
        
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          SIGUIENTE
        </button>
      </div>
    </div>
  );
};

export default Pagination;