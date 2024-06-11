import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import HeroOne from '../components/ui/HeroOne';
import FeatureSection from '../components/ui/FeatureSection';
import HowItWorksSlider from '../components/ui/HowItWorksSlider';
import NewsletterPricing from '../components/ui/NewsletterPricing';

function Home() {

    // const navigate = useNavigate()
    // useEffect(() => {
    //     navigate("/login")
    // }, [navigate])

    return (
        <section id='pages-pre-Home'>
            <HeroOne />
            <FeatureSection />
            <HowItWorksSlider />
            <NewsletterPricing />

            <h1>FAQ</h1>
            <h1>CONTACT FORM</h1>
            <h1>FOOTER</h1>
            <span className='block mb-[2000px]'>
                <p>test</p>
            </span>
        </section>
    )
}

export default Home