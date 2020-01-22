import React, { useState, useEffect } from 'react'
import { Button } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import BuyerLogin from './BuyerLogin'   //BuyerLogin.js
import SellerLogin from '~/components/b2bSeller/login'

import {B2bShopXButtonNav} from '~/components/common'

//http://localhost:3000/login?userType=consumer

const Login = (props) => {

    //const { userType } = ComUtil.getParams(props)

    const [userType, setUserType] = useState(ComUtil.getParams(props).userType || 'buyer')

    function toggle() {
        userType === 'buyer'? setUserType('seller') : setUserType('buyer')
    }

    return(
        <div>
            <B2bShopXButtonNav close>{userType === 'buyer'? '소비자' : '판매자'} 로그인</B2bShopXButtonNav>
            {
                userType === 'buyer' && <div><BuyerLogin/></div>
            }
            {
                userType === 'seller' && <div><SellerLogin/></div>
            }
            <div className='text-center'>
                <Button outline size='md' color={'link'} onClick={toggle}><u>{userType === 'buyer' || '' ? '판매자' : '소비자'} 로그인하기</u></Button>
            </div>
        </div>

    )
}

export default Login
