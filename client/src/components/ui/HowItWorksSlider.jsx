import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Parallax } from 'react-scroll-parallax';

import RegisterImage from "../../assets/Screenshot_1.png"
import ManageTasksImage from "../../assets/Screenshot_1.png"
import ViewReportsImage from "../../assets/Screenshot_1.png"
import HeadingTitle from './elements/HeadingTitle';
import SubTitle from './elements/SubTitle';
import SubTitleSmall from './elements/SubTitleSmall';
import { NextArrow, PrevArrow } from './elements/Arrows';

const SliderItem = ({ imageSrc, title, description }) => {
    return (
        <div className='pr-5 pl-5 lg:pr-20'>
            <div className='grid grid-cols-[2fr_3fr] bg-stone-100 rounded-extra-large'>
                <span className='bg-white rounded-extra-large'>
                    <img src={imageSrc} alt="Register Time" className='w-full h-full min-h-[350px] object-cover rounded-extra-large scale-95' />
                </span>
                <span className='px-10 pt-10 pb-10 text-left'>
                    <SubTitleSmall>{title}</SubTitleSmall>
                    <p className='mt-5 text-lg text-slate-800 font-medium'>{description}</p>
                </span>
            </div>
        </div>
    )
}

const HowItWorksSlider = () => {
    const settings = {
        dots: false,
        infinite: false,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        centerMode: true,
        centerPadding: '400px',
        easing: "ease-in-out",
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    infinite: false,
                    dots: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: '0%'
                }
            }
        ]
    };

    return (
        <section id='HowItWorksSlider' className='mx-auto py-10 overflow-hidden relative mb-40'>
            <div className='container'>
                <div className='max-w-[400px] mb-20'>
                    <Parallax
                        translateX={['10px', '100px']}
                        startScroll="self"
                        endScroll="self"
                        shouldAlwaysCompleteAnimation={true}
                        opacity={["1", "0.5"]}
                        shouldStartAtBoundary={true}
                    >
                        <HeadingTitle>How it works, a deep dive</HeadingTitle>
                    </Parallax>
                </div>
            </div>

            <Slider {...settings} className='w-full mx-auto'>
                <SliderItem
                    imageSrc={RegisterImage}
                    title="Register Time"
                    description="Effortlessly register your time with our intuitive interface. Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt harum eaque praesentium sunt blanditiis nam ad ipsa, inventore, provident asperiores voluptas saepe ipsam autem consequuntur beatae dolorum porro animi ea."
                />
                <SliderItem
                    imageSrc={RegisterImage}
                    title="Register Time"
                    description="Effortlessly register your time with our intuitive interface. Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt harum eaque praesentium sunt blanditiis nam ad ipsa, inventore, provident asperiores voluptas saepe ipsam autem consequuntur beatae dolorum porro animi ea."
                />
                <SliderItem
                    imageSrc={RegisterImage}
                    title="Register Time"
                    description="Effortlessly register your time with our intuitive interface. Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt harum eaque praesentium sunt blanditiis nam ad ipsa, inventore, provident asperiores voluptas saepe ipsam autem consequuntur beatae dolorum porro animi ea."
                />
                <SliderItem
                    imageSrc={RegisterImage}
                    title="Register Time"
                    description="Effortlessly register your time with our intuitive interface. Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt harum eaque praesentium sunt blanditiis nam ad ipsa, inventore, provident asperiores voluptas saepe ipsam autem consequuntur beatae dolorum porro animi ea."
                />
            </Slider>
        </section>
    );
};

export default HowItWorksSlider;
