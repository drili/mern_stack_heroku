import React, { useContext, useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import axios from "axios"
import Select from "react-select"
import toast, { Toaster } from 'react-hot-toast'
import { Modal } from "flowbite-react";

import { BiSolidTimeFive } from "react-icons/bi"
import { AiOutlineClockCircle } from "react-icons/ai"
import { BsFillLightningChargeFill } from "react-icons/bs";
import { FaDivide } from "react-icons/fa";
import { AiFillPlusCircle } from "react-icons/ai"

import { UserContext } from '../context/UserContext'
import TaskModal from '../components/task/TaskModal'
import TaskCard from '../components/task/TaskCard'
import getCurrentSprint from '../functions/getCurrentSprint'
import { ConfigContext } from '../context/ConfigContext'
import ModalCreateLabel from '../components/modals/ModalCreateLabel'
import ModalCreateVertical from '../components/modals/ModalCreateVertical'

const CreateTask = () => {
    const [customers, setCustomers] = useState([])
    const [sprints, setSprints] = useState([])
    const [labels, setLabels] = useState([])
    const [verticals, setVerticals] = useState([])
    const [activeUsers, setActiveUsers] = useState([])
    const { user } = useContext(UserContext)
    const [tasks, setTasks] = useState([])
    const [selectedSprints, setSelectedSprints] = useState([]);
    const [displayCount, setDisplayCount] = useState(5)
    const [toggleViewState, setToggleViewState] = useState("timedTask")
    const [toggleShowAdjustPercentages, setToggleShowAdjustPercentages] = useState(false)
    const [percentageAllocations, setPercentageAllocations] = useState([]);

    const [taskData, setTaskData] = useState({
        taskName: '',
        taskTimeLow: '',
        taskTimeHigh: '',
        taskDescription: '',
        taskCustomer: '',
        taskLabel: '',
        taskVertical: '',
        taskPersons: [],
        taskSprints: [],
        createdBy: '',
        taskDeadline: '',
        estimatedTime: 0,
        taskType: "timedTask",
        tenantId: user.tenant_id,
        upcomingDeadlineNotificationSent: false,
        deadlineNotificationSent: false,
    });

    const activeSprint = getCurrentSprint()

    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const inputClasses = "h-[40px] border rounded focus:border-pink-700 p-0 px-3 w-full block mb-4"
    const inputClasses2 = "h-[40px] border rounded focus:border-pink-700 p-0 px-3 w-full block mb-1"
    const labelClasses = "text-sm font-medium mb-2 block "
    const imageSrc = baseURL + "/uploads/"

    const [openFlowbiteModal_label, setOpenFlowbiteModal_label] = useState(false)
    const [openFlowbiteModal_vertical, setOpenFlowbiteModal_vertical] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setTaskData({
            ...taskData,
            [name]: value
        })
    }

    const handleTogglePercentAlloc = () => {
        setToggleShowAdjustPercentages(!toggleShowAdjustPercentages)
    }

    const handleViewState = (value) => {
        setTaskData((taskData) => ({
            ...taskData,
            taskDeadline: "",
            estimatedTime: 0,
            taskTimeLow: '',
            taskTimeHigh: '',
            taskType: value,
        }))

        if (value === "quickTask") {
            setTaskData((taskData) => ({
                ...taskData,
                taskTimeLow: 0,
                taskTimeHigh: 0,
            }))
        }

        setToggleViewState(value)
    }

    const handleLoadMore = () => {
        setDisplayCount(prevCount => prevCount + 5)
    }

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/tasks/fetch-by-user/${user.id}?tenantId=${user.tenant_id}`)
            setTasks(response.data)

        } catch (error) {
            console.error('Failed to fetch tasks', error);
        }
    }

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/customers/fetch?tenantId=${user.tenant_id}`)
            setCustomers(response.data)
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/users/fetch-active-users?tenantId=${user.tenant_id}`)

            setActiveUsers(response.data)
        } catch (error) {
            console.error('Failed to fetch active users', error);
        }
    }

    const fetchSprints = async () => {
        try {
            const response = await axios.get(baseURL + "/sprints/fetch?activeYear=" + user.active_year)
            setSprints(response.data)
        } catch (error) {
            console.error('Failed to fetch sprints', error);
        }
    }

    const fetchLabels = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/labels/fetch-labels?tenantId=${user.tenant_id}`);

            const labelsData = response.data;
            const defaultLabelId = labelsData.find(label => label.labelName === "Ingen label")?._id;

            setLabels(response.data)
            setTaskData(prevData => ({
                ...prevData,
                taskLabel: prevData.taskLabel || defaultLabelId
            }));
        } catch (error) {
            console.error('Failed to fetch labels', error);
        }
    }

    const fetchVerticals = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/verticals/fetch-verticals?tenantId=${user.tenant_id}`);

            setVerticals(response.data)

            if (response.data.length > 0) {
                const firstVerticalId = response.data[0]._id;
                setTaskData(prevData => ({
                    ...prevData,
                    taskVertical: firstVerticalId,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch verticals', error);
        }
    }

    useEffect(() => {
        setTaskData((taskData) => ({
            ...taskData,
            createdBy: user.id
        }))
        fetchSprints()
        fetchUsers()
        fetchTasks()
        fetchCustomers()
        fetchLabels()
        fetchVerticals()
    }, [])

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleFormChangeSprints = (selectedOptions) => {
        setSelectedSprints(selectedOptions);
        setTaskData((prevData) => ({
            ...prevData,
            taskSprints: selectedOptions.map((option) => option.value)
        }));
    }

    const handleFormChangeUsers = (selectedOptions) => {
        const numberOfUsers = selectedOptions.length

        const personsWithPercentage = selectedOptions.map((option) => ({
            user: option.value,
            percentage: Number((100 / numberOfUsers).toFixed(0)),
        }))

        setTaskData((prevData) => ({
            ...prevData,
            taskPersons: personsWithPercentage
        }))
    }

    const createTaskNotification = async (data) => {  
        try {
            const response = await axios.post(tenantBaseURL + "/notifications/create-notification-task", { data })
        } catch (error) {
            console.error('Failed to create task notification', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let finalTaskData = { 
            ...taskData,
        }

        if (toggleShowAdjustPercentages) {
            const updatedTaskPersons = updateTaskDataWithNewPercentages()
            finalTaskData = {
                ...taskData,
                taskPersons: updatedTaskPersons
            }
        }

        try {
            const response = await axios.post(`${baseURL}/${user.tenant_id}/tasks/create?tenantId=${user.tenant_id}`, finalTaskData)

            setTasks([])

            if (response.status === 200) {
                toast('Task created successfully', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })

                fetchTasks()
                console.log(response.data)
                createTaskNotification(response.data)
            }

        } catch (error) {
            console.error('Failed to create task', error)
            toast('There was an error creating task', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: "#fff"
                }
            })
        }
    }

    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const handleTaskModal = (taskId) => {
        setShowModal(true)
        setSelectedTaskId(taskId)
    }

    const onCloseModal = () => {
        setShowModal(false)
        toast.dismiss()
    }

    useEffect(() => {
        if (activeSprint.sprintId) {
            const activeSprintOption = sprints.find(sprint => sprint._id === activeSprint.sprintId);
            if (activeSprintOption) {
                setSelectedSprints([{ value: activeSprintOption._id, label: activeSprintOption.sprintName }]);
            }

            setTaskData((prevData) => ({
                ...prevData,
                taskSprints: [activeSprintOption?._id]
            }));
        }
    }, [activeSprint, sprints]);

    const handlePercentageChange = (userId, newPercentage) => {
        setPercentageAllocations(currentAllocations =>
            currentAllocations.map(allocation =>
                allocation.user === userId ? { ...allocation, percentage: newPercentage === "" ? "" : Number(newPercentage) } : allocation
            )
        );
    }

    const updateTaskDataWithNewPercentages = () => {
        return percentageAllocations
    }

    useEffect(() => {
        setPercentageAllocations(taskData.taskPersons.map(person => ({
            user: person.user,
            percentage: person.percentage || Number((100 / taskData.taskPersons.length).toFixed(0))
        })))
    }, [taskData.taskPersons])

    return (
        <div id='createTaskPage'>
            <PageHeading
                heading="Create Task"
                subHeading={`Create a new task.`}
                suffix="Complete the form and submit the data."
            />

            <section className='grid grid-cols-5 gap-10 mb-10'>
                <span className='py-10 px-10 flex rounded-extra-large border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-full border-gray-200 shadow-none col-span-3'>
                    <form onSubmit={handleSubmit}>
                        <span>
                            <section className='flex w-full justify-between'>
                                <div>
                                    <h2 className='text-lg md:text-2xl text-black font-bold'>Create new <span className={`${toggleViewState === "timedTask" ? "text-pink-700" : "text-teal-200"}`}>
                                        {toggleViewState === "timedTask" ? "timed" : "quick"}</span> task
                                    </h2>
                                </div>

                                <div className='flex items-start pb-0 rounded-t'>
                                    <button
                                        className={`${toggleViewState === "timedTask" ?
                                            "bg-pink-700 text-white" : ""} 
                                            rounded-none flex gap-2 items-center focus:outline-none border-none`}
                                        onClick={() => handleViewState("timedTask")}
                                        type='button'
                                    >
                                        Timed task <AiOutlineClockCircle />
                                    </button>
                                    <button
                                        className={`${toggleViewState === "quickTask" ?
                                            "bg-teal-200 text-white border-none" : ""} 
                                            rounded-none flex gap-2 items-center focus:outline-none border-none`}
                                        onClick={() => handleViewState("quickTask")}
                                        type='button'
                                    >
                                        Quick task <BsFillLightningChargeFill />
                                    </button>
                                </div>
                            </section>

                            <hr className='mb-5' />
                        </span>

                        <div>
                            <label htmlFor="taskName" className={labelClasses}>Task name</label>
                            <input type="text" name="taskName" value={taskData.taskName} onChange={handleFormChange} placeholder="Task Name" required
                                className={inputClasses} />
                        </div>

                        {toggleViewState === "timedTask" ? (
                            <span className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className={labelClasses} htmlFor="taskTimeLow">Task time low</label>
                                    <input type="number" name="taskTimeLow" value={taskData.taskTimeLow} onChange={handleFormChange} placeholder="Task Time Low" required
                                        className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses} htmlFor="taskTimeHigh">Task time high</label>
                                    <input type="number" name="taskTimeHigh" value={taskData.taskTimeHigh} onChange={handleFormChange} placeholder="Task Time High" required
                                        className={inputClasses} />
                                </div>

                                <span className='hidden'>
                                    <input type='hidden' value={taskData.taskType} name='taskType' />
                                </span>
                            </span>
                        ) : (
                            <span className='grid grid-cols-2 gap-4'>
                                <span>
                                    <label className={labelClasses} htmlFor="taskDeadline">Deadline</label>
                                    <input
                                        className={inputClasses}
                                        type="date"
                                        name='taskDeadline'
                                        required
                                        onChange={handleInputChange}
                                    />
                                </span>
                                <div>
                                    <label className={labelClasses} htmlFor="estimatedTime">Estimated time <span className='text-slate-300'>optional</span></label>
                                    <input type="number" name="estimatedTime" value={taskData.estimatedTime} onChange={handleFormChange} placeholder="Estimated Task Time"
                                        className={inputClasses} />
                                </div>

                                <span className='hidden'>
                                    <input type='hidden' value={taskData.taskType} name='taskType' />
                                </span>
                            </span>
                        )}

                        <div>
                            <label className={labelClasses} htmlFor="taskDescription">Task description (optional)</label>
                            <textarea required={false} name="taskDescription" value={taskData.taskDescription} onChange={handleFormChange} placeholder="Task Description"
                                className={`${inputClasses} py-3 min-h-[100px]`} />
                        </div>
                        <div>
                            <label className={labelClasses} htmlFor="taskCustomer">Task customer</label>
                            <select
                                name="taskCustomer"
                                onChange={handleFormChange}
                                placeholder="Task Customer"
                                required
                                className={inputClasses}
                            >
                                <option>Select customer</option>
                                {customers
                                    .filter((customer) => !customer.isArchived)
                                    .map((customer) => (
                                        <option value={customer._id} key={customer._id}>{customer.customerName}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <span className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className={labelClasses} htmlFor="taskLabel">Task label</label>
                                <select
                                    onChange={handleFormChange}
                                    name="taskLabel"
                                    placeholder='Task label'
                                    required
                                    value={taskData.taskLabel}
                                    className={`${inputClasses2}`}>
                                    <option disabled>Select label</option>
                                    {labels
                                        .map((label) => (
                                            <option
                                                value={label._id}
                                                key={label._id}
                                            >{label.labelName}</option>
                                        ))
                                    }
                                </select>
                                {user?.user_role == "1" ? (
                                    <p className='text-sm flex items-center gap-1 mb-4 text-teal-500 cursor-pointer' onClick={() => setOpenFlowbiteModal_label(true)}>Create new label <AiFillPlusCircle size={15} /></p>
                                ) : (
                                    <span className='mb-4 block'></span>
                                )}
                            </div>
                            <div>
                                <label className={labelClasses} htmlFor="taskVertical">Task vertical</label>
                                <select
                                    onChange={handleFormChange}
                                    name="taskVertical"
                                    placeholder='Task vertical'
                                    required
                                    className={inputClasses2}>
                                    <option disabled>Select vertical</option>
                                    {verticals
                                        .map((vertical) => (
                                            <option value={vertical._id} key={vertical._id}>{vertical.verticalName}</option>
                                        ))
                                    }
                                </select>
                                {user?.user_role == "1" ? (
                                    <p className='text-sm flex items-center gap-1 mb-4 text-teal-500 cursor-pointer' onClick={() => setOpenFlowbiteModal_vertical(true)}>Create new vertical <AiFillPlusCircle size={15} /></p>
                                ) : (
                                    <span className='mb-4 block'></span>
                                )}
                            </div>
                        </span>

                        <div className='mt-0'>
                            <label className={labelClasses} htmlFor="taskPersons">Task persons</label>
                            <Select
                                name="taskPersons"
                                onChange={handleFormChangeUsers}
                                options={activeUsers.map((user) => ({
                                    value: user._id,
                                    label: user.username
                                }))}
                                isMulti
                                required
                            ></Select>

                            {taskData?.taskPersons?.length > 1 && (
                                <p
                                    onClick={handleTogglePercentAlloc}
                                    className='text-blue-700 text-sm cursor-pointer mt-2 flex align-center items-center gap-1'>
                                    Adjust percentage allocations <FaDivide className='text-xs' />
                                </p>
                            )}

                            {toggleShowAdjustPercentages && (
                                <div className='mt-5'>
                                    {percentageAllocations.map((allocation, index) => {
                                        const matchingUser = activeUsers.find(user => user._id === allocation.user);
                                        const displayName = matchingUser ? matchingUser.username : allocation.user;

                                        return (
                                            <div key={index} className='grid grid-cols-12 items-center mb-2'>
                                                <p className='col-span-4 text-sm'>{displayName}</p>
                                                <input
                                                    type="number"
                                                    value={allocation.percentage}
                                                    max="100"
                                                    min="1"
                                                    onChange={(e) => handlePercentageChange(allocation.user, e.target.value)}
                                                    className={`mb-0 col-span-2 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className='mt-4'>
                            <label className={labelClasses} htmlFor="taskSprints">Task month</label>
                            {activeSprint && selectedSprints && sprints && (
                                <Select
                                    name="taskSprints"
                                    onChange={handleFormChangeSprints}
                                    options={sprints.map((sprint) => ({
                                        value: sprint._id,
                                        label: sprint.sprintName
                                    }))}
                                    isMulti
                                    required
                                    value={selectedSprints}
                                ></Select>
                            )}
                        </div>

                        {/* <p>Current sprint: {activeSprint.sprintId}</p> */}

                        <button type="submit" className='bg-black text-white py-3 rounded mt-10 w-full'>Create Task</button>
                    </form>
                </span>

                <span className='col-span-2'>
                    <div className='bg-stone-100 w-full p-[2rem] md:p-10 rounded-extra-large'>
                        <span>
                            <h2 className='text-lg md:text-2xl text-black font-bold mb-3'>Your Recent Created Tasks</h2>
                            <hr className='mb-5' />
                        </span>

                        <span id='tasksList' className='flex flex-col gap-2'>
                            {tasks.slice(0, displayCount).map((task) => (
                                <span
                                    key={task._id}
                                    onClick={() => handleTaskModal(task._id)}
                                >
                                    <TaskCard
                                        key={task._id}
                                        taskId={task._id}
                                        taskName={task.taskName}
                                        taskDescription={task.taskDescription}
                                        taskPersons={task.taskPersons}
                                        customerName={task.taskCustomer.customerName}
                                        customerColor={task.taskCustomer.customerColor}
                                        taskLow={task.taskTimeLow}
                                        taskHigh={task.taskTimeHigh}
                                        taskSprintName={task.taskSprints[0].sprintName}
                                        taskType={task.taskType}
                                        estimatedTime={task?.estimatedTime}
                                        taskDeadline={task?.taskDeadline}
                                    ></TaskCard>
                                </span>
                            ))}
                        </span>

                        <span>
                            {displayCount < tasks.length && (
                                <button onClick={handleLoadMore}
                                    className='rounded w-full mt-5 text-sm min-h-[45px] border border-zinc-400 cursor-pointer  bg-pink-700 border-none text-white'>
                                    Load more tasks
                                </button>
                            )}
                        </span>
                    </div>
                </span>

                <ModalCreateLabel 
                    openFlowbiteModal={openFlowbiteModal_label}
                    setOpenFlowbiteModal={setOpenFlowbiteModal_label}
                    tenantBaseURL={tenantBaseURL}
                    fetchVerticals={fetchVerticals}
                    fetchLabels={fetchLabels}
                />
                <ModalCreateVertical 
                    openFlowbiteModal={openFlowbiteModal_vertical}
                    setOpenFlowbiteModal={setOpenFlowbiteModal_vertical}
                    tenantBaseURL={tenantBaseURL}
                    fetchVerticals={fetchVerticals}
                    fetchLabels={fetchLabels}
                />
            </section>

            {selectedTaskId && (
                <TaskModal
                    taskID={selectedTaskId}
                    showModalState={showModal}
                    // onCloseModal={() => setShowModal(false)}
                    onCloseModal={onCloseModal}
                    fetchTasks={fetchTasks}
                />
            )}
        </div>
    )
}

export default CreateTask