import React, {useState, useEffect} from 'react'
import Css from './ProgressDate.module.scss'
import classNames from 'classnames'
import {TimeText} from '~/components/common'
import moment from 'moment'
import ComUtil from '~/util/ComUtil'

const ProgressDate = (props) => {
    const {saleEnd, priceSteps, currentPrice, consumerPrice} = props
    const [sIdx, setSIdx] = useState()
    const [width, setWidth] = useState(0)
    useEffect(()=>{
        const i = getSelectedIndex()
        console.log({i})
        setSIdx(getSelectedIndex())
        setWidth(getWidth())
    }, [])
    function getSelectedIndex(){
        let selectedIndex;
        let isEnded = true
        let now = moment().format('x')
        console.log({priceSteps: JSON.stringify(priceSteps)})
        priceSteps.some((item, index) => {
            if(now <= moment(item.until).format('x')){

                selectedIndex = index
                console.log({index, selectedIndex})
                isEnded = false
                return true
            }
        })

        if(isEnded){
            selectedIndex = priceSteps.length -1
        }


        return selectedIndex
    }
    function getWidth(){


        const idx = getSelectedIndex()

        const defaultWidth = 0; //3을 준 이유는 원이 이동할때 3프로 더 왼쪽에서 이동되는 현상을 보여서임

        console.log(priceSteps)
        if(idx === 0){
            return getCalWidth(moment(priceSteps[0].until).add('day', -10).format('YYYY-MM-DDTHH:mm:ss'), priceSteps[0].until, 0) + defaultWidth
        }else if(idx === 1){
            return getCalWidth(priceSteps[0].until, priceSteps[1].until, 33.33) + defaultWidth
        }else if(idx === 2){
            return getCalWidth(priceSteps[1].until, priceSteps[2].until, 66.66) + defaultWidth
        }
    }
    function getCalWidth(startDate, endDate, initWidth){
        let start = moment(startDate).format('x')
        const end = moment(endDate).format('x')

        const during = end - start
        const now = moment().format('x')
        const compDate = now - start

        let days = 0;
        let selectedDayIndex = 0;

        for(let ms = 0; ms <= during; ms += 86400000){
            console.log({ms, during, compDate, days, selectedDayIndex})
            if(ms <= compDate){
                selectedDayIndex++
            }
            if(ms !== 0)
                days++
        }

        const ratePerDay = 33.33 / days //하루 비울

        const widthRate = ratePerDay * selectedDayIndex //하루비울 * 진행된 일수

        let calWidth = initWidth + widthRate

        //판매 기한이 지났으면 강제로 100 세팅
        if(calWidth > 100){
            calWidth = 100
        }

        return calWidth
    }
    return(
        <div className={Css.wrap}>
            <div className={Css.container}>
                <div className={Css.header}>주문종료 <b><TimeText date={saleEnd} formatter={'DD[일 ]hh[시 ]mm[분 ]ss[초]'} /></b> 남음</div>
                <div className={Css.body}>
                    <div className={Css.proBox}>
                        {
                            priceSteps.map((item, i) =>
                                <div className={Css.item}>
                                    <div className={classNames(Css.bar, i === 0 && Css.roundLeft, i === priceSteps.length -1 && Css.roundRight, i <= sIdx   && Css.selected)}></div>
                                    <div className={Css.date}>{moment(item.until).format('MM.DD')}</div>
                                </div>
                            )
                        }

                        {/*<div className={Css.item}>*/}
                        {/*<div className={classNames(Css.bar, Css.selected)}></div>*/}
                        {/*<div className={Css.date}>2.31</div>*/}
                        {/*</div>*/}
                        {/*<div className={Css.item}>*/}
                        {/*<div className={Css.bar}></div>*/}
                        {/*<div className={Css.date}>2.23</div>*/}
                        {/*</div>*/}
                        {/*<div className={Css.item}>*/}
                        {/*<div className={Css.bar}></div>*/}
                        {/*<div className={Css.date}>1.22</div>*/}
                        {/*</div>*/}
                        <div className={Css.circle} style={{left: `${width}%`}}></div>

                    </div>
                    <div className={Css.priceBox}>


                        {
                            priceSteps.map((item, i) =>
                                <div className={Css.item}>
                                    <div className={classNames(Css.text, sIdx === i && Css.textDanger)}><b>{item.discountRate}%</b></div>
                                    <div className={Css.text}><strike>{ComUtil.addCommas(consumerPrice)}원</strike></div>
                                    <div className={Css.text}><b>{ComUtil.addCommas(item.price)}원</b></div>
                                </div>
                            )
                        }

                    </div>
                </div>
            </div>
        </div>

    )
}
export default ProgressDate