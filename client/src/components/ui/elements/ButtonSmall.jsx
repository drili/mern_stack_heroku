import React from 'react'

const ButtonSmall = ({ children }) => {
    return (
        <button className='bg-custom-rgba text-white text-sm flex align-center gap-2 items-center'>
            {children}
        </button>
    )
}

export default ButtonSmall