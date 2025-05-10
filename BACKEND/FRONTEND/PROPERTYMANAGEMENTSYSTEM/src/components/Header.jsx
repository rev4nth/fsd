import React from 'react';

const Header = () => {
  return (
    <div className="bg-blue-800 text-white py-4 px-6 flex justify-center items-center">
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-2">Welcome to RevoStay</h2>
        <p className="text-sm mb-2">Explore Properties in Tenali, Vijayawada</p>
        <button className="bg-white text-blue-800 px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-100 transition">
          Explore
        </button>
      </div>
    </div>
  );
};

export default Header;