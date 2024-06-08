import React from 'react'
import { FaClipboardList } from "react-icons/fa6";
import { FaClock } from "react-icons/fa6";
import { FaBell } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";

import SubTitle from './elements/SubTitle'

const FeatureSection = () => {
    const textClasses = "text-neutral-500 font-normal text-lg"
    return (
        <section id='FeatureSection' className='container relative px-4 md:px-0'>
            <div className='grid gap-10 mb-10 md:mb-40 md:grid-cols-2 md:gap-20'>
                <div className='flex flex-col gap-4 md:items-end md:text-right'>
                    <FaClipboardList size={40} color='' className='text-pink-700' />
                    <SubTitle>Real-Time Task Management</SubTitle>
                    <p className={textClasses}>Effortlessly organize and prioritize your tasks with our intuitive drag-and-drop interface. Keep track of what needs to be done today, this week, and what's already completed.</p>
                </div>

                <div className='flex flex-col gap-4'>
                    <FaClock size={40} color='' className='text-pink-700' />
                    <SubTitle>Time Registration and Reporting</SubTitle>
                    <p className={textClasses}>Accurately log the time spent on various tasks and generate detailed reports. Our system provides a clear breakdown of time allocated and utilized, helping you stay on top of your productivity.</p>
                </div>

                <div className='flex flex-col gap-4 md:items-end md:text-right'>
                    <FaBell size={40} color='' className='text-pink-700' />
                    <SubTitle>Comment System & Notifications</SubTitle>
                    <p className={textClasses}>Stay connected and informed with real-time notifications directly in Slack. Get alerts when you're mentioned in comments, and keep the entire team in sync without leaving your workspace.</p>
                </div>

                <div className='flex flex-col gap-4'>
                    <FaUserGear size={40} color='' className='text-pink-700' />

                    <SubTitle>Comprehensive Admin Controls</SubTitle>
                    <p className={textClasses}>Manage your team's time registrations, oversee client and internal time, handle user profiles, and ensure smooth operations with robust admin tools designed for efficiency and control.</p>
                </div>
            </div>

            <span className='absolute top-0 bottom-0 left-0 right-0 flex mb-0 mr-auto ml-auto flex-col justify-center -z-10 opacity-5'>
                <h1 className='rotate-90 md:rotate-0 text-[40vw] md:text-[15vw] text-center text-pink-700 font-bold'>Features</h1>
            </span>
        </section>
    )
}

export default FeatureSection