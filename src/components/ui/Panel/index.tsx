import React from "react";
import './style.css';

const Panel = ({
    children,
    className = ""
}:{
    children?: any,
    className?: string
}) => {

    return <div className={"panel-wrap" + (className ? " " + className : "")}>
        { children }
    </div>
}

export default Panel;