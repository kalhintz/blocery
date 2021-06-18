import React from 'react'
import Css from './GrandTitles.module.scss'
import classNames from 'classnames'

import styled from 'styled-components'
import {Div} from "~/styledComponents/shared";

// .grandTitle{
//     font-family: SeoulHangangL;
//     margin: 30px 16px;
// }
// .grandTitle > div:nth-child(1){
//     font-size: 1.266rem;//19px;
// }
// .grandTitle > div:nth-child(2){
//     font-size: 2.133rem;  //32px;
//     line-height: 36px;
//     display: flex;
// }

const TitleBox = styled(Div)`
    font-family: SeoulHangangL;
    margin: 30px 16px;
    
    & > div:nth-child(1){
        font-size: 1.266rem;//19px;
    }
    
    & > div:nth-child(2){
        font-size: 2.133rem;  //32px;
        line-height: 36px;
        display: flex;
    }
`

const GrandTitle = (props) => {
    const {className, smallText, largeText, subText, style} = props
    return(
        <TitleBox
            style={style}
            // className={classNames(Css.grandTitle, className)}
        >
            <div>{smallText}</div>
            <div>
                <div>{largeText}</div>
                <div className="ml-auto" style={{fontSize:'0.4em'}}>{subText}</div>
            </div>
        </TitleBox>
    )
}

export {
    GrandTitle
}