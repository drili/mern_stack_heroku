import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { BsArchive } from "react-icons/bs"


import { ConfigContext } from '../../context/ConfigContext'
import { UserContext } from '../../context/UserContext'

const TaskModalSettings = ({ labelClasses, inputClasses, taskID, fetchTaskData, fetchTasks, task, closeModal, updateFunc, sprintOverviewFetch, fetchWorkflow, taskType, activeSprint, activeFilterUser, newSprintArray }) => {
    const [sprints, setSprints] = useState([])
    const [customers, setCustomers] = useState([])
    const [verticals, setVerticals] = useState([])
    const [usersNot, setUsersNot] = useState([])
    const [taskPersons, setTaskPersons] = useState([])
    const [percentageValues, setPercentageValues] = useState({})
    const [totalPercentage, setTotalPercentage] = useState(0)
    const [errorPercentage, setErrorPercentage] = useState(false)

    const [formDataSprint, setFormDataSprint] = useState({
        taskSprintId: ""
    })
    const [formDataSprintCustomer, setFormDataSprintCustomer] = useState({
        customerId: ""
    })
    const [formDataVerticalId, setFormDataVerticalId] = useState({
        taskVertical: ""
    })
    const [sprintToUse, setSprintToUse] = useState([])

    const { baseURL } = useContext(ConfigContext);
    const { user } = useContext(UserContext)    

    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const imageSrc = `${baseURL}/uploads/`

    const fetchSprints = async () => {
        try {
            const response = await axios.get(baseURL + "/sprints/fetch")
            setSprints(response.data)
        } catch (error) {
            console.error('Failed to fetch sprints', error);
        }
    }

    const fetchVerticals = async () => {
        try {
            const response = await axios.get(tenantBaseURL + "/verticals/fetch-verticals")
            setVerticals(response.data)
        } catch (error) {
            console.error('Failed to fetch verticals', error);
        }
    }

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/customers/fetch`)
            setTimeout(() => {
                setCustomers(response.data)
            }, 250)
        } catch (error) {
            console.error('Failed to fetch customers', error)
        }
    }

    const fetchUsersNotInTask = async (taskPersons) => {
        try {
            const response = await axios.post(tenantBaseURL + "/users/users-not-in-task", { taskPersons })
            setUsersNot(response.data)
        } catch (error) {
            console.error('Failed to fetch users not in task', error);
        }
    }

    const handleInputChangeVertical = async (e) => {
        setFormDataVerticalId((formDataVerticalId) => ({
            ...formDataVerticalId,
            [e.target.name]: e.target.value
        }))
    }

    const handleUpdateVertical = async (event) => {
        event.preventDefault()
        if (formDataVerticalId.taskVertical == "") return

        try {
            const response = await axios.put(`${tenantBaseURL}/tasks/update-vertical/${taskID}`, formDataVerticalId)
            if (response.status === 200) {
                toast('Task vertical updated successfully', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })

                fetchTaskData(taskID)
                if (fetchTasks) {
                    fetchTasks(sprintToUse, activeFilterUser)
                }
            }
        } catch (error) {
            console.error('Failed to update task', error)
            toast('There was an error updating task', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: "#fff"
                }
            })
        }
    }

    const handleUpdateCustomers = async (event) => {
        event.preventDefault()
        if (formDataSprintCustomer.customerId == "") return

        try {
            const response = await axios.put(`${tenantBaseURL}/tasks/update-customers/${taskID}`, formDataSprintCustomer)
            if (response.status === 200) {
                toast('Task customer updated successfully', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })

                fetchTaskData(taskID)
                if (fetchTasks) {
                    fetchTasks(sprintToUse, activeFilterUser)
                }
            }
        } catch (error) {
            console.error('Failed to update task', error)
            toast('There was an error updating task', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: "#fff"
                }
            })
        }
    }

    const handleUpdateSprint = async (event) => {
        event.preventDefault()
        if (formDataSprint.taskSprintId == "") return

        try {
            const response = await axios.put(`${tenantBaseURL}/tasks/update-sprint/${taskID}`, formDataSprint)
            if (response.status === 200) {
                toast('Task sprint updated successfully', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })

                fetchTaskData(taskID)
                if (fetchTasks) {
                    fetchTasks(sprintToUse, activeFilterUser)
                }
                // updateFunc()
            }
        } catch (error) {
            console.error('Failed to update task', error)
            toast('There was an error updating task', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: "#fff"
                }
            })
        }
    }

    const handleInputChange = async (e) => {
        setFormDataSprint((formDataSprint) => ({
            ...formDataSprint,
            [e.target.name]: e.target.value
        }))
    }

    const handleInputChangeCustomer = async (e) => {
        setFormDataSprintCustomer((formDataSprintCustomer) => ({
            ...formDataSprintCustomer,
            [e.target.name]: e.target.value
        }))
    }

    const handleAddTaskUser = async (assignedUserId) => {
        if (assignedUserId) {
            try {
                const response = await axios.put(`${tenantBaseURL}/tasks/assign-user/${taskID}`, { assignedUserId })
                if (response.status === 200) {
                    fetchTaskData(taskID)
                    if (fetchTasks) {
                        fetchTasks(sprintToUse, activeFilterUser)
                    }

                    // updateFunc()
                }
            } catch (error) {
                console.error('Failed to assign user to task:', error);
            }
        }
    }

    const handleRemoveUser = async (e) => {
        e.preventDefault()

        const taskPersonId = e.target.elements.taskPersonId.value
        if (!taskPersonId) {
            console.log('No taskPersonId')
        }

        try {
            const response = await axios.put(`${tenantBaseURL}/tasks/remove-user/${taskID}/${taskPersonId}`)
            if (response.status === 200) {
                fetchTaskData(taskID)
                if (fetchTasks) {
                    fetchTasks(sprintToUse, activeFilterUser)
                }
            }
        } catch (error) {
            console.error('Failed to remove user from task:', error)
        }
    }

    const handlePercentageUpdate = async (e) => {
        e.preventDefault()

        const totalPercentageCalc = Object.values(percentageValues).reduce(
            (total, value) => total + parseInt(value || 0, 10),
            0
        )

        setTotalPercentage(totalPercentageCalc)
        if (totalPercentageCalc != 100) {
            setErrorPercentage(true)
        } else {
            setErrorPercentage(false)

            const updatedPercentageData = {
                taskId: taskID,
                percentageValues: percentageValues
            }

            try {
                const response = await axios.post(`${tenantBaseURL}/tasks/update-percentage`, updatedPercentageData)

                if (response.status === 200) {
                    toast('Percentage updated successfully', {
                        duration: 4000,
                        position: 'top-center',
                        style: {
                            background: '#22c55e',
                            color: "#fff"
                        }
                    })

                    // sprintOverviewFetch()
                    updateFunc()
                    // fetchWorkflow()
                }
            } catch (error) {
                console.error("Error updating task percentage:", error)
            }
        }
    }

    const handlePercentageChange = async (userId, newValue) => {
        setPercentageValues((prevValues) => ({
            ...prevValues,
            [userId]: newValue
        }))
    }

    const handleArchiveTask = async (e) => {
        e.preventDefault()

        const isCurrentlyArchived = task.isArchived

        if (!confirm(`Are you sure you want to ${isCurrentlyArchived ? "unarchive" : "archive"} this task?`)) {
            return
        }

        const archiveTaskId = taskID

        try {
            const response = await axios.put(
                `${tenantBaseURL}/tasks/archive-task/${archiveTaskId}`, 
                { userId: user.id }
            )
            
            if (response.status === 200) {
                toast(`Task ${isCurrentlyArchived ? "unarchived" : "archived"} successfully`, {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
    
                if (fetchTasks) {
                    fetchTasks(sprintToUse, activeFilterUser)
                }
                closeModal()
            }
        } catch (error) {
            console.error('Failed to remove user from task:', error)
        }
    }

    useEffect(() => {
        if (task && task[0] && task[0].taskPersons) {
            const taskPersons = task[0].taskPersons

            setTaskPersons(taskPersons)
            fetchUsersNotInTask(taskPersons)
            fetchSprints()
            fetchCustomers()
            fetchVerticals()

            const newPercentageValues = { ...percentageValues }
            taskPersons.forEach((person) => {
                newPercentageValues[person.user._id] = person.percentage
            })
            setPercentageValues(newPercentageValues);
        }

        if (!newSprintArray) {
            setSprintToUse(activeSprint)
        } else {
            setSprintToUse(newSprintArray)
        }


    }, [task, fetchTaskData, taskID])

    return (
        <div className='mt-5 py-5 px-5 border-0 rounded-lg bg-stone-100 relative flex flex-col w-full outline-none focus:outline-none'>
            <h2 className='font-bold mb-5 text-lg'>Task settings</h2>
            <section className='flex gap-10'>
                <span className='w-full'>
                    <span id='sprints'>
                        <form className='grid grid-cols-12 gap-1 mb-1' onSubmit={handleUpdateSprint}>
                            <label className={`${labelClasses} col-span-12`} htmlFor="taskCustomer">Change task month</label>
                            <span className='w-[100%] col-span-6 pr-5'>
                                <select
                                    name="taskSprintId"
                                    placeholder="Select Month"
                                    required
                                    className={`${inputClasses} min-w-[200px]`}
                                    onChange={(e) => handleInputChange(e)}
                                >
                                    <option value="">Select Month</option>
                                    {sprints
                                        .map((sprint) => (
                                            <option value={sprint._id} key={sprint._id}>{sprint.sprintName}</option>
                                        ))
                                    }
                                </select>
                            </span>

                            <span className='w-[100%] col-span-6'>
                                <button type="submit" className='mb-4 h-[40px] w-full rounded text-slate-800 text-sm py-2 border border-zinc-400 cursor-pointer bg-white '>Update task month</button>
                            </span>
                        </form>
                    </span>

                    <span id='customers'>
                        <form className='grid grid-cols-12 gap-1 mb-1' onSubmit={handleUpdateCustomers}>
                            <label className={`${labelClasses} col-span-12`} htmlFor="taskCustomer">Change task customer</label>
                            <span className='w-[100%] col-span-6 pr-5'>
                                <select
                                    name="customerId"
                                    placeholder="Select Customer"
                                    required
                                    className={`${inputClasses} min-w-[200px]`}
                                    onChange={(e) => handleInputChangeCustomer(e)}
                                >
                                    <option value="">Select Customer</option>
                                    {customers
                                        .map((customer) => (
                                            <option value={customer._id} key={customer._id}>{customer.customerName}</option>
                                        ))
                                    }
                                </select>
                            </span>

                            <span className='w-[100%] col-span-6'>
                                <button type="submit" className='mb-4 h-[40px] w-full rounded text-slate-800 text-sm py-2 border border-zinc-400 cursor-pointer bg-white '>Update task customer</button>
                            </span>
                        </form>

                        <form className='grid grid-cols-12 gap-1 mb-1' onSubmit={handleUpdateVertical}>
                            <label className={`${labelClasses} col-span-12`} htmlFor="taskCustomer">Change task vertical</label>
                            <span className='w-[100%] col-span-6 pr-5'>
                                <select
                                    name="taskVertical"
                                    placeholder="Select Customer"
                                    required
                                    className={`${inputClasses} min-w-[200px]`}
                                    onChange={(e) => handleInputChangeVertical(e)}
                                >
                                    <option value="">Select Vertical</option>
                                    {verticals
                                        .map((vertical) => (
                                            <option value={vertical._id} key={vertical._id}>{vertical.verticalName}</option>
                                        ))
                                    }
                                </select>
                            </span>

                            <span className='w-[100%] col-span-6'>
                                <button type="submit" className='mb-4 h-[40px] w-full rounded text-slate-800 text-sm py-2 border border-zinc-400 cursor-pointer bg-white '>Update task vertical</button>
                            </span>
                        </form>
                    </span>

                    <span>
                        <h2 className='font-bold text-lg'>Task created by</h2>
                        <p>{task[0]?.createdBy?.username || "Uden ejer"}</p>
                    </span>
                </span>

                <div className="border-l-[1px] border-gray-200 h-auto"></div>

                <span className='w-full'>
                    <span id='taskUsers'>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <span className='flex flex-col gap-1'>
                                <label className={labelClasses} htmlFor="taskCustomer">Task user(s)</label>
                                <span>
                                    <select
                                        name="taskUsersNot"
                                        placeholder="Add User"
                                        required
                                        className={`${inputClasses} min-w-[200px] h-[40px]`}
                                        onChange={(e) => handleAddTaskUser(e.target.value)}
                                    >
                                        <option>Add User</option>
                                        {usersNot
                                            .map((user) => (
                                                <option value={user._id} key={user._id}>{user.email}</option>
                                            ))
                                        }
                                    </select>
                                </span>
                            </span>
                        </form>

                        <span id='assignedUsers' className='flex flex-col gap-1 mb-5'>
                            {taskPersons
                                .map((user) => (
                                    <div key={user.user._id} id={user.user._id}>
                                        <span className='flex gap-2 items-center mb-1 border border-zinc-100 p-2 rounded-lg justify-between'>
                                            <section className='flex gap-2 items-center'>
                                                <img className='w-[25px] h-[25px] object-cover object-center rounded' src={`${imageSrc}${user.user.profileImage}`} />
                                                <p className='font-bold text-sm whitespace-nowrap'>{user.user.username}</p>

                                                {taskPersons.length > 1 && (
                                                    <form onSubmit={(e) => handleRemoveUser(e)}>
                                                        <input type="hidden" name='taskPersonId' value={user.user._id} />
                                                        <button type="submit" className='border-rose-950 px-2 py-0 text-sm'>Remove</button>
                                                    </form>
                                                )}
                                            </section>

                                            <section className='flex gap-2 items-center'>
                                                {taskPersons.length > 1 && (
                                                    <>
                                                        <form
                                                            className='flex items-center gap-2'
                                                            onSubmit={(e) => handlePercentageUpdate(e, user.user._id)}
                                                        >
                                                            <input type="hidden" name='taskPersonId' value={user.user._id} />

                                                            {taskType !== "quickTask" && (
                                                                <>
                                                                    <span className='flex items-center gap-2 mr-2'>
                                                                        <input
                                                                            className="max-w-[100px] px-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-0      "
                                                                            type="number"
                                                                            max="100"
                                                                            min="1"
                                                                            value={percentageValues[user.user._id] || ''}
                                                                            onChange={(e) => handlePercentageChange(user.user._id, e.target.value)}
                                                                            name="personPercentage"
                                                                        />
                                                                        <label className='text-xs font-normal whitespace-nowrap' htmlFor="personPercentage">% alloc</label>
                                                                    </span>
                                                                    <button type="submit" className='border-rose-500 px-2 py-0 text-sm'>Update</button>
                                                                </>
                                                            )}

                                                        </form>
                                                    </>
                                                )}
                                            </section>
                                        </span>
                                    </div>
                                ))
                            }

                            {errorPercentage && (
                                <div className='flex flex-col gap-1 text-right justify-end'>
                                    <p className='text-xs text-rose-950'>There was an error, total percent allocation is not equal 100%</p>
                                    <p className='text-xs underline'>Current total allocation percentage: {totalPercentage}%</p>
                                </div>
                            )}

                        </span>

                        <span id='archiveTask'>
                            <hr className='mb-5' />
                            <form onSubmit={handleArchiveTask}>
                                <label className={labelClasses} htmlFor="archiveTaskId">
                                    {task[0]?.isArchived ? "Unarchive task" : "Archive task"}
                                </label>
                                <button
                                    type="submit"
                                    className={`flex items-center justify-center gap-2 mt-2 h-[40px] w-full rounded text-white text-sm py-2 border-none cursor-pointer ${task[0].isArchived ? 'bg-green-700' : 'bg-pink-900'}`}
                                >
                                    {task[0].isArchived ? "Unarchive task" : "Archive task"}
                                    <BsArchive className='text-xs text-white' />
                                </button>
                            </form>
                        </span>
                    </span>
                </span>
            </section>

        </div>
    )
}

export default TaskModalSettings