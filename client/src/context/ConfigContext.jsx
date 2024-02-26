import React from 'react'

const baseURL = process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://taskalloc8or-f0b9361af29d.herokuapp.com/"
    
export const ConfigContext = React.createContext({ baseURL })

export const ConfigProvider = ({ children }) => (
    <ConfigContext.Provider value={{ baseURL }}>
        {children}
    </ConfigContext.Provider>
)