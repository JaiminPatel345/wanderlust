/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { FlashMessageContext } from '../../../utils/flashMessageContext.jsx';
import { useContext } from 'react';
import { BeatLoader } from 'react-spinners';
import { IconX } from '@tabler/icons-react';
import useUserStore from '../../../store/userStore.js';

const UpdateNameModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { currUser, updateName } = useUserStore();
    const { showSuccessMessage, showErrorMessage } = useContext(FlashMessageContext);
    
    useEffect(() => {
        if (isOpen && currUser) {
            setName(currUser.name || '');
        }
    }, [isOpen, currUser]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            showErrorMessage('Name cannot be empty');
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await updateName(name);
            if (result.success) {
                showSuccessMessage('Name updated successfully');
                onClose();
            } else {
                showErrorMessage(result.error || 'Failed to update name');
            }
        } catch (error) {
            console.error('Error updating name:', error);
            showErrorMessage(error.message || 'Failed to update name');
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium">Update Your Name</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <IconX size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your name"
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            {loading ? <BeatLoader size={8} color="white" /> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateNameModal; 