import React, { useState, useEffect } from 'react'
import {NavLink, Badge} from 'reactstrap'
import { getCart } from '~/lib/cartApi'
import { IconShoppingCart,IconShoppingCartWhite } from '~/components/common/icons'
import {Link} from '~/styledComponents/shared'
import {useRecoilState} from "recoil";
import {cartCountrState} from "~/recoilState";

function CartLink(props) {

    const [count, setCounter] = useRecoilState(cartCountrState)

    const { white, showShadow = false } = props

    //장바구니 카운트 조회 (장바구니 카운트가 변경되면 항상 조회 하도록)
    useEffect(() => {
        getCart().then(({data}) => setCounter(data.length))
    }, [count])

    return (

        <NavLink tag={Link} to={'/cartList'} className={'p-0'} >
            <div style={{position:'relative'}}>
                {  (white)? <IconShoppingCartWhite/>
                    : <IconShoppingCart/>
                }
                {
                    count > 0 && <span style={{position:'absolute', right: 0, top: -8}}><Badge pill color='dark'>{count}</Badge></span>
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