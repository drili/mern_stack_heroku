import React, { useContext, useEffect, useRef, useState } from 'react'
import { BsFillLightningChargeFill, BsXLg } from "react-icons/bs";
import { AiOutlineClockCircle } from "react-icons/ai"
import { FaCalendar, FaClock, FaPaperclip } from "react-icons/fa";
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

import TaskModalSettings from './TaskModalSettings'
import TaskTimeRegistration from './TaskTimeRegistration'
import TaskChat from './TaskChat'
import { ConfigContext } from '../../context/ConfigContext';
import { UserContext } from '../../context/UserContext';
import LabelSmall from '../LabelSmall';
import TaskTimeRegistrations from './TaskTimeRegistrations';

const TaskModal = ({ taskID, showModalState, onCloseModal, fetchTasks, updateFunc, sprintOverviewFetch, fetchDeadlineTasks, activeSprint, activeFilterUser, newSprintArray }) => {
    const { user } = useContext(UserContext)
    const [showModal, setShowModal] = useState(false)
    const [task, setTask] = useState([])
    const [taskSprint, setTaskSprint] = useState([])
    const [formData, setFormData] = useState({
        taskName: "",
        taskTimeLow: "",
        taskTimeHigh: "",
        taskDescription: "",
        taskDeadline: "",
        estimatedTime: 0,
    })
    const [toggleViewState, setToggleViewState] = useState("task")

    // const inputClasses = "mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
    // const labelClasses = "block mb-2 text-sm font-medium text-gray-900 "
    const inputClasses = "h-[40px] border rounded focus:border-pink-700 p-0 px-3 w-full block mb-4"
    const labelClasses = "text-sm font-medium mb-2 block "

    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;
    const modalContentRef = useRef(null)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(taskID)
            .then(() => {
                toast(`Task ID "${taskID}" copied to your clipboard`, {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#f8fafc',
                        color: "#000"
                    }
                })
            })
            .catch((err) => {
                console.error("Failed to copy task ID:", err);
            })
    }

    const handleViewState = (value) => {
        setToggleViewState(value)
    }

    const handleInputChange = (event) => {
        setFormData((formData) => ({
            ...formData,
            [event.target.name]: event.target.value
        }))
    }

    const fetchTaskData = async (taskID) => {
        if (taskID) {
            const response = await axios.get(`${tenantBaseURL}/tasks/fetch-by-id/${taskID}`)

            setTask(response.data)
            setFormData((formData) => ({
                ...formData,
                taskName: response.data[0]["taskName"],
                taskTimeLow: response.data[0]["taskTimeLow"],
                taskTimeHigh: response.data[0]["taskTimeHigh"],
                taskDescription: response.data[0]["taskDescription"],
                taskDeadline: response.data[0]["taskDeadline"],
                estimatedTime: response.data[0]["estimatedTime"],
            }))
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setTask([])
        onCloseModal()
        toast.dismiss()
    }

    // TODO: Finish function
    const handleClickOutside = (event) => {

    }

    useEffect(() => {
        if (showModalState) {
            setTimeout(() => {
                const taskElement = document.querySelector(`.taskModalComponent`)
                if (taskElement) {
                    const offset = -0
                    window.scroll({
                        top: taskElement.getBoundingClientRect().top + window.scrollY + offset,
                        behavior: 'smooth',
                    })
                }
            }, 250)
        }

        setShowModal(showModalState)
        fetchTaskData(taskID)

        // FIXME: Use state to check whether handleClickOutside function is active or not
        // document.addEventListener("mousedown", handleClickOutside)
    }, [showModalState])

    const handleUpdateTask = async (event) => {
        event.preventDefault()

        try {
            const response = await axios.put(`${tenantBaseURL}/tasks/update/${taskID}`, formData)

            if (response.status === 200) {
                toast('Task updated successfully', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
            }

            if (fetchTasks) {
                fetchTasks()
            }
            if (updateFunc) {
                updateFunc()
            }
            if (fetchDeadlineTasks) {
                fetchDeadlineTasks("")
            }
            // sprintOverviewFetch()
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

    return (
        <div id={`taskID_${taskID}`} className=''>
            <>
                {showModal ? (
                    <>
                        <div className='absolute z-50 top-0 w-full translate-x-[-50%] left-[50%]'>
                            <div className="relative my-6 mx-auto max-w-screen-xl w-full taskModalComponent">
                                <div className="border-0 rounded-extra-large shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

                                    <div className='flex items-center gap-2 px-4 pt-10 pb-0 rounded-t md:px-10'>
                                        <LabelSmall
                                            classes={``}
                                            backgroundColor=""
                                            borderColor={task[0]?.taskCustomer?.customerColor}
                                        >
                                            {task[0]?.taskCustomer?.customerName}
                                        </LabelSmall>

                                        <LabelSmall>
                                            {task[0]?.taskSprints[0]?.sprintName} <FaCalendar />
                                        </LabelSmall>

                                        <LabelSmall>
                                            <span className='flex gap-2 hover:cursor-pointer items-center' onClick={copyToClipboard}>ID: {taskID} <FaPaperclip /></span>
                                        </LabelSmall>

                                        {task[0]?.taskType === "quickTask" && (
                                            <>
                                                <LabelSmall
                                                    classes={`bg-teal-50 text-teal-500`}
                                                >
                                                    Quick Task <BsFillLightningChargeFill className='text-teal-500' />
                                                </LabelSmall>

                                                <LabelSmall
                                                    classes={`bg-teal-50 text-teal-500`}
                                                >
                                                    {task[0]?.taskDeadline}<FaClock />
                                                </LabelSmall>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-start justify-between py-6 rounded-t md:px-10 gap-8">
                                        <span>
                                            <h3 className="text-lg md:text-2xl text-black font-extrabold">
                                                {formData["taskName"]}
                                            </h3>

                                        </span>
                                        <button
                                            className="absolute right-10 top-10 text-white rounded-full h-[50px] w-[50px] bg-black font-bold uppercase text-sm focus:outline-none ease-linear transition-all duration-150 flex justify-center items-center"
                                            type="button"
                                            onClick={closeModal}
                                        >
                                            <h4 className='text-2xl'><BsXLg></BsXLg></h4>
                                        </button>
                                    </div>

                                    <div className='flex items-start px-4 pb-0 rounded-t md:px-10'>
                                        <button className={`${toggleViewState === "task" ? "bg-pink-700 text-white " : "bg-pink-100"} rounded-none focus:outline-none focus:border-none border-none outline-none mr-1`} onClick={() => handleViewState("task")}>Task</button>
                                        <button className={`${toggleViewState === "taskChat" ? "bg-pink-700 text-white " : " bg-pink-50"} rounded-none focus:outline-none focus:border-none border-none outline-none mr-1`} onClick={() => handleViewState("taskChat")}>Task settings</button>
                                        {task[0]?.taskType !== "quickTask" && (
                                            <button className={`${toggleViewState === "taskTimeRegistrations" ? "bg-pink-700 text-white " : " bg-pink-50"} rounded-none focus:outline-none focus:border-none border-none outline-none mr-1`} onClick={() => handleViewState("taskTimeRegistrations")}>Time registrations</button>
                                        )}
                                    </div>

                                    {toggleViewState === "task" ? (
                                        <div className="relative p-4 pt-0 flex-auto md:p-10 md:pt-0">
                                            <hr />

                                            <div className={`${task[0]?.taskType !== "quickTask" ? "md:grid-cols-2 gap-5 md:gap-10" : "md:grid-cols-0"} grid`}>
                                                <section className='mt-5'>
                                                    {task[0]?.taskType !== "quickTask" && (
                                                        <div className='mt-5 pt-6 px-6 border-0 bg-stone-100 rounded-lg relative flex flex-col w-full outline-none focus:outline-none h-full'>
                                                            {task && (
                                                                <TaskTimeRegistration
                                                                    labelClasses={labelClasses}
                                                                    inputClasses={inputClasses}
                                                                    taskId={taskID}
                                                                    sprintId={task[0]?.taskSprints[0]?._id}
                                                                    customerId={task[0]?.taskCustomer?._id}
                                                                    verticalId={task[0]?.taskVertical}
                                                                ></TaskTimeRegistration>
                                                            )}
                                                        </div>
                                                    )}
                                                </section>

                                                <section id='taskModalUpdate' className="mt-5">
                                                    <form className='mt-5 pt-6 pb-4 px-6 bg-white rounded-lg relative flex flex-col w-full focus:outline-none h-full border border-gray-200' onSubmit={handleUpdateTask}>
                                                        <div>
                                                            <h2 className='font-bold mb-5 text-lg'>Update task</h2>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="taskName" className={labelClasses}>Task name</label>
                                                            <input type="text" name="taskName" placeholder="Task Name" required value={formData["taskName"]}
                                                                className={inputClasses}
                                                                onChange={(e) => handleInputChange(e)} />
                                                        </div>
                                                        <span className='grid grid-cols-2 gap-4'>
                                                            {task[0]?.taskType !== "quickTask" && (
                                                                <>
                                                                    <div>
                                                                        <label className={labelClasses} htmlFor="taskTimeLow">Task time low</label>
                                                                        <input type="number" name="taskTimeLow" placeholder="Task Time Low" required value={formData["taskTimeLow"]}
                                                                            className={inputClasses}
                                                                            onChange={(e) => handleInputChange(e)} />
                                                                    </div>
                                                                    <div>
                                                                        <label className={labelClasses} htmlFor="taskTimeHigh">Task hime high</label>
                                                                        <input type="number" name="taskTimeHigh" placeholder="Task Time High" required value={formData["taskTimeHigh"]}
                                                                            className={inputClasses}
                                                                            onChange={(e) => handleInputChange(e)} />
                                                                    </div>
                                                                </>
                                                            )}

                                                            {task[0]?.taskType === "quickTask" && (
                                                                <>
                                                                    <span>
                                                                        <label className={labelClasses} htmlFor="taskDeadline">Deadline</label>
                                                                        <input
                                                                            className={inputClasses}
                                                                            type="date"
                                                                            name='taskDeadline'
                                                                            required
                                                                            onChange={(e) => handleInputChange(e)}
                                                                            value={formData["taskDeadline"]}
                                                                        />
                                                                    </span>
                                                                    <div>
                                                                        <label className={labelClasses} htmlFor="estimatedTime">Estimated time <span className='text-slate-300'>optional</span></label>
                                                                        <input
                                                                            type="number" name="estimatedTime" value={formData["estimatedTime"]} placeholder="Estimated Task Time"
                                                                            onChange={(e) => handleInputChange(e)}
                                                                            className={inputClasses}
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}
                                                        </span>
                                                        <div>
                                                            <label className={labelClasses} htmlFor="taskDescription">Task description</label>

                                                            <textarea name="taskDescription" placeholder="Task Description" value={formData["taskDescription"]}
                                                                className="h-[auto] border rounded focus:border-pink-700 pt-2 pb-2 px-3 w-full block mb-4"
                                                                onChange={(e) => handleInputChange(e)} />
                                                        </div>

                                                        <button type="submit" className='mt-5 rounded text-slate-800 text-sm py-2 border border-zinc-400 cursor-pointer '>Update Task</button>
                                                    </form>
                                                </section>
                                            </div>

                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-1 md:gap-5 mt-10 pt-10">
                                                <>
                                                    <h2 className='text-lg md:text-2xl text-black font-extrabold'>Task chat</h2>
                                                    {taskID && (
                                                        <TaskChat
                                                            taskID={taskID}
                                                            taskCustomer={task[0]?.taskCustomer?._id}
                                                        />
                                                    )}
                                                </>
                                            </div>
                                        </div>
                                    ) : toggleViewState === "taskChat" ? (
                                        <div className="relative p-4 pt-0 flex-auto md:p-10 md:pt-0">
                                            <hr />

                                            <div className='grid grid-cols-1 gap-5 md:gap-10'>
                                                <section id='taskModalSettings' className='mt-5'>
                                                    <TaskModalSettings
                                                        inputClasses={inputClasses}
                                                        labelClasses={labelClasses}
                                                        taskID={taskID}
                                                        fetchTaskData={fetchTaskData}
                                                        fetchTasks={fetchTasks}
                                                        task={task}
                                                        closeModal={closeModal}
                                                        sprintOverviewFetch={sprintOverviewFetch}
                                                        updateFunc={updateFunc}
                                                        taskType={task[0]?.taskType}
                                                        activeSprint={activeSprint}
                                                        activeFilterUser={activeFilterUser}
                                                        newSprintArray={newSprintArray}
                                                    />
                                                </section>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative p-4 pt-0 flex-auto md:p-10 md:pt-0">
                                            <hr />

                                            <div className='grid grid-cols-1 gap-5 md:gap-10'>
                                                <section id="taskTimeRegistrations" className='mt-5'>
                                                    <TaskTimeRegistrations taskId={taskID} />
                                                </section>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                    </>
                ) : null}
            </>

        </div>
    )
}

export default TaskModal