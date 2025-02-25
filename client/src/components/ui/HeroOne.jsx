import React from 'react'
import { FaArrowRightLong } from "react-icons/fa6";
import { Parallax } from 'react-scroll-parallax';

import BackgroundImage from "../../assets/images/65c5ecddff8cba0a5346c654_hero-bg-image.png"
import OverlappingImage from "../../assets/images/screenshot_dashboard1.png"

import HeadingBig from './elements/HeadingBig'
import ButtonSmall from './elements/ButtonSmall'
import HeroDescription from './elements/HeroDescription';
import ButtonBig from './elements/ButtonBig';

const HeroOne = () => {
    return (
        <div className='relative mb-20 md:mb-40'>
            <div className='relative'>
                <div
                    className='absolute inset-0 bg-zinc-900'
                    style={{
                        backgroundImage: `url(${BackgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '95%',
                        clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 80%)'
                    }}
                ></div>
                <section id='HeroOne' className='relative z-10 pt-10  md:pt-20 overflow-hidden'>
                    <div className='container'>
                        <div className="flex justify-center mb-5">
                            <ButtonSmall>Get started now by signing up <FaArrowRightLong /></ButtonSmall>
                        </div>
                        <div className='flex justify-center mb-10'>
                            <HeadingBig>
                                Navigate your <span className='text-pink-700'>work</span> with precision
                            </HeadingBig>
                        </div>
                        <div className='flex justify-center mb-10'>
                            <HeroDescription>
                                The task is your ultimate solution for mastering productivity. With its intuitive interface and powerful features, stay organized, focused, and on top of your tasks like never before.
                            </HeroDescription>
                        </div>
                        <div className='flex justify-center'>
                            <ButtonBig version="black">View App</ButtonBig>
                        </div>
                    </div>

                    <section className='container px-4 z-50'>
                        <Parallax
                            translateY={['50px', '-100px']}
                            scale={[1, 1.15]}
                            startScroll={0.5} // Start parallax when the element is 50% in view
                            endScroll={500} // End parallax after scrolling 100px from the element's starting point
                            shouldAlwaysCompleteAnimation={false} // Ensures the animation only starts in view
                            // opacity={[0, 1]}
                        >
                            <div className="relative bg-stone-100 p-2 mt-10 rounded-extra-large md:p-5">
                                <img src={OverlappingImage} alt="Overlapping" className="shadow-lg w-full rounded-extra-large" />
                            </div>
                        </Parallax>
                    </section>
                </section>
            </div>
        </div>
    )
}

export default HeroOne