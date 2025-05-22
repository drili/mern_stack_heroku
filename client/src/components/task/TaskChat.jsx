import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { EditorState, Editor, ContentState, convertFromHTML } from 'draft-js';
import { stateToHTML } from "draft-js-export-html"
import axios from 'axios';

import { BsFillSendFill } from "react-icons/bs";
import { BsFillTrashFill, BsPencilSquare } from "react-icons/bs"
import { FaClock, FaComment } from 'react-icons/fa';

import DraftEditor from '../drafteditor/DraftEditor';
import { UserContext } from '../../context/UserContext'
import processHtmlContent from '../../functions/processHtmlContent';
import { ConfigContext } from '../../context/ConfigContext';

const options = {
    entityStyleFn: (entity) => {
        const entityType = entity.get('type').toLowerCase();
        if (entityType === 'mention') {
            const data = entity.getData();
            return {
                element: 'span',
                attributes: {
                    className: `mention mention-user-${data.mention.id}`,
                },
                style: {},
            };
        }
    },
};

const formatDate = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', options).replace(',', ' •');
};

const TaskChat = ({ taskID, taskCustomer }) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [isInputEmpty, setIsInputEmpty] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editorStateComment, setEditorStateComment] = useState(null);
    const [timeline, setTimeline] = useState([]);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const { user } = useContext(UserContext);
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const contentIsMeaningful = (content) => /\S/.test(content.getPlainText());

    const handleEditorStateChange = (newState) => {
        setEditorState(newState);
        setIsInputEmpty(!contentIsMeaningful(newState.getCurrentContent()));
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const extractMentions = (editorState) => {
        const contentState = editorState.getCurrentContent();
        const mentionedUsers = [];

        contentState.getBlockMap().forEach((block) => {
            block.findEntityRanges(
                (character) => {
                    const entityKey = character.getEntity();
                    return (
                        entityKey !== null &&
                        contentState.getEntity(entityKey).getType() === 'mention'
                    );
                },
                (start, end) => {
                    const entityKey = block.getEntityAt(start);
                    const mentionData = contentState.getEntity(entityKey).getData();
                    mentionedUsers.push(mentionData.mention);
                }
            );
        });

        return mentionedUsers;
    };

    const handleSendMessage = async () => {
        const currentContent = editorState.getCurrentContent();
        if (!contentIsMeaningful(currentContent)) return;

        const htmlContent = stateToHTML(currentContent, options);
        setEditorState(EditorState.createEmpty());

        await axios.post(`${tenantBaseURL}/comments/create-comment`, {
            taskId: taskID,
            htmlContent,
            createdBy: user.id,
        });

        const mentionedUsers = extractMentions(editorState);
        await axios.post(`${tenantBaseURL}/notifications/create-notification`, {
            mentionedUsers,
            taskId: taskID,
            taskCustomer,
            mentionedBy: user.id,
            htmlContent
        });

        fetchTimelineData();
    };

    const startEdit = (message) => {
        if (typeof message.htmlContent !== 'string') return;
        setEditingId(message._id);

        const blocksFromHtml = convertFromHTML(message.htmlContent);
        const state = ContentState.createFromBlockArray(
            blocksFromHtml.contentBlocks,
            blocksFromHtml.entityMap
        );
        setEditorStateComment(EditorState.createWithContent(state));
    };

    const saveEdit = async () => {
        if (!editorStateComment) return;

        const htmlContent = stateToHTML(editorStateComment.getCurrentContent(), options);
        await axios.put(`${tenantBaseURL}/comments/edit-comment/${editingId}`, { htmlContent });

        setEditingId(null);
        fetchTimelineData();
    };

    const cancelEdit = () => setEditingId(null);

    const handleDeleteComment = async (commentId) => {
        await axios.delete(`${tenantBaseURL}/comments/delete-comment-by-id/${commentId}`);
        fetchTimelineData();
    };

    const fetchTimelineData = async () => {
        try {
            const [commentsRes, timeRes] = await Promise.all([
                axios.post(`${tenantBaseURL}/comments/fetch-comments-by-task`, { taskId: taskID }),
                axios.get(`${tenantBaseURL}/time-registrations/time-registered/${taskID}`)
            ]);

            const comments = commentsRes.data.map(item => ({ ...item, type: 'comment' }));
            const times = timeRes.data.map(item => ({ ...item, type: 'time' }));

            const allItems = [...comments, ...times].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setTimeline(allItems);
        } catch (err) {
            console.error("Failed to fetch timeline data", err);
        }
    };

    useEffect(() => {
        fetchTimelineData();
    }, [taskID]);

    useLayoutEffect(() => {
        scrollToBottom();
    }, [timeline]);

    return (
        <div className="flex flex-col h-full bg-white border pt-5 border-t-slate-100 border-x-0 border-b-0">
            <ul className="flex flex-col overflow-y-auto max-h-[55vh] relative" ref={chatContainerRef}>
                {timeline.map((item, index) => (
                    <li key={index} className="flex items-start gap-4 px-4 py-3 hover:bg-stone-100 group relative">
                        <div className="flex-1 pl-8">
                            <div class="absolute z-10 w-3 h-3 bg-pink-700 rounded-full mt-1.5 ml-1.5 -start-1.5 left-4 border border-white"></div>
                            <div class="absolute w-[1px] h-full ml-[11px] -start-1.5 left-4 border border-gray-200"></div>

                            <time class="mb-1 text-sm font-normal leading-none text-gray-500">{formatDate(item.createdAt)}</time>

                            {item.type === 'time' ? (
                                <p className="text-sm text-black"><strong>{item.timeRegistered}h</strong> – {item.description} <span class="text-gray-500 text-sm">by {(item.userId || item.createdBy).username}</span></p>
                                ) : <div className="relative">
                                    {(item.userId || item.createdBy) && (
                                        <div className="mb-0 flex align-top group relative hover:bg-stone-100 py-2 rounded">
                                            <img
                                                className='h-[40px] w-[40px] mt-1 rounded mr-4 object-cover'
                                                src={`${baseURL}/uploads/${(item.userId || item.createdBy).profileImage}`}
                                                alt="user"
                                            />
                                            <div className="w-full">
                                                <span className="text-base text-zinc-900 font-bold mb-0">{(item.userId || item.createdBy).username}</span>
                                                {editingId === item._id ? (
                                                <div className="z-0 relative border w-full border-gray-200 rounded p-2 bg-white">
                                                    <Editor
                                                    editorState={editorStateComment}
                                                    onChange={setEditorStateComment}
                                                    />
                                                </div>
                                                ) : (
                                                <div
                                                    className="rounded-md"
                                                    dangerouslySetInnerHTML={{
                                                    __html: processHtmlContent(item.htmlContent, user.id),
                                                    }}
                                                ></div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                              </div> 
                              }                            
                        </div>

                        {item.type === 'comment' && (item.createdBy?._id === user.id) && (
                            <div className="absolute right-0 top-0 py-1 px-0 flex">
                                {editingId === item._id ? (
                                    <span className='flex gap-2 mt-2 mr-2'>
                                        <button onClick={cancelEdit} className='save-button text-xs text-white'>Cancel</button>
                                        <button onClick={saveEdit} className='save-button text-xs text-white'>Save</button>
                                    </span>
                                ) : (
                                    <span className='flex gap-2 mt-2 mr-2'>
                                        <button onClick={() => startEdit(item)} className='delete-button hidden group-hover:block bg-white rounded'>
                                            <BsPencilSquare className='text-xs text-black' />
                                        </button>
                                        <button onClick={() => handleDeleteComment(item._id)} className='delete-button hidden group-hover:block bg-white rounded'>
                                            <BsFillTrashFill className='text-xs text-rose-500' />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </li>
                ))}

                <div ref={messagesEndRef} />
            </ul>

            <div className="border-t border-gray-200 pt-10 grid grid-cols-12 gap-4 items-end">
                <section className='col-span-10' onKeyDown={handleKeyDown}>
                    <DraftEditor
                        editorState={editorState}
                        setEditorState={handleEditorStateChange}
                    />
                </section>

                <section className='cols-span-2 justify-end mt-5'>
                    <button
                        className="bg-pink-700 text-white px-4 text-sm py-2 rounded-md flex items-center gap-2 hover:border-green-800 disabled:bg-pink-100"
                        onClick={handleSendMessage}
                        disabled={isInputEmpty}
                    >
                        <BsFillSendFill /> Comment
                    </button>
                </section>
            </div>
        </div>
    );
};

export default TaskChat;
