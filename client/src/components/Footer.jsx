import React, { useContext } from 'react'
import { Link } from 'react-router-dom'

import { UserContext } from '../context/UserContext';

const Footer = () => {
    const { user } = useContext(UserContext)
    const tenantId = user.tenant_id
    
    return (
        <div id='footerComponent' className='w-full'>
            <div className='grid grid-cols-12 gap-8 mt-10 border-t border-gray-200 py-10'>

                <div className='text-neutral-500 font-normal text-base col-span-3'>
                    <p>©2024 KYNETIC, All Rights Reserved</p>
                </div>

                <div className='col-span-9'>
                    <section className='flex flex-col gap-4'>
                        <Link to={`/${tenantId}/release-notes`} className='text-black text-base'>
                            Release Notes
                        </Link>

                        <Link to={`/${tenantId}/notifications`} className='text-black text-base'>
                            Notifications
                        </Link>

                        {/* TODO: Add support contact page */}
                        <Link to="#" className='text-slate-800 text-base'>
                            Support
                        </Link>
                    </section>
                </div>

            </div>
        </div>
    )
}

export default Footer