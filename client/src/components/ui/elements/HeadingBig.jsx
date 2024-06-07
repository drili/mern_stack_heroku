import React from 'react'

const HeadingBig = ({ children }) => {
    return (
        <h1 className='text-wrapped-balance text-center text-balance font-bold text-white text-4xl leading-custom-12 md:text-7xl md:max-w-[70%] md:leading-custom-14 md:text-balance'>{children}</h1>
    )
}

export default HeadingBig