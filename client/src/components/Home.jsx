import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate()

    useEffect(() => {
        navigate("/login")
    }, [navigate])
    return (
        <>
        </>
    )
}

export default Home