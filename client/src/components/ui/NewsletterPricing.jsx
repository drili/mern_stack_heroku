import React, { useState } from 'react';
import { FaCircleCheck } from "react-icons/fa6";

import BackgroundImage from "../../assets/images/65d077aa29bc0885104d4170_feature-bg-image.png";
import ButtonBig from './elements/ButtonBig';

const NewsletterPricing = () => {
    const [activeTab, setActiveTab] = useState("free");

    return (
        <section
            id='NewsletterPricing'
            className='bg-zinc-900 py-10 px-4 md:py-[12rem] h-full'
            style={{
                backgroundImage: `url(${BackgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
            }}>

            <div className='flex flex-col lg:flex-row gap-20 container mx-auto'>
                <section id='NewsletterPricing-newsletter' className='bg-stone-100 w-full p-[2rem] md:p-[4rem] rounded-extra-large'>
                    <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Stay up to date with new releases and updates</h3>
                    <span className='flex flex-col relative mb-5'>
                        <input type="text" placeholder='Enter your email address' className='h-[70px] border rounded focus:border-pink-700' />
                        <input type='submit' value='Subscribe!' className='bg-black text-white py-4 rounded absolute right-[5px] top-[5px] min-w-[150px] h-[60px]' />
                    </span>
                    <p className='text-slate-800 font-medium'>We only provide useful information!</p>
                </section>

                <section id='NewsletterPricing-pricing' className='bg-black w-full p-[2rem] md:p-[4rem] rounded-extra-large'>
                    <h3 className='mb-10 text-white text-4xl text-wrapped-balance font-bold'>Affordable <span className='text-pink-700'>pricing</span> pack</h3>
                    <hr />

                    <span className='flex mt-10 mb-10 gap-5 bg-zinc-900 py-2 px-2 rounded'>
                        <button
                            className={`rounded ${activeTab === 'free' ? 'bg-pink-700 text-white' : 'bg-transparent text-white'}`}
                            onClick={() => setActiveTab("free")}
                        >
                            Free
                        </button>
                        <button
                            className={`rounded ${activeTab === 'professional' ? 'bg-pink-700 text-white' : 'bg-transparent text-white'}`}
                            onClick={() => setActiveTab('professional')}
                        >
                            Professional
                        </button>
                    </span>

                    <span>
                        <h4 className='text-white text-xl font-bold mb-10'>A quick look at the core features</h4>
                    </span>

                    {activeTab === "free" && (
                        <>
                            <span id='featuresFree' className='flex flex-col gap-2 rounded-extra-large py-8 px-8 bg-zinc-900'>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Maximum 500 tasks pr. sprint</p>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Maximum 500 tasks pr. sprint</p>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Maximum 500 tasks pr. sprint</p>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Maximum 500 tasks pr. sprint</p>
                            </span>
                            <span className='mt-[4rem] flex justify-between'>
                                <p className='text-white text-4xl font-bold'>€0 <span className='text-base font-medium'>/ month</span></p>
                                <ButtonBig>Get Started</ButtonBig>
                            </span>
                        </>
                    )}

                    {activeTab === "professional" && (
                        <>
                            <span id='featuresPro' className='flex flex-col gap-2 rounded-extra-large py-8 px-8 bg-zinc-900'>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Unlimited tasks</p>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Unlimited tasks</p>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Unlimited tasks</p>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Unlimited tasks</p>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Unlimited tasks</p>
                                <p className='text-white text-lg flex align-center items-center gap-4'><FaCircleCheck className='text-pink-700' /> Unlimited tasks</p>
                            </span>
                            <span className='mt-[4rem] flex justify-between'>
                                <p className='text-white text-4xl font-bold'>€30 <span className='text-base font-medium'>/ month</span></p>
                                <ButtonBig>Get Started</ButtonBig>
                            </span>
                        </>
                    )}
                </section>
            </div>
        </section>
    );
}

export default NewsletterPricing;
