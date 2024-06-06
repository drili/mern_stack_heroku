import React from 'react'
import { useParams } from 'react-router-dom'

const TestComponent = () => {
    const { accountUsername } = useParams()

    return (
        <div id='TestComponent'>
            <h1>TestComponent</h1>
            <p>Hello {accountUsername}</p>
        </div>
    )
}

export default TestComponent