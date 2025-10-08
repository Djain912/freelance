'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video, ArrowRight } from "lucide-react";

export default function VcHomePage() {
    const [roomCode, setRoomCode] = useState("");
    const router = useRouter();

    const handleFormSubmit = (ev) => {
        ev.preventDefault();
        if (roomCode.trim()) {
            router.push(`/vcroom/${roomCode}`);
        }
    };

    const generateRandomRoom = () => {
        const randomId = Math.random().toString(36).substr(2, 9);
        router.push(`/vcroom/${randomId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
                        <Video className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Video Call
                    </h1>
                    <p className="text-gray-600">
                        Join or start a video call room
                    </p>
                </div>

                {/* Join Room Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Room Code
                        </label>
                        <input 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            value={roomCode} 
                            onChange={(e) => setRoomCode(e.target.value)} 
                            type="text" 
                            placeholder="Enter Room Code" 
                        />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                        type="submit"
                        disabled={!roomCode.trim()}
                    >
                        <span>Join Room</span>
                        <ArrowRight className="h-4 w-4" />
                    </motion.button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                </div>

                {/* Quick Start */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateRandomRoom}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                    <Video className="h-4 w-4" />
                    <span>Start New Room</span>
                </motion.button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Powered by ZegoCloud
                </p>
            </motion.div>
        </div>
    );
}
