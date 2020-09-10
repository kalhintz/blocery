import React from 'react'

//const Myeongjo
const SeoulHangang = (props) => {
    const style = {

    }
    const newStyle = {...props.style}

    return(
        <span style={{
            fontFamily: 'SeoulHangangM'
        }}>{props.children}</span>
    )
}


const LightGray = (props) => <span style={{color: '#979493'}}>{props.children}</span>

export {
    SeoulHangang,
    LightGray
}
