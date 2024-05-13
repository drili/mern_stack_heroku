import React, { useEffect } from 'react'

import PageHeading from '../components/PageHeading'
import releaseNotesData from "../data/release-notes.json";

const ReleaseNotes = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div id='ReleaseNotesComponent'>
            <PageHeading
                heading="T8 Release Notes"
                subHeading={`Overview of newest releases and features`}
                suffix=""
            />

            <div>
                {releaseNotesData.map((release, index) => (
                    <div key={index} className='release grid grid-cols-12 mb-40'>
                        <section className='col-span-3 sticky top-0'>
                            <span className='sticky top-[120px]'>
                                <h3 className='text-slate-500 text-sm'>{release.releaseDate}</h3>
                                <h2 className='font-bold'>Version <span className='text-rose-500'>{release.releaseVersion}</span></h2>
                            </span>
                        </section>

                        <section className='col-span-9'>
                            <img className='rounded-md max-h-[250px] w-full object-cover' src={release.releaseImageLink} />

                            <section className='mt-10'>
                                {release.releaseObject.map((item, itemIndex) => (
                                    <div key={itemIndex} className='release-item mb-5'>
                                        <h3 className='text-lg font-bold'>{item.name}</h3>
                                        <ul className='list-disc'>
                                            {item.description.map((desc, descIndex) => (
                                                <li className='ml-5 mb-1' key={descIndex}>{desc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </section>
                        </section>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ReleaseNotes