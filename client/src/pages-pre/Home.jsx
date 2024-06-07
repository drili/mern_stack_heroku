import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {

    // const navigate = useNavigate()
    // useEffect(() => {
    //     navigate("/login")
    // }, [navigate])

    return (
        <>
            <h1>Home Page 1</h1>
            <span className='block mb-[2000px]'>
                <p>test</p>
            </span>
        </>
    )
}

export default Home