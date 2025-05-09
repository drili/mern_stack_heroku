import React, { useContext, useEffect, useState } from 'react'
import { Accordion, Table } from 'flowbite-react'
import { FaSpinner } from 'react-icons/fa'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

import PageHeading from '../../components/PageHeading'
import CustomCodeBlock from '../../components/CustomCodeBlock'
import PersonsOverviewFilter from '../../components/admin/PersonsOverviewFilter'
import { ConfigContext } from '../../context/ConfigContext'
import { UserContext } from '../../context/UserContext'
import Register from './Register'

const PersonsOverview = () => {
    const [usersData, setUsersData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [imageSrc, setImageSrc] = useState(null)

    const [editedUsers, setEditedUsers] = useState({});
    const [isChecked, setIsChecked] = useState({})

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const inputClasses = "bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
    const labelClasses = "block mb-2 text-sm font-medium text-gray-900 "

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${tenantBaseURL}/users/fetch-all-users`)
            if (response.status === 200) {
                setUsersData(response.data)
                setTimeout(() => {
                    setIsLoading(false)
                }, 250);
            }
        } catch (error) {
            console.error('Failed to fetch all users', error)
        }
    }

    const handleInputChange = (event, userId) => {
        const { name, value } = event.target
        setEditedUsers((prevEditedUsers) => ({
            ...prevEditedUsers,
            [userId]: {
                ...prevEditedUsers[userId],
                [name]: value
            }
        }))
    }

    const handleEditUser = async (userId) => {
        const editedData = editedUsers[userId]
        
        if (!editedData) {
            return
        }

        try {
            const response = await axios.put(`${tenantBaseURL}/users/update-users/${userId}`, editedData)

            if(response.status === 200) {
                toast(`${response.data.username} updated successfully!`, {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
            } else {
                console.error('Failed to update user');
            }
        } catch (error) {
            console.error('Failed to update user', error);
        }
    }

    const handleActivationChange = async (userId, event) => {
        const { checked } = event.target;

        setIsChecked((prevIsChecked) => ({
            ...prevIsChecked,
            [userId]: checked
        }));

        try {
            const response = await axios.put(`${tenantBaseURL}/users/update-user-activation/${userId}`, {
                isActivated: checked,
            })

            if (response.status === 200) {
                console.log(`User ${userId} is now ${checked ? 'activated' : 'archived'}`);
            } else {
                console.error('Failed to update user activation status');
            }
        } catch (error) {
            console.error('Error occurred while updating user activation status:', error);
        }
    }

    useEffect(() => {
        setImageSrc(baseURL + "/uploads/")
        fetchUsers()
    }, [])

    return (
        <div id='PersonsOverviewPage'>
            <h2 className='text-black text-xl font-bold mb-2'>Users overview</h2>
            <p className='text-neutral-500 text-sm mb-10'>An overview of active and archived users</p>

            <PersonsOverviewFilter userObject={user} />

            <div id='PersonsOverviewPage-table'>
                <Accordion collapseAll={false}>
                    <Accordion.Panel>
                        <Accordion.Title>
                            <span className='flex gap-5 items-center'>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Overview of all active and archived users
                                </h2>
                            </span>
                        </Accordion.Title>

                        <Accordion.Content>
                            <section className='overflow-x-auto'>
                                <Table className='relative'>
                                    <Table.Head>
                                        <Table.HeadCell className='text-left text-black hidden'>
                                            User ID
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Status
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Image
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Email
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Username
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Password
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Title
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Role
                                        </Table.HeadCell>
                                        <Table.HeadCell className='text-left text-black'>
                                            Slack ID
                                        </Table.HeadCell>
                                    </Table.Head>

                                    <Table.Body className="divide-y">
                                        {isLoading ? (
                                            <Table.Row className="bg-white  ">
                                                <Table.Cell>
                                                    <div className="absolute top-5 left-0 w-full h-full flex items-center justify-center">
                                                        <FaSpinner className="animate-spin text-rose-500 text-4xl" />
                                                    </div>
                                                </Table.Cell>
                                            </Table.Row>
                                        ) : (
                                            usersData &&
                                            usersData.map((user) => (
                                                <Table.Row className="bg-white  " key={user._id}>
                                                    <Table.Cell className="whitespace-nowrap font-light text-gray-900 hidden">
                                                        <input className={inputClasses} value={user._id} disabled />
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        {/* {user.isActivated === true ? "Active" : "Archived"} */}
                                                        <label className="relative inline-flex items-center mb-0 cursor-pointer">
                                                            <input
                                                                type="checkbox" 
                                                                className="sr-only peer"
                                                                name='isActivated'
                                                                checked={(isChecked[user._id] !== undefined ? isChecked[user._id] : user.isActivated === true)}
                                                                onChange={(e) => handleActivationChange(user._id, e)}
                                                            />
                                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all  peer-checked:bg-green-500"></div>
                                                            <span className="ml-3 text-sm font-medium text-gray-900"></span>
                                                        </label>
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        <img 
                                                        className='w-[40px] h-[40px] rounded object-cover ml-2'
                                                        src={`${imageSrc}${user.profileImage}`} /
                                                        >
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        <input 
                                                            className={inputClasses}
                                                            name="email"
                                                            value={editedUsers[user._id]?.email || user.email}
                                                            onChange={(e) => handleInputChange(e, user._id)}
                                                        />
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        <input 
                                                            className={inputClasses}
                                                            name="username"
                                                            value={editedUsers[user._id]?.username || user.username}
                                                            onChange={(e) => handleInputChange(e, user._id)}
                                                        />
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        <input className={inputClasses} type='password' value={user.password} disabled 
                                                            onChange={() => (console.log(``))}
                                                        />
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        <input 
                                                            className={inputClasses}
                                                            name="userTitle"
                                                            value={editedUsers[user._id]?.userTitle || user.userTitle}
                                                            onChange={(e) => handleInputChange(e, user._id)}
                                                        />
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        {user.userRole === 1 ? "admin" : "default"}
                                                    </Table.Cell>

                                                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 ">
                                                        <input
                                                            className={inputClasses}
                                                            name='slackId'
                                                            value={editedUsers[user._id]?.slackId || user.slackId}
                                                            onChange={(e) => handleInputChange(e, user._id)}
                                                        />
                                                    </Table.Cell>

                                                    <Table.Cell>
                                                        <a
                                                            className="font-medium cursor-pointer text-slate-800 hover:underline"
                                                            onClick={() => handleEditUser(user._id)}
                                                        >
                                                            <p className='border border-zinc-400 rounded text-center px-2 py-1 font-bold text-xs'>
                                                                Update
                                                            </p>
                                                        </a>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))
                                        )}

                                    </Table.Body>
                                </Table>
                            </section>
                        </Accordion.Content>
                    </Accordion.Panel>
                </Accordion>
            </div>

            <div className='mt-20'>
                <Register userObject={user} fetchUsers={fetchUsers} />
            </div>

        </div >
    )
}

export default PersonsOverview