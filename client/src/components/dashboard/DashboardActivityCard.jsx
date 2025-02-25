import React, { useEffect } from 'react'

const DashboardActivityCard = ({ data }) => {

    const accumulateTimeByType = (data) => {
        const timeAccumulated = {
            intern: 0,
            client: 0,
            offtime: 0,
            sicktime: 0
        }

        data.forEach(item => {
            if (item.registrationType in timeAccumulated) {
                timeAccumulated[item.registrationType] += item.timeRegistered
            }
        })

        return timeAccumulated
    }

    const accumulatedTime = accumulateTimeByType(data)

    return (
        <div className='flex flex-col h-full justify-between'>
            <h3 className="text-black text-lg font-medium">Your recent activity this month</h3>
            <div id="recentActivity" className="grid grid-cols-2 place-items-center text-center">
                <div className="w-full py-5 px-2 border-r border-b border-solid border-gray-100">
                    <h2 className={`${accumulatedTime.intern > 0 ? "text-teal-200" : "text-black"} font-bold`}>{accumulatedTime.intern} hours</h2>
                    <p>Intern time</p>
                </div>
                <div className="w-full py-5 px-2 border-l border-b border-solid border-gray-100">
                    <h2 className={`${accumulatedTime.client > 0 ? "text-teal-200 font-bold" : "text-black"} font-bold`}>{accumulatedTime.client} hours</h2>
                    <p>Client time</p>
                </div>
                <div className="w-full py-5 px-2 border-r border-t border-solid border-gray-100">
                    <h2 className={`${accumulatedTime.offtime > 0 ? "text-teal-200 font-bold" : "text-black"} font-bold`}>{accumulatedTime.offtime} hours</h2>
                    <p>Off time</p>
                </div>
                <div className="w-full py-5 px-2 border-l border-t border-solid border-gray-100">
                    <h2 className={`${accumulatedTime.sicktime > 0 ? "text-teal-200 font-bold" : "text-black"} font-bold`}>{accumulatedTime.sicktime} hours</h2>
                    <p>Sick time</p>
                </div>
            </div>

            <span>
                <p className='text-neutral-500 text-sm mt-5'>* Percentage allocated from time registrations based on task information.</p>
            </span>
        </div>
    )
}

export default DashboardActivityCard