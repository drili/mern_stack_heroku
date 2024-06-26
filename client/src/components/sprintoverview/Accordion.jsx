import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { BsFillLightningChargeFill } from "react-icons/bs";
import { Accordion, Table } from 'flowbite-react'
import { IoIosCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";

import { UserContext } from '../../context/UserContext'
import getCurrentSprint from '../../functions/getCurrentSprint'
import TaskModal from '../task/TaskModal'
import { ConfigContext } from '../../context/ConfigContext';

const DefaultAccordion = ({ userObject, selectedSprint }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [sprintData, setSprintData] = useState([])
    const { user } = useContext(UserContext)
    const currentSprint = getCurrentSprint()
    const [accumulatedValues, setAccumulatedValues] = useState({})
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const { baseURL } = useContext(ConfigContext);

    const handleTaskModal = (taskId) => {
        setShowModal(true)
        setSelectedTaskId(taskId)
    }

    const onCloseModal = () => {
        setShowModal(false)
        toast.dismiss()
    }

    const fetchTasks = () => {
        return
    }

    useEffect(() => {
        const titleElement = document.querySelector(`#taskId_${userObject._id}`);
        if (titleElement) {
            titleElement.addEventListener('click', () => {
                setIsOpen((prevIsOpen) => !prevIsOpen)
            })
        }
    }, [])

    useEffect(() => {
        if (!selectedSprint) {
            if (currentSprint.month != "") {
                fetchSprintData(currentSprint)
            }
        } else {
            fetchSprintData(selectedSprint)
        }
    }, [currentSprint])

    const fetchSprintData = async (activeSprintArray) => {
        try {
            const response = await axios.get(`${baseURL}/tasks/fetch-by-user-sprint/${userObject._id}?month=${activeSprintArray.sprintMonth}&year=${activeSprintArray.sprintYear}&time_reg=1`)

            setSprintData(response.data)

            // *** Accumulated data
            const userAccumulatedValues = {}
            response.data.forEach(data => {
                const userId = data.taskPersons.find(person => person.user._id === userObject._id).user._id
                const taskAlloc = data.taskPersons.find(person => person.user._id === userObject._id).percentage
                // const taskTimeLow = data.taskTimeLow
                // const taskTimeHigh = data.taskTimeHigh

                const taskTimeLow = parseFloat((taskAlloc / 100) * data.taskTimeLow)
                const taskTimeHigh = parseFloat((taskAlloc / 100) * data.taskTimeHigh)

                if (!userAccumulatedValues[userId]) {
                    userAccumulatedValues[userId] = {
                        low: 0,
                        high: 0
                    }
                }

                userAccumulatedValues[userId].low += taskTimeLow;
                userAccumulatedValues[userId].high += taskTimeHigh;
            })
            // console.log({userAccumulatedValues});
            setAccumulatedValues(userAccumulatedValues);
        } catch (error) {
            console.error('Failed to fetch tasks', error)
        }
    }

    const sprintOverviewFetch = () => {
        console.log(`sprintOverviewFetch()`);
        if (!selectedSprint) {
            fetchSprintData(currentSprint)
        } else {
            fetchSprintData(selectedSprint)
        }
    }

    useEffect(() => {
        if (!selectedSprint) {
            if (currentSprint.month != "") {
                fetchSprintData(currentSprint)
            }
        } else {
            fetchSprintData(selectedSprint)
        }
    }, [currentSprint])

    useEffect(() => {
        if (isOpen) {
            if (!selectedSprint) {
                fetchSprintData(currentSprint)
            } else {
                fetchSprintData(selectedSprint)
            }
        } else {
            setSprintData([])
            // console.log(`${userObject._id} is CLOSED`);
        }
    }, [isOpen])

    return (
        <>
            <Accordion collapseAll >
                <Accordion.Panel>
                    <Accordion.Title id={`taskId_${userObject._id}`} className={user.id === userObject._id ? "bg-rose-50 rounded-none" : ""}>
                        <span className='flex gap-5 flex-col items-start md:flex-row md:items-center'>
                            <div className='flex gap-5 items-center'>
                                <img
                                    className='w-[60px] h-[60px] rounded-full object-cover'
                                    src={`${baseURL}/uploads/${userObject.profileImage}`}
                                />
                                <span>
                                    <span className='flex gap-3'>
                                        <h2 className='text-lg font-bold text-gray-900'>{userObject.username}</h2>
                                        <label className='bg-rose-100 text-rose-800 rounded-md py-1 px-2 text-xs font-bold h-fit'>{userObject.userTitle}</label>
                                    </span>
                                    <h2 className='text-sm font-light text-zinc-500'>{userObject.email}</h2>
                                </span>
                            </div>

                            <div className='relative right-0 md:absolute md:right-[100px]'>
                                {accumulatedValues[userObject._id] ? (
                                    <div id="taskInfoLabels" className='flex gap-4'>
                                        <span className='text-center'>
                                            <label htmlFor="" className='text-sm'>Low</label>
                                            {accumulatedValues[userObject._id] ? (
                                                <p className='bg-rose-900 text-white rounded-md text-sm py-2 px-2 min-w-[50px]'>
                                                    {(accumulatedValues[userObject._id].low).toFixed(2)}
                                                </p>
                                            ) : (
                                                <></>
                                            )}
                                        </span>

                                        <span className='text-center'>
                                            <label htmlFor="" className='text-sm'>High</label>
                                            {accumulatedValues[userObject._id] ? (
                                                <p className='bg-rose-900 text-white rounded-md text-sm py-2 px-2 min-w-[50px]'>
                                                    {(accumulatedValues[userObject._id].high).toFixed(2)}
                                                </p>
                                            ) : (
                                                <></>
                                            )}
                                        </span>

                                        <span className='text-center'>
                                            <label htmlFor="" className='text-sm'>Median</label>
                                            {accumulatedValues[userObject._id] ? (
                                                <p className='bg-rose-900 text-white rounded-md text-sm py-2 px-2 min-w-[50px]'>
                                                    {((accumulatedValues[userObject._id].low + accumulatedValues[userObject._id].high) / 2).toFixed(2)}
                                                </p>
                                            ) : (
                                                <></>
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </span>
                    </Accordion.Title>
                    <Accordion.Content>
                        {isOpen ? (
                            <div className='overflow-x-auto'>
                                <Table className='relative min-w-full'>
                                    <Table.Head>
                                        <Table.HeadCell className='text-left'>
                                            Task Name
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left'>
                                            Customer
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left'>
                                            Low
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left'>
                                            High
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left'>
                                            Percent Allocation
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left'>
                                            Time Registered
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-center'>
                                            Done
                                        </Table.HeadCell>
                                        {/* <Table.HeadCell className='text-left'>
                                            Remaining Task Time
                                        </Table.HeadCell> */}
                                    </Table.Head>
                                    <Table.Body className="divide-y">
                                        {sprintData.map((data) => (
                                            <Table.Row className="bg-white  " key={data._id}>
                                                <Table.Cell className="flex items-center gap-2 whitespace-nowrap font-medium text-gray-900 ">
                                                    <p className='w-[250px] text-xs whitespace-nowrap overflow-hidden text-ellipsis'>{data.taskName}</p>
                                                    {data.taskType === "quickTask" ? (
                                                        <BsFillLightningChargeFill className='text-amber-500' />
                                                    ) : null}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <p className='text-xs'>{data.taskCustomer.customerName}</p>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <p className='text-xs'>{data.taskTimeLow}</p>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <p className='text-xs'>{data.taskTimeHigh}</p>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {data.taskPersons
                                                        .filter(person => person.user._id === user.id)
                                                        .map(taskPerson => (
                                                            <div className='text-xs' key={taskPerson._id}>{taskPerson.percentage.toFixed(2)}</div>
                                                        ))
                                                    }
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <p className='text-xs font-extrabold underline'>{data.timeRegistrations.reduce((totalTime, registration) => totalTime + registration.timeRegistered, 0)}</p>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    {data.workflowStatus === 3 ? (
                                                        <p className='flex items-center justify-center text-lg text-green-500 font-bold'>
                                                            <IoIosCheckmarkCircle />
                                                        </p>
                                                    ) : (
                                                        <p className='flex items-center justify-center text-lg text-red-500 font-bold'>
                                                            <IoMdCloseCircle />
                                                        </p>
                                                    )}
                                                </Table.Cell>

                                                {/* <Table.Cell>
                                                    <p className='font-thin text-slate-500 text-xs'>TBU</p>
                                                </Table.Cell> */}
                                                <Table.Cell>
                                                    <a
                                                        className="font-medium cursor-pointer text-slate-500 hover:underline "
                                                        onClick={() => handleTaskModal(data._id)}
                                                    >
                                                        <p className='border border-gray-300 rounded-lg text-center px-2 py-1 font-bold text-xs'>
                                                            Open
                                                        </p>
                                                    </a>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        ) : (
                            null
                        )}
                    </Accordion.Content>
                </Accordion.Panel>
            </Accordion>

            <TaskModal
                taskID={selectedTaskId}
                showModalState={showModal}
                onCloseModal={onCloseModal}
                fetchTasks={fetchTasks}
                // sprintOverviewFetch={sprintOverviewFetch}
                updateFunc={sprintOverviewFetch}
            />
        </>
    )
}

export default DefaultAccordion;
