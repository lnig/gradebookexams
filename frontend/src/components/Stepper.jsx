import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Check, MoreHorizontal } from 'lucide-react';

const steps = ['Basic Information', 'Questions', 'Access To Test', 'Settings', 'Summary'];

export default function Stepper({ currentStep }) {
    const [breakpoint, setBreakpoint] = useState('default');
    const containerRef = useRef(null);

    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth;
            if (width >= 1536) setBreakpoint('2xl');
            else if (width >= 1280) setBreakpoint('xl');
            else if (width >= 1024) setBreakpoint('lg');
            else if (width >= 768) setBreakpoint('md');
            else if (width >= 640) setBreakpoint('sm');
            else setBreakpoint('default');
        };

        updateBreakpoint();
        window.addEventListener('resize', updateBreakpoint);

        return () => {
            window.removeEventListener('resize', updateBreakpoint);
        };
    }, []);

    const getVisibleSteps = () => {
        switch (breakpoint) {
            case '2xl':
                return steps;
            case 'xl':
                if(currentStep == 0) return steps.slice(0, 4);
                if(currentStep == steps.length - 1) return steps.slice(1, 5);
                return steps.slice(Math.max(0, currentStep - 2), currentStep + 3);
            case 'lg':
                if(currentStep == 0) return steps.slice(0, 3);
                if(currentStep == steps.length - 1) return steps.slice(2, 5);
                return steps.slice(Math.max(0, currentStep - 1), currentStep + 2);
            case 'md':
                if(currentStep == 0) return steps.slice(0, 3);
                if(currentStep == steps.length - 1) return steps.slice(2, 5);
                return steps.slice(Math.max(0, currentStep - 1), currentStep + 2);
            case 'sm':
                if(currentStep == 0) return steps.slice(0, 2);
                if(currentStep == steps.length - 1) return steps.slice(3, 5);
                return steps.slice(Math.max(0, currentStep), currentStep + 2);
            default:
                return steps.slice(currentStep, currentStep + 1);
        }
    };

    const stepsToShow = getVisibleSteps();
    const showEllipsis = steps.length > stepsToShow.length;

    return (
        <div ref={containerRef} className="mb-6 flex items-center overflow-hidden">
            {stepsToShow.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center">
                        <div className={`flex justify-center items-center w-7 h-7 rounded-full 
                            ${steps.indexOf(step) < currentStep ? 'border border-solid border-primary-500 text-textBg-10' : 
                              steps.indexOf(step) === currentStep ? 'bg-primary-500 text-textBg-100' : 
                              'border border-solid border-textBg-400 text-textBg-100'}`}>
                            {steps.indexOf(step) < currentStep ? <Check size={16} className="text-primary-500"/> : 
                             steps.indexOf(step) === currentStep ? <p>{steps.indexOf(step) + 1}</p> : 
                             <p className="text-textBg-600">{steps.indexOf(step) + 1}</p>}
                        </div>
                        <p className="text-textBg-700 ml-2">{step}</p>
                    </div>
                    {index < stepsToShow.length - 1 && (
                        <div className="flex">
                            <ChevronRight size={20} className="text-textBg-700 mx-1 lg:mx-3 xl:mx-6" />
                        </div>
                    )}
                </React.Fragment>
            ))}
            {showEllipsis && stepsToShow[stepsToShow.length - 1] != steps[steps.length - 1] && (
                <div className="flex items-center">
                    <ChevronRight size={20} className="text-textBg-700 mx-1 lg:mx-3 xl:mx-6" />
                    <MoreHorizontal size={20} className="text-textBg-700 mx-1 lg:mx-3 xl:mx-6" />
                </div>
            )}
        </div>
    );
}
