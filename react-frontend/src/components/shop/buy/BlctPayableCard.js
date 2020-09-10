import React, {useState, useEffect, useRef} from 'react'
import Css from './BlctPayableCard.module.scss'
import classNames from 'classnames'
import ComUtil from '~/util/ComUtil'
import {Input, Button, Collapse} from 'reactstrap'
import {Icon} from '~/components/common/icons'
import ButtonCss from './Button.module.scss'

import { IoMdClose } from "react-icons/io";

function exchangeBlctToWon(payableBlct, blctToWon, ){
    return ComUtil.addCommas((payableBlct * blctToWon).toFixed(0))
}

const BlctPayableCard = (props) => {
    const [useBlct, setUseBlct] = useState() //기본값은 BLCT 최대치로 입력되어있도록
    const elInput = useRef(null);
    useEffect(()=>{
        //부모의 사용할 blct값에 강제로 초기값 0 을 넣어주기위해 didMount시 onChange를 강제로 일으켜 주었음
        props.onChange({
            value: 0,
            error: true
        })
        elInput.current.focus();
    },[])
    function onChange(e){
        console.log(e.target.value)
        const value = e.target.value
        const payableBlct = props.payableBlct

        if(parseFloat(value) > payableBlct){
            props.onChange({
                value: value,
                error: true
            })
        }else{
            props.onChange({
                value: value,
                error: false
            })
        }
        setUseBlct(value)
    }
    //전액사용
    function onClick(){
        const value = props.payableBlct
        setUseBlct(value)
        props.onChange({
            value: value,
            error: false
        })
    }
    function onClearClick(){
        setUseBlct("");
        props.onChange({
            value: 0,
            error: true
        })
        elInput.current.focus();
    }
    return(
        <div className={classNames(Css.blctContainer, (useBlct > props.payableBlct || ComUtil.toNum(useBlct) <= 0) && Css.borderDanger)}>
            <div>
                <div>보유BLY</div>
                <div className={Css.vMiddle}><Icon name={'blocery'}/>&nbsp;
                    <span>
                        <b>{ComUtil.addCommas(ComUtil.roundDown(props.totalBlct, 2))}</b>
                         BLY / {ComUtil.addCommas((props.totalBlct * props.blctToWon).toFixed(0))}원
                    </span>
                </div>
            </div>
            <div>
                <div>사용가능BLY</div>
                <div className={Css.vMiddle}><Icon name={'blocery'}/>&nbsp;{props.payableBlct} BLY / {exchangeBlctToWon(props.payableBlct, props.blctToWon)}원</div>
            </div>
            <div className={'d-flex mt-2'}>
                <div>
                    <small>{`${ComUtil.addCommas(ComUtil.toNum(props.blctToWon))}원 X ${ComUtil.addCommas(ComUtil.toNum(useBlct))}BLY = ${ComUtil.addCommas(ComUtil.roundDown(ComUtil.toNum(useBlct) * ComUtil.toNum(props.blctToWon), 0))  } 원`}</small>
                </div>
                <div className={classNames('ml-auto', Css.textGray)}>
                    <small>(1BLY 는 {ComUtil.addCommas(props.blctToWon)}원의 가치)</small>
                </div>

            </div>
            <div className={Css.inputGroup}>
                <div>
                    <Input innerRef={elInput} className={ButtonCss.input} type={'number'} value={useBlct} placeholder={'최대 '+props.payableBlct+' BLY'} onChange={onChange}/>
                    <div className={Css.clear} onClick={onClearClick}><IoMdClose color={'white'}/></div>
                </div>

                <div>
                    <Button className={ButtonCss.btnWhite} block onClick={onClick}>전액사용</Button>
                </div>
            </div>
            <div className='mt-1'>
                <Collapse isOpen={!useBlct || useBlct <= 0}>
                    <small className={'text-danger'}>사용할 BLY를 입력해 주세요</small>
                </Collapse>
            </div>
            <div className='mt-1'>
                <Collapse isOpen={useBlct > props.payableBlct}>
                    <small className={'text-danger'}>최대 {ComUtil.addCommas(props.payableBlct)} BLY를 사용 가능합니다</small>
                </Collapse>
            </div>
            <div className='mt-1'>
                <small>BLY는 상품금액의 최대 50%까지만 사용이 가능합니다.</small>
            </div>
        </div>

    )

}

export default BlctPayableCard