import { Navigate, useRoutes } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem("token")
    const userRole = localStorage.getItem("user_role")

    // TODO: If account is not confirmed, show confirmation code first - admin accounts will always be verified/authenticated.
    if(!isAuthenticated || userRole !== "1") {
        return <Navigate to="/cannot-access" />
    }

    return children
}

export default AdminRoute