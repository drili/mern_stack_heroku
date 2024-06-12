import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const ContactForm = () => {
    return (
        <section
            id='ContactForm'
            className='bg-white py-[12rem] h-full'
            style={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
            }}>

            <div className='flex flex-col lg:flex-row gap-20 container mx-auto'>
                <section id='ContactInfo' className='bg-gray-100 w-full p-[4rem] rounded-extra-large'>
                    <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Contact Information</h3>
                    <p className='text-slate-800 font-medium mb-4'>You can reach us at:</p>
                    <p className='text-slate-800 font-medium mb-2'>1234 Street Name</p>
                    <p className='text-slate-800 font-medium mb-2'>City, State, ZIP</p>
                    <p className='text-slate-800 font-medium mb-2'>Phone: (123) 456-7890</p>
                    <p className='text-slate-800 font-medium mb-6'>Email: contact@example.com</p>
                    <div className='flex gap-4'>
                        <a href='https://facebook.com' target='_blank' rel='noopener noreferrer'><FaFacebook className='text-2xl text-blue-600' /></a>
                        <a href='https://twitter.com' target='_blank' rel='noopener noreferrer'><FaTwitter className='text-2xl text-blue-400' /></a>
                        <a href='https://linkedin.com' target='_blank' rel='noopener noreferrer'><FaLinkedin className='text-2xl text-blue-700' /></a>
                        <a href='https://instagram.com' target='_blank' rel='noopener noreferrer'><FaInstagram className='text-2xl text-pink-600' /></a>
                    </div>
                </section>

                <section id='ContactForm-section' className='bg-gray-100 w-full p-[4rem] rounded-extra-large'>
                    <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Get in Touch</h3>
                    <form className='flex flex-col gap-4'>
                        <input type="text" placeholder='Name' className='h-[50px] border rounded focus:border-pink-700 p-3' required />
                        <input type="email" placeholder='Email' className='h-[50px] border rounded focus:border-pink-700 p-3' required />
                        <input type="tel" placeholder='Phone (optional)' className='h-[50px] border rounded focus:border-pink-700 p-3' />
                        <textarea placeholder='Message' className='h-[150px] border rounded focus:border-pink-700 p-3' required></textarea>
                        <button type='submit' className='bg-pink-700 text-white py-3 rounded'>Send Message</button>
                    </form>
                </section>
            </div>
        </section>
    );
}

export default ContactForm;
