import React from 'react'
import Css from './LoginLinkCar.module.scss'
import classNames from 'classnames'
import {IconNotiGreenCircle} from '~/components/common/icons'

function LoginLinkCard(props){
    const {
        icon = false,
        description,
        style = {},
        onClick = () => null } = props
    return(
        <div className={Css.wrap}>
            <div style={style} className={classNames(Css.container, Css.center)}>
                {
                    icon && <div className={Css.icon}><IconNotiGreenCircle/></div>
                }
                <div className={Css.alertMessage}>앗! 로그인을 하지 않으셨네요.</div>
                {
                    description && <div className={Css.description}>{description}</div>
                }
                <div className={Css.loginBox}>
                    <div onClick={onClick}>로그인</div>
                </div>
            </div>
        </div>
    )
    // return(
    //     <div className='d-flex justify-content-center align-items-center'>
    //         <span className='f2 mr-1' onClick={onClick}><u className='cursor-pointer'>로그인</u></span><span>이 필요합니다</span>
    //     </div>
    // )
}
export default LoginLinkCard