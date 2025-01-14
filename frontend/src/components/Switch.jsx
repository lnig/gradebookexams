/* Switch.jsx */
/* eslint-disable react/prop-types */
import React from 'react';

export default function Switch({ text, isOn, onToggle, disabled }) {
    const toggleSwitch = () => {
        if (!disabled && onToggle) {
            onToggle(!isOn);
        }
    };

    return (
        <div className='flex items-center gap-6'>
            <div>
                <div
                    className={`w-14 h-7 flex items-center rounded-full p-1 ${isOn && !disabled ? 'bg-primary-500 cursor-pointer' : isOn && disabled ? 'bg-primary-200' : 'bg-textBg-300 cursor-pointer'}`}
                    onClick={toggleSwitch}
                >
                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-6' : 'translate-x-0'}`}/>
                </div>
            </div>

            <div>
                <p className='text-lg text-textBg-900'>{text}</p>
            </div>
        </div>
    );
}
