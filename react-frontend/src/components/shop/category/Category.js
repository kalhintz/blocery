import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Header } from '~/components/shop/header'
import {getItems} from '~/lib/adminApi'
import classNames from 'classnames'
import { ShopXButtonNav } from '~/components/common'
import { CategoryItems } from '~/components/common/categoryItems'
const Category = (props) => {
    const [items, setItems] = useState([])

    useEffect(()=>{
        async function fetch(){
            const {data} = await getItems(true)
            setItems(data)
        }
        fetch()

    }, [])

    function onClick({type, payload}) {
        props.history.push(payload.url)//GoodsListByItemKind.js로 라우터 이동
    }

    return(
        <div>
            {/*<Header />*/}
            <ShopXButtonNav fixed isVisibleXButton={false} isVisibleCart>
                카테고리
            </ShopXButtonNav>
            <div className='p-1'>
                <CategoryItems data={items} onClick={onClick}/>
            </div>
        </div>
    )
}

export default Category