import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from "yup"
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios';
import emailjs from "emailjs-com"

import ConfirmAccount from './ConfirmAccount';
import generateRandomString from '../functions/generateRandomString';
import { ConfigContext } from '../context/ConfigContext';

const schema = yup.object().shape({
    accountUsername: yup.string()
        .min(3, "Account Username must be at least 3 characters")
        .max(40, "Account Username cannot be more than 40 characters")
        .matches(/^[a-zA-Z0-9]+$/, "Account Username can only contain letters and numbers")
        .required("Account Username is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string()
        .min(3, "Password must be at least 3 characters")
        .required("Password is required"),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required("Confirm Password is required")
});

const Registration = () => {
    const inputClass = "border bg-slate-50 rounded-sm py-2 px-2"
    const labelClass = "font-bold text-sm"

    const { baseURL } = useContext(ConfigContext)
    const serviceID = "service_bt14urb"
    const templateID = "template_5m1gsjp"
    const publicKey = "yG2xGgLGaL0uBar61"

    const [formSuccess, setFormSuccess] = useState(false)
    const [loginForm, setLoginForm] = useState(false)
    const [formServerError, setFormServerError] = useState("")
    const [formEmail, setFormEmail] = useState("")

    const { register, handleSubmit, formState: { errors } } = useForm({
		resolver: yupResolver(schema)
	});

    const onSubmitCreateAccount = async (data) => {
        try {
            let confirmationCode = generateRandomString()

            const accountData = { ...data, confirmationCode }
            const response = await axios.post(`${baseURL}/api/account/register`, accountData)

            const emailParams = {
                user_email: data.email,
                confirmation_code: confirmationCode
            }

            if (response.status === 200 || response.status === 201) {
                await emailjs.send(serviceID, templateID, emailParams, publicKey)

                setFormEmail(data.email)
                setFormSuccess(true)
                setFormSuccess(true)
            }
            console.log(response.data);
        } catch (error) {
            console.error('Error registering account:', error);
        }
    };

    const handleShowLoginForm = async () => {
        setLoginForm(!loginForm)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
    }

    return (
        <div className="grid grid-cols-2 gap-10 py-40">
            <section className='mb-5'>
                <h1 className='text-5xl font-bold'>TaskAlloc8or Account Registration</h1>
            </section>

            {loginForm && (
                <section id="loginForm" className='mb-5'>
                    <h2 className='mb-10 text-2xl text-slate-500 font-bold text-center'>Account Login</h2>

                    <form className='grid grid-col-1 gap-2' onSubmit={handleLogin}>
                        <span className='flex flex-col gap-2'>
                            <label htmlFor="" className={labelClass}>Account Email</label>
                            <input name='login-accountEmail' type="email" className={inputClass} required />
                            <p className="text-red-600 text-sm"></p>
                        </span>

                        <span className='flex flex-col gap-2'>
                            <label htmlFor="" className={labelClass}>Password</label>
                            <input name='password' type="password" required className={inputClass} />
                            <p className="text-red-600 text-sm">{errors.password?.message}</p>
                        </span>

                        <span className='flex flex-col gap-2'>
                            <input type="submit" value="Login" name='' className="bg-slate-900 text-white mt-5 py-2 rounded-sm" />
                        </span>

                        <span className='flex flex-col gap-2'>
                            <p className='text-xs text-center'>Notice: If your account exists, then you will be redirected to your domain.</p>
                        </span>
                    </form>

                    <span className='flex justify-center'>
                        <p className='mt-5'>Don't have an account? <a href="#" className='underline' onClick={handleShowLoginForm}>Register</a></p>
                    </span>
                </section>
            )}

            {!formSuccess && !loginForm ? (
                <section className='mb-5'>
                    <span className=''>
                        <h2 className='mb-10 text-2xl text-slate-500 font-bold text-center'>Account Registration</h2>
                    </span>

                    <form className='grid grid-col-1 gap-2' onSubmit={handleSubmit(onSubmitCreateAccount)}>
                        <span className='flex flex-col gap-2'>
                            <label htmlFor="" className={labelClass}>Account Username</label>
                            <input name='accountUsername' {...register('accountUsername')} className={inputClass} />
                            <p className="text-red-600 text-sm">{errors.accountUsername?.message}</p>
                        </span>

                        <span className='flex flex-col gap-2'>
                            <label htmlFor="" className={labelClass}>Email</label>
                            <input name='email' {...register('email')} className={inputClass} />
                            <p className="text-red-600 text-sm">{errors.email?.message}</p>
                        </span>

                        <span className='flex flex-col gap-2'>
                            <label htmlFor="" className={labelClass}>Password</label>
                            <input name='password' type="password" {...register('password')} className={inputClass} />
                            <p className="text-red-600 text-sm">{errors.password?.message}</p>

                        </span>

                        <span className='flex flex-col gap-2'>
                            <label htmlFor="" className={labelClass}>Confirm Password</label>
                            <input name='confirmPassword' type="password" {...register('confirmPassword')} className={inputClass} />
                            <p className="text-red-600 text-sm">{errors.confirmPassword?.message}</p>
                        </span>

                        <span className='flex flex-col gap-2'>
                            <input type="submit" value="Create Account" name='' className="bg-slate-900 text-white mt-5 py-2 rounded-sm" />
                        </span>
                    </form>

                    <span className='flex justify-center'>
                        <p className='mt-5'>Account already created? <a href="#" className='underline' onClick={handleShowLoginForm}>Login</a></p>
                    </span>
                </section>
            ) : (
                <>
                    {!loginForm && (
                        <ConfirmAccount
                            inputClass={inputClass}
                            labelClass={labelClass}
                            email={formEmail}
                            handleShowLoginForm={handleShowLoginForm}
                            setLoginForm={setLoginForm}
                        />
                    )}
                </>

            )}

        </div>
    )
}

export default Registration