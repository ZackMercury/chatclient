import React from "react";

const Panel = ({
    children,
    className
}) => {

    return <div className={"" + className ? " " + className : ""}>
        { children }
    </div>
}

export default Panel;