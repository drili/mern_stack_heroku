import React from 'react'
import { useLocation } from 'react-router-dom'

import PageHeading from '../components/PageHeading'

const ViewCustomer = () => {
    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const urlCustomerId = query.get("customerId")

    return (
        <div id='ViewCustomer'>
            <PageHeading 
                heading={`Customer: ${urlCustomerId}`}
                subHeading={`A section to view your customers information`}
                suffix=""
            />

            <p>{urlCustomerId}</p>
        </div>
    )
}

export default ViewCustomer