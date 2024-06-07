import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import RegisterImage from "../../assets/Screenshot_1.png"
import ManageTasksImage from "../../assets/Screenshot_1.png"
import ViewReportsImage from "../../assets/Screenshot_1.png"
import HeadingTitle from './elements/HeadingTitle';

const HowItWorksSlider = () => {
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        centerMode: true,
        centerPadding: '400px',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false,
                    centerMode: false,  // Disable center mode on smaller screens
                    centerPadding: '0%'
                }
            }
        ]
    };

    return (
        <section id='HowItWorksSlider' className='mx-auto py-10 overflow-hidden relative'>
            <div className='container'>
                <div className='max-w-[400px] mb-20'>
                    <HeadingTitle>How it works, a deep dive</HeadingTitle>
                </div>
            </div>

            <Slider {...settings} className='w-full mx-auto'>
                <div className='px-10'>
                    <div className='grid grid-cols-2 bg-rose-500'>
                        <span>
                            <img src={RegisterImage} alt="Register Time" className='w-full h-[300px] object-cover rounded-md' />
                        </span>
                        <span>
                            <h3 className='text-xl font-semibold text-center mt-4'>Register Time</h3>
                            <p className='text-center mt-2'>Effortlessly register your time with our intuitive interface.</p>
                        </span>
                    </div>
                </div>
                <div className='px-10'>
                    <div className='grid grid-cols-2 bg-rose-500'>
                        <span>
                            <img src={ManageTasksImage} alt="Manage Tasks" className='w-full h-[300px] object-cover rounded-md' />
                        </span>
                        <span>
                            <h3 className='text-xl font-semibold text-center mt-4'>Manage Tasks</h3>
                            <p className='text-center mt-2'>Easily manage and prioritize your tasks.</p>
                        </span>
                    </div>
                </div>
                <div className='px-10'>
                    <div className='grid grid-cols-2 bg-rose-500'>
                        <span>
                            <img src={ViewReportsImage} alt="View Reports" className='w-full h-[300px] object-cover rounded-md' />
                        </span>
                        <span>
                            <h3 className='text-xl font-semibold text-center mt-4'>View Reports</h3>
                            <p className='text-center mt-2'>Generate and view detailed reports of your time and tasks.</p>
                        </span>
                    </div>
                </div>
            </Slider>
        </section>
    );
};

export default HowItWorksSlider;
