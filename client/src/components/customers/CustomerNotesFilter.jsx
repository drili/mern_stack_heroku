import React, { useContext, useEffect, useState } from 'react'
import { BsSearch, BsCalendarFill } from "react-icons/bs"

import { UserContext } from '../../context/UserContext'
import { ConfigContext } from '../../context/ConfigContext'
import getCurrentSprint from '../../functions/getCurrentSprint'
import axios from 'axios'

const CustomerNotesFilter = () => {
    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer "
    const labelClasses = "h-full flex flex-col justify-center bg-teal-200 border-none text-slate-800 border rounded px-4 py-1 text-sm border border-zinc-400 "

    const [sprints, setSprints] = useState([])
    const [currentSprint, setCurrentSprint] = useState([])
    const activeSprint = getCurrentSprint()

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const handleSprintChange = (e) => {
        const selectedValue = e.target.value
        
        const selectedSprint = sprints.find((sprint) => sprint._id === selectedValue)
        // console.log({selectedSprint})
        if (selectedSprint) {
            setCurrentSprint(selectedSprint)
        }
    }

    const fetchSprints = async () => {
        try {
            const response = await axios.get(`${baseURL}/sprints/fetch?activeYear=${user.active_year}`)
            setSprints(response.data)
        } catch (error) {
            console.error('Failed to fetch sprints', error);

        }
    }

    useEffect(() => {
        fetchSprints()
        setCurrentSprint(activeSprint)
    }, [activeSprint])

    return (
        <>
            <div id='CustomerNotesFilter' className='py-4 px-5 rounded-lg bg-[#f2f3f4] relative flex flex-col w-full outline-none focus:outline-none mb-5'>
                <section className='flex justify-end gap-8'>
                    <div id='CustomerNotesFilter-activeSprint'>
                        <span className={`${labelClasses} `}>
                            {currentSprint && currentSprint?.sprintMonth} {currentSprint && currentSprint?.sprintYear}
                        </span>
                    </div>

                    <div id='CustomerNotesFilter-filterSprint'>
                        <span className='flex gap-2 items-center'>
                            <select
                                className={`${inputClasses} min-w-[200px]`}
                                defaultValue=""
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
        </>
    )
}

export default CustomerNotesFilter