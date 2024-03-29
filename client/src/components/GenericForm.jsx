import React, { useState } from 'react'

const GenericForm = ({
    fieldCount,
    inputTypes = [],
    fieldNames = [],
    fieldValues = [],
    required = [],
    formClass = "",
    inputClass = "",
    buttonClass = "",
    onSubmit,
}) => {
    const [formData, setFormData] = useState(fieldValues)

    const handleInputChange = (index, event) => {
        const newFormData = [...formData]
        newFormData[index] = event.target.value
        setFormData(newFormData)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        onSubmit(formData)
    }

    const renderInputFields = () => {
        return Array.from({ length: fieldCount }, (_, index) => (
            <span key={index}>
                <label
                    htmlFor={inputTypes[index] || 'text'} 
                    className='block mb-2 text-sm font-medium text-gray-900 '>
                        {fieldNames[index] || `Field ${index + 1}`}
                    </label>
                <input
                    required={required[index] || true}
                    type={inputTypes[index] || 'text'}
                    value={formData[index] || ''}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder={fieldNames[index] || `Field ${index + 1}`}
                    name="password"
                    className={`${inputClass} mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                />
            </span>
        ));
    };

    return (
        <form className={formClass} onSubmit={handleSubmit}>
            {renderInputFields()}

            <input 
                className={`${buttonClass} button text-white mt-10 bg-rose-500 hover:bg-violet-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center   `}
                type="submit" 
                value="Submit" 
            />
        </form>
    )
}

export default GenericForm