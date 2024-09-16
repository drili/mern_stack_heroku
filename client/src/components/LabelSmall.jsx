import React from 'react'

const LabelSmall = ({ children, classes, backgroundColor, borderColor }) => {
    return (
        <section 
            id='component_LabelSmall'
            className={`${classes} text-black px-2 py-1 rounded font-bold text-xs flex gap-2 items-center`}
            style={{ 
                backgroundColor: backgroundColor,
                border: `1px solid ${borderColor ? borderColor : ''}`,
                color: borderColor ? borderColor : ''
            }}
            >
            {children}
        </section>
    )
}

export default LabelSmall