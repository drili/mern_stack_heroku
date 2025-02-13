import React, { useEffect } from 'react'
import aos from 'aos'
import 'aos/dist/aos.css';

const HeadingTitle = ({ children, animate }) => {

    useEffect(() => {
        aos.init({
            once: false
        })
    }, [])
    
    return (
        <h2 
            className='text-6xl text-black font-bold'
            data-aos-duration="1000"
            data-aos={animate ? "fade-up" : undefined}
        >
            {children}
        </h2>
    )
}

export default HeadingTitle