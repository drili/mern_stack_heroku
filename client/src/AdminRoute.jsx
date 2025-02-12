import { useContext } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { UserContext } from './context/UserContext';

const AdminRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem("token")
    const userRole = localStorage.getItem("user_role")
    const { user } = useContext(UserContext)
    const tenantId = user.tenant_id

    // TODO: If account is not confirmed, show confirmation code first - admin accounts will always be verified/authenticated.
    if(!isAuthenticated || userRole !== "1") {
        return <Navigate to={`/${tenantId}/cannot-access`} />
    }

    return children
}

export default AdminRoute