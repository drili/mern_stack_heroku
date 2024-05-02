import React from 'react'
import PageHeading from '../../components/PageHeading'

const GeneralFeatures = () => {
    return (
        <div id='GeneralFeaturesPage'>
            <PageHeading
                heading="Admin General Features"
                subHeading={`Create new month(s)/month-years, view archived tasks and more`}
                suffix=""
            />

            {/* // TODO: Add the following options:
                1. Ability to create new months
                3. ... figure out what else */}
        </div>
    )
}

export default GeneralFeatures