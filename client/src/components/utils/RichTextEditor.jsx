import React, { useState } from 'react';
import Editor from '@draft-js-plugins/editor';
import { EditorState, RichUtils, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { stateToHTML } from "draft-js-export-html"

const RichTextEditor = ({ onContentChange }) => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const toggleInlineStyle = (style) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    const handleEditorChange = (state) => {
        setEditorState(state);
        const contentState = state.getCurrentContent();
        const rawContent = convertToRaw(contentState); 
        const plainText = contentState.getPlainText();
        const htmlContent = stateToHTML(contentState);
        onContentChange({ rawContent, plainText, htmlContent });
    };

    return (
        <div className="min-h-[200px] w-full mb-4">
            <div className="editor rounded" style={{ border: '1px solid #6B7280', minHeight: '200px', padding: '10px' }}>
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    handleKeyCommand={handleKeyCommand}
                    placeholder="Write your note here..."
                />
            </div>
            <div className="mt-2">
                <button
                    type="button"
                    className="mr-2 px-3 py-1 border rounded bg-gray-200 text-sm"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleInlineStyle('BOLD');
                    }}
                >
                    B
                </button>
                <button
                    type="button"
                    className="mr-2 px-3 py-1 border rounded bg-gray-200 italic text-sm"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        toggleInlineStyle('ITALIC');
                    }}
                >
                    I
                </button>
            </div>
        </div>
    );
};

export default RichTextEditor;