import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/admin/Register';
import Home from './pages-pre/Home';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import CreateTask from './pages/CreateTask';
import CreateCustomer from './pages/CreateCustomer';
import Customers from './pages/Customers';
import Workflow from './pages/Workflow';
import NotFound from './pages/NotFound';
import SprintOverview from './pages/SprintOverview';
import TimeRegistrations from './pages/TimeRegistrations';
import RegisterOffTimes from './pages/RegisterOffTimes';
import Notifications from "./pages/Notifications"

import Admin from './pages/admin/Admin';
import TimeRegistrationsOverview from './pages/admin/TimeRegistrationsOverview';
import PersonsOverview from './pages/admin/PersonsOverview';
import CannotAccess from './pages/CannotAccess';
import UserNotActivated from './pages/functionalities/UserNotActivated';
import GeneralFeatures from './pages/admin/GeneralFeatures';
import TaskVerticalsOverview from './pages/admin/TaskVerticalsOverview';
import ReleaseNotes from './pages/ReleaseNotes';
import TaskView from './pages/tasks/TaskView';

import LayoutPre from './pages-pre/LayoutPre';
import Registration from './pages-pre/Registration';
import TestComponent from './test/TestComponent';
import Features from './pages-pre/Features';
import Pricing from './pages-pre/Pricing';
import Contact from './pages-pre/Contact';

function AppRoutes() {
    return (

        <BrowserRouter>
            <Routes>
                {/* SaaS pages */}
                <Route path="/" element={<LayoutPre><Home /></LayoutPre>} />
                <Route path="/features" element={<LayoutPre><Features /></LayoutPre>} />
                <Route path="/pricing" element={<LayoutPre><Pricing /></LayoutPre>} />
                <Route path="/contact" element={<LayoutPre><Contact /></LayoutPre>} />
                <Route path="/registration" element={<LayoutPre><Registration /></LayoutPre>} />
                <Route path="/login" element={<Login />} />
                <Route path="/user-not-activated" element={<UserNotActivated />} />
                
                {/* TEST */}
                {/* <Route 
                    path='/:accountUsername/*'
                    element={
                        <Routes>
                            <Route path='testing' element={<TestComponent />} />
                            <Route path="/user-not-activated" element={<UserNotActivated />} />
                        </Routes>
                    }
                    >
                </Route> */}

                {/* TODO: Update routes to include :accountUsername */}
                <Route
                    path="/:tenantId/*"
                    element={
                        <Layout>
                            <Routes>
                                <Route path='testing' element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
                                <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="create-task" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
                                <Route path="sprint-overview" element={<ProtectedRoute><SprintOverview /></ProtectedRoute>} />
                                <Route path="time-registrations" element={<ProtectedRoute><TimeRegistrations /></ProtectedRoute>} />
                                <Route path="release-notes" element={<ProtectedRoute><ReleaseNotes /></ProtectedRoute>} />
                                <Route path='task-view' element={<ProtectedRoute><TaskView /></ProtectedRoute>} />
                                <Route
                                    path="customers"
                                >
                                    <Route index={true} element={<Customers />}></Route>
                                    <Route path="create-customer" element={<ProtectedRoute><CreateCustomer /></ProtectedRoute>} />
                                </Route>
                                {/* <Route path="create-customer" element={<ProtectedRoute><CreateCustomer /></ProtectedRoute>} /> */}
                                <Route path="workflow" element={<ProtectedRoute><Workflow /></ProtectedRoute>} />
                                <Route path="register-offtime" element={<ProtectedRoute><RegisterOffTimes /></ProtectedRoute>} />
                                <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                                <Route path="admin" element={<ProtectedRoute>
                                    <AdminRoute>
                                        <Admin />
                                    </AdminRoute>
                                </ProtectedRoute>} />
                                <Route path="admin/time-registrations-overview" element={<ProtectedRoute>
                                    <AdminRoute>
                                        <TimeRegistrationsOverview />
                                    </AdminRoute>
                                </ProtectedRoute>} />
                                <Route path="admin/persons-overview" element={<ProtectedRoute>
                                    <AdminRoute>
                                        <PersonsOverview />
                                    </AdminRoute>
                                </ProtectedRoute>} />
                                <Route path="admin/register" element={<ProtectedRoute>
                                    <AdminRoute>
                                        <Register />
                                    </AdminRoute>
                                </ProtectedRoute>} />
                                <Route path="admin/general-features" element={<ProtectedRoute>
                                    <AdminRoute>
                                        <GeneralFeatures />
                                    </AdminRoute>
                                </ProtectedRoute>} />
                                <Route path="admin/task-verticals-overview" element={<ProtectedRoute>
                                    <AdminRoute>
                                        <TaskVerticalsOverview />
                                    </AdminRoute>
                                </ProtectedRoute>} />

                                <Route path="cannot-access" element={
                                    <ProtectedRoute><CannotAccess /></ProtectedRoute>
                                } />

                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Layout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
