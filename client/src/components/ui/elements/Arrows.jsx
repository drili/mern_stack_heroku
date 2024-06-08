import React from 'react';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

export const PrevArrow = ({ className, style, onClick }) => (
    <div
        className={className}
        style={{ ...style, display: 'block', left: '10px', zIndex: 1 }}
        onClick={onClick}
    >
        <FaArrowLeft className="text-black text-2xl" />
    </div>
);

export const NextArrow = ({ className, style, onClick }) => (
    <div
        className={className}
        style={{ ...style, display: 'block', right: '10px', zIndex: 1 }}
        onClick={onClick}
    >
        <FaArrowRight className="text-black text-2xl" />
    </div>
);
