import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { BsFillTrashFill } from 'react-icons/bs';

import { UserContext } from '../../../context/UserContext';
import { ConfigContext } from '../../../context/ConfigContext';

const ViewCustomerNotesComponent = ({ customerId, selectedSprint }) => {
    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const [customerNotes, setCustomerNotes] = useState([])

    const handleDeleteNote = async (noteId) => {
        if (noteId) {
            try {
                const response = await axios.delete(`${tenantBaseURL}/customer-notes/delete-customer-notes/${noteId}`)

                if (response.status === 200 || response.status === 201) {
                    handleFetchCustomerNotes(customerId, selectedSprint)
                }
            } catch (error) {
                console.error("Error deleting customer notes", error)
            }
        }
    }

    const handleFetchCustomerNotes = async (customerId, selectedSprint) => {
        let sprintId
        if (selectedSprint.sprintId) {
            sprintId = selectedSprint.sprintId
        } else {
            sprintId = selectedSprint._id
        }

        if (customerId && sprintId) {
            try {
                const response = await axios.get(`${tenantBaseURL}/customer-notes/fetch-customer-notes?customerId=${customerId}&sprintId=${sprintId}`)
                setCustomerNotes(response.data)
            } catch (error) {
                console.error("Error fetching customer notes", error)
            }
        }
    }

    useEffect(() => {
        handleFetchCustomerNotes(customerId, selectedSprint)
    }, [selectedSprint, customerId])

    return (
        <div id='ViewCustomerNotesComponent'>
            {customerNotes.length < 1 && (
                <p>No notes found.</p>
            )}
            {customerNotes && customerNotes.map(note => (
                <div className="py-6 mx-auto bg-white space-y-4 border-b border-stone-100" key={note._id}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{note.noteTitle}</h2>
                        <span className="text-sm text-gray-500">Created: {note.createdAt}</span>
                    </div>

                    <div
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{ __html: note.noteContent }}
                    />

                    <div className="flex justify-between items-center relative">
                        <span className="text-sm text-gray-400">Created by: {note.createdBy.username}</span>

                        {note.createdBy._id === user.id && (
                            <span className='flex gap-2 mt-2 mr-2 absolute right-0 bottom-0'>
                                <button
                                    className='delete-button group-hover:block bg-stone-100 rounded py-2 px-3'
                                    onClick={() => handleDeleteNote(note._id)}
                                    id={note._id}
                                >
                                    <BsFillTrashFill className='text-xs text-rose-500' />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ViewCustomerNotesComponent