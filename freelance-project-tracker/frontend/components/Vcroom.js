import React from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const Vcroom = () => {
    const { roomId } = useParams();

    const myMeeting = async (element) => {
        const appID = 1639741869;
        const serverSecret = "08ac7d089ce25f47a1b89e645464b55f";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, 
            serverSecret, 
            roomId, 
            Date.now().toString(), 
            "User" // You can get the actual user name from context
        );
       
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: element,
            sharedLinks: [
                {
                    name: 'Personal link',
                    url: window.location.protocol + '//' + 
                         window.location.host + window.location.pathname +
                         '?roomID=' + roomId,
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
        <>
            <div className="room-page">
                <div ref={myMeeting} />
            </div>
        </>
    );
};

export default Vcroom;
