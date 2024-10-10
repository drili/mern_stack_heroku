import React, { useContext, useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from "moment"
import axios from 'axios'
import { Table } from 'flowbite-react'

import PageHeading from '../components/PageHeading'
import HolidaysFilter from '../components/holidays/HolidaysFilter'
import HolidayCard from '../components/holidays/HolidayCard'
import { UserContext } from '../context/UserContext'
import { ConfigContext } from '../context/ConfigContext'
import exportToCSV from '../functions/exportToCSV'

const Holidays = () => {
    const [selectedSprint, setSelectedSprint] = useState("")
    const localizer = momentLocalizer(moment);
    const [isLoading, setIsLoading] = useState(true)

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const [allHolidays, setAllHolidays] = useState([])
    const [events, setEvents] = useState([])
    const [viewMode, setViewMode] = useState("card")
    const [activeFilter, setActiveFilter] = useState([])

    const handleSprintChange = (selectedValue, selectedSprint) => {
        setSelectedSprint(selectedSprint)
        setIsLoading(true)
    }

    const handleFilterChange = async (filter) => {
        setActiveFilter(filter)
    }

    const handleViewMode = async (option) => {
        setViewMode(option)
    }

    const exportToCSVFunc = (holidays) => {
        const csvHeader = ["User", "Start Date", "End Date", "Total Days", "Status"];

        exportToCSV(csvHeader, holidays, `t8-holidays-${activeFilter}`)
    }

    const fetchAllHolidays = async (userId) => {
        try {
            const response = await axios.get(`${baseURL}/${user.tenant_id}/holidays/fetch-all-holidays/${userId}`)
            if (response.status === 200) {
                setAllHolidays(response.data)
            }
        } catch (error) {
            console.error("Error fetching all holidays", error)
        }
    }

    useEffect(() => {
        setEvents(allHolidays
            .filter(holiday => holiday.status === "approved" || holiday.status === "completed")
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
        fetchAllHolidays("0")
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
                    <HolidaysFilter onSelectedSprint={handleSprintChange} fetchAllHolidays={fetchAllHolidays} handleFilterChange={handleFilterChange} />
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
                        <div className="col-span-12 flex justify-between">
                            <h2 className='font-extrabold text-3xl'>Holiday overview <span className='text-pink-700'>2024</span></h2>

                            <span className='flex gap-2'>
                                <button onClick={() => handleViewMode("card")} className={`${viewMode === "card" ? "bg-pink-700 text-white" : "bg-white"} rounded text-slate-800 text-sm min-h-[45px] cursor-pointer`}>Card list</button>
                                <button onClick={() => handleViewMode("table")} className={`${viewMode === "table" ? "bg-pink-700 text-white" : "bg-white"} rounded text-slate-800 text-sm min-h-[45px] cursor-pointer`}>Table list</button>
                            </span>
                        </div>

                        {viewMode === "table" && (
                            <>
                                <section className='col-span-12 text-right'>
                                    <button onClick={() => exportToCSVFunc(allHolidays)} className='text-black cursor-pointer bg-transparent underline text-base m-0 p-0'>Export to CSV</button>
                                </section>
                                <section className='col-span-12'>
                                    <Table className='w-full'>
                                        <Table.Head className='w-full'>
                                            <Table.HeadCell className='text-left text-black text-[10px] p-2'>
                                                User
                                            </Table.HeadCell>
                                            <Table.HeadCell className='text-left text-black text-[10px] p-2'>
                                                Start date
                                            </Table.HeadCell>
                                            <Table.HeadCell className='text-left text-black text-[10px] p-2'>
                                                End date
                                            </Table.HeadCell>
                                            <Table.HeadCell className='text-left text-black text-[10px] p-2'>
                                                Total days
                                            </Table.HeadCell>
                                            <Table.HeadCell className='text-left text-black text-[10px] p-2'>
                                                Status
                                            </Table.HeadCell>
                                        </Table.Head>
                                        <Table.Body className="divide-y">
                                            {allHolidays.map((holiday) => (
                                                <Table.Row className="bg-white" key={holiday._id}>
                                                    <Table.Cell className="flex gap-2 items-center p-2">
                                                        <img src={`${baseURL}/uploads/${holiday.userId.profileImage}`} className='h-8 w-8 rounded object-cover' />
                                                        <p className='font-bold text-black text-[12px]'>{holiday.userId.username}</p>
                                                    </Table.Cell>
                                                    <Table.Cell className="p-2">
                                                        <p className='font-bold text-neutral-500 text-[12px]'>{holiday.startTime}</p>
                                                    </Table.Cell>
                                                    <Table.Cell className="p-2">
                                                        <p className='font-bold text-neutral-500 text-[12px]'>{holiday.endTime}</p>
                                                    </Table.Cell>
                                                    <Table.Cell className="p-2">
                                                        <p className='font-bold text-neutral-500 text-[12px]'>{holiday.totalDays}</p>
                                                    </Table.Cell>
                                                    <Table.Cell className="p-2">
                                                        <p className={`
                                                        ${
                                                            holiday.status === "approved" ? "text-green-500" :
                                                            holiday.status === "pending" ? "text-yellow-500" :
                                                            holiday.status === "completed" ? "text-teal-200" :
                                                                "text-neutral-500"} font-bold`
                                                        }>
                                                            {holiday.status}
                                                        </p>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </section>
                            </>
                        )}

                        {viewMode === "card" && (
                            <section className='col-span-12 grid grid-cols-12 gap-4'>
                                <div className="col-span-4">
                                    <h3 className='font-bold mb-5 border-b pb-2'>Pending approval</h3>
                                    {allHolidays
                                        .filter(holiday => holiday.status === "pending")
                                        .map((holiday, index) => (
                                            <HolidayCard holidayObj={holiday} baseURL={baseURL} userLoggedIn={user} fetchAllHolidays={fetchAllHolidays} activeFilter={activeFilter} />
                                        ))}
                                </div>
                                <div className="col-span-4">
                                    <h3 className='font-bold mb-5 border-b pb-2'>Approved</h3>
                                    {allHolidays
                                        .filter(holiday => holiday.status === "approved")
                                        .map((holiday, index) => (
                                            <HolidayCard holidayObj={holiday} baseURL={baseURL} userLoggedIn={user} fetchAllHolidays={fetchAllHolidays} activeFilter={activeFilter} />
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
                        )}

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