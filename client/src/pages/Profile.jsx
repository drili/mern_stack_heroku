import React, { useContext } from 'react'
import { Link, useNavigate } from "react-router-dom";
import PageHeading from '../components/PageHeading';
import GenericForm from '../components/GenericForm';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import UploadImageForm from '../components/UploadImageForm';
import { ConfigContext } from '../context/ConfigContext';

const Profile = () => {
    const { user, setUser } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const handleEditProfileForm = (data) => {
        const updatedUser = {
            username: data[0],
            email: data[1],
            userTitle: data[2],
            userId: user.id
        }

        axios.put(tenantBaseURL + "/users/profile/update", updatedUser)
            .then((res) => {
                console.log('User information updated successfully:', res.data)
                localStorage.setItem("user", JSON.stringify(res.data.user))
                setUser(res.data.user)

                toast('User has been updated successfully', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
            })
            .catch((err) => {
                toast('There was an error updating your user', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#ef4444',
                        color: "#fff"
                    }
                })

                console.error('Failed to update user information:', err)
            });
    }

    const handleEditPassword = (data) => {
        console.log(data);

        if (data[0] !== data[1]) {
            toast('Passwords do not match', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: "#fff"
                }
            })

            return
        }

        const updatedPassword = {
            newPassword: data[0],
            userId: user.id
        }

        axios.put(tenantBaseURL + "/users/profile/update-password", updatedPassword)
            .then((res) => {
                console.log('User password updated successfully:', res.data)

                toast('Password has been updated successfully', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
            })
            .catch((err) => {
                toast('There was an error updating your password', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#ef4444',
                        color: "#fff"
                    }
                })

                console.error('Failed to update user information:', err)
            });
            
    }

    return (
        <div id='profilePage'>
            <PageHeading 
                heading="Profile Page"
                subHeading={`Welcome to the profile page`}
                suffix="A quick overview of your data"
            />

            <section className='grid grid-cols-12 gap-10 mb-10'>
                <span className='flex flex-col gap-10 col-span-7'>
                    <div className='py-10 px-10 flex rounded-extra-large border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-auto border-gray-200 shadow-none'>
                        <span className='flex flex-col gap-5'>
                            <h3 class="text-black text-lg font-medium">Update your user info</h3>
                            <hr className='mb-5'/>
                        </span>


                        <GenericForm
                            fieldCount={3}
                            inputTypes={['text', 'email', 'text']}
                            fieldNames={[`Username`, `Email`, 'User title']}
                            fieldValues={[`${user.username}`,`${user.email}`,  `${user.user_title}`, '', '']}
                            required={[true, true, true, true]}
                            formClass="my-form"
                            inputClass="my-input"
                            buttonClass="my-button"
                            onSubmit={(data) => handleEditProfileForm(data)}
                        />
                    </div>

                    <div className='py-10 px-10 flex rounded-extra-large border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-auto border-gray-200 shadow-none'>
                        <span className='flex flex-col gap-5'>
                            <h3 class="text-black text-lg font-medium">Update your user password</h3>
                            <hr className='mb-5'/>
                        </span>

                        <GenericForm
                            fieldCount={2}
                            inputTypes={['password', 'password']}
                            fieldNames={[`New password`, `Confirm password`]}
                            fieldValues={['', '']}
                            required={[true, true]}
                            formClass="my-form"
                            inputClass="my-input"
                            buttonClass="my-button"
                            onSubmit={(data) => handleEditPassword(data)}
                        />
                    </div>
                </span>

                <span className='col-span-5'>
                    <div className='p-10 rounded-extra-large bg-stone-100 mb-10 h-full'>
                        <span className='flex flex-col m-auto text-center'>
                            <span>
                                <UploadImageForm></UploadImageForm>
                            </span>
                        </span>

                        <div>
                            
                        </div>
                    </div>
                </span>
            </section>

        </div>
    )
}

export default Profile