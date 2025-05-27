import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext';

const PageHeading = ({ heading, subHeading, suffix }) => {
    const { user } = useContext(UserContext)

    return (
        <div id='pageHeading' className='mb-10'>
            <h1 className='text-6xl text-black font-bold mb-5'>{ heading }</h1>
            <h5 className='text-wrapped-balance text-neutral-500 text-base'>{ subHeading }. { suffix }</h5>
        </div>
    )
}

export default PageHeading