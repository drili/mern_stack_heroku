import React, { useContext, useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import GenericForm from '../components/GenericForm'
import axios from "axios"
import toast, { Toaster } from 'react-hot-toast';
import { BsFillTrashFill } from "react-icons/bs"
import { AiOutlineUndo } from "react-icons/ai"
import { ConfigContext } from '../context/ConfigContext';
import { UserContext } from '../context/UserContext';

const CreateCustomer = () => {
    const [customers, setCustomers] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [showArchived, setShowArchived] = useState(false)

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(tenantBaseURL + "/customers/fetch")
            setCustomers(response.data)
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const filteredCustomers = customers.filter((customer) => {
        const customerName = customer.customerName.toLowerCase()
        const query = searchQuery.toLowerCase()
        return customerName.includes(query)
    })

    const handleCreateCustomer = async (data) => {
        if (!data) {
            return
        }

        const customerData = {
            customerName: data[0],
            customerColor:  data[1]
        }

        try {
            const response = await axios.post(tenantBaseURL + "/customers/create", customerData)
            fetchCustomers()

            if (response.status === 200) {
                toast('Customer has successfully created', {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#22c55e',
                        color: "#fff"
                    }
                })
            }
        } catch (error) {
            console.error('Failed to create customer', error);
            toast('There was an error creating customer', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: "#fff"
                }
            })
        }
    }

    const handleArchiveCustomer = async (customerId) => {
        try {
            await axios.put(`${tenantBaseURL}/customers/archive/${customerId}`)
            fetchCustomers()
            console.log("Customer archived successfully");
        } catch (error) {
            console.error("Failed to delete customer", error);
        }
    }

    const handleUnArchiveCustomer = async (customerId) => {
        try {
            await axios.put(`${tenantBaseURL}/customers/unarchive/${customerId}`)
            fetchCustomers()
            console.log("Customer un-archived successfully");
        } catch (error) {
            console.error("Failed to delete customer", error);
        }
    }

    const archivedCustomersCount = customers.filter(customer => !customer.isArchived).length
    const customerCount = customers.length

    return (
        <div id="createCustomerPage">
            <PageHeading 
                heading="Create Customer"
                subHeading={`A section to create new customers`}
                suffix=""
            />

            <section className='grid grid-cols-2 gap-10 mb-10'>
                <span>
                    <div className='py-10 px-10 flex rounded-extra-large border bg-white dark:border-gray-700 dark:bg-gray-800 flex-col h-full border-gray-200 shadow-none col-span-3'>
                        <span>
                            <h2 className='text-lg md:text-2xl text-black font-bold mb-3'>Create new <span className='text-pink-700'>customer</span></h2>
                            <hr className='mb-5'/>
                        </span>

                        <GenericForm
                            fieldCount={2}
                            inputTypes={['text', 'color']}
                            fieldNames={[`Customer Name`, `Customer Color`]}
                            fieldValues={['',]}
                            required={[true, true]}
                            formClass="my-form"
                            inputClass="my-input"
                            buttonClass="my-button"
                            onSubmit={(data) => handleCreateCustomer(data)}
                        />
                    </div>
                </span>

                <span>
                    <div className='bg-stone-100 w-full p-[2rem] md:p-10 rounded-extra-large'>
                        <span>
                            <h2 className='text-lg md:text-2xl text-black font-bold mb-3'>Customer List ({archivedCustomersCount}/{customerCount})</h2>
                            <hr className='mb-5'/>
                        </span>

                        <span className='search-container grid grid-cols-2 gap-4'>
                            <input
                                type='text'
                                placeholder='Search customers'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='h-[40px] border rounded focus:border-pink-700 p-0 px-3 w-full block mb-4 '
                            >
                            </input>

                            <div className="h-[40px] border rounded focus:border-pink-700 p-0 px-3 w-full mb-4 flex items-center">
                                <input 
                                    id="bordered-checkbox-1" 
                                    type="checkbox" 
                                    value="" 
                                    name="bordered-checkbox" 
                                    onChange={() => setShowArchived(!showArchived)}
                                    />
                                <label htmlFor="bordered-checkbox-1" className="w-full py-4 ml-2 text-sm font-medium text-gray-900 ">Show archived customers</label>
                            </div>
                        </span>

                        <div>
                            <ul>
                                {filteredCustomers
                                    .filter((customer) => (showArchived ? true : !customer.isArchived))
                                    .map((customer) => (
                                        <li 
                                            key={customer._id}
                                            // style={{ border : `1px solid ${customer.customerColor}` }}
                                            // style={{ border: `1px solid #eee` }}
                                            className='mb-2 rounded bg-white'
                                            >
                                            <div className='flex text-sm gap-4 justify-between items-center hover:bg-[#f2f3f4]'>
                                                <span 
                                                    className={`block rounded-lg py-2 px-5 bg flex-1`}
                                                    // style={{ background : `${customer.customerColor}` }}
                                                >
                                                    <p 
                                                        
                                                        className='text-sm text-inherit font-bold inline-block px-2 rounded-md'>{customer.customerName}</p>
                                                </span>
                                                {customer.isArchived ? (
                                                        <button className='flex items-center justify-center gap-2 h-[40px] w-full rounded text-white text-sm py-2 border-none cursor-pointer bg-pink-500 max-w-[150px]' onClick={() => handleUnArchiveCustomer(customer._id)}>Un-Acrhive <AiOutlineUndo/></button>
                                                    ) : (
                                                        <button className='flex items-center justify-center gap-2 h-[40px] w-full rounded text-white text-sm py-2 border-none cursor-pointer bg-pink-900 max-w-[150px]' onClick={() => handleArchiveCustomer(customer._id)}>Archive <BsFillTrashFill/></button>
                                                    )
                                                }
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </span>
            </section>

        </div>
    )
}

export default CreateCustomer