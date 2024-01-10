import React from "react";

function Signup (props) {
    return(
        <>
            <h1>{props.name}</h1>
            <img src={props.image} alt="" />
        </>
    );
}

export default Signup;