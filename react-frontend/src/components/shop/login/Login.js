import React from 'react'
import ConsumerLogin from './ConsumerLogin'   //BuyerLogin.js
import {ShopXButtonNav} from '~/components/common'
const Login = (props) => {
    return(
        <div>
            <ShopXButtonNav close>소비자 로그인</ShopXButtonNav>
            <div><ConsumerLogin /></div>
        </div>
    )
}
export default Login
