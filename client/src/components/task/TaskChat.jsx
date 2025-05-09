import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { EditorState, Editor, ContentState, convertFromHTML } from 'draft-js';
import { stateToHTML } from "draft-js-export-html"
import axios from 'axios';

import { BsFillSendFill } from "react-icons/bs";
import { BsFillTrashFill, BsPencilSquare } from "react-icons/bs"

import DraftEditor from '../drafteditor/DraftEditor';
import { UserContext } from '../../context/UserContext'
import processHtmlContent from '../../functions/processHtmlContent';
import { ConfigContext } from '../../context/ConfigContext';

const options = {
    entityStyleFn: (entity) => {
        const entityType = entity.get('type').toLowerCase();
        if (entityType === 'mention') {
            const data = entity.getData();
            // console.log({ data });
            return {
                element: 'span',
                attributes: {
                    className: `mention mention-user-${data.mention.id}`,
                },
                style: {
                },
                // text: `@${data.mention.name}`,
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
    const [messages, setMessages] = useState([]);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [isInputEmpty, setIsInputEmpty] = useState(true)
    const [comments, setComments] = useState([])

    const [editingId, setEditingId] = useState(null)
    const [draftContent, setDraftContent] = useState("")
    const [editorStateComment, setEditorStateComment] = useState(null);

    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)

    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const startEdit = (message) => {
        if (typeof message.htmlContent !== 'string') {
            console.error("Expected a string for HTML content, received:", typeof message.htmlContent);
            return
        }
    
        setEditingId(message._id);
    
        try {
            const blocksFromHtml = convertFromHTML(message.htmlContent);
            const state = ContentState.createFromBlockArray(
                blocksFromHtml.contentBlocks,
                blocksFromHtml.entityMap
            );
            setEditorStateComment(EditorState.createWithContent(state));
        } catch (error) {
            console.error("Error converting HTML to content blocks:", error);
        }
    }

    const renderEditor = () => {
        if (editingId) {
            return (
                <Editor
                    editorState={editorStateComment}
                    onChange={setEditorStateComment}
                />
            )
        }

        return null
    }

    const cancelEdit = async () => {
        setEditingId(null)
    }

    // *** Server requests
    const saveEdit = async () => {
        if (!editorStateComment) return;

        const htmlContent = stateToHTML(editorStateComment.getCurrentContent(), options);

        try {
            const htmlContentSave = stateToHTML(editorStateComment.getCurrentContent())
            const response = await axios.put(`${tenantBaseURL}/comments/edit-comment/${editingId}`, {
                htmlContent: htmlContentSave
            })

            setEditingId(null)
            if (response.status === 200) {
                fetchComments(taskID)
            }
        } catch (error) {
            console.error("Error saving edited comment", error.response)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`${tenantBaseURL}/comments/delete-comment-by-id/${commentId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error("Could not delete comment")
            }

            setComments(prevComments => prevComments.filter(comment => comment._id !== commentId))
            const data = await response.json()
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const fetchComments = async (taskId) => {
        try {
            const response = await fetch(tenantBaseURL + "/comments/fetch-comments-by-task", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskId: taskId
                })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json()
            setComments(data)
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const sendCommentToServer = async (htmlContent) => {
        try {
            const response = await fetch(tenantBaseURL + "/comments/create-comment", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskId: taskID,
                    htmlContent: htmlContent,
                    createdBy: user.id,
                })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            fetchComments(taskID)
        }
    }

    const sendNotification = async (mentionedUsers, taskId, taskCustomer, mentionedBy, htmlContent) => {
        try {
            const response = await axios.post(tenantBaseURL + "/notifications/create-notification", {
                mentionedUsers,
                taskId,
                taskCustomer,
                mentionedBy,
                htmlContent
            })
        } catch (error) {
            console.error("Error sending notification", error);
        }
    }

    // *** Frontend functionalities
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }

    const contentIsMeaningful = (content) => {
        const plainText = content.getPlainText()
        return /\S/.test(plainText);
    }

    const handleEditorStateChange = (newState) => {
        setEditorState(newState)
        const currentContent = newState.getCurrentContent()
        setIsInputEmpty(!contentIsMeaningful(currentContent))
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
            event.preventDefault()
            handleSendMessage()
        }
    }

    // *** User handling from mentions
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
    }

    const handleSendMessage = () => {
        const currentContent = editorState.getCurrentContent();
        if (!contentIsMeaningful(currentContent)) {
            return;
        }

        const htmlContent = stateToHTML(currentContent, options)
        // const messageText = currentContent.getPlainText();
        setMessages([...messages, htmlContent]);
        setEditorState(EditorState.createEmpty());
        sendCommentToServer(htmlContent)

        const mentionedUsers = extractMentions(editorState)
        sendNotification(mentionedUsers, taskID, taskCustomer, user.id, htmlContent)
        console.log("Mentioned users:", mentionedUsers);
    };

    const handleEditComment = (message) => {
        setEditingId(message._id)
        setDraftContent(message.htmlContent)
    }

    useLayoutEffect(() => {
        scrollToBottom()
    }, [comments])

    useEffect(() => {
        fetchComments(taskID)
        scrollToBottom()
    }, [taskID])

    return (
        <div className="flex flex-col h-full bg-white border pt-5 border-t-slate-100 border-x-0 border-b-0">
            <div className="flex flex-col overflow-y-auto max-h-[55vh]" id='TaskChatMentions' ref={chatContainerRef}>
                {comments.map((message, index) => (
                    <div key={index} className="mb-0 flex align-top group relative hover:bg-stone-100 py-2 px-4 rounded">
                        <div>
                            <img
                                className='h-[40px] w-[40px] mt-1 rounded mr-4 object-cover'
                                src={`${baseURL}/uploads/${message.createdBy.profileImage}`}
                            />
                        </div>

                        <div className='w-full'>
                            <div className="text-base text-zinc-900 font-bold mb-0">{message.createdBy.username}
                                <span className='ml-1 font-[400] text-[12px] text-zinc-400'>{formatDate(message.createdAt)}</span>
                            </div>

                            {editingId === message._id ? (
                                renderEditor()

                            ) : (
                                <div
                                    className="rounded-md" 
                                    dangerouslySetInnerHTML={{
                                    __html: processHtmlContent(message.htmlContent, user.id)
                                }}></div>
                            )}
                        </div>

                        {message.createdBy._id === user.id && (
                            <span className='absolute right-0 top-0 py-1 px-0 flex'>
                                {editingId === message._id && (
                                    <span className='flex gap-2 mt-2 mr-2'>
                                        <button onClick={cancelEdit} className='save-button text-xs text-white'>
                                            Cancel
                                        </button>
                                        <button onClick={saveEdit} className='save-button text-xs text-white'>
                                            Save
                                        </button>
                                    </span>
                                )}

                                {!editingId && (
                                    <span className='flex gap-2 mt-2 mr-2'>
                                        <button
                                            className='delete-button hidden group-hover:block bg-white rounded'
                                            onClick={() => startEdit(message)}
                                        >
                                            <BsPencilSquare className='text-xs text-black' />
                                        </button>
                                        
                                        <button
                                            className='delete-button hidden group-hover:block bg-white rounded'
                                            onClick={() => handleDeleteComment(message._id)}
                                            id={message._id}
                                        >
                                            <BsFillTrashFill className='text-xs text-rose-500' />
                                        </button>
                                    </span>
                                )}
                                
                            </span>
                        )}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

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