import React, { useState } from "react";
import { motion } from "framer-motion";
import { Video, X, Copy, ExternalLink } from "lucide-react";

const VideoCallModal = ({ isOpen, onClose, projectId, userId, userName }) => {
    const [roomId, setRoomId] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [generatedRoomId, setGeneratedRoomId] = useState("");

    // Generate a unique room ID
    const generateRoomId = () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${projectId}_${timestamp}_${random}`;
    };

    const handleCreateRoom = () => {
        const newRoomId = generateRoomId();
        setGeneratedRoomId(newRoomId);
        setIsCreating(true);
    };

    const handleJoinRoom = () => {
        if (roomId.trim()) {
            const roomUrl = `/vcroom/${roomId}`;
            window.open(roomUrl, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
        }
    };

    const handleJoinGeneratedRoom = () => {
        if (generatedRoomId) {
            const roomUrl = `/vcroom/${generatedRoomId}`;
            window.open(roomUrl, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
        }
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(generatedRoomId);
        alert("Room ID copied to clipboard!");
    };

    const copyRoomLink = () => {
        const roomUrl = `${window.location.origin}/vcroom/${generatedRoomId}`;
        navigator.clipboard.writeText(roomUrl);
        alert("Room link copied to clipboard!");
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <Video className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Video Call</h2>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="h-5 w-5" />
                    </motion.button>
                </div>

                {!isCreating ? (
                    <div className="space-y-4">
                        {/* Create New Room */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">Start New Video Call</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Create a new video call room and share the room ID with the other party.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreateRoom}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <Video className="h-4 w-4" />
                                <span>Create Room</span>
                            </motion.button>
                        </div>

                        {/* Join Existing Room */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">Join Existing Room</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Enter the room ID shared by the other party.
                            </p>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    placeholder="Enter Room ID"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleJoinRoom}
                                    disabled={!roomId.trim()}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Join Room</span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Room Created */}
                        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                            <Video className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-green-900 mb-1">Room Created!</h3>
                            <p className="text-sm text-green-700">
                                Share the room ID with the other party to start the video call.
                            </p>
                        </div>

                        {/* Room Details */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room ID
                                </label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={generatedRoomId}
                                        readOnly
                                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={copyRoomId}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Copy Room ID"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleJoinGeneratedRoom}
                                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Join Room</span>
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={copyRoomLink}
                                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    <Copy className="h-4 w-4" />
                                    <span>Copy Link</span>
                                </motion.button>
                            </div>
                        </div>

                        <div className="text-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsCreating(false)}
                                className="text-sm text-gray-600 hover:text-gray-800 underline"
                            >
                                ← Back to options
                            </motion.button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default VideoCallModal;
