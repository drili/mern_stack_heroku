import React, { useContext, useEffect, useState } from 'react'
import { AiFillPlusCircle } from 'react-icons/ai'
import { Link } from 'react-router-dom'
import axios from 'axios'

import getCurrentSprint from '../../functions/getCurrentSprint'
import { UserContext } from '../../context/UserContext'
import { ConfigContext } from '../../context/ConfigContext'
import { BsCalendarFill } from 'react-icons/bs'
import { BiUser } from 'react-icons/bi'

const HolidaysFilter = ({ onSelectedSprint, fetchAllHolidays, handleFilterChange }) => {
    const inputClasses = "rounded text-slate-800 text-sm min-h-[45px] border border-zinc-400 cursor-pointer "
    const labelClasses = "h-full flex flex-col justify-center bg-teal-200 border-none text-slate-800 border rounded px-4 py-1 text-sm border border-zinc-400 "

    const [sprints, setSprints] = useState([])
    const [currentSprint, setCurrentSprint] = useState([])
    const activeSprint = getCurrentSprint()
    const [users, setUsers] = useState([])
    const [activeFilterUser, setActiveFilterUser] = useState()

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const fetchUsers = async () => {
        try {
            const response = await axios.get(tenantBaseURL + "/users/fetch-active-users")
            setUsers(response.data)
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    }

    const handleUserChange = async (event) => {
        const userId = event
        const selectedUser = users.find((user) => user._id === userId)

        setActiveFilterUser(selectedUser)
        fetchAllHolidays(userId)
        handleFilterChange(userId)
    }

    useEffect(() => {
        setCurrentSprint(activeSprint)
        fetchUsers()
    }, [activeSprint])

    return (
        <div id='HolidaysFilter' className='items-center py-4 px-5 border-0 rounded-lg bg-[#f2f3f4] relative flex flex-row justify-between w-full outline-none focus:outline-none'>
            <section className='flex gap-4'>
                <div id="CustomersFilter-links">
                    <span className='h-full flex flex-row items-center gap-2 justify-center text-xs font-medium'>
                        <Link to="register-holidays">
                            <button type="submit" className={`${inputClasses} bg-pink-700 text-white border-none`}>Register & view holidays</button>
                        </Link>

                        <AiFillPlusCircle size={20} color='' />
                    </span>
                </div>
            </section>

            <section className='flex justify-end gap-8'>
                <div>
                    {activeFilterUser !== "0" && activeFilterUser && (
                        <span className={`${labelClasses}`}>
                            {activeFilterUser.username}
                        </span>
                    )}
                </div>
                <div id='HolidaysFilter-filterUsers'>
                    <span className='flex gap-2 items-center'>
                        <select
                            className={`${inputClasses} min-w-[200px]`}
                            defaultValue=""
                            onChange={(e) => handleUserChange(e.target.value)}
                        >
                            <option disabled value="">Select user</option>
                            <option value="0">All</option>
                            {users.map((user) => (
                                <option key={user?._id} value={`${user?._id}`}>{user?.username}</option>
                            ))}
                        </select>
                        <BiUser size={20}></BiUser>
                    </span>
                </div>
            </section>
        </div>
    )
}

export default HolidaysFilter