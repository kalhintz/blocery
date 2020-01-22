import React from 'react'
import Style from './B2bShopOnlyXButtonNav.module.scss'
import PropTypes from 'prop-types'
import { Webview } from '../../../lib/webviewApi'
import { BrowserHistory } from 'react-router-dom'
import { XButton } from '../../common'
import classnames from 'classnames'
const B2bShopOnlyXButtonNav = (props) => {
    const close = () => {
        Webview.closePopup()
    }
    const back = () => {
        //팝업 안에서 이동.
        console.log('history : ', props.history.action);
        // history.back()으로 페이지에 진입한경우 action이 POP으로 들어옴
        if(props.history.action === 'PUSH' || props.history.action === 'POP' ) {
            console.log('goBack===========')
            props.history.goBack();
        }
        //페이지가 window.location 을 통해 들어왔을 경우 history의 goBack() 할 수가 없어 메인 페이지로 이동하게 함
        else {
            console.log('/home/1===========')
            window.location = '/b2b/home/1'

        }
    }
    return(
        <div className={Style.wrap}>
            {
                props.close ? <XButton close onClick={close} style={props.style}/> : <XButton back onClick={back} style={props.style}/>
            }
        </div>
    )
}

B2bShopOnlyXButtonNav.propTypes = {
    close: PropTypes.bool
}
B2bShopOnlyXButtonNav.defaultProps = {
    close: false
}


export default B2bShopOnlyXButtonNav