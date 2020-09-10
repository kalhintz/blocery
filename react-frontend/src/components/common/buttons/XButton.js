import React from 'react'
import Style from './XButton.module.scss'
// import 'material-icons/css/material-icons.css'
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import { ArrowBack, Close } from '@material-ui/icons'
import {IconBackArrow} from '~/components/common/icons'

import classNames from 'classnames'

const XButton = ({...rest}) => (
    <IconBackArrow {...rest}/>
)


// const XButton = ({style = null, onClick = () => null, back, ...rest}) => (
//     <span
//         className={classNames('position-absolute text-white p-2')}
//         onClick={onClick}
//         {...rest}
//     >
//         <IconBackArrow style={style}/>
//         {
//             // back ? (<ArrowBack/>) : (<Close/>)
//         }
//     </span>
// )

export default XButton