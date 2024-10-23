import React from 'react'
import CustomerNotesFilter from './CustomerNotesFilter'

const CustomerNotes = ({ customerId }) => {
    return (
        <section id='CustomerNotes' className='grid grid-cols-12 gap-4'>
            <span className='col-span-12'>
                <h2 class="font-extrabold text-3xl mb-2">Customer notes</h2>
                <h5 class="text-wrapped-balance text-neutral-500 text-base">Select the month to view the different customer notes.</h5>
            </span>

            <span className='col-span-12'>
                <CustomerNotesFilter />
            </span>

            <span className='col-span-12'>
                <div className="grid grid-cols-12 gap-10">
                    <section className='col-span-7'>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, fuga corporis minus autem eligendi mollitia vel, iure accusantium vero perspiciatis architecto quasi laboriosam dolorum sunt placeat. Eos atque deserunt dolorem cumque commodi sint provident officia repellendus obcaecati, enim suscipit quod.</p>
                    </section>

                    <section className='col-span-5'>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, fuga corporis minus autem eligendi mollitia vel, iure accusantium vero perspiciatis architecto quasi laboriosam dolorum sunt placeat. Eos atque deserunt dolorem cumque commodi sint provident officia repellendus obcaecati, enim suscipit quod.</p>
                    </section>
                </div>
            </span>
        </section>
    )
}

export default CustomerNotes