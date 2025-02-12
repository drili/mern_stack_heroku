import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import userImage from "../assets/profile-pics/default-image.jpg"
import { ConfigContext } from '../context/ConfigContext';
import WorkInProgressLabel from './WorkInProgressLabel';

const UploadImageForm = () => {
    const [selectedImage, setSelectedImage] = useState(null)
    const [profileImage, setProfileImage] = useState(null)
    const [imageSrc, setImageSrc] = useState(null)

    const { user, setUser } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);

    useEffect(() => {
        if (!user.profile_image) {
            setProfileImage(userImage)
            setImageSrc("")

        } else {
            setProfileImage(user.profile_image)
            setImageSrc(baseURL + "/uploads/")
        }
    }, [user.profile_image])

    const handleImageUpload = (event) => {
        const file = event.target.files[0]
        setSelectedImage(file)
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault()

        if (!selectedImage) {
            return
        }

        const formData = new FormData()
        formData.append("profileImage", selectedImage)
        formData.append("userId", user.id)

        try {
            const response = await axios.put(baseURL + "/users/profile/upload-image", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            localStorage.setItem("user", JSON.stringify(response.data.user))
            setUser(response.data.user)

            console.log('Image uploaded successfully', response.data);
        } catch (error) {
            console.error('Failed to upload image', error);
        }
    }

    return (
        <div>
            <section className='mb-5'>
                <span className='relative'>
                    <img
                        src={`${imageSrc}${profileImage}`}
                        className="w-[100px] h-[100px] object-cover rounded text-center m-auto mb-1"
                    />
                    <span className='bg-teal-200 rounded py-1 px-2 text-xs font-bold'>{user.user_title}</span>
                </span>
                <span className='mt-10'>
                    <span className='flex flex-col gap-0 mb-5 mt-5'>
                        <h3 className='text-lg md:text-3xl text-black font-extrabold'>{user.username}</h3>
                        <h3 className='font-light text-black'>{user.email}</h3>
                    </span>
                </span>
            </section>

            <hr className='mt-5' />

            <section className='relative'>
                <div className=''>
                    <h3 className='text-black text-lg font-medium text-left mt-5'>User stats</h3>
                </div>


                <div className='grid grid-cols-12 gap-1 mt-5'>
                    <div className="col-span-6 bg-white rounded py-4 px-2">
                        <h3 className='mb-2 mt-0 text-lg text-slate-800 font-bold'>Hours registered</h3>
                        <p className='text-pink-700 font-extrabold text-3xl mt-3'>0</p>
                    </div>
                    <div className="col-span-6 bg-white rounded py-4 px-2">
                        <h3 className='mb-2 mt-0 text-lg text-slate-800 font-bold'>Tasks completed</h3>
                        <p className='text-pink-700 font-extrabold text-3xl mt-3'>0</p>
                    </div>
                    <div className="col-span-6 bg-white rounded py-4 px-2">
                        <h3 className='mb-2 mt-0 text-lg text-slate-800 font-bold'>Hours allocated</h3>
                        <p className='text-pink-700 font-extrabold text-3xl mt-3'>0</p>
                    </div>
                    <div className="col-span-6 bg-white rounded py-4 px-2">
                        <h3 className='mb-2 mt-0 text-lg text-slate-800 font-bold'>Tasks created</h3>
                        <p className='text-pink-700 font-extrabold text-3xl mt-3'>0</p>
                    </div>
                </div>

                <WorkInProgressLabel smallVersion={false} />
            </section>

            <form onSubmit={handleFormSubmit} className='mt-10 opacity-0 hidden' disabled>

                <label htmlFor="file" className="block mb-2 text-sm font-medium text-gray-900 ">Update Image</label>
                <input disabled type="file" accept="image/*" onChange={handleImageUpload} />
                <input
                    required
                    className='my-button button text-white mt-10 bg-rose-500 hover:bg-violet-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center   '
                    type="submit"
                    value="Upload New Image"
                />
            </form>
        </div>
    )
}

export default UploadImageForm