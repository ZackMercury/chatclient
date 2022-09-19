import { Button, CircularProgress, Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../app/redux/store';
import { Session, setUserData } from '../../app/redux/userSlice';

const LobbyPage = () => {
    const firstname = useSelector<RootState, string> (state => state.user.firstname!);
    const lastname = useSelector<RootState, string> (state => state.user.lastname!);
    const email = useSelector<RootState, string> (state => state.user.email!);
    const createdAt = new Date(useSelector<RootState, string> (state => state.user.createdAt!));
    const birthDate = new Date(useSelector<RootState, string> (state => state.user.birthDate!));
    const sessions = useSelector<RootState, Session[]> (state => state.user.activeSessions!);


    const roomIDTextInput = useRef<HTMLInputElement>();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const createRoom = async () => {
        const res = await axios.post("/api/chat/createRoom");
        const roomID = res.data;
        navigate("/room/" + roomID);
    }


    const joinRoom = () => {
        const roomID = roomIDTextInput.current!.value;
        navigate("/room/" + roomID);
    }


    const killSession = async (session) => {
        const id = session._id;

        try {
            await axios.delete("/api/user/killsession", { data: { sessionId: id }});
            const sessionsCopy = sessions.concat();
            sessionsCopy.splice(sessionsCopy.indexOf(session), 1);

            dispatch(setUserData({
                activeSessions: sessionsCopy
            }))
        } catch (err) {
            console.error(err);
        }
    }

    const killAll = async () => {
        try {
            await axios.delete("/api/user/killallsessions");

            dispatch(setUserData({
                activeSessions: []
            }))
        } catch (err) {
            console.error(err);
        }
    }

    return <div className="lobbyPageWrapper">
        <Typography variant='h4' sx={{ marginBottom: "30px"}}>User profile</Typography>
        
        <Typography variant="h6">Rooms</Typography>
        <Button variant="contained" onClick={() => createRoom()} sx={{ height: "55px", marginBottom: "20px"}}>Create a room</Button>
        <br/>
        <br/>
        <Grid container sx={{ marginBottom: "30px"}}>
            <Grid item>
                <TextField inputRef={roomIDTextInput} label="Room ID"/>
            </Grid>
            <Grid item>
                <Button sx={{ height: "55px", marginLeft: "15px"}} onClick={() => joinRoom()} variant="contained">Join room</Button>
            </Grid>
        </Grid>

        <Typography variant="h6">User info</Typography>
        <Typography variant='body1'>
            {firstname} {lastname} ({email})
        </Typography>
        <Typography variant="body1">
            Born {birthDate.getDate()}.{birthDate.getMonth() + 1}.{birthDate.getFullYear()} <br/>
            Registered {createdAt.getDate()}.{createdAt.getMonth() + 1}.{createdAt.getFullYear()}
        </Typography>

        <Typography variant="h6" sx={{ marginTop: "30px"}} >Sessions</Typography>
         
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell><b>SessionID</b></TableCell>
                    <TableCell><b>User agent</b></TableCell>
                    <TableCell><b>IP</b></TableCell>
                    <TableCell><b>Location</b></TableCell>
                    <TableCell><Button onClick={() => killAll()} sx={{ width: "max-content"}} variant='outlined'>Kill all</Button></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    sessions && sessions.map(session => 
                        <TableRow key={session._id}>
                            <TableCell>{session._id}</TableCell>
                            <TableCell>{session.userAgent}</TableCell>
                            <TableCell>{session.ip}</TableCell>
                            <TableCell>{session.location}</TableCell>
                            <TableCell><Button variant='outlined' onClick={() => killSession(session)}>Kill</Button></TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
    </div>
}

export default LobbyPage;