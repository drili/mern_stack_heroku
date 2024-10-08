import axios from 'axios'
import React from 'react'

const HolidayCard = ({ holidayObj, baseURL, userLoggedIn, fetchAllHolidays }) => {
    if (!holidayObj) {
        return false
    }

    const handleApprove = async (holidayId) => {
        if (holidayId) {
            try {
                const response = await axios.put(`${baseURL}/${userLoggedIn.tenant_id}/holidays/approve-holiday/${holidayId}`)
                fetchAllHolidays()
            } catch (error) {
                console.error("Error approving holiday", error)
            }
        }
    }

    const handleDecline = async (holidayId) => {
        if (holidayId) {
            try {
                const response = await axios.put(`${baseURL}/${userLoggedIn.tenant_id}/holidays/decline-holiday/${holidayId}`)
                fetchAllHolidays()
            } catch (error) {
                console.error("Error declining holiday", error)
            }
        }
    }
    return (
        <div className={`${holidayObj.status === "declined" ? "bg-red-200" : "bg-white"} task-card flex justify-between p-3 mb-2 border border-custom-bg-gray rounded hover:bg-gray-100 cursor-pointer relative group`}>
            <div>
                <p className='text-sm'>Date: from <b className='text-sm underline text-pink-700'>{holidayObj.startTime}</b> to <b className='text-sm underline text-pink-700'>{holidayObj.endTime}</b></p>
                <p className='text-sm'>Days: <b>{holidayObj.totalDays}</b></p>
                <p className='text-sm'>Applicant: <b className='text-sm'>{holidayObj.userId.username}</b></p>
            </div>
            <div>
                <img className='h-8 w-8 rounded object-cover' src={`${baseURL}/uploads/${holidayObj.userId.profileImage}`} />
            </div>

            {holidayObj.status === "pending" && userLoggedIn?.user_role === 1 && (
                <div className='gap-4 absolute justify-center text-center margin-auto w-full top-0 left-0 items-center h-full z-10 hidden group-hover:flex bg-black/75 rounded'>
                    <button onClick={() => handleDecline(holidayObj._id)} className='rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer bg-white'>Decline</button>
                    <button onClick={() => handleApprove(holidayObj._id)} className='rounded text-sm min-h-[45px] cursor-pointer bg-pink-700 text-white border-none'>Approve</button>
                </div>
            )}

            {holidayObj.status === "approved" && userLoggedIn?.user_role === 1 && (
                <div className='gap-4 absolute justify-center text-center margin-auto w-full top-0 left-0 items-center h-full z-10 hidden group-hover:flex bg-black/75 rounded'>
                    <button onClick={() => handleDecline(holidayObj._id)} className='rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer bg-white'>Decline</button>
                </div>
            )}
        </div>
    )
}

export default HolidayCard