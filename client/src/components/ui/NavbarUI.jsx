import React, { useState } from 'react'
import Logo from '../Logo'

const NavbarUI = () => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    return (
        <nav className="bg-zinc-900 p-4">
            <div className="container mx-auto flex items-center justify-between">
                <div className="text-white font-bold text-xl">
                    <a href="#">
                        <Logo lightLogo={true} />
                    </a>
                </div>
                <div className="hidden md:flex space-x-4">
                    <a href="#" className="text-white py-3 px-4 rounded hover:bg-custom-rgba hover:text-white">Home</a>
                    <a href="#" className="text-white py-3 px-4 rounded hover:bg-custom-rgba hover:text-white">Features</a>
                    <a href="#" className="text-white py-3 px-4 rounded hover:bg-custom-rgba hover:text-white">Pricing</a>
                    <a href="#" className="text-white py-3 px-4 rounded hover:bg-custom-rgba hover:text-white">About</a>
                    <a href="#" className="text-white py-3 px-4 rounded hover:bg-custom-rgba hover:text-white">Contact</a>
                </div>
                <div className="hidden md:block">
                    <button className="bg-white text-zinc-900 px-6 py-3 rounded hover:bg-pink-600 hover:text-white">Sign Up</button>
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