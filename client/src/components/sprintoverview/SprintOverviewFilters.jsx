import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { BsSearch, BsCalendarFill } from "react-icons/bs"

import getCurrentSprint from '../../functions/getCurrentSprint'
import { UserContext } from '../../context/UserContext'
import { ConfigContext } from '../../context/ConfigContext'

const SprintOverviewFilters = ({ onSelectedSprint }) => {
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
        <div id='WorkflowFilters' className='items-center py-4 px-5 border-0 rounded-lg bg-slate-50 relative flex justify-between w-full outline-none focus:outline-none mb-10 flex-col md:flex-row'>
            <section className='gap-4 hidden md:flex'>
                <button className='bg-white px-4 py-2 rounded-lg border-1 border-zinc-300'>
                    Persons
                </button>

                {/* <button className=' px-4 py-2 rounded-lg'>
                    Customers
                </button> */}
            </section>

            <section className='flex justify-end gap-8 flex-col w-full md:flex-row'>
                
                <div id='WorkflowFilters-activeSprint'>
                    <span className='h-full flex flex-col justify-center bg-slate-500 text-white border rounded-md text-xs font-medium p-3'>
                        {currentSprint && currentSprint?.sprintMonth} {currentSprint && currentSprint?.sprintYear}
                    </span>
                </div>

                <div id='WorkflowFilters-filterSprint'>
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

export default SprintOverviewFilters