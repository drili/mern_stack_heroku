import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import HeroOne from '../components/ui/HeroOne';
import FeatureSection from '../components/ui/FeatureSection';
import HowItWorksSlider from '../components/ui/HowItWorksSlider';
import NewsletterPricing from '../components/ui/NewsletterPricing';
import FAQSection from '../components/ui/FAQSection';
import ContactForm from '../components/ui/ContactForm';
import FooterUI from '../components/ui/FooterUI';

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
            <FAQSection />
            <ContactForm />
            <FooterUI />
        </section>
    )
}

export default Home