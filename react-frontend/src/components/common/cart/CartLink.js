import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {NavLink, Badge} from 'reactstrap'
import { getCart } from '../../../lib/cartApi'
import { IconShoppingCart,IconShoppingCartWhite } from '~/components/common/icons'

import {Link} from '~/styledComponents/shared'

function getIconStyle({showShadow}){

    const style = {}

    if(showShadow){
        style.filter = 'drop-shadow(2px 2px 2px #343a40)'
        style.fontSize = '1.5rem'
    }
    return style
}

function CartLink(props) {

    const { white, showShadow = false } = props

    const [counter, setCounter] = useState(0)
    const cartCounter = useSelector(store => store.cart.counter)

    //장바구니 카운트 조회 (장바구니 카운트가 변경되면 항상 조회 하도록)
    useEffect(() => {
        getCart().then(({data}) => setCounter(data.length))
    }, [cartCounter])

    return (

        <NavLink tag={Link} to={'/cartList'} className={'p-0'} >
            <div style={{position:'relative'}}>
                {  (white)? <IconShoppingCartWhite/>
                    : <IconShoppingCart/>
                }
                {
                    counter > 0 && <span style={{position:'absolute', right: 0, top: -8}}><Badge pill color='dark'>{counter}</Badge></span>
                }
            </div>
        </NavLink>


        // <Link to={'/cartList'} noti={counter > 0} notiRight={-2} >
        //     {  (white)? <IconShoppingCartWhite/>
        //                : <IconShoppingCart/>
        //     }
        // </Link>
    )
}

export default CartLink