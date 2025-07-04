import React, { useContext, useEffect, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import axios from 'axios'

import PageHeading from '../components/PageHeading'
import SprintOverviewFilters from '../components/sprintoverview/SprintOverviewFilters'
import DefaultAccordion from '../components/sprintoverview/Accordion'
import { ConfigContext } from '../context/ConfigContext'
import { UserContext } from '../context/UserContext'

const SprintOverview = () => {
    const [selectedSprint, setSelectedSprint] = useState("")
    const [activeUsers, setActiveUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useContext(UserContext)

    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const handleSprintChange = (selectedValue, selectedSprint) => {
        setSelectedSprint(selectedSprint)
        setActiveUsers([])
        setIsLoading(true)

        fetchActiveUsers();
    }
    
    const fetchActiveUsers = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/users/fetch-active-users`)
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
                heading="Month Overview"
                subHeading={`An overview of your month`}
                suffix="Toggle between persons & customers, and filter by month."
            />

            <SprintOverviewFilters
                onSelectedSprint={handleSprintChange}
            ></SprintOverviewFilters>

            <section id="sprintOverviewFields" className='flex flex-col gap-4'>
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