import React, { useContext, useState } from "react"
import axios from 'axios'
import { Link, useNavigate } from "react-router-dom"
import PageHeading from '../components/PageHeading'
import DashboardFilters from "../components/dashboard/DashboardFilters"
import DashboardCards from "../components/dashboard/DashboardCards"
import { UserContext } from '../context/UserContext'
import { useEffect } from "react"
import getCurrentSprint from "../functions/getCurrentSprint"
import monthWorkdays from "../functions/monthWorkdays"
import { Card } from "flowbite-react"
import DashboardWeeklyChart from "../components/dashboard/DashboardWeeklyChart"
import DashboardTeamEfforts from "../components/dashboard/DashboardTeamEfforts"
import DashboardActivityCard from "../components/dashboard/DashboardActivityCard"
import { ConfigContext } from "../context/ConfigContext"

const Dashboard = () => {
    const { user } = useContext(UserContext)
    const [selectedSprint, setSelectedSprint] = useState("")
    const activeSprint  = getCurrentSprint()
    const [workDays, setWorkDays] = useState("")
    const [tasks, setTasks] = useState([])
    const [activeSprintState, setActiveSprintState] = useState([])
    
    const [timeRegistered, setTimeRegistered] = useState([])
    const [totalAccumulatedTime, setTotalAccumulatedTime] = useState("")
    const [totalAllocatedTimeLow, setTotalAllocatedTimeLow] = useState("")
    const [totalAllocatedTimeHigh, setTotalAllocatedTimeHigh] = useState("")
    const [finishedTasks, setFinishedTasks] = useState([])
    const [timeRegisteredAll, setTimeRegisteredAll] = useState([])

    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const fetchTimeRegistrationsBySprint = async (sprintId) => {
        try {
            if(sprintId) {
                const response = await axios.get(`${tenantBaseURL}/time-registrations/fetch-users-time-regs-by-sprint/${sprintId}`)
                console.log({response})
                if (response.status === 200) {
                    setTimeRegisteredAll(response.data)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchTimeRegistrations = async (sprintId) => {
        try {
            if (sprintId) {
                const response = await axios.get(`${tenantBaseURL}/time-registrations/time-registered-user/${sprintId}/${user.id}/${user.tenant_id}`)
                
                if (response.status == 200) {
                    setTimeRegistered(response.data)
                    const totalAccumulatedTime = response.data.reduce((accumulator, time) => {
                        const timeValue = parseFloat(time?.timeRegistered)

                        if (!isNaN(timeValue)) {
                            accumulator += timeValue;
                        }

                        return accumulator
                    }, 0)

                    setTotalAccumulatedTime(totalAccumulatedTime)
                }
            }
        } catch (error) {
            console.error('Failed to fetch time registrations', error)
        }
    }

    const fetchTasksByUserAndSprint = async (activeSprintArray) => {
        try {
            if (activeSprintArray && activeSprintArray.sprintMonth) {
                const response = await axios.get(`${tenantBaseURL}/tasks/fetch-by-user-sprint/${user.id}?month=${activeSprintArray.sprintMonth}&year=${activeSprintArray.sprintYear}&tenantId=${user.tenant_id}`)

                const totalAllocatedTimeLow = response.data.reduce((accumulator, time) => {
                    const userTaskPerson = time.taskPersons.find(
                        (person) => person.user._id === user.id
                    )
                    const timeValueLow = parseFloat((userTaskPerson.percentage / 100) * time?.taskTimeLow)
                    
                    if (!isNaN(timeValueLow)) {
                        accumulator += timeValueLow;
                    }
                    return accumulator
                }, 0)

                const totalAllocatedTimeHigh = response.data.reduce((accumulator, time) => {
                    const userTaskPerson = time.taskPersons.find(
                        (person) => person.user._id === user.id
                    )
                    const timeValueHigh = parseFloat((userTaskPerson.percentage / 100) * time?.taskTimeHigh)

                    if (!isNaN(timeValueHigh)) {
                        accumulator += timeValueHigh;
                    }
                    return accumulator
                }, 0)

                const finishedTasks = response.data.filter(task => task.workflowStatus === 3);

                setTotalAllocatedTimeLow(totalAllocatedTimeLow)
                setTotalAllocatedTimeHigh(totalAllocatedTimeHigh)
                setFinishedTasks(finishedTasks)

                setTasks(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error)
        }
    }

    const handleSprintChange = (selectedValue, selectedSprint) => {
        setSelectedSprint(selectedValue)
        fetchTimeRegistrations(selectedValue)
        fetchTimeRegistrationsBySprint(selectedValue)
        fetchTasksByUserAndSprint(selectedSprint)
        setActiveSprintState(selectedSprint)

        const monthWorkdaysRes = monthWorkdays(selectedSprint?.sprintMonth, selectedSprint?.sprintYear)
        setWorkDays(monthWorkdaysRes)
    }

    useEffect(() => {
        fetchTimeRegistrations(activeSprint?.sprintId)
        fetchTimeRegistrationsBySprint(activeSprint?.sprintId)
        fetchTasksByUserAndSprint(activeSprint)
        setActiveSprintState(activeSprint)

        // const monthWorkdaysRes = monthWorkdays("September", "2023")
        const monthWorkdaysRes = monthWorkdays(activeSprint?.sprintMonth, activeSprint?.sprintYear)
        setWorkDays(monthWorkdaysRes)
    }, [activeSprint])

    return (
        <div id='dashboardPage'>
            <PageHeading 
                heading="Dashboard"
                subHeading={`Welcome to your user dashboard`}
                suffix="A quick overview of your data."
            />

            <DashboardFilters
                onSelectedSprint={handleSprintChange}
            ></DashboardFilters>
            

            <section id="topCards" className='grid grid-cols-1 gap-10 mb-10 md:grid-cols-3'>
                <DashboardCards
                    totalAccumulatedTime={totalAccumulatedTime}
                    workDays={workDays}
                    finishedTasks={finishedTasks}
                    tasks={tasks}
                    totalAllocatedTimeLow={totalAllocatedTimeLow}
                    totalAllocatedTimeHigh={totalAllocatedTimeHigh}
                ></DashboardCards>
            </section>

            <section id="timeRegsWeekly" className="grid grid-cols-1 gap-10 mb-10 md:grid-cols-2">
                <span>
                    <Card className="h-full border-gray-200 shadow-none bg-stone-100 border-none">
                        <div>
                            <span className="flex flex-col gap-2 mb-5">
                                <h3 className="text-black text-lg font-medium">Your time registrations this week</h3>
                            </span>

                            <span className="flex flex-col gap-2">
                                <DashboardWeeklyChart
                                    fetchTimeRegistrations={timeRegistered}
                                ></DashboardWeeklyChart>
                            </span>
                        </div>
                    </Card>
                </span>

                <span>
                    <Card className="h-full shadow-none border-gray-200">
                        <DashboardActivityCard data={timeRegistered} />
                    </Card>
                </span>
            </section>

            <section id="teamRegSection" className="mt-20 mb-20">
                <DashboardTeamEfforts
                    registrationData={timeRegisteredAll}
                    activeSprint={activeSprintState}
                />
            </section>
        </div>
    )
}

export default Dashboard