import { Button, Link, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import * as yup from 'yup';
import { setUserData } from "../../app/redux/userSlice";
import './style.css';

const validationSchema = yup.object({
    email: yup
        .string()
        .email("Must be a valid email")
        .required(),

    password: yup
        .string()
        .required()
})

const SignInPage = () => {
    const title = "Sign In";
    document.title = title;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema,
        validateOnChange: true,
        onSubmit: async (values) => {
            try {
                const response = await axios.post("/api/user/signin", values);
                const data = response.data;

                window.localStorage.setItem("at", data.accessToken);
                window.localStorage.setItem("rt", data.refreshToken);

                delete data.accessToken;
                delete data.refreshToken;

                dispatch(setUserData({ ...data, isLoggedIn: true }));

                navigate("/");
            } catch (err) {
                console.log(err);
                return;
            }
        },
    });

    return <div className="signInPageWrapper">
        <Typography sx={{ marginBottom: "15px" }} variant="h5">{title}</Typography>
        <form onSubmit={formik.handleSubmit}>
            <div>
                <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && !!formik.errors.email}
                    helperText={formik.touched.email && formik.errors.email}
                />
            </div>
            <div>
                <TextField
                    fullWidth
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && !!formik.errors.password}
                    helperText={formik.touched.password && formik.errors.password}
                />
            </div>
            <Button color="primary" variant="contained" fullWidth type="submit">
                SIGN IN
            </Button>
            <Typography variant="subtitle1">
                Don't have an account? <Link to="/signup" component={RouterLink}>Register here.</Link>
            </Typography>
        </form>
    </div>
}

export default SignInPage;