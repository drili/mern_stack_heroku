import React, { useContext, useEffect, useState } from 'react'
import { Table } from 'flowbite-react'
import axios from 'axios'
import { ConfigContext } from '../../context/ConfigContext'

const TimeRegistrationTable = ({ eventObj, toast, fetchUserRegistrations, userId, tenantId }) => {
    const [editedTimes, setEditedTimes] = useState({})
    const [eventObjState, setEventObjState] = useState(eventObj)

    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${tenantId}`

    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer "
    const labelClasses = "h-full flex flex-col justify-center bg-teal-200 border-none text-slate-800 border rounded px-4 py-1 text-sm border border-zinc-400 "

    const handleTimeChange = (eventId, time) => {
        setEditedTimes(prevTimes => ({
            ...prevTimes,
            [eventId]: time
        }))
    }

    const handleSaveTime = async (event) => {
        const eventId = event._id
        const editedTime = editedTimes[eventId] || event.timeRegistered
        
        if (eventId && editedTime && editedTime > 0 && editedTime != "") {
            try {
                const response = await axios.post(`${tenantBaseURL}/time-registrations/time-registration-update`, { eventId, editedTime })

                if (response.status === 200) {
                    toast('Time registration updated successfully', {
                        duration: 4000,
                        position: 'top-center',
                        style: {
                            background: '#22c55e',
                            color: "#fff"
                        }
                    })

                    fetchUserRegistrations(userId)
                }
            } catch (error) {
                console.error('Failed to update time registration', error)
            }
        } 
    }

    const handleDeleteTime = async (eventId) => {
        if (eventId) {
            try {
                const response = await axios.delete(`${tenantBaseURL}/time-registrations/time-registration-delete/${eventId}`)

                if (response.status === 200) {
                    toast('Time registration has been deleted', {
                        duration: 4000,
                        position: 'top-center',
                        style: {
                            background: '#ef4444',
                            color: "#fff"
                        }
                    })

                    setEventObjState(eventObjState.filter(event => event._id !== eventId))

                    fetchUserRegistrations(userId)
                }
            } catch (error) {
                console.error('Failed to delete time registration', error)
            }            
        }
    }
    
    useEffect(() => {
        if (eventObj) {
            setEventObjState(eventObj)
        }
    }, [eventObj])

    return (
        <div>
            <Table className='relative'>
                <Table.Head>
                    <Table.HeadCell className='text-left text-black'>
                        Task Name
                    </Table.HeadCell>
                    <Table.HeadCell className='text-left text-black p-0'>
                        Customer
                    </Table.HeadCell>
                    {/* <Table.HeadCell className='text-left text-black'>
                        Client
                    </Table.HeadCell> */}
                    <Table.HeadCell className='text-left text-black'>
                        Time
                    </Table.HeadCell>
                    <Table.HeadCell className='text-left text-black'>
                        Edit
                    </Table.HeadCell>
                    <Table.HeadCell className='text-left text-black'>
                        Delete
                    </Table.HeadCell>
                </Table.Head>

                <Table.Body className="divide-y">
                    {eventObjState &&
                        eventObjState.map(event => (
                            <Table.Row className="bg-white  " key={event._id}>
                                <Table.Cell className="whitespace-break-spaces font-medium text-gray-900  text-sm leading-3">
                                    {event.taskId ? event.taskId.taskName : "Off- & Sicktime"}
                                    {/* {event.taskId ? event.taskId.taskName : (event.registrationType === "offtime" ? "offtime" : "sicktime")} */}
                                </Table.Cell>
                                
                                <Table.Cell className="whitespace-break-spaces font-medium text-gray-900  text-s leading-3 p-0">
                                    {event.taskId?.taskCustomer?.customerName}
                                </Table.Cell>

                                <Table.Cell className='whitespace-break-spaces text-xs'>
                                    <input
                                        step="0.25"
                                        className="h-[30px] border rounded focus:border-pink-700 px-3 py-0 max-w-[100px] text-sm"
                                        type="number"
                                        value={editedTimes[event._id] !== undefined ? editedTimes[event._id] : event.timeRegistered}
                                        onChange={(e) => handleTimeChange(event._id, e.target.value)}
                                    />
                                </Table.Cell>

                                <Table.Cell className='whitespace-break-spaces text-[10px]'>
                                    <a
                                        className="rounded text-slate-800 text-sm border border-none cursor-pointer"
                                        onClick={() => handleSaveTime(event)}
                                    >
                                    <p className='border border-zinc-400 rounded-lg text-center px-2 py-1 font-bold text-[10px]'>
                                        Save
                                    </p>
                                    </a>
                                </Table.Cell>
                                <Table.Cell className='whitespace-break-spaces text-[10px]'>
                                    <a
                                        className="rounded text-red-500 text-sm border border-none cursor-pointer flex"
                                        onClick={() => handleDeleteTime(event._id)}
                                    >
                                    <p className='border border-zinc-400 rounded-lg text-center px-2 py-1 font-bold text-[10px]'>
                                        Delete
                                    </p>
                                    </a>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    }
                </Table.Body>
            </Table>
        </div>
    )
}

export default TimeRegistrationTable