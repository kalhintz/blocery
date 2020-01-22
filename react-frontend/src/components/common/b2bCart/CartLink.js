import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {NavLink, Badge} from 'reactstrap'
import { getCart } from '../../../lib/b2bCartApi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'


function getIconStyle({showShadow}){

    const style = {}

    if(showShadow){
        style.filter = 'drop-shadow(2px 2px 2px #343a40)'
        style.fontSize = '1.5rem'
    }
    return style
}

function CartLink(props) {

    const { showShadow = false } = props

    const [counter, setCounter] = useState(0)
    const cartCounter = useSelector(store => store.b2bCart.counter)

    //장바구니 카운트 조회 (장바구니 카운트가 변경되면 항상 조회 하도록)
    useEffect(() => {
        getCart().then(res => console.log({res}))
        getCart().then(({data}) => setCounter(data.length))
    }, [cartCounter])

    return (
        <NavLink tag={Link} to={'/b2b/cartList'} className={'p-0'} >
            <div style={{position:'relative', paddingRight: 13}}>
                <FontAwesomeIcon icon={faShoppingCart}
                                 size={'lg'}
                                 className={'text-white'}
                                 style={getIconStyle({showShadow})}
                />
                {
                    counter > 0 && <span style={{position:'absolute', right: 0, top: -8}}><Badge pill color='dark'>{counter}</Badge></span>
                }
            </div>
        </NavLink>
    )
}

export default CartLink