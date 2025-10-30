'use client'

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

export default function VcroomPage() {
    const { roomId } = useParams();
    const meetingRef = useRef(null);

    useEffect(() => {
        if (roomId && meetingRef.current) {
            initializeMeeting();
        }
    }, [roomId]);

    const initializeMeeting = async () => {
        const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '1227171486');
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '2bfaecbcd128381aff9ecb12ee9a3859';
        
        // Try to get user info from localStorage or generate random
        let userId = Date.now().toString();
        let userName = `User${Math.floor(Math.random() * 1000)}`;
        
        try {
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    userId = user._id || user.id || userId;
                    userName = user.name || userName;
                }
            }
        } catch (error) {
            console.log('No user found in localStorage, using random name');
        }
        
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, 
            serverSecret, 
            roomId, 
            userId,
            userName
        );
       
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        
        // Build URL safely for both client and server
        const shareUrl = typeof window !== 'undefined' 
            ? `${window.location.protocol}//${window.location.host}/vcroom/${roomId}`
            : `https://localhost:3000/vcroom/${roomId}`;
        
        zp.joinRoom({
            container: meetingRef.current,
            sharedLinks: [
                {
                    name: 'Personal link',
                    url: shareUrl,
                },
            ],
            scenario: {
                mode: ZegoUIKitPrebuilt.VideoConference,
                config: {
                    role: "Host",
                },
            },
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: true,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: true,
            showTextChat: true,
            showUserList: true,
            maxUsers: 50,
            layout: "Auto",
            showLayoutButton: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto p-4">
                {/* Header */}
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Video Call Room
                    </h1>
                    <p className="text-gray-300">
                        Room ID: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{roomId}</span>
                    </p>
                </div>
                
                {/* Video Call Container */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
                    <div ref={meetingRef} style={{ width: '100%', height: '100%' }} />
                </div>
            </div>
        </div>
    );
}
