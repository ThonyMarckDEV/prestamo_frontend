import React from 'react';
import loadingGif from '../../img/loading.gif';

const FetchWithGif = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
      <img
        src={loadingGif}
        alt="Loading..."
        className="w-32 h-32 object-contain"
      />
    </div>
  );
};

export default FetchWithGif;