import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import PageHeading from '../../components/PageHeading'
import TaskModal from '../../components/task/TaskModal'
import useTaskModal from '../../functions/useTaskModal'

const TaskView = () => {
    const [taskID, setTaskID] = useState(null)
    const { showModal, setShowModal, handleTaskModal, onCloseModal } = useTaskModal()

    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const urlTaskID = query.get("taskID")

    useEffect(() => {
        setTaskID(urlTaskID)
    }, [urlTaskID])

    useEffect(() => {
        if (taskID) {
            setShowModal(true)
        }
    }, [taskID])

    return (
        <div id='taskViewPage'>
            {taskID ? (
                <div>
                    <PageHeading 
                        heading="Task View"
                        subHeading={`View of specific task (modal)`}
                        suffix={`Task ID: ${taskID}`}
                    />

                    <section className='flex'>
                        <button 
                            onClick={() => handleTaskModal(taskID)}
                            className='rounded text-sm min-h-[45px] border border-zinc-400 cursor-pointer  bg-pink-700 border-none text-white'>Re-open Task</button>
                    </section>

                    <TaskModal 
                        taskID={taskID}
                        showModalState={showModal}
                        onCloseModal={onCloseModal}
                    />
                </div>
            ) : (
                <PageHeading 
                    heading="Task View"
                    subHeading={`Error: No task ID found`}
                    suffix=""
                />
            )}
        </div>
    )
}

export default TaskView