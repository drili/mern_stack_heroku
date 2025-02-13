import React, { useContext, useEffect, useState } from 'react'
import { Accordion, Table } from 'flowbite-react'
import axios from 'axios'
import { FaSpinner } from 'react-icons/fa'

import PageHeading from '../../components/PageHeading'
import TimeRegOverviewFilter from '../../components/admin/TimeRegOverviewFilter'
import CustomCodeBlock from '../../components/CustomCodeBlock'
import getCurrentSprint from '../../functions/getCurrentSprint'
import { ConfigContext } from '../../context/ConfigContext'
import { UserContext } from '../../context/UserContext'

const TimeRegistrationsOverview = () => {
    const [selectedSprint, setSelectedSprint] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [timeRegistrations, setTimeRegistrations] = useState([])
    const activeSprint = getCurrentSprint()

    const { user } = useContext(UserContext)

    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const handleSprintChange = (selectedValue, selectedSprint) => {
        setSelectedSprint(selectedSprint)
        setIsLoading(true)

        fetchTimeRegs(selectedSprint?._id)
    }

    const fetchTimeRegs = async (sprintId) => {
        if (!sprintId) {
            return
        }

        try {
            const response = await axios.get(`${tenantBaseURL}/time-registrations/fetch-users-time-regs-by-sprint/${sprintId}`)

            if (response.status == 200) {
                setTimeout(() => {
                    setTimeRegistrations(response.data)
                    setIsLoading(false)
                }, 200)
            }
        } catch (error) {
            console.error('Failed to fetch time registrations', error)
        }
    }

    useEffect(() => {
        if (activeSprint?.sprintId) {

            fetchTimeRegs(activeSprint?.sprintId)
        }
    }, [activeSprint])

    return (
        <div id='TimeRegistrationsOverview'>
            <h2 className='text-black text-xl font-bold mb-2'>Time registrations overview</h2>
            <p className='text-neutral-500 text-sm mb-10'>An overview of time registrations pr. user`</p>

            <TimeRegOverviewFilter
                onSelectedSprint={handleSprintChange}
            />

            <div id='TimeRegistrationsOverview-table'>
                <Accordion collapseAll={false}>
                    <Accordion.Panel>
                        <Accordion.Title>
                            <span className='flex gap-5 items-center'>
                                <h2 className="text-lg font-bold text-black">
                                    Time Registrations in {selectedSprint ? selectedSprint?.sprintName : `${activeSprint.sprintMonth} ${activeSprint.sprintYear}`}
                                </h2>
                            </span>
                        </Accordion.Title>

                        <Accordion.Content>
                            <section>
                                <Table className='relative'>
                                    <Table.Head>
                                        <Table.HeadCell className='text-left text-black'>
                                            Name
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Total Time Registered
                                        </Table.HeadCell>

                                        <Table.HeadCell className='text-left text-black'>
                                            Intern Time
                                        </Table.HeadCell>

                                        <Table.HeadCell className='text-left text-black'>
                                            Client Time
                                        </Table.HeadCell>

                                        <Table.HeadCell className='text-left text-black'>
                                            Off- & Sicktime
                                        </Table.HeadCell>
                                    </Table.Head>

                                    <Table.Body className="divide-y">
                                        {isLoading ? (
                                            <Table.Row className="bg-white  ">
                                                <Table.Cell>
                                                    <div className="absolute top-5 left-0 w-full h-full flex items-center justify-center">
                                                        <FaSpinner className="animate-spin text-rose-500 text-4xl" />
                                                    </div>
                                                </Table.Cell>
                                            </Table.Row>
                                        ) : (
                                            timeRegistrations &&
                                            timeRegistrations.map((regs) => (
                                                <Table.Row className="bg-white  " key={regs._id}>
                                                    <Table.Cell className="whitespace-nowrap text-black font-bold ">
                                                        {regs.username}
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        {regs.totalTime}
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        {regs.internTime}
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        {regs.clientTime}
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        {regs.restTime}
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))
                                        )}

                                    </Table.Body>
                                </Table>
                            </section>
                        </Accordion.Content>
                    </Accordion.Panel>
                </Accordion>
            </div>
        </div>
    )
}

export default TimeRegistrationsOverview