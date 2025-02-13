import React, { useEffect, useState } from 'react'
import Logo from '../Logo'
import { Link, useLocation } from 'react-router-dom'

const NavbarUI = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentURL, setCurrentURL] = useState("")

    const location = useLocation()

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const getLinkClass = (path) => {
        return currentURL === path
            ? "text-white py-3 px-4 rounded bg-custom-rgba text-white hover:text-white"
            : "text-white py-3 px-4 rounded hover:bg-custom-rgba hover:text-white"
    }

    useEffect(() => {
        setCurrentURL(window.location.pathname);
    }, [location])

    return (
        <nav className="bg-zinc-900 p-4">
            <div className="container mx-auto flex items-center justify-between">
                <div className="text-white font-bold text-xl">
                    <Link to="/">
                        <Logo lightLogo={true} />
                    </Link>
                </div>
                <div className="hidden md:flex space-x-4">
                    <Link to="/" className={getLinkClass("/")}>Home</Link>
                    <Link to="/features" className={getLinkClass("/features")}>Features</Link>
                    <Link to="/pricing" className={getLinkClass("/pricing")}>Pricing</Link>
                    <Link to="/contact" className={getLinkClass("/contact")}>Contact</Link>
                    {/* <Link to="/" className='text-white py-3 px-4 rounded hover:bg-custom-rgba hover:text-white'>About</Link> */}
                </div>
                <div className="hidden md:block md:space-x-4">
                    <Link to="/login" className={getLinkClass("/login")}>Login</Link>
                    <Link to="/registration">
                        <button className="bg-white text-zinc-900 px-6 py-3 rounded hover:bg-pink-700 hover:text-white">Sign Up</button>
                    </Link>
                </div>
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-zinc-900 focus:outline-none rounded">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden py-2 px-4`}>
                <a href="#" className="block text-white hover:text-gray-400 py-2 text-lg">Home</a>
                <a href="#" className="block text-white hover:text-gray-400 py-2 text-lg">About</a>
                <a href="#" className="block text-white hover:text-gray-400 py-2 text-lg">Services</a>
                <a href="#" className="block text-white hover:text-gray-400 py-2 text-lg">Contact</a>
            </div>
        </nav>
    );
}

export default NavbarUI