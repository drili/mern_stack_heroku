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
                                <h3 className='text-neutral-500 text-sm'>{release.releaseDate}</h3>
                                <h2 className='font-extrabold border-b-2 border-b-stone-300 border-dotted'>Version <span className='text-pink-700'>{release.releaseVersion}</span></h2>
                            </span>
                        </section>

                        <section className='col-span-9 border-l-stone-100 border-l-2 pl-8 border-dotted'>
                            <img className='rounded-extra-large max-h-[250px] w-full object-cover' src={release.releaseImageLink} />

                            <section className='mt-10'>
                                {release.releaseObject.map((item, itemIndex) => (
                                    <div key={itemIndex} className='release-item mb-2 bg-stone-100 py-4 rounded px-4'>
                                        <h3 className='text-lg font-bold text-black mb-2'>{item.name}</h3>
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