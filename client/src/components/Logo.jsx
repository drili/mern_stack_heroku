import React from 'react'

const Logo = ({ lightLogo }) => {
    return (
        <span className={`${lightLogo ? "text-white" : "text-zinc-900"} text-xl font-bold whitespace-nowrap`}>
            TaskAlloc<span className='text-pink-700 ml-[2px] mr-[1px] underline'>8</span>or
        </span>
    )
}

export default Logo