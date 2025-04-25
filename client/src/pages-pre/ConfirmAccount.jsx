import axios from 'axios'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ConfirmAccount = ({ inputClass, labelClass, email, handleShowLoginForm, setLoginForm }) => {
    const serverURL = "http://localhost:8000"

    const [confirmationCode, setConfirmationCode] = useState("")
    const [accountVerified, setAccountVerified] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const handleConfirmationCode = async (e) => {
        setConfirmationCode(e.target.value)
    }

    const handleConfirmationForm = async (e) => {
        e.preventDefault()

        try {
            const accountData = { email, confirmationCode }

            const response = await axios.post(`${serverURL}/api/account/verify-account`, accountData)

            if (response.status === 200) {
                console.log({ response });
                setErrorMsg("")
                setAccountVerified(true)
                setLoginForm(false)
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                console.log({ response: error.response });
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg("An unexpected error occurred");
            }
        }
    }

    return (
        <div id='componentConfirmAccount'>
            {email && (
                <>
                    {!accountVerified ? (
                        <div>
                            <span className='mb-5'>
                                <h3 className='mb-10 text-4xl text-black text-wrapped-balance font-bold'>Confirm account</h3>

                                <p className='mb-5'>Enter your confirmation code that was sent to your email ({email}) here</p>
                            </span>

                            <span className='mb-5'>
                                <form className='grid grid-col-1 gap-2' onSubmit={handleConfirmationForm}>

                                    <span className='flex flex-col'>
                                        <label htmlFor="" className='text-lg font-medium mb-2'>Confirmation code</label>
                                        <input name='text' placeholder='Enter your confirmation code' value={confirmationCode} onChange={handleConfirmationCode} className='h-[50px] border rounded focus:border-pink-700 p-3' required />
                                    </span>
                                    <span className='flex flex-col gap-2'>
                                        <input type="submit" value="Confirm" name='' className="bg-black text-white py-3 rounded mt-5" />
                                    </span>

                                    {errorMsg && (
                                        <span className='flex flex-col gap-2'>
                                            <p className='text-red-600 text-sm'>{errorMsg}</p>
                                        </span>
                                    )}

                                </form>
                            </span>

                            <span>
                                <p className='mt-5'>Go back</p>
                            </span>
                        </div>
                    ) : (
                        <div>
                            <h2 className='text-xl font-bold mb-5'>Your account has been verified successfully</h2>
                            <p className='mb-10'>Your subdomain has been created and sent to your email. You can login as admin using your credentials.</p>
                            <button className='bg-slate-950 text-white p-2 px-5 text-sm rounded-sm' onClick={handleShowLoginForm}>Login Now</button>
                        </div>
                    )}

                </>
            )}

        </div>
    )
}

export default ConfirmAccount