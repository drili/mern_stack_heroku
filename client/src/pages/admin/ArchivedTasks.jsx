import React, { useContext, useEffect, useState } from 'react'
import { Accordion, Table } from 'flowbite-react'
import { FaSpinner } from 'react-icons/fa'
import axios from 'axios'

import { BsSearch, BsCalendarFill } from "react-icons/bs"

import { ConfigContext } from '../../context/ConfigContext'
import { UserContext } from '../../context/UserContext'
import TaskModal from '../../components/task/TaskModal'

const ArchivedTasksOverview = () => {
    const [archivedTasks, setArchivedTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState("all")
    const [selectedSprint, setSelectedSprint] = useState("all")
    const [selectedVercial, setSelectedVertical] = useState("all")

    const { baseURL } = useContext(ConfigContext)
    const { user } = useContext(UserContext)

    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer "
    const labelClasses = "h-full flex flex-col justify-center bg-teal-200 border-none text-slate-800 border rounded px-4 py-1 text-sm border border-zinc-400 "

    const fetchArchivedTasks = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/tasks/fetch-task?archived=true`)
            if (response.status === 200) {
                setTimeout(() => {
                    setArchivedTasks(response.data)
                    setIsLoading(false)
                }, 200)
            }
        } catch (error) {
            console.error('Fejl ved hentning af arkiverede tasks:', error)
            setIsLoading(false)
        }
    }

    const uniqueCustomers = Array.from(
        new Set(archivedTasks.map(t => t.taskCustomer?._id).filter(Boolean))
    ).map(id => {
        const task = archivedTasks.find(t => t.taskCustomer?._id === id)
        return { id, name: task?.taskCustomer?.customerName || "Ukendt" }
    })
    
    const sprintMap = new Map()

    archivedTasks.forEach(task => {
        task.taskSprints.forEach(sprint => {
            if (!sprintMap.has(sprint._id)) {
                sprintMap.set(sprint._id, {
                    id: sprint._id,
                    name: `${sprint.sprintMonth} ${sprint.sprintYear}`,
                    year: parseInt(sprint.sprintYear),
                    month: parseMonthToNumber(sprint.sprintMonth)
                })
            }
        })
    })

    const uniqueSprints = Array.from(sprintMap.values())
        .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year
            return b.month - a.month
        })

    function parseMonthToNumber(monthName) {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        return months.indexOf(monthName) + 1
    }

    const uniqueVertical = Array.from(
        new Set(archivedTasks.map(t => t.taskVertical?._id).filter(Boolean))
    ).map(id => {
        const task = archivedTasks.find(t => t.taskVertical?._id === id)
        return { id, name: task?.taskVertical?.verticalName || "Ukendt" }
    })

    //Modal
    const handleTaskModal = (taskId) => {
        setShowModal(true)
        setSelectedTaskId(taskId)
    }

    const onCloseModal = () => {
        setShowModal(false)
    }

    const fetchTasks = () => {
        return
    }

    const sprintOverviewFetch = () => {
        fetchSprintData(currentSprint)
    }

    useEffect(() => {
        fetchArchivedTasks()
    }, [])

    // Group tasks by filters
    const filteredTasks = archivedTasks.filter(task => {
        const customerMatch = selectedCustomer === "all" || task.taskCustomer?._id === selectedCustomer
        const sprintMatch = selectedSprint === "all" || task.taskSprints.some(s => s._id === selectedSprint)
        const verticalMatch = selectedVercial === "all" || task.taskVertical?._id === selectedVercial
        return customerMatch && sprintMatch && verticalMatch
    })
    
    // Group tasks by vertical
    const groupedByVertical = filteredTasks.reduce((acc, task) => {
        const verticalName = task.taskVertical?.verticalName || "Ukendt kategori"
        if (!acc[verticalName]) acc[verticalName] = []
        acc[verticalName].push(task)
        return acc
    }, {})

    return (
        <div id="ArchivedTasksOverview">
            <h2 className="text-black text-xl font-bold mb-2">Arkiverede opgaver</h2>
            <p className="text-neutral-500 text-sm mb-10">Opgaver grupperet efter kategori</p>

            <div id='TimeRegOverviewFilter' className='py-4 px-5 rounded-lg bg-[#f2f3f4] relative flex flex-col w-full outline-none focus:outline-none mb-10'>
                <section className='flex gap-4'>
    
                </section>
    
                <section className='flex justify-end gap-8'>
    
                    <div className="flex gap-4">
                        <div>
                            <select
                                className={`${inputClasses} min-w-[200px]`}
                                value={selectedVercial}
                                onChange={(e) => setSelectedVertical(e.target.value)}
                            >
                                <option value="all">All verticals</option>
                                {uniqueVertical.map(vertical => (
                                    <option key={vertical.id} value={vertical.id}>
                                        {vertical.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <select
                                className={`${inputClasses} min-w-[200px]`}
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                            >
                                <option value="all">All customers</option>
                                {uniqueCustomers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                className={`${inputClasses} min-w-[200px]`}
                                value={selectedSprint}
                                onChange={(e) => setSelectedSprint(e.target.value)}
                            >
                                <option value="all">All sprints</option>
                                {uniqueSprints.map(sprint => (
                                    <option key={sprint.id} value={sprint.id}>
                                        {sprint.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
    
                </section>
            </div>

            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center py-10">
                    <FaSpinner className="animate-spin text-rose-500 text-4xl" />
                </div>
            ) : (
                <Accordion collapseAll={true}>
                    {Object.entries(groupedByVertical).map(([verticalName, tasks]) => (
                        <Accordion.Panel key={verticalName}>
                            <Accordion.Title>
                                <h3 className="text-lg font-bold text-black">{verticalName} ({tasks.length})</h3>
                            </Accordion.Title>

                            <Accordion.Content>
                                <Table className="relative">
                                    <Table.Head>
                                        <Table.HeadCell className="text-left text-black">Tasknavn</Table.HeadCell>
                                        <Table.HeadCell className="text-left text-black">Deadline</Table.HeadCell>
                                        <Table.HeadCell className="text-left text-black">Bruger(e)</Table.HeadCell>
                                        <Table.HeadCell className="text-left text-black">Kunde</Table.HeadCell>
                                        <Table.HeadCell className="text-left text-black"></Table.HeadCell>
                                    </Table.Head>

                                    <Table.Body className="divide-y">
                                        {tasks.map(task => (
                                            <Table.Row key={task._id} className="bg-white">
                                                <Table.Cell className="font-bold text-black whitespace-nowrap">
                                                    {task.taskName}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {task.taskDeadline ? task.taskDeadline.split('T')[0] : '-'}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {task.taskPersons?.map(p => p.user?.username).join(', ') || "-"}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {task.taskCustomer?.customerName || "-"}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <a
                                                        className="font-medium cursor-pointer text-slate-800 hover:underline "
                                                        onClick={() => handleTaskModal(task._id)}
                                                    >
                                                        <p className='border border-zinc-400 rounded text-center px-2 py-1 font-bold text-xs'>
                                                            Open
                                                        </p>
                                                    </a>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </Accordion.Content>
                        </Accordion.Panel>
                    ))}
                </Accordion>
            )}

            <TaskModal
                taskID={selectedTaskId}
                showModalState={showModal}
                onCloseModal={onCloseModal}
                fetchTasks={fetchTasks}
                // sprintOverviewFetch={sprintOverviewFetch}
                updateFunc={sprintOverviewFetch}
            />
        </div>
    )
}

export default ArchivedTasksOverview
