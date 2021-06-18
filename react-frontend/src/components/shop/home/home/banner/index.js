import React, { useState, useEffect } from 'react'
import { BannerSwiper } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { getBannerList } from '~/lib/adminApi'
import {Server} from '~/components/Properties'

const Banner = () => {
    const [data, setData] = useState([])

    useEffect(() => {
        getEventData()
    }, [])

    async function getEventData() {
        const { data: data } = await getBannerList();

        ComUtil.sortNumber(data, 'imageNo')

        //console.log(data)
        for(var i=0; i < data.length; i++){
            data[i].imageUrl = Server.getImageURL() + data[i].imageUrl
        }

        setData(data)
    }

    // async function getEventData(){
    //     const eventData = [
    //         {
    //             imageUrl: 'https://blocery.com/images/R8zbpk72bnlk.jpg',
    //             url: '/mypage/noticeList'
    //         },
    //         {
    //             imageUrl: 'https://blocery.com/images/xHiydxsbQcbD.jpg',
    //             url: '/event'
    //         },
    //         {
    //             imageUrl: 'https://blocery.com/images/NkTDnEnEycts.jpg',
    //             url: (Server._serverMode() === 'production')?'/goods?goodsNo=163':'/goods?goodsNo=265'
    //         },
    //
    //     ]
    //     setData(eventData)
    // }

    if(data.length <= 0) return null
    return <BannerSwiper data={data}/>
}
export default Banner