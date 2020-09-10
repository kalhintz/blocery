import React from 'react'
import ComUtil from '~/util/ComUtil'
export default function NoticeTemplate(props) {
    return (
        <div>
            <div>{props.title}</div>
            <hr/>
            <div className={'text-right f7 text-secondary'}>{ ComUtil.utcToString(props.regDate, 'YY.MM.DD HH:MM')}</div>
            <div style={{whiteSpace: 'pre-line'}}>{props.content}</div>
        </div>
    )
}