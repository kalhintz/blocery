import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Header } from '~/components/shop/header'
import {getItems} from '~/lib/adminApi'
import classNames from 'classnames'
import { ShopXButtonNav } from '~/components/common'
import { CategoryItems } from '~/components/common/categoryItems'
import {getMdPickListFront} from '~/lib/shopApi'
import { B2cHeader } from '~/components/common/headers'

import MdPicks from './Mdpicks'


async function searchItems(){
    const {data} = await getItems(true)
    return data
}

async function searchMdPicks(){
    const {data} = await getMdPickListFront()
    return data
}

const Category = (props) => {
    const [items, setItems] = useState([])
    const [mdPicks, setMdPick] = useState()

    useEffect(()=>{
        async function fetch(){
            setItems(await searchItems());
            setMdPick(await searchMdPicks());
        }
        fetch()

    }, [])




    function onClick(url) {
        props.history.push(url)//GoodsListByItemKind.js로 라우터 이동
    }

    return(
        <div>
            {/*<Header />*/}
            <B2cHeader category/>
            {/*<ShopXButtonNav underline fixed isVisibleXButton={false} isVisibleCart>*/}
                {/*카테고리*/}
            {/*</ShopXButtonNav>*/}
            
            <CategoryItems data={items} onClick={onClick}/>

            <MdPicks data={mdPicks} onClick={onClick}/>
        </div>
    )
}

export default Category