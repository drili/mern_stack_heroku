import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

import { UserContext } from '../../context/UserContext'
import { ConfigContext } from '../../context/ConfigContext'

const getFormattedDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    const day = ('0' + currentDate.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
}

const TaskTimeRegistration = ({ labelClasses, inputClasses, taskId, sprintId, customerId, verticalId, onTimeRegistered }) => {
    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const [timeRegistrations, setTimeRegistrations] = useState([])
    const [formRegisterTime, setFormRegisterTime] = useState({
        userId: user.id,
        taskId: taskId,
        timeRegistered: "",
        description: "",
        sprintId: "",
        currentTime: "",
        customerId: "",
        verticalId: verticalId
    })

    const fetchTimeRegistrations = async (taskId) => {
        try {
            const response = await axios.get(`${tenantBaseURL}/time-registrations/time-registered/${taskId}`)
            
            setTimeRegistrations(response.data)
        } catch (error) {
            console.error('Failed to fetch registered time(s)', error)
        }
    }

    const handleInputChange = async (e) => {
        setFormRegisterTime((formData) => ({
            ...formData,
            [e.target.name]: e.target.value
        }))
    }

    const handleRegisterTime = async (e) => {
        e.preventDefault()
        
        if (formRegisterTime.timeRegistered > 0) {
            try {
                const response = await axios.post(`${tenantBaseURL}/time-registrations/register-time`, formRegisterTime)
                if (response.status === 201) {
                    toast('Time registered successfully', {
                        duration: 4000,
                        position: 'top-center',
                        style: {
                            background: '#22c55e',
                            color: "#fff"
                        }
                    })

                    fetchTimeRegistrations(taskId)

                    setFormRegisterTime((formData) => ({
                        ...formData,
                        timeRegistered: '',
                        description: '',
                        currentTime: getFormattedDate()
                    }))

                    if (typeof onTimeRegistered === 'function') {
                        onTimeRegistered();
                    }
                }
            } catch (error) {
                console.error('Failed to register time', error)
                toast('There was an error registering time', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#ef4444',
                        color: "#fff"
                    }
                })
            }
        }
    }

    useEffect(() => {
        fetchTimeRegistrations(taskId)
        setFormRegisterTime((formData) => ({
            ...formData,
            sprintId: sprintId,
            customerId: customerId,
            verticalId: verticalId,
            currentTime: getFormattedDate()
        }))
    }, [taskId, sprintId, verticalId])

    return (
        <div id='TaskTimeRegistration' className=''>
            <h2 className='font-bold mb-5 text-lg'>Task time registration</h2>

            <span className='timeRegistrationField flex flex-col gap-4'>
                <div className='flex-1'>
                    <form onSubmit={handleRegisterTime} className=''>
                        <div className='grid grid-cols-4 gap-x-4'>
                            <div className='col-span-2'>
                                <label className={labelClasses} htmlFor="currentTime">Date</label>
                                <input
                                    className={inputClasses}
                                    type="date"
                                    name='currentTime'
                                    value={formRegisterTime.currentTime}
                                    onChange={(e) => handleInputChange(e)}
                                    required
                                />
                            </div>

                            <div className='col-span-2'>
                                <label className={labelClasses} htmlFor="timeRegistered">Time</label>
                                <input 
                                    className={inputClasses}
                                    placeholder='1.25 Hours'
                                    type='number'
                                    step="0.25"
                                    name="timeRegistered"
                                    value={formRegisterTime.timeRegistered}
                                    onChange={(e) => handleInputChange(e)}
                                    required
                                    >
                                </input>
                            </div>
                            <div className='col-span-4'>
                                <label htmlFor="description" className={labelClasses}>Registration comment</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formRegisterTime.description}
                                    onChange={handleInputChange}
                                    placeholder="Registration comment (optional)"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <button type="submit" className='bg-black text-white py-2 rounded mt-5 mb-5 w-full text-sm hover:bg-pink-700'>Register Time</button>
                    </form>
                </div>

                <div className='flex-1'>
                    <label className={labelClasses}>Total time registered</label>
                    
                    {timeRegistrations && timeRegistrations.length > 0 ? (
                        <p className='text-lg font-bold underline'>
                            {timeRegistrations.reduce((totalTime, registration) => totalTime + registration.timeRegistered, 0)}
                        </p>
                    ) : (
                        <p className='text-lg font-bold underline'>
                            0
                        </p>
                    )}
                </div>
            </span>

        </div>
    )
}

export default TaskTimeRegistration