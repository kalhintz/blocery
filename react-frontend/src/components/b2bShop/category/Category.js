import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Header } from '~/components/b2bShop/header'
import {getB2bItems} from '~/lib/adminApi'
import classNames from 'classnames'
import { B2bShopXButtonNav } from '~/components/common'
import { CategoryItems } from '~/components/common/b2bCategoryItems'
const Category = (props) => {
    const [items, setItems] = useState([])

    useEffect(()=>{
        async function fetch(){
            const {data} = await getB2bItems(true)
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
            <B2bShopXButtonNav fixed isVisibleXButton={false} isVisibleCart>
                카테고리
            </B2bShopXButtonNav>
            <div className='p-1'>
                <CategoryItems data={items} onClick={onClick}/>
            </div>
        </div>
    )
}

export default Category