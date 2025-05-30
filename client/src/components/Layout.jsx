import React, { useState, useContext, useEffect } from 'react'
import Navbar from './Navbar'
import { Link, useLocation } from 'react-router-dom'
import { BsHouseDoor, BsList, BsCalendar, BsClock, BsPeople, BsPerson, BsGear, BsCurrencyDollar, BsFillHeartPulseFill, BsThreeDots, BsCalendar2Week } from 'react-icons/bs'
import { AiOutlineMenu } from "react-icons/ai"
import SidebarLink from './navbar/SidebarLink'
import { UserContext } from '../context/UserContext'
import { ConfigContext } from '../context/ConfigContext'
import Footer from './Footer'

const Layout = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    {/* ${isMobile ? (showSidebar ? 'fixed inset-0 z-10 translate-x-0' : 'fixed inset-0 z-10 -translate-x-full') : ''} */ }
    const { user } = useContext(UserContext)

    const tenantId = user.tenant_id

    const [imageSrc, setImageSrc] = useState(null)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [userImg, setUserImg] = useState("")

    const location = useLocation()
    const currentPath = location.pathname

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar)
    }

    const { baseURL } = useContext(ConfigContext);

    useEffect(() => {
        if (user) {
            setImageSrc(baseURL + "/uploads/")
            setUsername(user.username)
            setEmail(user.email)
            setUserImg(user.profile_image)
        }

        const checkScreenWidth = () => {
            const screenWidth = window.innerWidth
            if (screenWidth <= 990) {
                setShowSidebar(false)
            } else {
                setShowSidebar(true)
            }

            setIsMobile(screenWidth <= 990)
        }

        checkScreenWidth()

        window.addEventListener("resize", checkScreenWidth)
        return () => window.removeEventListener('resize', checkScreenWidth)
    }, [user])

    return (
        <div className='layout grid h-screen grid-cols-[300px_1fr] grid-rows-[85px_1fr] overflow-hidden'>
            <aside className="hidden lg:block bg-custom-bg-gray p-6 transition-transform duration-300 ease-in-out relative w-full min-h-screen col-[1/2] row-[2/3]">
                <div className='sidebar-content'>
                    <div className='sidebarLinks flex flex-col h-full gap-2'>
                        <h3 className='font-thin text-zinc-400'>Main Menu</h3>
                        <SidebarLink
                            menuLink={`/${tenantId}/dashboard`}
                            linkText="Dashboard"
                            currentPath={currentPath}
                            iconComponent={BsHouseDoor}
                        />

                        <SidebarLink
                            menuLink={`/${tenantId}/workflow`}
                            linkText="Workflow"
                            currentPath={currentPath}
                            iconComponent={BsList}
                        />

                        <SidebarLink
                            menuLink={`/${tenantId}/sprint-overview`}
                            linkText="Month Overview"
                            currentPath={currentPath}
                            iconComponent={BsCalendar}
                        />

                        <SidebarLink
                            menuLink={`/${tenantId}/time-registrations`}
                            linkText="Time Registrations"
                            currentPath={currentPath}
                            iconComponent={BsClock}
                        />

                        <SidebarLink
                            menuLink={`/${tenantId}/customers`}
                            linkText="Customers"
                            currentPath={currentPath}
                            iconComponent={BsPeople}
                        />

                        <SidebarLink
                            menuLink={`/${tenantId}/profile`}
                            linkText="User Profile"
                            currentPath={currentPath}
                            iconComponent={BsPerson}
                        />

                        <SidebarLink
                            menuLink={`/${tenantId}/holidays`}
                            linkText="Holidays"
                            currentPath={currentPath}
                            iconComponent={BsCalendar2Week}
                        />
                    </div>
                    <div className='mt-[20px]'>
                        <h3 className='font-thin text-zinc-400'>Misc</h3>

                        <SidebarLink
                            menuLink={`/${tenantId}/admin`}
                            linkText="Admin"
                            currentPath={currentPath}
                            iconComponent={BsGear}
                        />

                        <SidebarLink
                            menuLink="#"
                            linkText="More Bizz"
                            currentPath={currentPath}
                            iconComponent={BsCurrencyDollar}
                            wip={true}
                        />

                        <SidebarLink
                            menuLink="#"
                            linkText="Client Health"
                            currentPath={currentPath}
                            iconComponent={BsFillHeartPulseFill}
                            wip={true}
                        />
                    </div>

                    {/* 
                    <Link to={`/${tenantId}/profile`} id='sidebarUser' className='flex items-center justify-start p-4 pl-0 space-x-2 mt-[40px]'>
                        <img
                            src={`${imageSrc}${userImg}`}
                            className='h-12 w-12 rounded object-cover'
                        />
                        <div>
                            <p className='font-bold text-gray-900'>@{username}</p>
                            <p className='font-light text-gray-600 text-sm'>{email}</p>
                        </div>
                    </Link>*/}
                </div>
            </aside>

            <Navbar />

            <main className='w-full h-full p-4 col-[1/3] lg:col-[2/3] row-[2/3] overflow-scroll'>
                
                {/*
                {isMobile && (
                    <button
                        className='fixed bottom-4 left-4 bg-slate-800 text-white p-2 rounded-full flex items-center justify-center z-40'
                        onClick={toggleSidebar}
                    >
                        {showSidebar && isMobile ? <BsThreeDots /> : <BsThreeDots />}
                    </button>
                )}*/}

                <section id="mainSection" className='max-w-[1400px] flex mx-auto p-4'>
                    <div className='w-full'>
                        {children}
                    </div>
                </section>

                <section id='footerSection' className='max-w-[1400px] flex mx-auto p-4'>
                    <Footer />
                </section>
            </main>
        </div>
    )
}

export default Layout