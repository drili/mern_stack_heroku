import React, { useEffect, useState } from 'react';

const Logo = ({ lightLogo }) => {
    const [animate, setAnimate] = useState(true);

    useEffect(() => {
        setTimeout(() => setAnimate(false), 1000);
    }, []);

    return (
        <span className={`${lightLogo ? "text-white" : "text-zinc-900"} text-xl font-bold whitespace-nowrap`}>
            TaskAlloc
            <span
                className={`text-pink-700 ml-[2px] mr-[1px] underline ${animate ? "animate-bounce-once" : ""}`}
                style={{ display: 'inline-block' }}
            >
                8
            </span>
            or
        </span>
    );
};

export default Logo;
