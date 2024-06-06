import React from 'react'

const LayoutPre = ({ children }) => {
  return (
    <div id='LayoutPre'>
        <section>
            HEADER
        </section>

        <section className='max-w-screen-xl m-auto'>
            {children}
        </section>
    </div>
  )
}

export default LayoutPre