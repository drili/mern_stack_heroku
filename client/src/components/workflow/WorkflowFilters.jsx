import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { BsSearch, BsCalendarFill } from "react-icons/bs"
import { BiUser } from "react-icons/bi"
import { FaUserGroup } from "react-icons/fa6";
import { ToggleSwitch } from "flowbite-react";

import { UserContext } from '../../context/UserContext'
import { ConfigContext } from '../../context/ConfigContext';

const WorkflowFilters = ({
    activeSprint,
    fetchTasksByUserAndSprint,
    updateFilteredTasks,
    updatedFilteredTasksCustomer,
    setNewSprintArray,
    fetchDeadlineTasks,
    activeFilterUser,
    setActiveFilterUser,
    toggleSmallCards,
    setToggleSmallCards
}) => {
    const [sprints, setSprints] = useState([])
    const [customers, setCustomers] = useState([])
    const [users, setUsers] = useState([])
    const [currentSprint, setCurrentSprint] = useState([])
    const [searchTerm, setSearchTerm] = useState("")

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer "
    const labelClasses = "h-full flex flex-col justify-center bg-teal-200 border-none text-slate-800 border rounded px-4 py-1 text-sm border border-zinc-400 "

    const handleToggleCardState = async () => {
        setToggleSmallCards(!toggleSmallCards)
        localStorage.setItem("toggleSmallCards", JSON.stringify(!toggleSmallCards))
    }

    const fetchSprints = async () => {
        try {
            const response = await axios.get(`${baseURL}/sprints/fetch?activeYear=${user.active_year}`)
            setSprints(response.data)
        } catch (error) {
            console.error('Failed to fetch sprints', error);
        }
    }

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(tenantBaseURL + "/customers/fetch")
            setCustomers(response.data)
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get(tenantBaseURL + "/users/fetch-active-users")
            setUsers(response.data)
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    }

    const handleUserChange = async (event) => {
        const userId = event
        fetchTasksByUserAndSprint(currentSprint, userId)
        fetchDeadlineTasks(userId)
        setActiveFilterUser(userId)

    }

    const handleSprintChange = async (selectedValue) => {
        const [id, sprintName, sprintYear, sprintMonth] = selectedValue.split('|');
        const newSprintArray = { ...currentSprint }


        newSprintArray.sprintMonth = sprintMonth
        newSprintArray.sprintYear = sprintYear

        setNewSprintArray(newSprintArray);

        setCurrentSprint(newSprintArray)
        fetchTasksByUserAndSprint(newSprintArray, activeFilterUser)
        fetchDeadlineTasks(activeFilterUser)
    }

    const handleSearchTerm = async (e) => {
        const newSearchTerm = e.target.value
        setSearchTerm(newSearchTerm)
        updateFilteredTasks(newSearchTerm)
    }

    const handleCustomerChange = async (selectedValue) => {
        const [_id, customerName] = selectedValue.split('|')

        updatedFilteredTasksCustomer(customerName)
    }

    useEffect(() => {
        fetchSprints()
        fetchCustomers()
        fetchUsers()
        setCurrentSprint(activeSprint)

        setActiveFilterUser(user._id)
    }, [activeSprint])

    return (
        <>
            <div id='WorkflowFilters' className='py-4 px-5 rounded-lg bg-[#f2f3f4] relative flex flex-col w-full outline-none focus:outline-none mb-5'>
                <section className='flex justify-end gap-8 flex-col md:flex-row'>
                    <div id='WorkflowFilters-activeSprint'>
                        <span className={`${labelClasses} `}>
                            {currentSprint && currentSprint?.sprintMonth} {currentSprint && currentSprint?.sprintYear}
                        </span>
                    </div>

                    <div id='WorkflowFilters-searchField'>
                        <span className='flex gap-2 items-center'>
                            <input
                                type="text"
                                className={`${inputClasses} min-w-[200px]`}
                                placeholder='Search task(s)'
                                onChange={handleSearchTerm}
                            />
                            <BsSearch size={20}></BsSearch>
                        </span>
                    </div>

                    <div id='WorkflowFilters-filterSprint'>
                        <span className='flex gap-2 items-center'>
                            <select
                                className={`${inputClasses} min-w-[200px]`}
                                defaultValue=""
                                onChange={(e) => handleSprintChange(e.target.value)}
                            >
                                <option disabled value="">Select month</option>
                                {sprints && sprints.map((sprint) => (
                                    <option key={sprint?._id} value={`${sprint?._id}|${sprint?.sprintName}|${sprint?.sprintYear}|${sprint.sprintMonth}`}>
                                        {sprint?.sprintName}
                                    </option>
                                ))}
                            </select>
                            <BsCalendarFill size={20}></BsCalendarFill>
                        </span>
                    </div>

                    <div id='WorkflowFilters-filterCustomer'>
                        <span className='flex gap-2 items-center'>
                            <select
                                className={`${inputClasses} min-w-[200px]`}
                                defaultValue=""
                                onChange={(e) => handleCustomerChange(e.target.value)}
                            >
                                <option disabled value="">Select customer</option>
                                {customers.map((customer) => (
                                    <option key={customer?._id} value={`${customer?._id}|${customer?.customerName}`}>{customer?.customerName}</option>
                                ))}
                            </select>
                            <FaUserGroup size={20} />
                        </span>
                    </div>

                    <div id='WorkflowFilters-filterUsers'>
                        <span className='flex gap-2 items-center'>
                            <select
                                className={`${inputClasses} min-w-[200px]`}
                                defaultValue=""
                                onChange={(e) => handleUserChange(e.target.value)}
                            >
                                <option disabled value="">Select user</option>
                                {users.map((user) => (
                                    <option key={user?._id} value={`${user?._id}`}>{user?.username}</option>
                                ))}
                            </select>
                            <BiUser size={20}></BiUser>
                        </span>
                    </div>
                </section>
            </div>

            <div id="workflowFilters-2" className='py-4 px-5 border-0 rounded-lg relative flex flex-col w-full outline-none focus:outline-none mb-5'>
                <div id='workflowFilters-toggleSmallCards' className='flex flex-row-reverse'>
                    
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" class="sr-only peer" checked={toggleSmallCards === true ? "checked" : ""} onClick={handleToggleCardState}/>
                        <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        <p class="ms-3 text-black text-sm font-medium">Small Cards</p>
                    </label>

                </div>
            </div>
        </>
    )
}

export default WorkflowFilters