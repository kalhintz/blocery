import React, { Fragment, useState, useEffect } from 'react'
import { SpinnerBox } from '~/components/common'

import { GrandTitle } from '~/components/common/texts'
import { getConsumerGoodsJustCached } from '~/lib/goodsApi'
import {HalfGoodsList} from '~/components/common/lists'
import Footer from '../footer'


const NewestGoods = (props) => {
    const { limitCount = 99 } = props

    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        // const sorter = {direction: 'DESC', property: 'timestamp'}
        // const { data } = await getConsumerGoodsJustSorted(sorter)
        const { data } = await getConsumerGoodsJustCached()

        if(data.length > limitCount){
            data.splice(limitCount, data.length);
        }
        console.log({data})

        setData(data)
    }

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!data) return <SpinnerBox minHeight={160} />
    return (
        <Fragment>
            <GrandTitle
                smallText={'새롭게 등록된'}
                largeText={'따끈따끈한 상품'}
            />
            <HalfGoodsList data={data} onClick={onClick}/>
            <Footer/>
        </Fragment>

    )
}
export default NewestGoods