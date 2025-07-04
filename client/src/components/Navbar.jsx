import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell } from "react-icons/fa";
import socketIoClient from 'socket.io-client';

import { UserContext } from '../context/UserContext';
import userImage from "../assets/profile-pics/default-image.jpg"
import Logo from '../components/Logo';
import { ConfigContext } from '../context/ConfigContext';
import notificationSoundFile from "../assets/sounds/short-success-sound-glockenspiel-treasure-video-game-6346.mp3";
import NotificationDropdown from './notifications/NotificationsDropdown';

const notificationSound = new Audio(notificationSoundFile);

const Navbar = () => {
    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer "
    const labelClasses = "block mb-2 text-sm font-medium text-gray-900 "

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [userImg, setUserImg] = useState("")
    const [profileImage, setProfileImage] = useState(null)
    const [imageSrc, setImageSrc] = useState(null)
    const navigate = useNavigate()
    const [activeYear, setActiveYear] = useState("")
    const [sprintYears, setSprintYears] = useState([])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const { user, setUser, hasUnreadNotifications, setHasUnreadNotifications } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;
    const tenantId = user.tenant_id

    const socket = socketIoClient(baseURL)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const handleSprintYearChange = async (e) => {
        const newActiveYear = e

        try {
            const response = await axios.put(`${tenantBaseURL}/users/update-sprint-year`, { activeYear: newActiveYear, userId: user.id })
            setActiveYear(response.data.activeYear)

            if (user) {
                const updatedUser = { ...user, active_year: response.data.activeYear }
                setUser(updatedUser)

                localStorage.setItem("user", JSON.stringify(updatedUser))
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to update sprint year:', error);
        }
    }

    const fetchSprintYears = async () => {
        try {
            const response = await axios.get(`${baseURL}/sprints/fetch-sprint-years`)
            if (response.status === 200) {
                setSprintYears(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch all sprint years', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.clear();
        setUsername('');

        navigate("/login")
    }

    useEffect(() => {
        if (user) {
            setUsername(user?.username)
            setEmail(user?.email)
            setUserImg(user?.profile_image)
            setImageSrc(baseURL + "/uploads/")
            setActiveYear(user?.active_year)
            fetchSprintYears();
        }
    }, [user])

    useEffect(() => {
        socket.emit('register', user.id);

        socket.on('new-notification', (data) => {
            setHasUnreadNotifications(true);

            notificationSound.play()
                .then(() => {
                    console.log("Notification sound played.");
                })
                .catch(error => {
                    console.error("Error playing the notification sound", error)
                })
            // console.log("NEW NOTIFICATION");
        });

        return () => {
            socket.off('new-notification');
        };
    }, [user, socket]);

    useEffect(() => {
        socket.on("new-notification", (data) => {
            setHasUnreadNotifications(true)
        })

        return () => {
            socket.off("new-notification")
        }
    }, [socket])

    const menuItems = (
        <>
            <span id="navbarButtons" className='flex gap-4 mt-10 flex-col w-full md:flex-row md:mr-4 md:items-center md:mt-0 md:w-auto'>
                <div>
                    <select
                        className={`${inputClasses} min-w-[100px] bg-white`}
                        defaultValue=""
                        onChange={(e) => handleSprintYearChange(e.target.value)}
                    >
                        <option value={activeYear}>{activeYear}</option>
                        {sprintYears
                            .filter((year) => year.sprintYear !== activeYear)
                            .map((year) => (
                                <option key={year._id} value={year.sprintYear}>{year.sprintYear}</option>
                            ))}
                    </select>
                </div>

                <Link to={`/${tenantId}/register-offtime`}>
                    <button 
                        type="submit" 
                        className={`${inputClasses}`}>Register Off- & Sicktime</button>
                </Link>

                <Link to={`/${tenantId}/create-task`}>
                    <button type="submit" className={`${inputClasses} bg-pink-700 border-none text-white`}>Create Task</button>
                </Link>
            </span>

            <Link to={`/${tenantId}/profile`} className='flex flex-row align-center items-center justify-center py-1 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 mt-5 md:mt-0'>
                <p className='font-bold'>@{username}</p>
                <img
                    className='w-[45px] h-[45px] rounded object-cover ml-2'
                    src={`${imageSrc}${userImg}`} />
            </Link>

            <span className='flex items-center'>
                <div className='mr-5 ml-1 relative hover:cursor-pointer'>
                    <NotificationDropdown />
                </div>
            </span>

            <span className='flex items-center'>
                <button
                    onClick={handleLogout}
                    type="button"
                    className={`${inputClasses}`}>Logout</button>
            </span>
        </>
    )

    return (
        <>
            <nav className="bg-white w-full h-full z-20 top-0 left-0 border-b border-gray-200 col-[1/3] row-[1/2]">
                <div className="w-full h-full px-6 flex flex-wrap items-center justify-between mx-auto py-4">
                    <a href="#" className="flex items-left">
                        <Logo />
                    </a>

                    <button
                        onClick={toggleMobileMenu}
                        data-collapse-toggle="navbar-sticky" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200   " aria-controls="navbar-sticky" aria-expanded={isMobileMenuOpen}>
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>

                    <div className="hidden lg:flex md:order-2">
                        {menuItems}
                    </div>

                    <div className={`${isMobileMenuOpen ? 'flex flex-col items-end' : 'hidden'} md:hidden w-full`} id="navbar-sticky">
                        {menuItems}
                    </div>

                </div>
            </nav>
        </>
    )
}

export default Navbar