import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { UserContext } from '../../context/UserContext';
import { ConfigContext } from '../../context/ConfigContext';
import { fetchRecentNotifications } from '../../services/notificationService';
import { formatTimeAgo } from '../../utils/formatters';
import TaskModal from '../../components/task/TaskModal';
import socketIoClient from 'socket.io-client';
import axios from 'axios';
import { FaCheckDouble } from "react-icons/fa";

const NotificationDropdown = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user, hasUnreadNotifications, setHasUnreadNotifications } = useContext(UserContext);
    const { baseURL } = useContext(ConfigContext);
    const tenantId = user.tenant_id;
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setShowDropdown(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowDropdown(false);
        }, 200);
    }; 

    useEffect(() => {
        if (showDropdown) {
            fetchRecentNotifications(baseURL, tenantId, user.id, 5).then(setNotifications);
        }
    }, [showDropdown]);

    useEffect(() => {
        const checkForUnread = async () => {
            try {
                const response = await fetchRecentNotifications(baseURL, tenantId, user.id, 50);
                const hasUnread = response.some(notification => !notification.notificationIsRead);
                setHasUnreadNotifications(hasUnread);
            } catch (error) {
                console.error("Error checking unread notifications:", error);
            }
        };
    
        checkForUnread();
    }, [user.id, baseURL]);
    

    const handleBellClick = () => {
        navigate(`/${tenantId}/notifications`);
    };

    const handleOpenTaskModal = async (taskId, notificationId) => {
        setSelectedTaskId(taskId);
        setShowModal(true);
    
        try {
            await axios.put(`${baseURL}/${tenantId}/notifications/update-user-notification-read`, {
                notificationId
            });
    
            setNotifications((prev) =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, notificationIsRead: true } : n
                )
            );
    
            const hasUnread = notifications.some(n => n._id !== notificationId && !n.notificationIsRead);
            setHasUnreadNotifications(hasUnread);
        } catch (err) {
            console.error("Kunne ikke opdatere notifikation som læst", err);
        }
    };    

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="cursor-pointer relative">
                <FaBell className="text-slate-900 w-5 h-5" onClick={handleBellClick} />
                {hasUnreadNotifications && (
                    <span className="absolute top-[-3px] right-[-1px] bg-pink-700 h-[10px] w-[10px] rounded-full" />
                )}
            </div>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white border cursor-default border-gray-300 shadow-lg rounded z-50">
                    <div className="p-3 text-sm font-semibold text-black flex justify-between">
                        <p>Notifications</p>
                    </div>
                    <ul className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                        {notifications.length > 0 ? notifications.map((note, idx) => (
                            <li key={idx} className={`
                                px-4 py-2 text-sm cursor-pointer relative text-black 
                                ${!note.notificationIsRead ? 'bg-gray-100' : ''}
                                hover:bg-gray-200
                                flex items-center gap-2`}
                                onClick={() => handleOpenTaskModal(note.taskId?._id, note._id)}
                                >
                                {!note.notificationIsRead && (
                                    <span className="h-2 w-2 absolute left-1  bg-pink-700 rounded-full" />
                                )}
                                <img
                                    src={`${baseURL}/uploads/${note?.mentionedBy?.profileImage}`}
                                    className="min-w-[50px] h-[50px] object-cover rounded-md"
                                />
                                <div className='flex flex-col gap-1 w-full'>
                                    <div className='flex items-center justify-between'>
                                        <p className="font-medium text-black">{note.mentionedBy?.username || 'System'}</p>
                                        <p className="text-xs text-gray-400">
                                            {formatTimeAgo(note.createdAt)}
                                        </p>
                                    </div>
                                    <p className="text-gray-600 text-sm truncate">
                                        {note.notificationMessage.replace(/<[^>]*>/g, '')}
                                    </p>

                                </div>
                            </li>
                        )) : (
                            <li className="px-4 py-3 text-gray-500">No notifications available</li>
                        )}
                    </ul>
                    <div className="text-right p-2 border-t border-gray-200">
                        <Link to={`/${tenantId}/notifications`} className="text-pink-700 text-sm hover:underline">
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}

            {showModal && (
                <TaskModal
                    taskID={selectedTaskId}
                    showModalState={showModal}
                    onCloseModal={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default NotificationDropdown;
