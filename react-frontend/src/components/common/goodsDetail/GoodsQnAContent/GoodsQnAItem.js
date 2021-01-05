import React, {Fragment, useState} from 'react'
import {FaComments} from 'react-icons/fa'
import ComUtil from '~/util/ComUtil'
import { Hr } from '~/components/common'
const whiteSpace = {whiteSpace: 'pre-line'}

const GoodsQnAItem = (props) => {
    const [ isVisible, setIsVisible ] = useState(false)
    function toggle(){
        setIsVisible(!isVisible)
    }
    const email = props.consumerEmail
    const secureEmail = email.split('@');
    return(
        <Fragment>
            {/*<hr className='m-0'/>*/}
            <Hr/>

            <div className={'f6 m-3'}>
                <div onClick={toggle}>
                    <div className={'mb-2'}>
                        <span className={'mr-2'}>{secureEmail[0].substring(0,3)}***@{secureEmail[1]}</span>
                        <span className={'mr-2'}>|</span>
                        <span className={'mr-2'}>{ComUtil.timeFromNow(props.goodsQueDate)}</span>
                        <span className={'mr-2'}>|</span>
                        {props.goodsQnaStat === 'ready' ? <span>답변대기</span> : <span className={'text-text'}>답변완료</span>}
                    </div>
                    <div style={whiteSpace}>
                        {props.goodsQue}
                    </div>
                </div>
            </div>

            {/*답변 영역*/}
            {
                (isVisible && props.goodsQnaStat === 'ready') && (
                    <Fragment>
                        <hr className='m-0'/>
                        <div className={'p-3 text-center text-secondary'}>
                            <FaComments className={'mr-2'} />
                            판매자의 답변을 기다리고 있습니다
                        </div>
                    </Fragment>
                )
            }
            {
                (isVisible && props.goodsQnaStat !== 'ready') && (
                    <Fragment>
                        <hr className='m-0'/>
                        <div className={'p-3 f6 text-dark bg-light'}>

                            <div className='mb-2'>
                                <span className={'mr-2'}>L</span>
                                <span className={'text-info mr-2'}>판매자 답변</span>
                                <span className={'mr-2'}>|</span>
                                <span>{ComUtil.utcToString(props.goodsAnsDate, 'YYYY.MM.DD')}</span>
                            </div>
                            <div style={whiteSpace}>
                                {props.goodsAns}
                            </div>

                        </div>
                    </Fragment>

                )
            }

        </Fragment>
    )
}
export default GoodsQnAItem