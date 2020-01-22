import React from 'react'
import Style from './SellerXButtonNav.module.scss'
import propTypes from 'prop-types'
import { Webview } from '../../../lib/webviewApi'
const SellerXButtonNav = (props) => {
    // const close = () => {
    //     // const data = {type: 'close'}
    //     // window.postMessage(JSON.stringify(data))
    //     // window.postMessage(JSON.stringify({}))
    //     // Webview.closePopup()
    //     props.onClose()
    // }
    return(
        <div className={Style.wrap}>
            <div className={Style.close} onClick={props.onClose}>×</div>
            <div className={Style.name}>{props.name}</div>
        </div>
    )
}


export default SellerXButtonNav