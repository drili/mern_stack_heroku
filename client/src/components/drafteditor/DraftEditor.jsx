import React, { useRef, useState, useMemo, useCallback, useEffect, useContext } from 'react';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, { defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import {
    ItalicButton,
    BoldButton,
    UnderlineButton,
    CodeButton,
    HeadlineOneButton,
    HeadlineTwoButton,
    HeadlineThreeButton,
    UnorderedListButton,
    OrderedListButton,
    BlockquoteButton,
    CodeBlockButton,
} from '@draft-js-plugins/buttons';
import axios from 'axios';

import '@draft-js-plugins/static-toolbar/lib/plugin.css';

import mentions from './Mentions';
import "../../assets/css/draft.css"
import { ConfigContext } from '../../context/ConfigContext';
import { UserContext } from '../../context/UserContext';

const DraftEditor = ({ editorState, setEditorState }) => {
    const ref = useRef(null);
    // const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [open, setOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    
    const { user } = useContext(UserContext)
    const { baseURL } = useContext(ConfigContext);
    const tenantBaseURL = `${baseURL}/${user.tenant_id}`;

    const fetchUsers = async () => {
        try {
            const response = await axios.get(tenantBaseURL + "/users/fetch-active-users")
            const transformedUsers = response.data.map((user) => ({
                id: user._id,
                name: user.username,
                link: `${tenantBaseURL}/profile?${user._id}`,
                avatar: user.profileImage,
            }))
            setAllUsers(transformedUsers);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    }

    const customSuggestionsFilter = (searchValue, suggestions) => {
        const value = searchValue.toLowerCase();
        const filteredSuggestions = suggestions.filter((suggestion) => (
            !value || suggestion.name.toLowerCase().includes(value)
        ));
        const length = Math.min(filteredSuggestions.length, 20);
        return filteredSuggestions.slice(0, length);
    };

    // Initialize the mention plugin
    const mentionPlugin = useMemo(() => createMentionPlugin(), []);
    const { MentionSuggestions } = mentionPlugin;

    // Initialize the toolbar plugin
    const toolbarPlugin = useMemo(() => createToolbarPlugin(), []);
    const { Toolbar } = toolbarPlugin;

    // Combine the plugins
    const plugins = useMemo(() => [mentionPlugin, toolbarPlugin], [mentionPlugin, toolbarPlugin]);

    const onOpenChange = useCallback((open) => {
        setOpen(open);
    }, [suggestions]);

    const onSearchChange = useCallback(({ value }) => {
        setSuggestions(customSuggestionsFilter(value, allUsers));
        // setSuggestions(defaultSuggestionsFilter(value, suggestions));
    }, [allUsers]);

    const MentionEntry = (props) => {
        const { isFocused, searchValue, selectMention, ...parentProps } = props;

        return (
            <div {...parentProps} className="mentionEntry">
                <img src={`${baseURL}/uploads/${props.mention.avatar}`} alt={props.mention.name} />
                <span>{props.mention.name}</span>
            </div>
        );
    };

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <div
            className='w-full border border-gray-200 p-4 rounded-md relative'
            onClick={() => {
                ref.current && ref.current.focus();
            }}
        >
            <Toolbar>
                {(externalProps) => (
                    <div className='testClass bg-gray-50 shadow-none absolute left-0 top-0 w-full'>
                        <BoldButton {...externalProps} getEditorState={() => editorState} setEditorState={setEditorState} />
                        <ItalicButton {...externalProps} getEditorState={() => editorState} setEditorState={setEditorState} />
                        <UnderlineButton {...externalProps} getEditorState={() => editorState} setEditorState={setEditorState} />
                        <CodeButton {...externalProps} getEditorState={() => editorState} setEditorState={setEditorState} />
                        <UnorderedListButton {...externalProps} getEditorState={() => editorState} setEditorState={setEditorState} />
                        <OrderedListButton {...externalProps} getEditorState={() => editorState} setEditorState={setEditorState} />
                        <BlockquoteButton {...externalProps} getEditorState={() => editorState} setEditorState={setEditorState} />
                        <CodeBlockButton {...externalProps} getEditorState={() => editorState} setEditorState={setEditorState} />
                    </div>
                )}
            </Toolbar>

            <div className='mt-10'>
                <Editor
                    editorKey="editor"
                    editorState={editorState}
                    onChange={setEditorState}
                    plugins={plugins}
                    ref={ref}
                    placeholder='Write your comment'
                />
            </div>
            <MentionSuggestions
                open={open}
                onOpenChange={onOpenChange}
                suggestions={suggestions}
                onSearchChange={onSearchChange}
                entryComponent={MentionEntry}
                onAddMention={() => {
                    // get the mention object selected
                }}
            // popoverContainer={({ children }) => <div>{children}</div>}
            // onAddMention={() => { /* handle mention addition */ }}
            />

            {/* <div style={{ marginTop: "100px" }}>
                <button onClick={handleSendComment} type='button'>handleSendComment</button>
            </div> */}
        </div>
    );
};

export default DraftEditor;
