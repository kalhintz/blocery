import React, { Fragment, useState, useEffect } from 'react'
import { BannerSwiper } from '~/components/common'

const Banner = () => {

    const [data, setData] = useState([])

    useEffect(() => {
        getEventData()
    }, [])

    async function getEventData(){
        const eventData = [
            {imageUrl: 'https://i.pinimg.com/originals/4c/af/b4/4cafb45320973be50b5cfe10ccdf4a5e.jpg', url: '/b2b/event'},
        ]
        setData(eventData)
    }

    if(data.length <= 0) return null
    return <BannerSwiper data={data}/>
}
export default Banner