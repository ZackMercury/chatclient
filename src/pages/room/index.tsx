import { Button, CircularProgress, IconButton, InputAdornment, InputLabel, linkClasses, OutlinedInput, TextField, Typography } from "@mui/material";
import axios, { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../app/redux/store";
import { CopySvg } from "../../icons";
import "./style.css";

interface Message {
    author: string;
    timestamp: string;
    text: string;
    byMe: boolean;
}

const RoomPage = () => {
    const roomID = useParams()["id"];

    const address = "http://" + window.location.host + "/room/" + roomID;

    const [creatingOffer, setCreatingOffer] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const [connectionOpen, setConnectionOpen] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream>();
    const [remoteStream, setRemoteStream] = useState<MediaStream>();
    const [dataChannel, setDataChannel] = useState<RTCDataChannel>();
    const [roomExists, setRoomExists] = useState<boolean>(true);

    const [chatMessage, setChatMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);


    const author = useSelector<RootState, string>(state => state.user.email!);
    const [remoteAuthor, setRemoteAuthor] = useState<string>("");

    const deviceVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const messageField = useRef<HTMLInputElement>(null);
    const messageBox = useRef<HTMLDivElement>(null);

    const messagesRef = useRef<Message[]>([]);

    messagesRef.current = messages;

    const onConnectionOpen = (connection, stream, remoteStream) => {
        setConnectionOpen(true);
        console.log(stream);
        
    }

    const onMessageReceived = (e) => {
        const message = JSON.parse(e.data);
        setMessages(messagesRef.current.concat([message]));
    }

    const chatMessageSend = () => {
        const msg: Message = {
            text: chatMessage,
            timestamp: (new Date()).toString(),
            author: author,
            byMe: false
        }
        messageField.current!.value = "";

        const messagesCopy = messages.concat();
        messagesCopy.push({...msg, byMe: true});
        setMessages(messagesCopy);
        dataChannel!.send(JSON.stringify(msg));
    }

    useEffect(() => {
        if (messages.length)
            messageBox.current!.scrollTop = messageBox.current!.scrollHeight;

        console.log(messages);
    }, [messages]);

    useEffect(() => {
        const myVideo = deviceVideo.current!;
        myVideo.srcObject = stream!;
        myVideo.onloadedmetadata = (e) => {
            myVideo.play();
        }
    }, [stream]);

    useEffect(() => {
        if (!connectionOpen) return;
        const video = remoteVideo.current!;

        video.srcObject = remoteStream!;
        video.onloadedmetadata = (e) => {
            video.play();
        }
    }, [connectionOpen]);

    useEffect(() => {
        // Component did mount
        const asyncFunc = async () => {
            
            const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
            setStream(stream);
            const remoteStream = new MediaStream();
            setRemoteStream(remoteStream);
            
            

            const connection = new RTCPeerConnection({
                iceServers: [
                    {urls: ["stun:opasuite13.ixcsoft.com.br:3478"]},
                    {username: "opasuite", urls: [
                        "stun:opasuite13.ixcsoft.com.br"
                    ], credential: "opasuite"}
                ]
            });

            stream.getTracks().forEach(track => connection.addTrack(track, stream));

            connection.addEventListener("track", (e) => {
                e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
            })

            let initialOffer;
            try {
                const at = window.localStorage.getItem("at");
                initialOffer = (await axios.get("/api/chat/getOffer/" + roomID, {
                    headers: {
                        Authorization: "Bearer " + at
                    }
                })).data;
            } catch (err) {
                if (err.response.status === 404) {
                    setRoomExists(false);
                }
                return;
            }
            
            setCreatingOffer(true);

            if (!initialOffer) {
                // Generate offer
                // Create data channel and subscribe to exchange events
                const dc = connection.createDataChannel("channel");
                setDataChannel(dc);
                dc.addEventListener("open", onConnectionOpen.bind(this, connection, stream, remoteStream));
                dc.addEventListener("message", onMessageReceived)
                dc.addEventListener("close", () => {
                    console.log("Connection closed");
                })

                const offer = await connection.createOffer();
                console.log ("Offer generated");
                await connection.setLocalDescription(offer);
                console.log ("Local desc set");

                const at = window.localStorage.getItem("at");
                await axios.post("/api/chat/joinRoom/" + roomID, { 
                    offer: offer
                }, {
                    headers: {
                        Authorization: "Bearer " + at
                    }
                });

                setTimeout(async () => {
                    // Wait till best ICE candidate
                    setCreatingOffer(false);

                    setWaiting(true)
                    

                    const checkForRemotes = setInterval(async () => {
                        const at = window.localStorage.getItem("at");
                        const answer = (await axios.get("/api/chat/getAnswer/" + roomID, {
                            headers: {
                                Authorization: "Bearer " + at
                            }
                        })).data;

                        if(!answer) return;
                        
                        setWaiting(false);
                        clearInterval(checkForRemotes);
                        console.log(answer);
                        setRemoteAuthor(answer.userEmail);
                        await connection.setRemoteDescription(answer.offer);
                        console.log("Remote desc set");

                        console.log(connection.localDescription, connection.remoteDescription)
                    }, 2000)
                }, 3000);
            }
            else {
                connection.addEventListener("datachannel", e => {
                    console.log("DC")

                    const dc = e.channel;
                    setDataChannel(dc);
                    console.log(stream);
                    dc.addEventListener("open", onConnectionOpen.bind(this, connection, stream, remoteStream));
                    dc.addEventListener("message", onMessageReceived.bind(this));
                    dc.addEventListener("close", () => {
                        console.log("Connection closed");
                    })
                })

                await connection.setRemoteDescription(initialOffer.offer);
                console.log(initialOffer);
                setRemoteAuthor(initialOffer.userEmail);
                console.log("Offer set");
                const answer = await connection.createAnswer();
                console.log("Answer created " + JSON.stringify(answer));
                await connection.setLocalDescription(answer);
                console.log("Local desc set")

                

                setTimeout(async () => {
                    // Wait till best ICE candidate
                    const answer = connection.localDescription;
                    const res = await axios.post("/api/chat/joinRoom/" + roomID, { offer: answer });
                    
                    setCreatingOffer(false);
                    // Get data channel and subscribe to exchange events
                    console.log(connection.localDescription, connection.remoteDescription);
                }, 3000);
            }
            
        }
        asyncFunc();
    }, [])

    return <div className="roomPageWrapper">
        {

            roomExists && !connectionOpen ? <>
                <InputLabel htmlFor='roomLink'>Room link</InputLabel>
                <OutlinedInput id="roomLink" label="Room link" disabled value={address} endAdornment={
                    <InputAdornment position="end">
                        <IconButton onClick={() => navigator.clipboard.writeText(address)}>
                            <CopySvg />
                        </IconButton>
                    </InputAdornment>
                }/>
                <br/>
                <br/>
                { (creatingOffer || waiting) ? <CircularProgress sx={{ marginBottom: "30px"}}/> : "" }

                
            </>: !roomExists ? <Typography variant="body1">Room not found</Typography>:""
        }
        <div id="videoContainer">
            { 
                roomExists ? <video ref={deviceVideo} muted={true}></video> : ""
            }
            {
                connectionOpen ? <video ref={remoteVideo}></video> : ""
            }
        </div>
        { 
            connectionOpen ?
            <div id="chat">
                <div id="messages" ref={messageBox}>
                    This is the beginning of your conversation with {remoteAuthor}
                    {messages.map(message => <div className={"message" + (message.byMe ? " byMe" : "")}><Typography variant="body1"><b>{message.author}</b>: {message.text}</Typography></div>)}
                </div>
                <form>
                    <div id="sendField">
                        <TextField onChange={(e) => setChatMessage(e.currentTarget.value)} style={{height:"10px"}} inputProps={{ style: { height: "5px"}, ref: messageField}}/>
                        <Button type="submit" variant="contained" onClick={(e) => {e.preventDefault(); chatMessageSend()}}>Send</Button>
                    </div>  
                </form>
            </div> : ""
        }
    </div>
}

export default RoomPage;