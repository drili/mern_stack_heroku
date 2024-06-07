import React from 'react'
import NavbarUI from '../components/ui/NavbarUI'

const LayoutPre = ({ children }) => {
  return (
    <div id='LayoutPre'>
        <section>
            <NavbarUI />
        </section>

        <section className=''>
            {children}
        </section>
    </div>
  )
}

export default LayoutPre