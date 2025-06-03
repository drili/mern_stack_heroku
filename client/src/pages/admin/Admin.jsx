import React, { useState } from 'react'
import { Card } from "flowbite-react"
import { AiOutlineClockCircle, AiOutlineUsergroupAdd } from "react-icons/ai"
import { FiUsers, FiArchive } from "react-icons/fi"
import { BsListTask, BsArchive } from "react-icons/bs"
import { Link } from 'react-router-dom'
import { HiOutlineArrowSmRight, HiOutlineCog } from "react-icons/hi"
import { FaRegTrashAlt } from "react-icons/fa";
import { CiMedicalClipboard } from "react-icons/ci";

import PageHeading from '../../components/PageHeading'
import GeneralFeatures from './GeneralFeatures'
import Groups from './Groups'
import PersonsOverview from './PersonsOverview'
import Register from './Register'
import TaskVerticalsOverview from './TaskVerticalsOverview'
import TimeRegistrationsOverview from './TimeRegistrationsOverview'
import ArchivedTasks from './ArchivedTasks'

const Admin = () => {
    const [activeComponent, setActiveComponent] = useState("GeneralFeatures")

    const sections = [
        { name: 'GeneralFeatures', label: 'General Features', icon: HiOutlineCog },
        { name: 'TimeRegistrationsOverview', label: 'Time Registrations', icon: AiOutlineClockCircle },
        { name: 'Users', label: 'Users', icon: FiUsers },
        { name: 'TaskVerticalsOverview', label: 'Task Vertical', icon: BsListTask },
        { name: 'Groups', label: 'Groups', icon: AiOutlineUsergroupAdd },
        { name: 'ArchivedTasks', label: 'Archived Tasks', icon: BsArchive },
        { name: 'Holidays', label: 'Holidays', icon: FaRegTrashAlt }
    ]

    const renderComponent = () => {
        switch (activeComponent) {
            case 'GeneralFeatures':
                return <GeneralFeatures />
            case 'TimeRegistrationsOverview':
                return <TimeRegistrationsOverview />
            case 'Users':
                return <PersonsOverview />
            case 'TaskVerticalsOverview':
                return <TaskVerticalsOverview />;
            case 'Groups':
                return <Groups />
            case 'ArchivedTasks':
                return <ArchivedTasks />
            case 'Holidays':
                return <div>Holidays Component</div>;

            default:
                return <GeneralFeatures />
        }
    }

    return (
        <div id='AdminPage'>
            <PageHeading
                heading="Admin"
                subHeading={`Welcome to your admin page`}
                suffix="Select which feature you would like to use."
            />

            <div className='grid grid-cols-12 gap-10'>
                <section id='AdminCards' className='flex flex-col gap-4 col-span-2'>
                    {sections.map((section) => (
                        <div
                            key={section.name}
                            className={`
                                rounded text-slate-800 text-sm cursor-pointer py-2 px-4 
                                ${activeComponent === section.name ? 'bg-stone-100' : ''}`
                            }
                            onClick={() => setActiveComponent(section.name)}
                        >
                            <div className='flex gap-4 items-center'>
                                <span>
                                    <section.icon size={20} />
                                </span>
                                <span>
                                    <h3 className='text-sm text-black font-bold'>{section.label}</h3>
                                </span>
                            </div>
                        </div>
                    ))}
                </section>

                <section className='flex flex-col col-span-10 w-full'>
                    {renderComponent()}
                </section>
            </div>
        </div>
    )
}

export default Admin