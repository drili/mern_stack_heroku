import React, { useState, useContext, useEffect } from 'react'
import { Accordion, Table } from 'flowbite-react'
import axios from 'axios'
import { FaSpinner } from 'react-icons/fa'

import PageHeading from '../../components/PageHeading'
import TimeRegVerticalsOverviewFilter from '../../components/admin/TimeRegVerticalsOverviewFilter'
import getCurrentSprint from '../../functions/getCurrentSprint'
import { ConfigContext } from '../../context/ConfigContext'
import { UserContext } from '../../context/UserContext'

const TaskVerticalsOverview = () => {
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

        fetchTimeRegsVerticals(selectedSprint?._id)
    }

    const fetchTimeRegsVerticals = async (sprintId) => {
        if (!sprintId) {
            return
        }

        try {
            const response = await axios.get(`${tenantBaseURL}/time-registrations/time-registrations-verticals-aggregated/${sprintId}`)

            console.log(response.data)
            if (response.status == 200) {
                setTimeout(() => {
                    setTimeRegistrations(response.data)
                    setIsLoading(false)
                }, 200)
            }
            // console.log(response.data)
        } catch (error) {
            console.error('Failed to fetch time registrations', error)
        }
    }

    useEffect(() => {
        if (activeSprint?.sprintId) {

            fetchTimeRegsVerticals(activeSprint?.sprintId)
        }
    }, [activeSprint])

    return (
        <div id='TaskVerticalsOverviewPage'>
            <h2 className='text-black text-xl font-bold mb-2'>Tasks verticals overview</h2>
            <p className='text-neutral-500 text-sm mb-10'>Overview of task time registration pr. vertical</p>

            <TimeRegVerticalsOverviewFilter
                onSelectedSprint={handleSprintChange}
            />

            <div id='TaskVerticalsOverview-table'>
                <Accordion collapseAll={false}>
                    <Accordion.Panel>
                        <Accordion.Title>
                            <span className='flex gap-5 items-center'>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Verticals Time Registrations in {selectedSprint ? selectedSprint?.sprintName : `${activeSprint.sprintMonth} ${activeSprint.sprintYear}`}
                                </h2>
                            </span>
                        </Accordion.Title>

                        <Accordion.Content>
                            <section>
                                <Table className='relative'>
                                    <Table.Head>
                                        <Table.HeadCell className='text-left'>
                                            Vertical
                                        </Table.HeadCell>

                                        <Table.HeadCell className='text-left'>
                                            Total Time Registered
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
                                                <Table.Row className="bg-white  " key={regs.vertical}>
                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        {regs.vertical}
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        {regs.hoursRegistered}
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

export default TaskVerticalsOverview