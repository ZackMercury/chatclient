import React from "react";
import Footer from "../../main/Footer";
import Header from "../../main/Header";

import { LogoSvg } from "../../../icons";

const StandardLayout = ({
    children
}:{
    children: any
}) => {

    return <div className="standardLayoutWrapper">
        <Header title="Camdy" Icon={ LogoSvg } />
        <main>{children}</main>
        <Footer/>
    </div>
}

export default StandardLayout;