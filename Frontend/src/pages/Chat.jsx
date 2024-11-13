/* eslint-disable react/prop-types */
import React, { useState } from "react"

const Chat = ({ chats }) => {
    const [selectedChatId, setSelectedChatId] = useState(null)

    const openChat = (chatId) => {
        setSelectedChatId(chatId)
    }

    return (
        <div className="flex">
            {/* Left side for chat list */}
            <div className="maxHight flex flex-col w-1/4 min-w-72 mt-2 border-t border-slate-100 text-center overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-xl [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-xl [&::-webkit-scrollbar-track]:bg-slate-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    All Chats
                </h2>
                <ul>
                    {chats.map((chat) => (
                        <li
                            key={chat._id}
                            className="mb-3 bg-white rounded-lg shadow-md p-3 transition duration-200 hover:bg-gray-200"
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-xl text-gray-900 ml-1 text-center">
                                    {chat.user.name}
                                </p>
                                <button
                                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition duration-200"
                                    onClick={() => openChat(chat._id)}
                                >
                                    Open Chat
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                                {chat.lastMessage}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right side for chat interaction */}
            <div className="w-3/4 p-4 bg-white">
                {selectedChatId ? (
                    chats.map((chat, index) => (
                        <div
                            key={index}
                            id={`chat-${index}`}
                            className={`chat-box ${
                                selectedChatId === chat._id ? "" : "hidden"
                            }`}
                        >
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                                Chat with {chat.user.name}
                            </h3>
                            <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto mb-4">
                                {/* Display messages for the selected chat */}
                                {chat.chats.map((messageId, msgIndex) => (
                                    <p
                                        key={msgIndex}
                                        className="mb-2 bg-blue-50 p-2 rounded-lg"
                                    >
                                        Message {messageId}
                                    </p>
                                ))}
                            </div>
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    className="w-full border border-gray-300 p-2 rounded-l-lg focus:outline-none"
                                />
                                <button className="bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600 transition duration-200">
                                    Send
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div id="no-chat-selected" className="chat-box">
                        <h3 className="text-2xl font-semibold text-gray-800">
                            Select a chat to start messaging
                        </h3>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Chat
