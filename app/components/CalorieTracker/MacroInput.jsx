import React from 'react'

const MacroInput = ({ label, value, onChange }) => {
  return (
    <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <input
      type="number"
      inputMode="numeric"
      placeholder="0"
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
    />
  </div>
  )
}

export default MacroInput
