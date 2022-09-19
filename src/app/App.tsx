import axios, { AxiosError } from "axios";
import React, { useEffect } from "react"
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom"
import StandardLayout from "../components/layout/StandardLayout"
import Panel from "../components/ui/Panel"
import LobbyPage from "../pages/lobby";
import RoomPage from "../pages/room";
import RootPage from "../pages/root";
import SignInPage from "../pages/signin";
import SignUpPage from "../pages/signup";
import store, { RootState } from "./redux/store";
import { setUserData } from "./redux/userSlice";
import './style.css';

interface Tokens {
    accessToken: string,
    refreshToken: string,
}

export const refreshTokens = async (rt: string | null): Promise<Tokens | undefined> => {
    if (!rt) return;
    axios.defaults.headers.common["Authorization"] = "Bearer " + rt;
    
    try {
        const tokens: Tokens = (await axios.patch("http://" + window.location.host + "/api/user/refresh")).data;
        return tokens;
    } catch (err) {
        // The most likely error is expiration of the refresh token
        // Let's prompt the user to log in by returning nothing
        return;
    }
}

const App = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isLoggedIn = useSelector<RootState, boolean>(state => state.user.isLoggedIn);

    useEffect(() => {
        // Component did mount
        // Check local storage for tokens

        const at = window.localStorage.getItem("at");
        const rt = window.localStorage.getItem("rt");

        // If the tokens exist, let's load user profile and fill the user slice
        // In case the access token is expired, let's refresh token
        
        

        if (at && rt)
        {
            axios.defaults.headers.common["Authorization"] = "Bearer " + at;

            axios.interceptors.response.use(res => res, async (err) => {
                const originalRequest = err.config;

                if (err.response.status === 401  && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const refreshToken = window.localStorage.getItem("rt");

                    const tokens = await refreshTokens(refreshToken);

                    if (tokens) {
                        console.log("refreshing tokens")
                        window.localStorage.setItem("at", tokens.accessToken);
                        window.localStorage.setItem("rt", tokens.refreshToken);

                        axios.defaults.headers.common["Authorization"] = "Bearer " + tokens.accessToken;
                        originalRequest.headers["Authorization"] = "Bearer " + tokens.accessToken;
                    } else {
                        navigate("/signin");
                    }
                    return axios(originalRequest);
                }
                return Promise.reject(err);
            })

            axios.get("/api/user/profile")
                 .then(res => {
                    dispatch(setUserData({ ...res.data, isLoggedIn: true } ));
                });
        }    
        
    }, [])

    return <div className="app-wrapper">
        <StandardLayout>
            <Panel className="mainPanel">
                <Routes>
                    <Route path="/" element={
                        isLoggedIn ? <LobbyPage/> : <RootPage/>
                    }/>
                    <Route path="/signin" element={<SignInPage/>}/>
                    <Route path="/signup" element={<SignUpPage/>}/>
                    <Route path="/room/:id" element={<RoomPage/>}/>
                </Routes>
            </Panel>
        </StandardLayout>
    </div>
}

export default App;