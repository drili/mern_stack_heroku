import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import Logo from '../Logo';
import { Link } from 'react-router-dom';

const FooterUI = () => {
    return (
        <section id='FooterUI' className='bg-zinc-900 py-20'>
            <div className='container mx-auto px-4 lg:px-0 grid grid-cols-1 lg:grid-cols-[2fr_4fr_2fr] gap-10'>
                <div id='FooterUI-left'>
                    <Logo lightLogo={true} />
                    <p className='text-zinc-300 text-lg mt-10'>
                        From project planning to daily to-dos, experience a new level of efficiency that transforms the way you work.
                    </p>
                    <div className='flex gap-4 mt-10'>
                        <a href='https://facebook.com' target='_blank' rel='noopener noreferrer'>
                            <FaFacebook className='text-2xl text-blue-600' />
                        </a>
                        <a href='https://twitter.com' target='_blank' rel='noopener noreferrer'>
                            <FaTwitter className='text-2xl text-blue-400' />
                        </a>
                        <a href='https://linkedin.com' target='_blank' rel='noopener noreferrer'>
                            <FaLinkedin className='text-2xl text-blue-700' />
                        </a>
                        <a href='https://instagram.com' target='_blank' rel='noopener noreferrer'>
                            <FaInstagram className='text-2xl text-pink-600' />
                        </a>
                    </div>
                </div>
                <div className='hidden lg:block'></div>
                <div id='FooterUI-right'>
                    <div className='flex flex-col lg:flex-row gap-10 justify-between'>
                        <div className='flex flex-col gap-5'>
                            <h2 className='text-white font-bold'>Company</h2>
                            <Link className='text-white text-lg' to='/'>Home</Link>
                            <Link className='text-white text-lg' to='/about'>About</Link>
                            <Link className='text-white text-lg' to='/services'>Services</Link>
                            <Link className='text-white text-lg' to='/contact'>Contact</Link>
                            <Link className='text-white text-lg' to='/blog'>Blog</Link>
                        </div>
                        <div className='flex flex-col gap-5'>
                            <h2 className='text-white font-bold'>Utilities</h2>
                            <Link className='text-white text-lg' to='/login'>Login</Link>
                            <Link className='text-white text-lg' to='/register'>Register</Link>
                            <Link className='text-white text-lg' to='/faq'>FAQ</Link>
                            <Link className='text-white text-lg' to='/support'>Support</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FooterUI;
