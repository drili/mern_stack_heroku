import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import HeadingTitle from './elements/HeadingTitle';

const ContactForm = () => {
    return (
        <section
            id='ContactForm'
            className='bg-white px-4 py-10 md:px-0 md:py-[12rem] h-full'
            style={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
            }}>

            <div className='container'>
                <section className='mb-20 text-center max-w-screen-lg mr-auto ml-auto'>
                    <HeadingTitle>Contact us now</HeadingTitle>
                    <p className='text-neutral-500 font-normal text-lg mt-10'>We believe in the power of connection. Your thoughts, queries, and ideas fuel our passion for innovation. Reach out to us and let's embark on a collaborative journey, transforming visions into tangible realities. Your message matters; drop us a line, and together, let's shape a better tomorrow.</p>
                </section>
            </div>

            <div className='flex flex-col lg:flex-row gap-20 container mx-auto'>
                <section id='ContactInfo' className='bg-stone-100 w-full p-[2rem] md:p-[4rem] rounded-extra-large'>
                    <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Contact Information</h3>
                    <span className='flex flex-col gap-2'>
                        <p className='text-slate-800 font-bold text-xl'>You can reach us at:</p>
                        <p className='text-slate-800 font-medium'>1234 Street Name</p>
                        <p className='text-slate-800 font-medium'>City, State, ZIP</p>
                        <p className='text-slate-800 font-medium'>Phone: (123) 456-7890</p>
                        <p className='text-slate-800 font-medium'>Email: contact@example.com</p>
                    </span>
                    <div className='flex gap-4 mt-10'>
                        <a href='https://facebook.com' target='_blank' rel='noopener noreferrer'><FaFacebook className='text-2xl text-blue-600' /></a>
                        <a href='https://twitter.com' target='_blank' rel='noopener noreferrer'><FaTwitter className='text-2xl text-blue-400' /></a>
                        <a href='https://linkedin.com' target='_blank' rel='noopener noreferrer'><FaLinkedin className='text-2xl text-blue-700' /></a>
                        <a href='https://instagram.com' target='_blank' rel='noopener noreferrer'><FaInstagram className='text-2xl text-pink-600' /></a>
                    </div>
                </section>

                <section id='ContactForm-section' className='w-full rounded-extra-large'>
                    {/* <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Get in Touch</h3> */}
                    <form className='flex flex-col gap-4'>
                        <span className='flex flex-col'>
                            <label htmlFor="" className='text-lg font-medium mb-2'>Name</label>
                            <input type="text" placeholder='Enter your name' className='h-[50px] border rounded focus:border-pink-700 p-3' required />
                        </span>
                        <span className='flex flex-col'>
                            <label htmlFor="" className='text-lg font-medium mb-2'>Email</label>
                            <input type="email" placeholder='Enter your email' className='h-[50px] border rounded focus:border-pink-700 p-3' required />
                        </span>
                        <span className='flex flex-col'>
                            <label htmlFor="" className='text-lg font-medium mb-2'>Phone</label>
                            <input type="tel" placeholder='Enter your phone (optional)' className='h-[50px] border rounded focus:border-pink-700 p-3' />
                        </span>
                        <span className='flex flex-col'>
                            <label htmlFor="" className='text-lg font-medium mb-2'>Message</label>
                            <textarea placeholder='Enter your message' className='h-[150px] border rounded focus:border-pink-700 p-3' required></textarea>
                        </span>
                        <button type='submit' className='bg-black text-white py-3 rounded mt-5'>Contact Us</button>
                    </form>
                </section>
            </div>
        </section>
    );
}

export default ContactForm;
