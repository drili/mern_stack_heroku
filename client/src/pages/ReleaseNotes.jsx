import React, { useEffect, useState } from 'react'

import PageHeading from '../components/PageHeading'
import releaseNotesData from "../data/release-notes.json";

const ReleaseNotes = () => {
    const [filters, setFilters] = useState({
        new: true,
        improvement: true,
        bug: true
    });

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const toggleFilter = (type) => {
        setFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const isAnyFilterActive = Object.values(filters).some(val => val);

    return (
        <div id='ReleaseNotesComponent'>
            <PageHeading
                heading="T8 Release Notes"
                subHeading="Overview of newest releases, changelog and features"
                suffix=""
            />


            <div className="mb-6 py-4 px-5 rounded-lg bg-[#f2f3f4] relative flex flex-row gap-4 items-center justify-end w-full outline-none focus:outline-none w-2/3">
                <h3>Click to toggle filters</h3>
                <button
                    onClick={() => toggleFilter("new")}
                    className={`px-3 py-1 rounded text-sm font-medium border ${
                        filters.new ? "bg-pink-100 text-pink-700" : "bg-white text-gray-500 border-gray-300"
                    }`}
                >
                New
                </button>
                <button
                    onClick={() => toggleFilter("improvement")}
                    className={`px-3 py-1 rounded text-sm font-medium border ${
                        filters.improvement ? "bg-green-100 text-green-700" : "bg-white text-gray-500 border-gray-300"
                    }`}
                >
                Improvement
                </button>
                <button
                    onClick={() => toggleFilter("bug")}
                    className={`px-3 py-1 rounded text-sm font-medium border ${
                        filters.bug ? "bg-yellow-100 text-yellow-700" : "bg-white text-gray-500 border-gray-300"
                    }`}
                >
                Bug fix
                </button>
            </div>

            <ol className="relative border-gray-200 w-2/3">
                {releaseNotesData.map((release, index) => {
                const filteredNotes = release.releaseNotes.filter(note => filters[note.type]);

                if (!isAnyFilterActive || filteredNotes.length === 0) return null;

                return (
                    <li key={index} className={`mb-10 ms-6 p-6 rounded-lg relative ${
                        release.major ? 'bg-pink-50' : 'bg-gray-100'
                      }`}>
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3 ring-8 ring-white">
                        <svg
                        className="w-2.5 h-2.5 text-pink-700"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        >
                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                        </svg>
                    </span>

                    <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                        Version {release.releaseVersion}
                        {index === 0 && (
                            <span className="bg-pink-100 text-pink-700 text-sm font-medium ms-3 px-2.5 py-0.5 rounded-sm">
                                Latest
                            </span>
                        )}
                    </h3>

                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                        Released on {release.releaseDate}
                    </time>

                    {filteredNotes.map((note, noteIndex) => (
                        <div key={noteIndex} className="release-item mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-md font-bold text-black">{note.title}</h4>
                            {note.type === "new" && (
                            <span className="bg-pink-100 text-pink-700 text-xs font-medium px-2.5 py-0.5 rounded-sm">New</span>
                            )}
                            {note.type === "improvement" && (
                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-sm">Improvement</span>
                            )}
                            {note.type === "bug" && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-0.5 rounded-sm">Bug fix</span>
                            )}
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{note.description}</p>
                        </div>
                    ))}
                    </li>
                );
                })}
            </ol>
            </div>
    )
}

export default ReleaseNotes