import React from 'react'

const HeroDescription = ({ children }) => {
    return (
        <p className='text-wrapped-balance text-center text-white text-base md:max-w-[70%]'>
            {children}
        </p>
    )
}

export default HeroDescription