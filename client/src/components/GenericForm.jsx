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
    buttonValue,
}) => {
    const [formData, setFormData] = useState(fieldValues)

    const inputClasses = "h-[40px] border rounded focus:border-pink-700 p-0 px-3 w-full block mb-4"
    const labelClasses = "text-sm font-medium mb-2 block "

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
                    className={`${labelClasses}`}>
                        {fieldNames[index] || `Field ${index + 1}`}
                    </label>
                
                {inputTypes[index] === "textarea" ? (
                    <textarea
                        className='w-full rounded min-h-[200px]'
                        required={required[index] || true}
                        onChange={(e) => handleInputChange(index, e)}
                    >{formData[index] || ''}</textarea>
                ) : (
                    <input
                        required={required[index] || true}
                        type={inputTypes[index] || 'text'}
                        value={formData[index] || ''}
                        onChange={(e) => handleInputChange(index, e)}
                        placeholder={fieldNames[index] || `Field ${index + 1}`}
                        name="password"
                        className={`${inputClasses} `}
                    />
                )}
            </span>
        ));
    };

    return (
        <form className={formClass} onSubmit={handleSubmit}>
            {renderInputFields()}

            <input 
                className={`${buttonClass} w-full bg-black text-white py-3 rounded mt-5`}
                type="submit" 
                value={`${buttonValue ? buttonValue : "Submit"}`}
            />
        </form>
    )
}

export default GenericForm