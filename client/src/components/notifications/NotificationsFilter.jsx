import React, { useState } from 'react'
import { BsSearch, BsCalendarFill } from "react-icons/bs"

const NotificationsFilter = ({ setSearchTerm, searchTerm }) => {
    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-text "
    const labelClasses = "h-full flex flex-col justify-center bg-teal-200 border-none text-slate-800 border rounded px-4 py-1 text-sm border border-zinc-400 "


    const handleSearchTerm = async (e) => {
        const newSearchTerm = e.target.value
        setSearchTerm(newSearchTerm)
    }

    return (
        <div id='NotificationsFilter' className='py-4 px-5 border-0 rounded-lg bg-slate-50 relative flex flex-col w-full outline-none focus:outline-none mb-10'>
            <section className='flex justify-end gap-8 flex-col md:flex-row'>

                <div id='WorkflowFilters-searchField'>
                    <span className='flex gap-2 items-center'>
                        <input
                            type="text"
                            className={`${inputClasses} min-w-[200px] hover:cursor-text`}
                            placeholder='Search notification(s)'
                            onChange={handleSearchTerm}
                        />
                        <BsSearch size={20}></BsSearch>
                    </span>
                </div>

            </section>
        </div>
    )
}

export default NotificationsFilter