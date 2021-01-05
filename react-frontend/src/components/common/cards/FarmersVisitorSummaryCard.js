import React, {useState, useEffect} from 'react'
import ComUtil from '~/util/ComUtil'
import { countRegularConsumer, getProducerByProducerNo } from '~/lib/producerApi'

const FarmersVisitorSummaryCard = (props) => {

    const { producerNo } = props
    const [shopVisitorsCount, setShopVisitorsCount] = useState(0)
    const [regularConsumerCount, setRegularConsumerCount] = useState(0) //단골수
    const [forceUpdateIndex, setForceUpdateIndex] = useState(0)

    useEffect(() => {
        refreshVisitorsCount()
        refreshRegularShopCount()

        const visitorsCountInterval = setInterval(() => { refreshVisitorsCount() }, 5000);
        const regularShopCountInterval = setInterval(() => { refreshRegularShopCount() }, 5000);

        return () => {
            clearInterval(visitorsCountInterval)
            clearInterval(regularShopCountInterval)
        };

    }, [])

    //props.forceUpdateIndex 와 forceUpdateIndex 값이 다른 경우에 새로고침 시도
    useEffect(()=>{
        if(props.forceUpdateIndex !== forceUpdateIndex){
            setForceUpdateIndex(props.forceUpdateIndex)
            refreshVisitorsCount()
            refreshRegularShopCount()
        }
    })

    function refreshVisitorsCount(){

        //방문자수
        //TODO: Producer.java 에 shopVisitorsCount를 가져와야함
        getProducerByProducerNo(producerNo).then(({data: producer}) => {
            setShopVisitorsCount(producer.shopVisitorsCount || 0)
        })
    }

    function refreshRegularShopCount(){
        //단골수
        countRegularConsumer(producerNo).then(({data: count}) => {
            setRegularConsumerCount(count || 0)
        })
    }

    return(
        <div
            className='p-2 f6 text-dark border border-white text-center'
            style={{minWidth: 70, borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, 0.8)'}}
        >
            {/*<div><span className='mr-2'>방문</span><span className={'font-weight-bold'}>{ComUtil.addCommas(shopVisitorsCount)}</span></div>*/}
            <div><span className='mr-2'>단골</span><span className='font-weight-bold'>{ComUtil.addCommas(regularConsumerCount)}</span></div>
        </div>
    )
}
export default FarmersVisitorSummaryCard