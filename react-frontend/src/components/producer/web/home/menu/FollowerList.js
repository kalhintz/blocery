import React, { useState, useEffect} from 'react'
import { getRegularShopListByProducerNo } from '~/lib/producerApi'
import ComUtil from '~/util/ComUtil'
import { Link } from 'react-router-dom'

const limitedCount = 10

const FollowerList = () => {

    const [data, setData] = useState()
    const [count, setCount] = useState()

    useEffect(() => {
        getList()
    }, [])

    async function getList(){
        const { status, data } = await getRegularShopListByProducerNo()
        // console.log({follerList: data})

        let items = []

        // ComUtil.sortNumber(data, 'orderNo', true)

        console.log({followerList: data})

        setCount(data.length)

        if(data.length <= limitedCount)
            items = data
        else
            items = data.slice(0,limitedCount)

        setData(items)
    }


    if(!data) return null

    return(

        <>
        <div className={'d-flex align-items-center mb-3'}>
            <div className={'text-dark'}>
                최근 단골고객
            </div>
            <div className={'ml-auto bg-danger small rounded-lg text-white d-flex align-items-center pl-2 pr-2'}>
                {ComUtil.addCommas(count)}
            </div>
        </div>
        {
            data.map((item, index) =>
                <div key={'follower_'+index} className={'d-flex align-items-center mb-3'}>
                    <img className={'rounded-circle mr-3'} style={{width: 40, height: 40, objectFit: 'cover'}} src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS5zkVQApWuH-Kyh0AJQylnmEzEk-6v2e_erhbZBeb8fx9kRffv" alt=""/>
                    <div className={'flex-grow-1'}>
                        <div className={'d-flex align-items-start'}>
                            <div className={'f5 text-dark cursor-pointer'}>{item.consumerName}</div>
                            <div className={'ml-auto text-muted f7'}>{ComUtil.timeFromNow(item.shopRegDate)}</div>
                        </div>

                        <div className={'f7 text-muted'}>{item.consumerEmail}</div>
                    </div>
                </div>
            )
        }
        {
            data.length <= 0 && <div className={'text-center f5 text-muted mb-3'}>단골고객이 없습니다</div>
        }
        <div className={'text-center'}>
            <Link to={'/producer/web/shop/regularShopList'} className={'btn btn-info btn-sm'}>전체보기</Link>
        </div>
        </>
    )
}
export default FollowerList