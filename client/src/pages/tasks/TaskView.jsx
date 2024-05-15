import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import PageHeading from '../../components/PageHeading'
import TaskModal from '../../components/task/TaskModal'
import useTaskModal from '../../functions/useTaskModal'

// TODO: Finish task view
// Trello: https://trello.com/c/GcEGA8db/43-new-task-view
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
                            className='my-button button text-white bg-rose-500 hover:bg-violet-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-auto px-5 py-2.5 text-center'>Re-open Task</button>
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