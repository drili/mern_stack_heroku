import React, { useContext, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import toast, { Toaster } from 'react-hot-toast'

import backgroundImage from "../../assets/pexels-artūras-kokorevas-15986451.jpg"
import { ConfigContext } from "../../context/ConfigContext"

function Register({ userObject, fetchUsers }) {
    const inputClasses = "h-[40px] border rounded focus:border-pink-700 px-3 py-0 "
    const labelClasses = "text-sm font-medium mb-2 "

    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [email, setEmail] = useState()
    const navigate = useNavigate()

    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${userObject.tenant_id}`

    const onSubmit = (e) => {
        e.preventDefault();

        const newUser = {
            username,
            password,
            email,
            isActivated: 0,
            profileImage: "",
            userRole: 0
        }

        axios.post(tenantBaseURL + "/users/register", newUser)
            .then(res => (
                toast('User created successfully', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
            ))
            .then(res => (
                fetchUsers()
            ))
            .then(res => (
                window.scroll({top: 0, behavior: "smooth"})
            ))
            .catch(err => console.error(err))

        setUsername("")
        setPassword("")
        setEmail("")
    }

    return (
        <div id="loginFormSection" className='grid grid-cols-12 align-center gap-20 mt-10'>
            <section className="login-form col-span-6">
                <form onSubmit={onSubmit} className="py-10 px-10 flex rounded-extra-large border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-full border-gray-200 shadow-none col-span-3 gap-4">
                    <h3 className="text-black text-lg font-medium">Register new account </h3>
                    <hr />
                    <div className='flex flex-col'>
                        <label className={labelClasses}>Username</label>
                        <input
                            placeholder='Enter your username'
                            className={inputClasses}
                            type="text"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label className={labelClasses}>Email</label>
                        <input
                            className={inputClasses}
                            placeholder='Enter your email'
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label className={labelClasses}>Password</label>
                        <input
                            className={inputClasses}
                            placeholder='Enter your password'
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <input
                            className='bg-black text-white py-3 rounded mt-5 w-full'
                            type="submit"
                            value="Register Account" />
                    </div>
                </form>
            </section>

            <section className="login-image-field h-[auto] overflow-hidden col-span-6">
                <img
                    className='max-h-[500px] w-full rounded-extra-large'
                    src={backgroundImage}
                    alt=""
                    loading="lazy" />
            </section>

        </div>
    );
}

export default Register