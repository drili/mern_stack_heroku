import React, { useState, useEffect, useContext } from 'react'
import { Card } from 'flowbite-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

import PageHeading from '../components/PageHeading'
import { UserContext } from '../context/UserContext'
import { ConfigContext } from '../context/ConfigContext'
import HolidayCard from '../components/holidays/HolidayCard'

const RegisterHolidays = () => {
    const inputClasses = "h-[40px] border rounded focus:border-pink-700 px-3 py-0 "
    const labelClasses = "text-sm font-medium mb-2 "

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const [error, setError] = useState("")
    const [totalDaysValue, setTotalDaysValue] = useState(0)
    const [formValues, setFormValues] = useState({
        userId: user.id,
        startTime: "",
        endTime: "",
        totalDays: totalDaysValue,
    })
    const [holidays, setHolidays] = useState([])

    const [visiblePending, setVisiblePending] = useState(1)
    const [visibleApproved, setVisibleApproved] = useState(1);
    const [visibleDeclined, setVisibleDeclined] = useState(1);

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues({
            ...formValues,
            [name]: value
        })
    }

    const fetchHolidaysByUser = async (userId) => {
        try {
            const response = await axios.get(`${baseURL}/${user.tenant_id}/holidays/fetch-holidays-by-user/${userId}`)
            if (response.status === 200) {
                setHolidays(response.data)
            }
        } catch (error) {
            console.error("Error fetching holidays by user", error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!error) {
            try {
                const response = await axios.post(`${baseURL}/${user.tenant_id}/holidays/register-holidays`, formValues)

                if (response.status === 201) {
                    toast('Time registration was successful', {
                        duration: 4000,
                        position: 'top-center',
                        style: {
                            background: '#22c55e',
                            color: "#fff"
                        }
                    })
                    fetchHolidaysByUser(formValues.userId)
                }
            } catch (error) {
                console.error("Error holiday registration", error)
            }
        }
    }

    const calculateTotalDays = () => {
        const { startTime, endTime } = formValues

        if (startTime && endTime) {
            const startDate = new Date(startTime)
            const endDate = new Date(endTime)

            if (endDate < startDate) {
                setError('End date cannot be before start date');
                setTotalDaysValue(0)
            } else {
                setError("")

                const timeDifference = endDate - startDate
                const daysDifference = timeDifference / (1000 * 3600 * 24) + 1
                setTotalDaysValue(daysDifference)
                setFormValues({
                    ...formValues,
                    ["totalDays"]: daysDifference
                })
            }
        } else {
            setTotalDaysValue(0)
            setError("")
        }
    }

    useEffect(() => {
        calculateTotalDays()
        fetchHolidaysByUser(user.id)
    }, [formValues.startTime, formValues.endTime])

    return (
        <div id='RegisterHolidays'>
            <PageHeading
                heading="Register holidays"
                subHeading={`Register which days you wish to apply for holiday`}
                suffix="Use date picker to select specific date(s), from-to."
            />

            <section className='grid grid-cols-12 gap-10'>
                <span className='py-10 px-10 col-span-7 flex border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-full border-gray-200 shadow-none rounded-[20px]'>
                    <h3 className="text-black text-lg font-medium">Fill out the form to register your holidays.</h3>
                    <hr />

                    <form action="" className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        <span className='flex flex-col'>
                            <label className={labelClasses} htmlFor="startTime">Date from</label>
                            <input
                                className={inputClasses}
                                type="date"
                                name='startTime'
                                value={formValues.startTime}
                                required
                                onChange={handleInputChange}
                            />
                        </span>

                        <span className='flex flex-col'>
                            <label className={labelClasses} htmlFor="endTime">Date to</label>
                            <input
                                className={inputClasses}
                                type="date"
                                name='endTime'
                                value={formValues.endTime}
                                required
                                onChange={handleInputChange}
                            />
                            <p className='text-red-500 text-sm mt-2'>{error}</p>
                        </span>

                        <span className='flex flex-col'>
                            <label className={labelClasses} htmlFor="totalDays">Total days</label>
                            <p className='font-bold underline'>{totalDaysValue}</p>
                        </span>

                        <button disabled={!!error} type="submit" className={`${error ? "opacity-50" : ""} bg-black text-white py-3 rounded mt-5`}>Register holiday</button>
                    </form>

                    <Link to={`/${user.tenant_id}/holidays`} className='text-pink-700 text-center mt-5'>
                        Go back to holidays overview
                    </Link>
                </span>

                <div className='col-span-5 bg-stone-100 w-full p-[2rem] md:p-10 rounded-extra-large'>
                    <HolidaySection
                        title={"Your pending holidays"}
                        holidays={holidays.filter(holiday => holiday.status === "pending")}
                        visibleCount={visiblePending}
                        onShowMore={() => setVisiblePending(visiblePending + 5)}
                        baseURL={baseURL}
                    />

                    <HolidaySection
                        title={"Your approved holidays"}
                        holidays={holidays.filter(holiday => holiday.status === "approved")}
                        visibleCount={visibleApproved}
                        onShowMore={() => setVisibleApproved(visibleApproved + 5)}
                        baseURL={baseURL}
                    />

                    <HolidaySection
                        title={"Your declined holidays"}
                        holidays={holidays.filter(holiday => holiday.status === "declined")}
                        visibleCount={visibleDeclined}
                        onShowMore={() => setVisibleDeclined(visibleDeclined + 5)}
                        baseURL={baseURL}
                    />
                </div>
            </section>
        </div>
    )
}

const HolidaySection = ({ title, holidays, visibleCount, onShowMore, baseURL }) => {
    return (
        <>
            <h2 className='flex items-center gap-1 justify-between text-lg md:text-2xl text-black font-bold mb-3 mt-5'>{title} <span className='text-sm font-extrabold'>({holidays.length})</span></h2>
            <hr className='mb-5' />

            <span className='flex flex-col gap-2'>
                {holidays.slice(0, visibleCount).map((holiday, index) => (
                    <HolidayCard key={holiday._id} holidayObj={holiday} baseURL={baseURL} />
                ))}
            </span>

            {visibleCount < holidays.length && (
                <button onClick={onShowMore} className='rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer bg-white w-full'>
                    Show more
                </button>
            )}
        </>
    )
}

export default RegisterHolidays