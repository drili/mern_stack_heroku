import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import HeroOne from '../components/ui/HeroOne';
import FeatureSection from '../components/ui/FeatureSection';

function Home() {

    // const navigate = useNavigate()
    // useEffect(() => {
    //     navigate("/login")
    // }, [navigate])

    return (
        <section id='pages-pre-Home'>
            <HeroOne />

            <FeatureSection />
            
            <span className='block mb-[2000px]'>
                <p>test</p>
            </span>
        </section>
    )
}

export default Home