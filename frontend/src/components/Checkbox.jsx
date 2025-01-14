/* eslint-disable react/prop-types */
import { Check, X } from 'lucide-react';
import React from 'react';

const Checkbox = ({ checked, onChange, type = 'checkbox', disabled = false }) => {
    return (
        <label
            className={`inline-block relative select-none pl-2 pr-1 sm:pr-6`}>
            <input 
                type={type} 
                className="opacity-0 absolute h-0 w-0" 
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
                  <span 
                className={`h-10 w-10 border rounded flex items-center justify-center transition-colors duration-200 ${
                    checked ? 'border-green-700 bg-textBg-100' : 'border-red-500 bg-textBg-100'
                } ${disabled ? 'bg-gray-200 border-gray-400' : ''} hover:cursor-pointer`}
            >
                {checked ? (
                    <Check size={20} className={`text-green-700 ${disabled ? 'text-gray-500' : ''}`} />
                ) : (
                    <X size={20} className={`text-red-500 ${disabled ? 'text-gray-500' : ''}`} />
                )}
            </span>
        </label>
    );
};

export default Checkbox;
