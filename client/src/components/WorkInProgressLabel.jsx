import React from 'react'

import BackgroundImage from "../assets/images/65c5ecddff8cba0a5346c654_hero-bg-image.png"

const WorkInProgressLabel = ({ smallVersion }) => {
    return (
        <span className='w-[110%] h-[110%] absolute top-[-5%] right-[-5%] bg-zinc-900 opacity-80 flex flex-col justify-center rounded'>
            <span 
                className='absolute inset-0 flex flex-col justify-center rounded'

                style={{
                    backgroundImage: `url(${BackgroundImage})`,
                    backgroundSize: '',
                    // backgroundPosition: 'center',
                    // height: '95%',
                    // clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 80%)'
                }}
                >
                <p className={`${smallVersion ? "text-base" : "text-2xl"} font-bold text-white uppercase text-center`}>Work in progress</p>
            </span>
        </span>
    )
}

export default WorkInProgressLabel