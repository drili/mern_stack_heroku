import React, { useContext, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from "moment"
import { Card } from 'flowbite-react'
import axios from 'axios'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { AiFillInfoCircle } from "react-icons/ai"

import PageHeading from '../components/PageHeading'
import { UserContext } from '../context/UserContext'
import "../assets/css/calendar/calendar.css"
import TimeRegistrationTable from '../components/time-registrations/TimeRegistrationTable'
import { ConfigContext } from '../context/ConfigContext'

function formatDateToISO(ddmmyyyy) {
    const [day, month, year] = ddmmyyyy.split('-');
    return `${year}-${month}-${day}`;
}

const TimeRegistrations = () => {
    const localizer = momentLocalizer(moment);
    const { user } = useContext(UserContext)
    const [events, setEvents] = useState()
    const [eventsByDate, setEventsByDate] = useState([])

    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const CustomEvent = ({ event }) => {
        return (
            <div>
                {event.title}
            </div>
        )
    }

    const fetchUserRegistrations = async (userId) => {
        try {
            const response = await axios.post(`${tenantBaseURL}/time-registrations/time-registered-by-user`, { userId })
            const formattedEvents = response.data.map(item => {
                const itemDate = item.currentTime
                const formattedNewDate = formatDateToISO(itemDate)
                return {
                    id: `${formattedNewDate}`,
                    title: `${item.totalRegisteredTime} hours`,
                    start: formattedNewDate,
                    end: formattedNewDate
                }
            })

            setEvents(formattedEvents)
        } catch (error) {
            console.error('Failed to fetch time registrations', error)
        }
    }

    const fetchRegistrationsByDate = async (date) => {
        try {
            const response = await axios.get(`${tenantBaseURL}/time-registrations/time-registrations-by-date/${date}/${user.id}`)
            setEventsByDate(response.data)

        } catch (error) {
            console.error('Failed to fetch time registrations by date', error)
        }
    }

    useEffect(() => {
        fetchUserRegistrations(user.id)
    }, [user])

    const handleSelected = (event) => {
        console.log(event.id);
        const eventDate = formatDateToISO(event.id)
        fetchRegistrationsByDate(eventDate)
    }

    return (
        <div id='TimeRegistrations'>
            <PageHeading
                heading="Time Registrations"
                subHeading={`Your own personal time registrations, mapped over a calendar. Click to edit/remove your time registrations`}
                suffix=""
            />

            <section className='grid grid-cols-10 gap-10 mb-10'>
                <div className='col-span-5'>
                    <div style={{ height: 500 }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            components={{
                                event: CustomEvent,
                            }}
                            startAccessor="start"
                            endAccessor="end"
                            defaultDate={new Date()}
                            views={{
                                month: true,
                                day: false,
                                week: false,
                                agenda: true
                            }}
                            dayPropGetter={(date, events) => {
                                if (date.getDay() === 0 || date.getDay() === 6) {
                                    return {
                                        className: 'weekend-day',
                                    };
                                }
                                { };
                            }}
                            onSelectEvent={handleSelected}
                            eventPropGetter={
                                (event, start, end, isSelected) => {
                                    let newStyle = {
                                        backgroundColor: "#fbcfe8",
                                        color: 'black',
                                        // borderRadius: "0px",
                                        // border: "1px solid #be185d"
                                    };

                                    const numericPart = parseFloat(event.title.match(/\d+(\.\d+)?/)[0]);
                                    if (numericPart >= 7.5) {
                                        newStyle.backgroundColor = "#be185d"
                                        newStyle.color = "#fff"
                                    }

                                    return {
                                        className: "",
                                        style: newStyle
                                    };
                                }
                            }
                        />
                    </div>
                </div>

                <div className='col-span-5'>
                    <Card className='py-4 px-4 col-span-6 flex rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-auto border-gray-200 shadow-none'>
                        <h3 className="text-black text-lg font-medium">Your time registrations</h3>
                        <span className='flex gap-1 items-center flex-row'>
                            <AiFillInfoCircle />
                            <p className='text-xs text-zinc-800'>Pick date to see your time registrations.</p>
                        </span>

                        <span className='relative'>
                            <TimeRegistrationTable
                                eventObj={eventsByDate}
                                toast={toast}
                                fetchUserRegistrations={fetchUserRegistrations}
                                userId={user.id}
                                tenantId={user.tenant_id}
                            />
                        </span>
                    </Card>
                </div>
            </section>

        </div>
    )
}

export default TimeRegistrations