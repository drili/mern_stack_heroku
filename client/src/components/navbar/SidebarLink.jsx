import React from 'react'
import { Link } from 'react-router-dom';

const SidebarLink = ({ menuLink, linkText, currentPath, iconComponent, wip, iconOnly }) => {
    return (
        <Link
            to={menuLink}
            className={`
                gap-4 flex items-center py-3 px-4 rounded text-[14px] relative ease-in hover:bg-gray-200
                ${currentPath === menuLink ? 
                    'bg-pink-700 font-bold text-white hover:text-white' : 
                    'font-medium text-zinc-600'}`}>
            {React.createElement(iconComponent, { style: { fontSize: "18px" } })}
            
            {!iconOnly && linkText}
                    
            {wip ? (
                <div className='absolute right-0 flex  pt-1 pb-1 bg-teal-200 py-0 px-2 rounded-sm'>
                    <label className='text-[8px] text-zinc-900'>TBU</label>
                </div>
            ) : (
                ""
            )}
        </Link>
    )
}

export default SidebarLink