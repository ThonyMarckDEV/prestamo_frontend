import React from "react";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-[9999]">
      {/* Spinner */}
      <div className="animate-spin inline-block w-16 h-16 border-4 rounded-full border-t-transparent border-solid border-gray-800"></div>
    </div>
  );
}

export default LoadingScreen;