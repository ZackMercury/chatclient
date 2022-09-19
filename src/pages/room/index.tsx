import { CircularProgress, IconButton, InputAdornment, InputLabel, linkClasses, OutlinedInput, TextField } from "@mui/material";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CopySvg } from "../../icons";

const RoomPage = () => {
    const roomID = useParams()["id"];

    const address = "http://" + window.location.host + "/room/" + roomID;

    const [creatingOffer, setCreatingOffer] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);

    useEffect(() => {
        // Component did mount
        const asyncFunc = async () => {
            
            const connection = new RTCPeerConnection();

            let initialOffer;
            try {
                const at = window.localStorage.getItem("at");
                initialOffer = (await axios.get("/api/chat/getOffer/" + roomID, {
                    headers: {
                        Authorization: "Bearer " + at
                    }
                })).data;
            } catch (err) {
                // TODO 404 page
                if (err.response.status === 404) {
                    console.error("Room doesn't exist");
                }
                return;
            }
            
            setCreatingOffer(true);

            if (!initialOffer) {
                // Generate offer
                connection.addEventListener("icecandidate", (e) => console.log(e.candidate));
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

                        // Create data channel and subscribe to exchange events
                        const dc = connection.createDataChannel("channel");
                        dc.addEventListener("open", () => {
                            console.log("Connection open");
                        })
                        dc.addEventListener("message", e => {
                            console.log(e.data);
                        })
                        dc.addEventListener("close", () => {
                            console.log("Connection closed");
                        })

                        connection.addIceCandidate()
                        
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

                    dc.addEventListener("open", () => {
                        console.log("Connection open");
                    })
                    dc.addEventListener("message", e => {
                        console.log(e.data);
                    })
                    dc.addEventListener("close", () => {
                        console.log("Connection closed");
                    })
                })

                await connection.setRemoteDescription(initialOffer.offer)
                console.log("Offer set");
                connection.addEventListener("icecandidate", (e) => console.log(e.candidate));
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
        { (creatingOffer || waiting) ? <CircularProgress /> : "" }
        
    </div>
}

export default RoomPage;