import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/UserContext';
import { ConfigContext } from '../../../context/ConfigContext';

const ViewCustomerNotesComponent = ({ customerId, selectedSprint }) => {
    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const [customerNotes, setCustomerNotes] = useState([])

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
                    <p className="text-gray-700">{note.noteContent}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Created by: {note.createdBy}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ViewCustomerNotesComponent