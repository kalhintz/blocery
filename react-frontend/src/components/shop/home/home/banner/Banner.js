import React, { Fragment, useState, useEffect } from 'react'
import { BannerSwiper } from '~/components/common'
import B2cMissionEvent from '~/images/event/b2cMissionEvent.jpeg'

const Banner = () => {

    const [data, setData] = useState([])

    useEffect(() => {
        getEventData()
    }, [])

    async function getEventData(){
        const eventData = [
            {imageUrl: B2cMissionEvent, url: '/event'},
        ]
        setData(eventData)
    }

    if(data.length <= 0) return null
    return <BannerSwiper data={data}/>
}
export default Banner