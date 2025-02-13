import React, { useContext, useState } from 'react'
import PageHeading from '../components/PageHeading'
import { Card } from "flowbite-react"
import axios from 'axios'
import { UserContext } from '../context/UserContext'
import toast, { Toaster } from 'react-hot-toast'
import { ConfigContext } from '../context/ConfigContext'

const RegisterOffTimes = () => {
    const { user } = useContext(UserContext)
    const [formValues, setFormValues] = useState({
        userId: user.id,
        currentTime: "",
        registrationType: "",
        timeRegistered: "",
        taskId: null,
        sprintId: "",
        tenantId: user.tenant_id,
    })
    const [sprintId, setSprintId] = useState("")
    const { baseURL } = useContext(ConfigContext);

    const inputClasses = "h-[40px] border rounded focus:border-pink-700 px-3 py-0 "
    const labelClasses = "text-sm font-medium mb-2 "

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues({
            ...formValues,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const newDate = new Date(formValues.currentTime)
        const optionsYear = { year: "numeric"}
        const optionsMonth = { month: "long" }

        const formattedTimeYear = newDate.toLocaleDateString('en-US', optionsYear);
        const formattedTimeMonth = newDate.toLocaleDateString('en-US', optionsMonth);

        try {
            const response = await axios.get(`${baseURL}/sprints/fetch-sprint-by-month-year/${formattedTimeMonth}/${formattedTimeYear}`)
            
            const updatedFormValues = {
                ...formValues,
                sprintId: response.data[0]._id
            };

            if(response.data[0]._id) {
                await registerTime(updatedFormValues)
            }
        } catch (error) {
            console.error("Error fetching sprints by month & year", error)
        }
    }

    const registerTime = async (formValues) => {
        if (formValues && formValues.sprintId) {

            try {
                const responseTime = await axios.post(`${baseURL}/${user.tenant_id}/time-registrations/register-time`, formValues)
                
                if (responseTime.status === 201) {
                    toast('Time registration was successful', {
                        duration: 4000,
                        position: 'top-center',
                        style: {
                            background: '#22c55e',
                            color: "#fff"
                        }
                    })
                }
            } catch (error) {
                console.error("Error time registration", error)
            }
            
        }
    }

    return (
        <div id='RegisterOffTimes'>
            <PageHeading 
                heading="Off- & Sicktime"
                subHeading={`Register your off- & sicktime registrations here`}
                suffix="Use date picker to select specific date(s)."
            />

            <section className='grid grid-cols-12'>
                <Card className='py-4 px-4 col-span-6 flex border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-full border-gray-200 shadow-none rounded-[20px]'>
                    <h3 className="text-black text-lg font-medium">Fill out the form to register your off- or sicktime.</h3>
                    <hr />

                    <form action="" className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        <span className='flex flex-col'>
                            <label className={labelClasses} htmlFor="timeRegistered">Time Amount</label>
                            <input 
                                className={inputClasses} 
                                type="number" 
                                value={formValues.timeRegistered}
                                name='timeRegistered' 
                                required 
                                step=".25"
                                onChange={handleInputChange}
                            />
                        </span>

                        <span className='flex flex-col'>
                            <label className={labelClasses} htmlFor="currentTime">Date</label>
                            <input
                                className={inputClasses}
                                type="date"
                                name='currentTime'
                                value={formValues.currentTime}
                                required
                                onChange={handleInputChange}
                            />
                        </span>

                        <span className='flex flex-col'>
                            <label className={labelClasses} htmlFor="registrationType">Registration Type</label>
                            <select 
                                className={inputClasses} 
                                name="registrationType"
                                value={formValues.registrationType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" defaultValue>Select type</option>
                                <option value="offtime">Offtime</option>
                                <option value="sicktime">Sicktime</option>
                            </select>
                        </span>

                        <button type="submit" className='bg-black text-white py-3 rounded mt-5'>Register time</button>
                    </form>
                </Card>
            </section>

        </div>
    )
}

export default RegisterOffTimes