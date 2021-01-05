import React from 'react'
import ConsumerLogin from './ConsumerLogin'   //BuyerLogin.js
import {ShopXButtonNav} from '~/components/common'

//http://localhost:3000/login?userType=consumer

const Login = (props) => {

    //const { userType } = ComUtil.getParams(props)

    // const [userType, setUserType] = useState(ComUtil.getParams(props).userType || 'consumer')
    //
    // function toggle(_userType) {
    //     setUserType(_userType)
    // }
/*
<ShopXButtonNav close>{userType === 'consumer'? '소비자' : '생산자'} 로그인</ShopXButtonNav>
        //     {
        //         userType === 'consumer' && <div><ConsumerLogin onClick={toggle}/></div>
        //     }
        //
        //     {
        //         userType === 'producer' && <div><ProducerLogin onClick={toggle}/></div>
        //     }
*/
    return(
        <div>
            <ShopXButtonNav close>소비자 로그인</ShopXButtonNav>
            <div><ConsumerLogin /></div>
        </div>
    )
}

export default Login
