import React, { useContext, useEffect, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import axios from 'axios'

import PageHeading from '../components/PageHeading'
import SprintOverviewFilters from '../components/sprintoverview/SprintOverviewFilters'
import DefaultAccordion from '../components/sprintoverview/Accordion'
import { ConfigContext } from '../context/ConfigContext'

const SprintOverview = () => {
    const [selectedSprint, setSelectedSprint] = useState("")
    const [activeUsers, setActiveUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const { baseURL } = useContext(ConfigContext);

    const handleSprintChange = (selectedValue, selectedSprint) => {
        setSelectedSprint(selectedSprint)
        setActiveUsers([])
        setIsLoading(true)

        fetchActiveUsers();
    }
    
    const fetchActiveUsers = async () => {
        try {
            const response = await axios.get(`${baseURL}/users/fetch-active-users`)
            if (response.status == 200) {
                setTimeout(() => {
                    setActiveUsers(response.data)
                    setIsLoading(false)
                }, 250)
            }

        } catch (error) {
            console.error('Failed to fetch active users', error)
        }
    }

    useEffect(() => {
        fetchActiveUsers()
    }, [])

    return (
        <div id="SprintOverviewPage">
            <PageHeading
                heading="Sprint Overview"
                subHeading={`An overview of your sprint`}
                suffix="Toggle between persons & customers, and filter by sprint."
            />

            <SprintOverviewFilters
                onSelectedSprint={handleSprintChange}
            ></SprintOverviewFilters>

            <section id="sprintOverviewFields" className='flex flex-col gap-4 relative'>
                {isLoading ? (
                    <div className="absolute top-5 left-0 w-full h-full flex items-center justify-center">
                        <FaSpinner className="animate-spin text-rose-500 text-4xl" />
                    </div>
                ) : (
                    activeUsers &&
                    activeUsers
                        .slice()
                        .sort((a, b) => a.username.localeCompare(b.username))
                        .map((userObj) => (
                            <DefaultAccordion 
                                key={userObj._id} 
                                userObject={userObj}
                                selectedSprint={selectedSprint} />
                        ))
                )}
            </section>
            
        </div>
    )
}

export default SprintOverview