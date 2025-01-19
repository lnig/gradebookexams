import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const NumberInput = ({className, value, disabled, onChange, maxValue, minValue}) => {

    const decreaseValue = () => {
        const newValue = minValue ? (value > minValue ? value - 1 : minValue) : (value > 1 ? value - 1 : 0);
        onChange(newValue);
    };

    const increaseValue = () => {
        const newValue = maxValue ? (value < maxValue ? value + 1 : maxValue) : (value < 999 ? value + 1 : 999);
        onChange(newValue);
    };

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        if (newValue === '') {
            onChange('');
        } else {
            const numericValue = Math.max(minValue, Math.min(maxValue, newValue));
            onChange(numericValue);
        }
    };

    const handleBlur = () => {
        if (value === '') {
            onChange(0);
        }
    };

    return (
        <div className={`flex items-center ${className} h-10 border bg-textBg-100 border-textBg-300 rounded p-1 space-x-2 `}>
            <button 
                className="flex items-center justify-center text-2xl bg-textBg-200 text-textBg-600 w-8 h-8 rounded"
                onClick={decreaseValue}
                disabled={value === minValue || disabled}
            >
                <Minus size={16}/>
            </button>
            <input 
                type="number" 
                value={value} 
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-[calc(100%-80px)] text-center text-lg focus:outline-none"
                max={maxValue}
                disabled = {disabled}
            />
            <button 
                className="flex items-center justify-center bg-primary-500 text-white rounded w-8 h-8"
                onClick={increaseValue}
                disabled={value === maxValue || disabled}
            >
                <Plus size={16}/>
            </button>
        </div>
    );
};

export default NumberInput;
