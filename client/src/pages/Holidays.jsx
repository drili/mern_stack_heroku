import React, { useContext, useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from "moment"
import axios from 'axios'

import PageHeading from '../components/PageHeading'
import HolidaysFilter from '../components/holidays/HolidaysFilter'
import HolidayCard from '../components/holidays/HolidayCard'
import { UserContext } from '../context/UserContext'
import { ConfigContext } from '../context/ConfigContext'

const Holidays = () => {
    const [selectedSprint, setSelectedSprint] = useState("")
    const localizer = momentLocalizer(moment);
    const [isLoading, setIsLoading] = useState(true)

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const [allHolidays, setAllHolidays] = useState([])
    const [events, setEvents] = useState([])

    const handleSprintChange = (selectedValue, selectedSprint) => {
        setSelectedSprint(selectedSprint)
        setIsLoading(true)
    }

    const fetchAllHolidays = async () => {
        try {
            const response = await axios.get(`${baseURL}/${user.tenant_id}/holidays/fetch-all-holidays`)
            if (response.status === 200) {
                setAllHolidays(response.data)
            }
        } catch (error) {
            console.error("Error fetching all holidays", error)
        }
    }

    useEffect(() => {
        setEvents(allHolidays
            .filter(holiday => holiday.status === "approved")
            .map(holiday => ({
                id: holiday._id,
                title: `${holiday.userId.username}`,
                start: moment(holiday.startTime, "DD-MM-YYYY").toDate(),
                end: moment(holiday.endTime, "DD-MM-YYYY").add(1, 'days').toDate(),
                allDay: true,
            }))
        )
    }, [allHolidays])

    useEffect(() => {
        fetchAllHolidays()
    }, [])

    return (
        <section id='Holidays'>
            <PageHeading
                heading={`Holidays`}
                subHeading={`Manage your holidays`}
                suffix={`You can apply for new holiday here and adjust your pending holidays.`}
            />

            <div className='grid grid-cols-12 gap-10'>
                <div className='col-span-12'>
                    <HolidaysFilter onSelectedSprint={handleSprintChange} />
                </div>

                <div id='calendarCol' className='col-span-12 min-h-[750px] py-10 px-10 flex rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-auto border-gray-200 shadow-none'>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        className='holidaysCalendar'
                        showAllEvents={true}
                    />
                </div>

                <div className='col-span-12 bg-[#f2f3f4] rounded-lg p-5'>
                    <section className='grid grid-cols-12 gap-10'>
                        <div className="col-span-12">
                            <h2 className='font-extrabold text-3xl'>Holiday overview <span className='text-pink-700'>2024</span></h2>
                        </div>

                        <div className="col-span-4">
                            <h3 className='font-bold mb-5 border-b pb-2'>Pending approval</h3>
                            {allHolidays
                                .filter(holiday => holiday.status === "pending")
                                .map((holiday, index) => (
                                    <HolidayCard holidayObj={holiday} baseURL={baseURL} userLoggedIn={user} fetchAllHolidays={fetchAllHolidays} />
                                ))}
                        </div>
                        <div className="col-span-4">
                            <h3 className='font-bold mb-5 border-b pb-2'>Approved</h3>
                            {allHolidays
                                .filter(holiday => holiday.status === "approved")
                                .map((holiday, index) => (
                                    <HolidayCard holidayObj={holiday} baseURL={baseURL} userLoggedIn={user} fetchAllHolidays={fetchAllHolidays} />
                                ))}
                        </div>

                        <div className="col-span-4">
                            <h3 className='font-bold mb-5 border-b pb-2'>Completed</h3>
                            {allHolidays
                                .filter(holiday => holiday.status === "completed")
                                .map((holiday, index) => (
                                    <HolidayCard holidayObj={holiday} baseURL={baseURL} />
                                ))}
                        </div>
                    </section>

                    <section>
                        {events.map(event => (
                            <p>{event._id}</p>
                        ))}
                    </section>
                </div>
            </div>
        </section>
    )
}

export default Holidays