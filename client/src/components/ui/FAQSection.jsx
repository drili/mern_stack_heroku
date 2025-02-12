import React, { useEffect } from 'react'
import { Accordion } from 'flowbite-react'

import HeadingTitle from './elements/HeadingTitle'

const FAQSection = () => {
    return (
        <section id='FAQSection' className='max-w-screen-lg ml-auto mr-auto px-4'>
            <div className='container'>
                <span className='flex justify-center mb-20'>
                    <HeadingTitle animate={true}>Frequently asked questions</HeadingTitle>
                </span>

                <Accordion collapseAll >
                    <Accordion.Panel className=''>
                        <Accordion.Title className='font-bold text-black'>Hello</Accordion.Title>
                        <hr />
                        <Accordion.Content className='text-lg text-slate-800'>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Asperiores soluta iste ratione ipsa aliquam et minima quia quae veniam, illo mollitia molestiae atque sequi cum, accusantium, beatae nobis repudiandae recusandae.
                        </Accordion.Content>
                    </Accordion.Panel>

                    <Accordion.Panel className=''>
                        <Accordion.Title className='font-bold text-black'>Hello</Accordion.Title>
                        <hr />
                        <Accordion.Content className='text-lg text-slate-800'>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Asperiores soluta iste ratione ipsa aliquam et minima quia quae veniam, illo mollitia molestiae atque sequi cum, accusantium, beatae nobis repudiandae recusandae.
                        </Accordion.Content>
                    </Accordion.Panel>

                    <Accordion.Panel className=''>
                        <Accordion.Title className='font-bold text-black'>Hello</Accordion.Title>
                        <hr />
                        <Accordion.Content className='text-lg text-slate-800'>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Asperiores soluta iste ratione ipsa aliquam et minima quia quae veniam, illo mollitia molestiae atque sequi cum, accusantium, beatae nobis repudiandae recusandae.
                        </Accordion.Content>
                    </Accordion.Panel>
                </Accordion>
            </div>

            <div className='mt-10 flex justify-center'>
                <p className='text-slate-800 text-lg font-medium'>Couldn’t find what you were looking for? write to us at <span className='text-pink-700'>connect@kynetic.dk</span></p>
            </div>
        </section>
    )
}

export default FAQSection