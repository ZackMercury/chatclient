import { Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import './style.css';

const Header = ({
    title,
    Icon,
}: {
    title: string
    Icon: React.FC
}) => {
    const navigate = useNavigate();

    const goToHomePage = () => {
        navigate("/")
    }

    return <header className="header" onClick={() => goToHomePage()}>
        <Icon/>
        <Typography variant="h6" color={"#fff"} className="headerTitle">{title}</Typography>
    </header>
}

export default Header;