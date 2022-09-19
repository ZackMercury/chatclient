import { CaseReducers, createSlice, Slice } from "@reduxjs/toolkit";
import { string } from "yup/lib/locale";


export interface Session {
    expiresAt: string;
    hashAt: string;
    hashRt: string;
    ip: string;
    location: string;
    user: string;
    userAgent: string;
    __v: number;
    _id: string;
}

export interface UserState {
    firstname?: string;
    lastname?: string;
    email?: string;
    createdAt?: string;
    birthDate?: string;
    activeSessions?: Session[];
    isLoggedIn: boolean;
}

const initialState: UserState = {
    isLoggedIn: false
};

export const userSlice: Slice<UserState> = createSlice({
    name: "user",
    initialState: initialState,

    reducers: {
        setUserData: (state: UserState, action) => {
            const payload = action.payload;
            return { ...state, ...payload }
        },

        emptyUserData: (state: UserState) => {
            return initialState;
        }
    }
});

export const { setUserData, emptyUserData } = userSlice.actions;
const userReducer = userSlice.reducer;
export default userReducer;