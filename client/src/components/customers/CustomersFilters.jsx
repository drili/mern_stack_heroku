import React, { useContext, useEffect, useState } from 'react'
import { BsSearch, BsCalendarFill } from "react-icons/bs"
import { AiFillPlusCircle } from "react-icons/ai"
import axios from 'axios'
import { Link } from 'react-router-dom'

import getCurrentSprint from '../../functions/getCurrentSprint'
import { UserContext } from '../../context/UserContext'
import { ConfigContext } from '../../context/ConfigContext'

const CustomersFilters = ({ onSelectedSprint }) => {
    const [sprints, setSprints] = useState([])
    const [currentSprint, setCurrentSprint] = useState([])
    const activeSprint  = getCurrentSprint()

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    
    const inputClasses = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
    const labelClasses = "block mb-2 text-sm font-medium text-gray-900 "

    const fetchSprints = async () => {
        try {
            const response = await axios.get(`${baseURL}/sprints/fetch?activeYear=${user.active_year}`)
            // console.log(response.data);
            setSprints(response.data)
        } catch (error) {
            console.error('Failed to fetch sprints', error);
            
        }
    }

    const handleSprintChange = (e) => {
        const selectedValue = e.target.value
        
        const selectedSprint = sprints.find((sprint) => sprint._id === selectedValue)
        // console.log({selectedSprint})
        if (selectedSprint) {
            onSelectedSprint(selectedValue, selectedSprint)
            setCurrentSprint(selectedSprint)
        }
    }

    useEffect(() => {
        fetchSprints()
        setCurrentSprint(activeSprint)
    }, [activeSprint])

    return (
        <div id='SprintOverviewFilters' className='items-center py-4 px-5 border-0 rounded-lg bg-slate-50 relative flex flex-row justify-between w-full outline-none focus:outline-none mb-10'>
            <section className='flex gap-4'>
                <div id="CustomersFilter-links">
                    <span className='h-full flex flex-row items-center gap-2 justify-center text-xs font-medium'>
                        <Link to="create-customer">
                            <button type="submit" className='border border-rose-500 h-fit whitespace-nowrap button text-black hover:bg-rose-800 focus:ring-4 focus:outline-none hover:text-white focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center   '>Create / Edit Customer</button>
                        </Link>

                        <AiFillPlusCircle size={20} color='' />
                    </span>
                </div>
            </section>
            
            <section className='flex justify-end gap-8'>
                <div id='CustomersFilter-activeSprint'>
                    <span className='h-full flex flex-col justify-center bg-slate-500 text-white border rounded-md px-4 py-1 text-xs font-medium'>
                        {currentSprint && currentSprint?.sprintMonth} {currentSprint && currentSprint?.sprintYear}
                    </span>
                </div>

                <div id='CustomersFilter-filterSprint'>
                    <span className='flex gap-2 items-center'>
                        <select 
                            className={`${inputClasses} min-w-[200px]`} 
                            defaultValue=""
                            // onChange={(e) => handleSprintChange(e.target.value)}
                            onChange={handleSprintChange}
                            >
                            <option disabled value="">Select month</option>
                            {sprints && sprints.map((sprint) => (
                                <option 
                                    key={sprint?._id} 
                                    value={`${sprint?._id}`}
                                    // value={`${sprint?._id}|${sprint?.sprintName}|${sprint?.sprintYear}|${sprint.sprintMonth}`}
                                    >
                                    {sprint?.sprintName}
                                </option>
                            ))}
                        </select>
                        <BsCalendarFill size={20}></BsCalendarFill>
                    </span>
                </div>

            </section>
        </div>
    )
}

export default CustomersFilters