import React, { useState } from 'react';
import { AmiliaResponse } from '../types';

interface ManualInputProps {
  onDataLoad: (data: AmiliaResponse) => void;
}

const ManualInput: React.FC<ManualInputProps> = ({ onDataLoad }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualLoad = () => {
    try {
      const parsedData = JSON.parse(inputValue) as AmiliaResponse;
      
      if (!parsedData.Items || !Array.isArray(parsedData.Items)) {
        throw new Error('Invalid data format: Missing or invalid Items array');
      }

      onDataLoad(parsedData);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label 
          htmlFor="manual-input" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Manually paste Amilia API response
        </label>
        <textarea
          id="manual-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="textarea-input"
          placeholder='{"Items": [], "Paging": {"TotalCount": 0, "Next": ""}}'
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <button
        onClick={handleManualLoad}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                 shadow-sm text-sm font-medium text-white bg-primary 
                 hover:bg-primary-dark focus:outline-none focus:ring-2 
                 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
      >
        Manually Load Amilia API Response
      </button>
    </div>
  );
};

export default ManualInput;
