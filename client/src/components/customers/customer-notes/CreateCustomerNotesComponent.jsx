import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import toast from 'react-hot-toast';

import GenericForm from '../../GenericForm'
import { UserContext } from '../../../context/UserContext';
import { ConfigContext } from '../../../context/ConfigContext';

const CreateCustomerNotesComponent = ({ customerId, selectedSprint }) => {
    const inputClasses = "h-[40px] border rounded focus:border-pink-700 p-0 px-3 w-full block mb-4"
    const labelClasses = "text-sm font-medium mb-2 block "

    const [sprints, setSprints] = useState([])
    const [activeSprintId, setActiveSprintId] = useState(null)

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const fetchSprints = async () => {
        try {
            const response = await axios.get(baseURL + "/sprints/fetch")
            setSprints(response.data)
        } catch (error) {
            console.error('Failed to fetch sprints', error);
        }
    }

    const handleCreateForm = async (data) => {
        data.preventDefault()

        const formData = {
            customerId: customerId,
            userId: user.id,
            sprintId: data.target["selectMonth"].value,
            noteTitle: data.target["noteTitle"].value,
            noteContent: data.target["noteContent"].value
        }

        if (formData && data.target["selectMonth"].value != 0) {
            try {
                const response = await axios.post(`${tenantBaseURL}/customer-notes/create-note`, formData);
                toast('Note has successfully created', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
            } catch (error) {
                console.error("Error creating customer note", error)
            }
        }
    }

    useEffect(() => {
        if (selectedSprint._id) {
            setActiveSprintId(selectedSprint._id)
        } else if (selectedSprint.sprintId) {
            setActiveSprintId(selectedSprint.sprintId)
        }
        
        fetchSprints()
    }, [customerId, selectedSprint])

    return (
        <div id='CreateCustomerNotesComponent' className='grid grid-cols-12'>
            <section className='col-span-8'>
                <form onSubmit={(data) => handleCreateForm(data)}>
                    <label className={labelClasses}>Title</label>
                    <input type="text" required className={inputClasses} name='noteTitle' />

                    <label className={labelClasses}>Note content</label>
                    <textarea type="text" required className="min-h-[200px] w-full rounded" name='noteContent' />

                    <label className={labelClasses}>Select sprint</label>
                    <select
                        className={`${inputClasses} min-w-[200px]`}
                        defaultValue=""
                        name='selectMonth'
                    >
                        {sprints && sprints.map((sprint) => (
                            <option
                                key={sprint?._id}
                                value={`${sprint?._id}`}
                                selected={sprint?._id === activeSprintId ? "true" : ""}
                            >
                                {sprint?.sprintName}
                            </option>
                        ))}
                    </select>

                    <input type="submit" className='my-button w-full bg-black text-white py-3 rounded mt-5' value="Create note" />
                </form>
            </section>
        </div>
    )
}

export default CreateCustomerNotesComponent