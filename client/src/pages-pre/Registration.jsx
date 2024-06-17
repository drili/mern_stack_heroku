import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from "yup"
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios';
import emailjs from "emailjs-com"

import ConfirmAccount from './ConfirmAccount';
import generateRandomString from '../functions/generateRandomString';
import { ConfigContext } from '../context/ConfigContext';
import HeadingTitle from '../components/ui/elements/HeadingTitle';
import FAQSection from '../components/ui/FAQSection';
import FooterUI from '../components/ui/FooterUI';

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
        <>
            <div id='Registration' className='bg-white px-4 py-10 md:px-0 md:pb-[12rem] md:pt-20 h-full'>
                <div className='container'>
                    <section className='mb-20 text-center max-w-screen-lg mr-auto ml-auto'>
                        <HeadingTitle>Register your account</HeadingTitle>
                        <p className='text-neutral-500 font-normal text-lg mt-10'>We believe in the power of connection. Your thoughts, queries, and ideas fuel our passion for innovation. Reach out to us and let's embark on a collaborative journey, transforming visions into tangible realities. Your message matters; drop us a line, and together, let's shape a better tomorrow.</p>
                    </section>
                </div>

                <div className='flex flex-col lg:flex-row gap-20 container mx-auto'>
                    <section id='ContactInfo' className='bg-stone-100 w-full p-[2rem] md:p-[4rem] rounded-extra-large'>
                        <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Get started</h3>
                        <span className='flex flex-col gap-2'>
                            <p className='text-slate-800 font-bold text-xl text-wrapped-balance mb-5'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maxime, mollitia?</p>
                            <p className='text-slate-800 font-medium'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, in dolores similique commodi eligendi aspernatur cumque veritatis sequi modi sapiente.</p>
                            <p className='text-slate-800 font-medium'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, in dolores similique commodi eligendi aspernatur cumque veritatis sequi modi sapiente.</p>
                        </span>
                    </section>

                    <section id='ContactForm-section' className='w-full rounded-extra-large'>
                        {loginForm && (
                            <section id="loginForm" className='mb-5'>
                                {/* TODO: When user logins with credentials through this form, account email will be used to find tenant and redirect to .../tenant-id/dashboard  */}
                                <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Account login</h3>

                                <form className='grid grid-col-1 gap-2' onSubmit={handleLogin}>
                                    <span className='flex flex-col'>
                                        <label htmlFor="" className='text-lg font-medium mb-2'>Account email</label>
                                        <input type="email" placeholder='Enter your email' name='login-accountEmail' required className='h-[50px] border rounded focus:border-pink-700 p-3' />
                                    </span>

                                    <span className='flex flex-col'>
                                        <label htmlFor="" className='text-lg font-medium mb-2'>Password</label>
                                        <input type="password" placeholder='Enter your password' name='login-password' required className='h-[50px] border rounded focus:border-pink-700 p-3' />
                                    </span>

                                    <span className='flex flex-col gap-2'>
                                        <input type="submit" value="Login" name='' className="bg-black text-white py-3 rounded mt-5" />
                                    </span>

                                    <span className='flex flex-col gap-2 mt-2'>
                                        <p className='text-xs text-center'>Notice: If your account exists, then you will be redirected to your domain.</p>
                                    </span>
                                </form>

                                <span className='flex justify-center'>
                                    <p className='mt-5'>Don't have an account? <a href="#" className='underline' onClick={handleShowLoginForm}>Register</a></p>
                                </span>
                            </section>
                        )}

                        {!formSuccess && !loginForm ? (
                            <section className=''>
                                <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Account registration</h3>

                                <form className='grid grid-col-1 gap-4' onSubmit={handleSubmit(onSubmitCreateAccount)}>
                                    <span className='flex flex-col'>
                                        <label htmlFor="" className='text-lg font-medium mb-2'>Account username</label>
                                        <input type="text" placeholder='Enter your name' name='accountUsername' {...register('accountUsername')} required className='h-[50px] border rounded focus:border-pink-700 p-3' />
                                        <p className="text-red-600 text-sm">{errors.accountUsername?.message}</p>
                                    </span>

                                    <span className='flex flex-col'>
                                        <label htmlFor="" className='text-lg font-medium mb-2'>Email</label>
                                        <input type="email" placeholder='Enter your email' name='email' {...register('email')} required className='h-[50px] border rounded focus:border-pink-700 p-3' />
                                        <p className="text-red-600 text-sm">{errors.email?.message}</p>
                                    </span>

                                    <span className='flex flex-col'>
                                        <label htmlFor="" className='text-lg font-medium mb-2'>Password</label>
                                        <input type="password" placeholder='Enter your password' name='password' {...register('password')} required className='h-[50px] border rounded focus:border-pink-700 p-3' />
                                        <p className="text-red-600 text-sm">{errors.password?.message}</p>
                                    </span>

                                    <span className='flex flex-col'>
                                        <label htmlFor="" className='text-lg font-medium mb-2'>Confirm password</label>
                                        <input type="password" placeholder='Enter your password' name='confirmPassword' {...register('confirmPassword')} required className='h-[50px] border rounded focus:border-pink-700 p-3' />
                                        <p className="text-red-600 text-sm">{errors.confirmPassword?.message}</p>
                                    </span>

                                    <span className='flex flex-col gap-2'>
                                        <input type="submit" value="Create Account" name='' className="bg-black text-white py-3 rounded mt-5" />
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
                    </section>
                </div>
            </div>

            <section className='mb-40'>
                <FAQSection />
            </section>

            <section>
                <FooterUI />
            </section>
        </>

    )
}

export default Registration