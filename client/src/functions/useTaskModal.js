import { useState } from 'react'

const useTaskModal = () => {
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const handleTaskModal = (taskId) => {
        console.log({taskId});
        setShowModal(true)
        setSelectedTaskId(taskId)
    }

    const onCloseModal = () => {
        setShowModal(false)
    }

    return {
        selectedTaskId,
        showModal,
        setShowModal,
        handleTaskModal,
        onCloseModal,
    }
}

export default useTaskModal