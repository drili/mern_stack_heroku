import React from 'react'
import { Card } from "flowbite-react"
import { BsFillClockFill, BsFillAwardFill, BsFillClipboard2CheckFill, BsFillPlusSquareFill } from "react-icons/bs"

const DashboardCards = ({
    totalAccumulatedTime,
    workDays,
    finishedTasks,
    tasks,
    totalAllocatedTimeLow,
    totalAllocatedTimeHigh
}) => {

    return (
        <>
            <span>
                <Card className="h-full border-gray-200 shadow-none">
                    <div>
                        <span className="flex flex-col gap-2 mb-5">
                            <h3 className="text-black text-lg font-medium">Your Time Registered This Month</h3>
                            <h2 className="text-4xl font-extrabold flex gap-2 mt-4 mb-0 text-pink-700">
                                <BsFillClockFill /> {totalAccumulatedTime} hours
                            </h2>
                        </span>

                        <span className="flex flex-col gap-2">
                            <span className="relative">
                                <span className="line absolute block h-[2px] bg-slate-100 w-full"></span>
                                <span
                                    className={`line absolute block h-[2px] bg-slate-500 max-w-[100%]`}
                                    style={{ width: `${parseFloat((totalAccumulatedTime / (workDays * 8)) * 100, 2).toFixed(0)}%` }}
                                ></span>
                            </span>
                            <p className="text-neutral-500 text-sm">{parseFloat((totalAccumulatedTime / (workDays * 8)) * 100, 2).toFixed(2)}% of total ({workDays * 8} hours)</p>
                        </span>
                    </div>
                </Card>
            </span>

            <span>
                <Card className="h-full border-gray-200 shadow-none">
                    <div>
                        <span className="flex flex-col gap-2 mb-5">
                            <h3 className="text-black text-lg font-medium">Finished tasks this month</h3>
                            <h2 className="text-4xl font-extrabold flex gap-2 mt-4 mb-0">
                                <BsFillClipboard2CheckFill /> {finishedTasks.length} tasks
                            </h2>
                        </span>

                        <span className="flex flex-col gap-2">
                            <span className="relative">
                                <span className="line absolute block h-[2px] bg-slate-100 w-full"></span>
                                <span
                                    className={`line absolute block h-[2px] bg-slate-500`}
                                    style={{ width: `${parseFloat((finishedTasks.length / tasks.length) * 100, 2).toFixed(0)}%` }}
                                ></span>
                            </span>
                            <p className="text-neutral-500 text-sm">{parseFloat((finishedTasks.length / tasks.length) * 100, 2).toFixed(2)}% of total ({tasks.length} tasks)</p>
                        </span>
                    </div>
                </Card>
            </span>

            <span>
                <Card className="h-full border-gray-200 shadow-none">
                    <span className="flex flex-col gap-2 mb-5">
                        <h3 className="text-black text-lg font-medium">Total allocated time this month</h3>
                        <h2 className="text-4xl font-extrabold flex gap-2 mt-4 mb-0">
                            <BsFillPlusSquareFill/>
                            {parseFloat(((totalAllocatedTimeLow + totalAllocatedTimeHigh) / 2).toFixed(2))} hours
                        </h2>
                    </span>

                    <span className="flex flex-col gap-2">
                        <p className="text-neutral-500 text-sm">Allocated Low: <b>{parseFloat(totalAllocatedTimeLow).toFixed(2)}</b> • Allocated High: <b>{parseFloat(totalAllocatedTimeHigh).toFixed(2)}</b></p>
                    </span>
                </Card>
            </span>
        </>
    )
}

export default DashboardCards