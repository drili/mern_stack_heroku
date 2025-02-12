import React from 'react'

const ButtonBig = ({ children, version }) => {
    const baseClasses = "px-6 py-3 rounded transition-all";
    const versionClasses = version === "black"
        ? "bg-black text-white hover:bg-pink-700"
        : "bg-white text-zinc-900 hover:bg-pink-700 hover:text-whit"

    const buttonClasses = `${baseClasses} ${versionClasses}`
    
    return (
        <button className={buttonClasses}>{children}</button>
    )
}

export default ButtonBig