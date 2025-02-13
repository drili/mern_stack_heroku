import React, { useEffect, useRef, useState } from 'react'
import { Modal, TextInput } from "flowbite-react";
import { BsXLg } from "react-icons/bs";
import axios from 'axios';
import toast from 'react-hot-toast';

const ModalCreateLabel = ({ openFlowbiteModal, setOpenFlowbiteModal, tenantBaseURL, fetchVerticals, fetchLabels }) => {
    const inputClasses = "h-[40px] border rounded focus:border-pink-700 p-0 px-3 w-full block mb-0"
    const labelClasses = "text-sm font-medium mb-2 block"

    const labelNameRef = useRef(null)

    const handleFormSubmit = (e) => {
        e.preventDefault()

        const labelName = labelNameRef.current.value
        if (labelName) {
            createLabel(labelName)
        }
    }

    const createLabel = async (labelName) => {
        try {
            const response = await axios.post(`${tenantBaseURL}/labels/create-label`, { labelName })

            if (response.status === 200) {
                toast('Label has successfully created', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
                fetchLabels()
                setOpenFlowbiteModal(false)
            }
        } catch (error) {
            toast('There was an error creating label', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: "#fff"
                }
            })
            console.error('Failed to create label', error);
        }
    }

    useEffect(() => {
        if (openFlowbiteModal && labelNameRef.current) {
            labelNameRef.current.focus()
        }
    }, [openFlowbiteModal]);

    return (
        <div id='ModalCreateLabel'>
            <Modal show={openFlowbiteModal} onClose={() => setOpenFlowbiteModal(false)} size="md" className='w-full h-full bg-[rgba(0,0,0,0.50)]'>
                <Modal.Body>
                    <div className='relative min-h-[100px] py-5 px-5 flex justify-between gap-5 items-start'>
                        <form onSubmit={handleFormSubmit} className='w-full'>
                            <label className={labelClasses}>Create new label</label>
                            <TextInput
                                ref={labelNameRef}
                                style={{ backgroundColor: "#fff", borderRadius: "5px", padding: "10px 10px" }} 
                                id='labelName' name="labelName" className='rounded-full bg-black' />
                            <input type='submit' value="Create" className='bg-black text-white py-2 rounded mt-5 w-full text-sm hover:bg-pink-700' />
                        </form>

                        <button
                            className="absolute top-0 right-0 translate-y-[-10px] translate-x-[10px] text-white rounded-full h-[40px] w-[40px] bg-black font-bold uppercase text-sm focus:outline-none ease-linear transition-all duration-150 flex justify-center items-center z-50"
                            type="button"
                            onClick={() => setOpenFlowbiteModal(false)}
                        >
                            <h4 className='text-2xl'><BsXLg></BsXLg></h4>
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default ModalCreateLabel