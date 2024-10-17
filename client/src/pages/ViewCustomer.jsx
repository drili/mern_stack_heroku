import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import { BsArrowLeft } from "react-icons/bs";
import { Accordion } from 'flowbite-react'

import PageHeading from '../components/PageHeading'
import { UserContext } from '../context/UserContext'
import { ConfigContext } from '../context/ConfigContext'
import GenericForm from '../components/GenericForm'
import WorkInProgressLabel from '../components/WorkInProgressLabel'

const ViewCustomer = () => {
    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const urlCustomerId = query.get("customerId")

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`

    const [customer, setCustomer] = useState([])
    const [customerTargets, setCustomerTargets] = useState([])

    const handleUpdateCustomerTargets = (data) => {
        console.log({ data });
    }

    const handleUpdateCustomer = (data) => {
        console.log({ data })
    }

    const fetchCustomerTargets = async (urlCustomerId) => {
        if (urlCustomerId) {
            try {
                const response = await axios.get(`${tenantBaseURL}/customer-targets/fetch-customer-targets-by-id?customerId=${urlCustomerId}`)

                console.log(response.data.length)
                if (response.data.length === 0) {
                    setCustomerTargets({
                        spendGoogleAds: '100',
                        spendMeta: '200',
                        spendLinkedIn: '300',
                        customerTarget: '400',
                        percentageIncrease: '500',
                    })

                    console.log({ customerTargets })
                } else {
                    console.log("NULL")
                    setCustomerTargets(response.data[0])
                }
            } catch (error) {
                console.error("Failed to fetch customer targets by ID", error)
            }
        }
    }

    const fetchCustomer = async (urlCustomerId) => {
        if (urlCustomerId) {
            try {
                const response = await axios.get(`${tenantBaseURL}/customers/fetch-customer?customerId=${urlCustomerId}`)
                setCustomer(response.data)
            } catch (error) {
                console.error("Failed to fetch customer by ID", error)
            }
        }
    }

    useEffect(() => {
        fetchCustomer(urlCustomerId)
        fetchCustomerTargets(urlCustomerId)
    }, [urlCustomerId])

    return (
        <div id='ViewCustomer'>
            <PageHeading
                heading={`Customer: ${customer[0]?.customerName}`}
                subHeading={`A section to view your customers information`}
                suffix=""
            />

            <section className='grid grid-cols-12 gap-10 mb-5'>
                <div className='flex col-span-6'>
                    <Link to={`/${user.tenant_id}/customers`} className='text-pink-700 text-center mt-5 flex gap-2 items-center'>
                        <BsArrowLeft />
                        Go back to customers overview
                    </Link>
                </div>
            </section>

            <section className='grid grid-cols-12 gap-10 mb-10'>
                <span className='flex flex-col gap-10 col-span-6'>
                    <div className='bg-white'>
                        <div>
                            <Accordion alwaysOpen={true} className='col-span-10 mb-5'>
                                <Accordion.Panel>
                                    <Accordion.Title className='relative'>
                                        <span className='flex flex-col gap-5'>
                                            <h3 className="text-black text-lg font-medium">Update customer info</h3>
                                        </span>
                                    </Accordion.Title>

                                    <Accordion.Content>
                                        {customer && customer.length > 0 && (
                                            <GenericForm
                                                fieldCount={2}
                                                inputTypes={['text', 'text']}
                                                fieldNames={[`Customer name`, `Customer color`]}
                                                fieldValues={[`${customer[0]?.customerName}`, `${customer[0]?.customerColor}`]}
                                                required={[true, true]}
                                                formClass="my-form"
                                                inputClass="my-input"
                                                buttonClass="my-button"
                                                onSubmit={(data) => handleUpdateCustomer(data)}
                                                buttonValue="Update customer info"
                                            />
                                        )}
                                    </Accordion.Content>

                                </Accordion.Panel>
                            </Accordion>
                        </div>

                        <div>
                            <Accordion collapseAll className='col-span-10'>
                                <Accordion.Panel>
                                    <Accordion.Title className='relative'>
                                        <span className='flex flex-col gap-5'>
                                            <h3 className="text-black text-lg font-medium">Update customer targets & spends</h3>
                                        </span>
                                    </Accordion.Title>

                                    <Accordion.Content>
                                        {customerTargets && customerTargets.length > 0 && (
                                            <GenericForm
                                                fieldCount={5}
                                                inputTypes={['number', 'number', 'number', 'number', 'number']}
                                                fieldNames={[`Google Ads adspend`, `Meta adspend`, `LinkedIn adspend`, `Customer target`, `Customer increase %`]}
                                                fieldValues={[
                                                    customerTargets.spendGoogleAds,
                                                    customerTargets.spendMeta,
                                                    customerTargets.spendLinkedIn,
                                                    customerTargets.customerTarget,
                                                    customerTargets.percentageIncrease
                                                ]}
                                                required={[]}
                                                formClass="my-form"
                                                inputClass="my-input"
                                                buttonClass="my-button"
                                                onSubmit={(data) => handleUpdateCustomerTargets(data)}
                                                buttonValue="Update targets & adspends"
                                            />
                                        )}
                                    </Accordion.Content>

                                </Accordion.Panel>
                            </Accordion>
                        </div>
                    </div>
                </span>

                <span className='flex flex-col gap-10 col-span-6'>
                    <div className='p-10 rounded-extra-large bg-stone-100 h-full relative'>
                        <span className='flex flex-col m-auto text-center sticky top-[150px]'>
                            <span>
                                <h3 class="text-lg md:text-3xl text-black font-extrabold">{customer[0]?.customerName}</h3>

                                <h3 className="text-black text-lg font-medium mt-5 mb-5">Customer metrics</h3>
                                <div id="recentActivity" className="grid grid-cols-2 place-items-center text-center bg-white rounded-extra-large relative">
                                    <div className="w-full py-5 px-2 border-r-0 border-b border-solid border-stone-100">
                                        <h2 className={`font-bold`}>100 hours</h2>
                                        <p>Intern time</p>
                                    </div>
                                    <div className="w-full py-5 px-2 border-l border-b border-solid border-stone-100">
                                        <h2 className={`font-bold`}>51 hours</h2>
                                        <p>Client time</p>
                                    </div>
                                    <div className="w-full py-5 px-2 border-r-0 border-t-0 border-solid border-stone-100">
                                        <h2 className={`font-bold`}>51 hours</h2>
                                        <p>Off time</p>
                                    </div>
                                    <div className="w-full py-5 px-2 border-l border-t-0 border-solid border-stone-100">
                                        <h2 className={`font-bold`}>51 hours</h2>
                                        <p>Sick time</p>
                                    </div>

                                    <WorkInProgressLabel smallVersion={false} />
                                </div>
                            </span>
                        </span>
                    </div>
                </span>
            </section>
        </div>
    )
}

export default ViewCustomer