import React, { useState, useEffect } from 'react';

const Countdown = ({ initialMinutes = 0, initialSeconds = 0, onTimesUp }) => {
    const [minutes, setMinutes] = useState(initialMinutes);
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        const timer = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(timer);
                    if (onTimesUp) onTimesUp();
                } else {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [minutes, seconds, onTimesUp]);

    return (
        <div>
            <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
        </div>
    );
};

export default Countdown;