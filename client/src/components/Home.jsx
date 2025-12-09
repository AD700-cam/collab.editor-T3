import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

export default function Home() {
    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        fetch('http://localhost:5000/api/documents', {
            headers: { 'user-email': email }
        })
            .then(res => res.json())
            .then(data => setDocuments(data))
            .catch(err => console.error('Error fetching documents:', err));
    }, []);

    const createNewDocument = () => {
        const id = uuidV4();
        navigate(`/documents/${id}`);
    };

    const deleteDocument = (e, id) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        fetch(`http://localhost:5000/api/documents/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    setDocuments(documents.filter(doc => doc._id !== id));
                }
            })
            .catch(err => console.error('Error deleting document:', err));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
                    <button
                        onClick={createNewDocument}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-200 flex items-center gap-2"
                    >
                        <span>+ New Document</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map(doc => (
                        <Link
                            key={doc._id}
                            to={`/documents/${doc._id}`}
                            className="group block bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200 border border-gray-100 relative"
                        >
                            <button
                                onClick={(e) => deleteDocument(e, doc._id)}
                                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Document"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 truncate">{doc.title || 'Untitled Document'}</h3>
                            <p className="text-sm text-gray-500 mt-1">ID: {doc._id.substring(0, 8)}...</p>
                        </Link>
                    ))}

                    {documents.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No documents found. Create one to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
