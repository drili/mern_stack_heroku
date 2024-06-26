import React, { useContext, useEffect, useRef, useState } from 'react'
import { FaWindowClose } from "react-icons/fa"
import { BsFillLightningChargeFill } from "react-icons/bs";
import { AiOutlineClockCircle } from "react-icons/ai"
import { FaCalendar, FaClock, FaPaperclip } from "react-icons/fa";
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

import TaskModalSettings from './TaskModalSettings'
import TaskTimeRegistration from './TaskTimeRegistration'
import TaskChat from './TaskChat'
import { ConfigContext } from '../../context/ConfigContext';

const TaskModal = ({ taskID, showModalState, onCloseModal, fetchTasks, updateFunc, sprintOverviewFetch, fetchDeadlineTasks, activeSprint, activeFilterUser, newSprintArray }) => {
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

    const inputClasses = "mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
    const labelClasses = "block mb-2 text-sm font-medium text-gray-900 "

    const { baseURL } = useContext(ConfigContext);
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
            const response = await axios.get(`${baseURL}/tasks/fetch-by-id/${taskID}`)

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
            const response = await axios.put(`${baseURL}/tasks/update/${taskID}`, formData)

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
            if(updateFunc) {
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
                        <div
                            // className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                            className='absolute z-50 top-0 w-full translate-x-[-50%] left-[50%]'
                        >
                            <div className="relative my-6 mx-auto max-w-screen-xl w-full taskModalComponent">

                                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

                                    <div className='flex items-center gap-2 px-4 pt-5 pb-0 rounded-t md:px-10'>
                                        <span 
                                            className="taskLabel flex items-center gap-2 text-xs px-2 py-1 rounded font-bold"
                                            style={{
                                                color: `${task[0]?.taskCustomer?.customerColor}`,
                                                border: `1px solid ${task[0]?.taskCustomer?.customerColor}`
                                            }}>
                                            {task[0]?.taskCustomer?.customerName}
                                        </span>
                                        <span className="taskLabel flex items-center gap-2 bg-rose-100 text-xs px-2 py-1 rounded text-rose-800 font-bold">
                                            {task[0]?.taskSprints[0]?.sprintName} <FaCalendar />
                                        </span>

                                        {task[0]?.taskType === "quickTask" && (
                                            <>
                                                <span className="flex items-center gap-2 taskLabel bg-amber-100 text-xs px-2 py-1 rounded text-amber-500 font-bold">
                                                    Quick Task <BsFillLightningChargeFill className='text-amber-500' />
                                                </span>

                                                <span className="flex items-center gap-2 taskLabel bg-amber-100 text-xs px-2 py-1 rounded text-amber-500 font-bold">
                                                    <p className='font-bold text-xs text-amber-500'>{task[0]?.taskDeadline}</p><FaClock />
                                                </span>
                                            </>
                                        )}

                                    </div>
                                    <div className="flex items-start justify-between p-4 pb-5 rounded-t md:px-10">
                                        <span>
                                            <h3 className="text-3xl font-semibold">
                                                {formData["taskName"]}
                                            </h3>
                                            <p className='flex gap-2 hover:cursor-pointer items-center text-slate-500 text-sm mt-2' onClick={copyToClipboard}>ID: {taskID} <FaPaperclip /></p>
                                        </span>
                                        <button
                                            className="text-white bg-black font-bold uppercase text-sm focus:outline-none ease-linear transition-all duration-150"
                                            type="button"
                                            onClick={closeModal}
                                        >
                                            <h4><FaWindowClose></FaWindowClose></h4>
                                        </button>
                                    </div>

                                    <div className='flex items-start px-4 pt-5 pb-0 rounded-t md:px-10'>
                                        <button className={`${toggleViewState === "task" ? "bg-slate-950 text-white font-bold underline border-slate-200" : ""} rounded-none border-slate-100 focus:outline-none hover:outline-none hover:border-slate-100`} onClick={() => handleViewState("task")}>Task</button>
                                        <button className={`${toggleViewState === "taskChat" ? "bg-slate-950 text-white font-bold underline border-slate-200" : ""} rounded-none border-slate-100 focus:outline-none hover:border-slate-100`} onClick={() => handleViewState("taskChat")}>Task Settings</button>
                                    </div>

                                    {toggleViewState === "task" ? (
                                        <div className="relative p-4 pt-0 flex-auto md:p-10 md:pt-0">
                                            <hr />
                                            
                                            <div className={`${task[0]?.taskType !== "quickTask" ? "md:grid-cols-2 gap-5 md:gap-10" : "md:grid-cols-0"} grid`}>
                                                <section className='mt-5'>
                                                    {task[0]?.taskType !== "quickTask" && (
                                                        <div className='mt-5 pt-5 px-5 border-0 rounded-lg bg-slate-50 relative flex flex-col w-full outline-none focus:outline-none h-full'>
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
                                                    <form className='mt-5 pt-5 px-5 border-0 rounded-lg bg-slate-50 relative flex flex-col w-full outline-none focus:outline-none h-full' onSubmit={handleUpdateTask}>
                                                        <div>
                                                            <h2 className='font-semibold mb-5'>Update Task</h2>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="taskName" className={labelClasses}>Task Name</label>
                                                            <input type="text" name="taskName" placeholder="Task Name" required value={formData["taskName"]}
                                                                className={inputClasses}
                                                                onChange={(e) => handleInputChange(e)} />
                                                        </div>
                                                        <span className='grid grid-cols-2 gap-4'>
                                                            {task[0]?.taskType !== "quickTask" && (
                                                                <>
                                                                    <div>
                                                                        <label className={labelClasses} htmlFor="taskTimeLow">Task Time Low</label>
                                                                        <input type="number" name="taskTimeLow" placeholder="Task Time Low" required value={formData["taskTimeLow"]}
                                                                            className={inputClasses}
                                                                            onChange={(e) => handleInputChange(e)} />
                                                                    </div>
                                                                    <div>
                                                                        <label className={labelClasses} htmlFor="taskTimeHigh">Task Time High</label>
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
                                                                        <label className={labelClasses} htmlFor="estimatedTime">Estimated Time <span className='text-slate-300'>optional</span></label>
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
                                                            <label className={labelClasses} htmlFor="taskDescription">Task Description</label>

                                                            <textarea name="taskDescription" placeholder="Task Description" value={formData["taskDescription"]}
                                                                className={inputClasses}
                                                                onChange={(e) => handleInputChange(e)} />
                                                        </div>

                                                        <button type="submit" className='mb-4 button text-black mt-1 bg-white border-rose-500 hover:bg-rose-800 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center   '>Update Task</button>
                                                    </form>
                                                </section>
                                            </div>

                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-1 md:gap-5 mt-10 pt-10">
                                                <>
                                                    <h2 className='font-semibold'>Task Chat</h2>
                                                    {taskID && (
                                                        <TaskChat 
                                                            taskID={taskID} 
                                                            taskCustomer={task[0]?.taskCustomer?._id}
                                                        />
                                                    )}
                                                </>
                                            </div>
                                        </div>
                                    ) : (
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

                                                <section className='mt-5'>
                                                    
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