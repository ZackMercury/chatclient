import React, { useState } from "react";
import { Formik, Field, useFormik } from "formik"
import { Alert, Button, Collapse, Link, TextField, Typography } from "@mui/material";
import * as yup from 'yup';
import './style.css';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../../app/redux/userSlice";

const validationSchema = yup.object({
    email: yup
        .string()
        .email("Enter a valid email")
        .required("Email is required"),
    password: yup
        .string()
        .min(8, "Password must be at least 8 characters long")
        .required(),
    passwordConfirmation: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match"),
    firstname: yup
        .string()
        .matches(/^[A-Z]\w+$/, "First name must be written in latin and start from a capital letter")
        .required(),
    lastname: yup
        .string()
        .matches(/^[A-Z]\w+$/, "Last name must be written in latin and start from a capital letter")
        .required(),
    birthDate: yup
        .date()
        .min(new Date("Sat Dec 31 1949 00:00:00 GMT+0300 (Eastern European Standard Time)"))
        .max(new Date())
        .required()
})

const SignUpPage = () => {
    const title = "Sign Up";
    document.title = title;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // State

    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState("");

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
            passwordConfirmation: "",
            firstname: "",
            lastname: "",
            birthDate: new Date()
        },
        validationSchema,
        validateOnChange: true,
        onSubmit: async (values) => {
            try {
                const response = await axios.post("/api/user/signup", {
                    ...values
                });

                window.localStorage.setItem("at", response.data.accessToken);
                window.localStorage.setItem("rt", response.data.refreshToken);
                dispatch(setUserData({ ...values, isLoggedIn: true }))

                navigate("/");
            } catch (err) {
                setError("User with such email already exists.");
                setHasError(true);
                return;
            }
        },
        
    });

    const onDateChange = (value: Dayjs | null) => {
        if(value)
            formik.setFieldValue("birthDate", value.toDate());
    }

    return <div className="signUpPageWrapper">
        <Typography sx={{ marginBottom: "15px" }} variant="h5">{title}</Typography>
        <form onSubmit={formik.handleSubmit}>
            <Collapse in={hasError}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Collapse>
            <div>
                <TextField
                    fullWidth
                    id="firstname"
                    name="firstname"
                    label="First name"
                    value={formik.values.firstname}
                    onChange={formik.handleChange}
                    error={formik.touched.firstname && !!formik.errors.firstname}
                    helperText={formik.touched.firstname && formik.errors.firstname}
                />
            </div>
            <div>
                <TextField
                    fullWidth
                    id="lastname"
                    name="lastname"
                    label="Last name"
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                    error={formik.touched.lastname && !!formik.errors.lastname}
                    helperText={formik.touched.lastname && formik.errors.lastname}
                />
            </div>
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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Birth date"
                        onChange={onDateChange}
                        renderInput={(params) => <TextField 
                            fullWidth
                            id="birthDate"
                            name="birthDate"
                            onChange={formik.handleChange} 
                            error={formik.touched.birthDate && !!formik.errors.birthDate}
                            //@ts-ignore
                            helperText={formik.touched.birthDate && formik.errors.birthDate} 
                            {...params} />}
                        
                        value={formik.values.birthDate}
                    />
                </LocalizationProvider>
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
            <div>
                <TextField
                    fullWidth
                    id="passwordConfirmation"
                    type="password"
                    label="Password (confirm)"
                    value={formik.values.passwordConfirmation}
                    onChange={formik.handleChange}
                    error={formik.touched.passwordConfirmation && !!formik.errors.passwordConfirmation}
                    helperText={formik.touched.passwordConfirmation && formik.errors.passwordConfirmation}
                />
            </div>
            <Button color="primary" variant="contained" fullWidth type="submit">
                SIGN UP
            </Button>
            <Typography variant="subtitle1">
                Already have an account? <Link to="/signin" component={RouterLink}>Sign in here.</Link>
            </Typography>
        </form>
    </div>
}

export default SignUpPage;