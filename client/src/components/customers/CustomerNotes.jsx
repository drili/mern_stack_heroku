import React, { useState } from 'react'
import { BsEye, BsFileEarmarkPlus } from "react-icons/bs";

import CustomerNotesFilter from './CustomerNotesFilter'
import ViewCustomerNotesComponent from './customer-notes/ViewCustomerNotesComponent';
import CreateCustomerNotesComponent from './customer-notes/CreateCustomerNotesComponent';

const CustomerNotes = ({ customerId }) => {
    const [activeComponent, setActiveComponent] = useState("ViewCustomerNotes")

    const sections = [
        { name: 'ViewCustomerNotes', label: 'View notes', icon: BsEye },
        { name: 'CreateCustomerNotes', label: 'Create notes', icon: BsFileEarmarkPlus },
    ]

    const renderComponent = () => {
        switch (activeComponent) {
            case "ViewCustomerNotes":
                return <ViewCustomerNotesComponent />
            case "CreateCustomerNotes":
                return <CreateCustomerNotesComponent />
            default:
                return <ViewCustomerNotesComponent />
        }
    }

    return (
        <section id='CustomerNotes' className='grid grid-cols-12 gap-4'>
            <span className='col-span-12'>
                <h2 class="font-extrabold text-3xl mb-2">Customer notes</h2>
                <h5 class="text-wrapped-balance text-neutral-500 text-base">Select the month to view the different customer notes.</h5>
            </span>

            <span className='col-span-12'>
                <CustomerNotesFilter />
            </span>

            <span className='col-span-12'>
                <div className="grid grid-cols-12 gap-10">
                    <section id="CustomerNotesCards" className='flex flex-col gap-4 col-span-2'>
                        {sections.map((section) => (
                            <div
                                key={section.name}
                                className={`
                                    rounded text-slate-800 text-sm cursor-pointer py-2 px-4 
                                    ${activeComponent === section.name ? 'bg-stone-100' : ''}
                                `}
                                onClick={() => setActiveComponent(section.name)}
                            >
                                <div className='flex gap-4 items-center'>
                                    <span>
                                        <section.icon size={20} />
                                    </span>
                                    <span>
                                        <h3 className='text-sm text-black font-bold'>
                                            {section.label}
                                        </h3>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className='flex flex-col col-span-10 w-full'>
                        {renderComponent()}
                    </section>
                </div>
            </span>
        </section>
    )
}

export default CustomerNotes