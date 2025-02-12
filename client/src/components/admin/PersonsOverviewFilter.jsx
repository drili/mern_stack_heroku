import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BsSearch, BsCalendarFill } from "react-icons/bs"
import { AiFillPlusCircle } from "react-icons/ai"
import { Link } from 'react-router-dom'


const PersonsOverviewFilter = ({ userObject }) => {
    const [sprints, setSprints] = useState([])
    const [currentSprint, setCurrentSprint] = useState([])

    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer "
    const labelClasses = "h-full flex flex-col justify-center bg-teal-200 border-none text-slate-800 border rounded px-4 py-1 text-sm border border-zinc-400 "

    useEffect(() => {

    }, [])

    return (
        <div id='PersonsOverviewFilter' className='items-center py-4 px-5 border-0 rounded-lg bg-slate-50 relative flex flex-row justify-between w-full outline-none focus:outline-none mb-10'>
            <section className='flex gap-4'>
            <div id="CustomersFilter-links">
                    <span className='h-full flex flex-row items-center gap-2 justify-center text-xs font-medium'>
                        <a href='#loginFormSection'>
                            <button type="submit" className={`${inputClasses} bg-pink-700 text-white border-none`}>Add New User</button>
                        </a>

                        <AiFillPlusCircle size={20} color='' />
                    </span>
                </div>
            </section>

            <section className='flex justify-end gap-8'>

            </section>
        </div>
    )
}

export default PersonsOverviewFilter