import { Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";
const RootPage = () => {
    return <div>
        <Typography sx={{ marginBottom: "10px" }} variant="h5">
            Welcome to Camdy, a video chat app.
        </Typography>
        <Typography variant="body1">
            You can start exploring all the wonderful features we have right now! <br/>
            Begin your journey by <Link component={RouterLink} to="/signup">signing up</Link> if you don't have an account.
            If you already have an account, <Link component={RouterLink} to="/signin">log in here</Link>
        </Typography>
    </div>
}

export default RootPage;