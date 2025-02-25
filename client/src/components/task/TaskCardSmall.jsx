import React from 'react'
import { BsFillLightningChargeFill } from "react-icons/bs";

const TaskCardSmall = ({ taskId, taskName, taskDeadline, toggleSmallCards }) => {
    const MAX_DESC_LENGTH = 80
    const truncatedTaskName =
    taskName.length > MAX_DESC_LENGTH
        ? taskName.slice(0, MAX_DESC_LENGTH) + "..."
        : taskName

    return (
        <div
            id={taskId}
            className={`task-card bg-pink-100  block p-3 mb-2 border border-pink-200 rounded shadow hover:bg-pink-200    cursor-pointer relative`}
        >
            <span className='relative'>
                <section className='flex gap-2'>
                    <h3 className='font-bold leading-5'>{truncatedTaskName}</h3>
                </section>

                <section className='flex mt-2 justify-start'>
                    <span className='flex items-center gap-2'>
                        <p className='text-xs'>Deadline: <b>{taskDeadline}</b></p>
                        <span className='absolute right-0 bottom-0'>
                            <BsFillLightningChargeFill className='text-amber-500' />
                        </span>
                    </span>
                </section>
            </span>
        </div>
    )
}

export default TaskCardSmall