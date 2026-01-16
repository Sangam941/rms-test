// ============================================
// TABLE SELECTION VIEW
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Home } from 'lucide-react';

const TableSelectionView = ({
  onTableSelect,
}: {
  onTableSelect?: (table: string) => void;
}) => {
  const tables = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];
  const cabins = ['C1', 'C2', 'C3', 'C4', 'C5'];
  const outside = ['O1', 'O2', 'O3'];
  const [tableNumber, setTableNumber] = useState('');
  const navigate = useNavigate();

  // For this pattern, assuming navigation for returning to menu (update as needed)
  const handleBack = () => {
    navigate('/menu');
  };
  const handleSelect = (value: string) => {
    setTableNumber(value);
    if (onTableSelect) {
      onTableSelect(value);
    }
    navigate('/menu');
  };
  const handleCustomConfirm = () => {
    if (tableNumber) {
      if (onTableSelect) {
        onTableSelect(tableNumber);
      }
      navigate('/menu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-12">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 lg:mb-8"
        >
          ← Back to Menu
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Select Your Table</h1>
          <p className="text-gray-600 mb-8 lg:mb-10">Choose a table to continue with your order</p>

          <div className="space-y-8 lg:space-y-10">
            <div>
              <h3 className="font-semibold text-lg lg:text-xl mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Tables
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                {tables.map(table => (
                  <button
                    key={table}
                    onClick={() => handleSelect(table)}
                    className="bg-slate-700 text-white py-6 lg:py-8 rounded-xl font-bold text-lg lg:text-xl hover:bg-slate-600 transition-all transform hover:scale-105"
                  >
                    {table}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg lg:text-xl mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Cabins
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                {cabins.map(cabin => (
                  <button
                    key={cabin}
                    onClick={() => handleSelect(cabin)}
                    className="bg-slate-700 text-white py-6 lg:py-8 rounded-xl font-bold text-lg lg:text-xl hover:bg-slate-600 transition-all transform hover:scale-105"
                  >
                    {cabin}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg lg:text-xl mb-4">Outside Seating</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
                {outside.map(spot => (
                  <button
                    key={spot}
                    onClick={() => handleSelect(spot)}
                    className="bg-slate-700 text-white py-6 lg:py-8 rounded-xl font-bold text-lg lg:text-xl hover:bg-slate-600 transition-all transform hover:scale-105"
                  >
                    {spot}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-green-500 rounded-xl p-6 lg:p-8 bg-green-50">
              <h3 className="text-green-700 font-semibold mb-4 text-base lg:text-lg">Custom Table Entry</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter table number (e.g., E1, Z9, Counter)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="flex-1 px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button
                  onClick={handleCustomConfirm}
                  disabled={!tableNumber}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSelectionView;