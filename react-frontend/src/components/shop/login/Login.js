import React, { useState, useEffect } from 'react'
import { Button } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import ConsumerLogin from './ConsumerLogin'   //BuyerLogin.js
import ProducerLogin from '~/components/producer/login'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

import {ShopXButtonNav} from '~/components/common'

//http://localhost:3000/login?userType=consumer

const Login = (props) => {

    //const { userType } = ComUtil.getParams(props)

    const [userType, setUserType] = useState(ComUtil.getParams(props).userType || 'consumer')

    function toggle(_userType) {
        setUserType(_userType)
    }

    return(
        <div>
            <ShopXButtonNav close>{userType === 'consumer'? '소비자' : '생산자'} 로그인</ShopXButtonNav>
            {
                userType === 'consumer' && <div><ConsumerLogin onClick={toggle}/></div>
            }

            {
                userType === 'producer' && <div><ProducerLogin onClick={toggle}/></div>
            }
        </div>

    )
}

export default Login
