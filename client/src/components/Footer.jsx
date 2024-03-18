import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <div id='footerComponent' className='w-full'>
            <div className='grid grid-cols-12 gap-8 mt-10 border-t-2 py-10'>

                <div className='text-slate-500 col-span-3'>
                    <p>©2024 KYNETIC, All Rights Reserved</p>
                </div>

                <div className='col-span-9'>
                    <section className='flex flex-col gap-4'>
                        <Link to="/release-notes" className='text-slate-900'>
                            Release Notes
                        </Link>

                        <Link to="/notifications" className='text-slate-900'>
                            Notifications
                        </Link>
                    </section>
                </div>

            </div>
        </div>
    )
}

export default Footer