import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'

import backgroundImage from "../assets/pexels-feyza-yıldırım-15795337.jpg"
import { UserContext } from '../context/UserContext';
import Logo from '../components/Logo';
import { ConfigContext } from '../context/ConfigContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser, setHasUnreadNotifications } = useContext(UserContext)

    const { baseURL } = useContext(ConfigContext);

    const navigate = useNavigate();

    const fetchUnreadNotifications = async (userId, tenantId) => {
        try {
            const response = await axios.post(baseURL + "/" + tenantId + "/notifications/fetch-unread-notifications", {
                userId: userId
            })

            return response
        } catch (error) {
            console.error("Error fetching notifications", error)
        }
    }

    const onSubmit = (e) => {
        e.preventDefault()

        const user = {
            email,
            password,
        }

        axios.post(baseURL + '/api/account/login', user)
            .then(res => {
                console.log(res.data);
                localStorage.setItem('token', res.data.token)
                localStorage.setItem("username", res.data.username)
                localStorage.setItem("email", res.data.user.email)
                localStorage.setItem("is_activated", res.data.user.is_activated)
                localStorage.setItem("profile_image", res.data.user.profile_image)
                localStorage.setItem("user_role", res.data.user.user_role)
                localStorage.setItem("user_title", res.data.user.user_title)
                localStorage.setItem("user", JSON.stringify(res.data.user))
                localStorage.setItem("tenant_id", JSON.stringify(res.data.user.tenant_id))

                fetchUnreadNotifications(res.data.user.id, res.data.user.tenant_id).then(response => {
                    const hasUnread = response.data.some(notification => !notification.notificationIsRead);
                    setHasUnreadNotifications(hasUnread);
                })

                setUser(res.data.user)

                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                navigate(`/${res.data.user.tenant_id}/dashboard`);
            })
            .catch(err => {
                toast('Incorrect credentials. Please try again.', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#ef4444',
                        color: "#fff"
                    }
                })
                // console.error(err)
            });

        setEmail('');
        setPassword('');
    }

    return (
        <>
            <div id="loginFormSection" className='grid grid-cols-2 min-h-[80vh]'>
                <section className="login-form max-w-[500px] ml-auto mr-auto w-full flex flex-col justify-center">
                    <div className='flex flex-col justify-start mb-10 text-left gap-10'>
                        <Logo />
                        <h3 className='text-4xl text-black text-wrapped-balance font-bold'>Login</h3>
                    </div>
                    <form onSubmit={onSubmit} className='grid grid-col-1 gap-4'>
                        <div className='flex flex-col'>
                            <label htmlFor="" className='text-lg font-medium mb-2'>Email</label>
                            <input
                                placeholder='Enter your email'
                                className='h-[50px] border rounded focus:border-pink-700 p-3'
                                type="text"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label htmlFor="" className='text-lg font-medium mb-2'>Password</label>
                            <input
                                className='h-[50px] border rounded focus:border-pink-700 p-3'
                                placeholder='Enter your password'
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <input
                                className="bg-black text-white py-3 rounded mt-5"
                                type="submit"
                                value="Login" />
                        </div>

                        <span className='flex justify-center'>
                            <p className='mt-5'>Don't have an account? <a href="/registration" className='underline text-pink-700'>Register</a></p>
                        </span>
                    </form>

                    {/* <div className='flex gap-2 mt-10 text-center m-auto align-center justify-center'> */}
                    {/* <h5>Don't have an account? </h5> */}
                    {/* <Link to="/register">Register account</Link> */}
                    {/* </div> */}
                </section>

                <section className="login-image-field h-[100vh] overflow-hidden">
                    <img
                        className=''
                        src={backgroundImage}
                        alt=""
                        loading="lazy" />
                </section>
            </div>
        </>
    );
}

export default Login