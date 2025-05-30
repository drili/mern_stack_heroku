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
            setIsMobile(screenWidth <= 1023)
        }

        checkScreenWidth()

        window.addEventListener("resize", checkScreenWidth)
        return () => window.removeEventListener('resize', checkScreenWidth)
    }, [user])

    return (
        <div className='layout grid relative h-screen grid-cols-[300px_1fr] grid-rows-[85px_1fr] overflow-hidden'>
            <aside className={`bg-gray-100 p-6 flex-col justify-between transition-transform duration-300 ease-in-out ${isMobile ? (showSidebar ? 'fixed inset-0 z-10 translate-x-0 w-full sm:w-1/3 pb-14 pt-28' : 'fixed inset-0 z-10 -translate-x-full w-full sm:w-1/3 pb-14 pt-28') : 'relative w-full min-h-screen col-[1/2] row-[2/3] pb-24'}`}>
                <div className='sidebar-content flex flex-col h-full justify-between'>
                    <div className='flex flex-col justify-between gap-8'>
                        <div className='sidebarLinks'>
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
                        <div className='sidebarLinks'>
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
                    </div>

                    <Link to={`/${tenantId}/profile`} id='sidebarUser' className='flex items-center justify-start p-4 pl-0 space-x-2'>
                        <img
                            src={`${imageSrc}${userImg}`}
                            className='h-12 w-12 rounded object-cover'
                        />
                        <div>
                            <p className='font-bold text-gray-900'>@{username}</p>
                            <p className='font-light text-gray-600 text-sm'>{email}</p>
                        </div>
                    </Link>
                </div>
            </aside>

            <Navbar />

            <main className='w-full h-full p-4 pb-24 col-[1/3] lg:col-[2/3] row-[2/3] overflow-scroll'>

                    <button
                        className='fixed bottom-4 left-4 bg-pink-700 drop-shadow text-white p-2 rounded-full flex lg:hidden items-center justify-center z-40'
                        onClick={toggleSidebar}
                    >
                        {showSidebar && isMobile ? <BsThreeDots /> : <BsThreeDots />}
                    </button>

                <section id="mainSection" className='max-w-[1400px] flex mx-auto p-4'>
                    <div className='w-full'>
                        {children}
                    </div>
                </section>

                <section id='footerSection' className='max-w-[1400px] flex mx-auto p-4'>
                    <Footer />
                </section>
            </main>

            {/* Mobile Sidebar 
            <div className="flex absolute lg:hidden bottom-4 left-4 bg-gray-100 drop-shadow-xl overflow-hidden rounded-full">
                <SidebarLink
                    menuLink={`/${tenantId}/dashboard`}
                    linkText="Dashboard"
                    currentPath={currentPath}
                    iconComponent={BsHouseDoor}
                    iconOnly="true"
                />

                <SidebarLink
                    menuLink={`/${tenantId}/workflow`}
                    linkText="Workflow"
                    currentPath={currentPath}
                    iconComponent={BsList}
                    iconOnly="true"
                />

                <SidebarLink
                    menuLink={`/${tenantId}/sprint-overview`}
                    linkText="Month Overview"
                    currentPath={currentPath}
                    iconComponent={BsCalendar}
                    iconOnly="true"
                />

                <SidebarLink
                    menuLink={`/${tenantId}/time-registrations`}
                    linkText="Time Registrations"
                    currentPath={currentPath}
                    iconComponent={BsClock}
                    iconOnly="true"
                />

                <SidebarLink
                    menuLink={`/${tenantId}/customers`}
                    linkText="Customers"
                    currentPath={currentPath}
                    iconComponent={BsPeople}
                    iconOnly="true"
                />

                <SidebarLink
                    menuLink={`/${tenantId}/profile`}
                    linkText="User Profile"
                    currentPath={currentPath}
                    iconComponent={BsPerson}
                    iconOnly="true"
                />

                <SidebarLink
                    menuLink={`/${tenantId}/holidays`}
                    linkText="Holidays"
                    currentPath={currentPath}
                    iconComponent={BsCalendar2Week}
                    iconOnly="true"
                />
            </div>*/}
        </div>
    )
}

export default Layout