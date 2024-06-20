import React from 'react'
import { useParams } from 'react-router-dom'

const TestComponent = () => {
    const { tenantId } = useParams()

    return (
        <div id='TestComponent'>
            <h1>TestComponent</h1>
            <p>Hello {tenantId}</p>
        </div>
    )
}

export default TestComponent