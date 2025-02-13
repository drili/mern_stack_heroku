import React, { useContext, useEffect, useState } from 'react'
import { Table } from 'flowbite-react'
import { FaSpinner } from 'react-icons/fa'

import DashboardTeamEffortsDoughnutChart from './DashboardTeamEffortsDoughnutChart'
import { ConfigContext } from '../../context/ConfigContext'

const DashboardTeamEfforts = ({ registrationData, activeSprint }) => {
    // console.log({ registrationData });
    const [isLoading, setIsLoading] = useState(true)
    const [imageSrc, setImageSrc] = useState(null)

    const { baseURL } = useContext(ConfigContext);

    useEffect(() => {
        setIsLoading(false)
        setImageSrc(baseURL + "/uploads/")
    }, [registrationData])

    return (
        <div id='DashboardTeamEfforts'>
            <section className='mb-10'>
                <h2 className='font-extrabold text-3xl'>Team Effort In <span className='text-pink-700'>{activeSprint.sprintMonth} {activeSprint.sprintYear}</span></h2>
            </section>
            <>
                <div className='overflow-x-auto'>
                    <Table className='min-w-full relative'>
                        <Table.Head>
                            <Table.HeadCell className='text-left text-black capitalize text-base bg-stone-100'>
                                User
                            </Table.HeadCell>
                            <Table.HeadCell className='text-left text-black capitalize text-base bg-stone-100'>
                                Total Time Registered
                            </Table.HeadCell>

                            <Table.HeadCell className='text-left text-black capitalize text-base bg-stone-100'>
                                Intern Time
                            </Table.HeadCell>

                            <Table.HeadCell className='text-left text-black capitalize text-base bg-stone-100'>
                                Client Time
                            </Table.HeadCell>

                            <Table.HeadCell className='text-left text-black capitalize text-base bg-stone-100'>
                                Off- & Sicktime
                            </Table.HeadCell>

                            <Table.HeadCell className='text-left text-black capitalize text-base bg-stone-100'>
                                Attribution
                            </Table.HeadCell>
                        </Table.Head>

                        <Table.Body className="divide-y">
                            {isLoading ? (
                                <Table.Row className="bg-white  ">
                                    <Table.Cell>
                                        <div className="absolute top-5 left-0 w-full h-full flex items-center justify-center">
                                            <FaSpinner className="animate-spin text-pink-700 text-4xl" />
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ) : (
                                registrationData &&
                                registrationData.map((regs) => (
                                    <Table.Row className="bg-white  " key={regs._id}>
                                        <Table.Cell className="whitespace-nowrap font-medium text-slate-800">
                                            <div className='flex gap-5 items-center'>
                                                <span className='w-[40px] h-[40px]'>
                                                    <img
                                                        className='w-[40px] h-[40px] rounded object-cover ml-2'
                                                        src={`${imageSrc}${regs.profileImage}`} /
                                                    >
                                                </span>
                                                <span>
                                                    {regs.username}
                                                </span>
                                            </div>
                                        </Table.Cell>

                                        <Table.Cell className="whitespace-nowrap text-pink-700 font-bold">
                                            {regs.totalTime} hours
                                        </Table.Cell>

                                        <Table.Cell className="whitespace-nowrap font-medium text-slate-800 ">
                                            {regs.internTime} hours
                                        </Table.Cell>

                                        <Table.Cell className="whitespace-nowrap font-medium text-slate-800 ">
                                            {regs.clientTime} hours
                                        </Table.Cell>

                                        <Table.Cell className="whitespace-nowrap font-medium text-slate-800 ">
                                            {regs.restTime} hours
                                        </Table.Cell>

                                        <Table.Cell className="whitespace-nowrap font-medium text-slate-800 ">
                                            <div className='max-h-[50px]'>
                                                {regs.totalTime > 0 ? (
                                                    <DashboardTeamEffortsDoughnutChart
                                                        data={regs}
                                                    />
                                                ) : (
                                                    <div></div>
                                                )}
                                            </div>
                                        </Table.Cell>

                                    </Table.Row>
                                ))
                            )}

                        </Table.Body>
                    </Table>
                </div>
            </>
        </div>
    )
}

export default DashboardTeamEfforts