import React, {useState, useEffect, useRef} from 'react'
import ComUtil from '~/util/ComUtil'
import {Collapse} from 'reactstrap'
import {Icon} from '~/components/common/icons'
import { IoMdClose } from "react-icons/io";

import {Div, Flex, Right} from '~/styledComponents/shared/Layouts'
import {Button, Input} from '~/styledComponents/shared'
import ReactSlider from 'react-slider'
import styled from 'styled-components';

import {color} from "../../../styledComponents/Properties";


const StyledSlider = styled(ReactSlider)`
    width: 100%;
    height: 10px;
`;

const StyledThumb = styled.div`
    width: 30px;
    height: 30px;
    line-height: 25px;
    text-align: center;
    background-color: #0CB3AB;
    color: ${color.white};
    border-radius: 50%;
    cursor: grab;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    border: 1px solid white;
`;

const Thumb = (props, state) => <StyledThumb {...props}>{state.valueNow}</StyledThumb>;

const StyledTrack = styled.div`
    top: 0;
    bottom: 0;
    background: ${props => props.index === 0 ? color.secondary : '#0CB3AB'};
    border-radius: 999px;
    height: 10px;
`;

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;

const BlctPayableCard = (props) => {
    const [useBlct, setUseBlct] = useState() //기본값은 BLCT 최대치로 입력되어있도록
    const [rate, setRate] = useState(0)
    const elInput = useRef(null)
    const { payableBlct } = props
    const [thumbSize, setThumbSize] = useState(30)

    useEffect(()=>{
        //부모의 사용할 blct값에 강제로 초기값 0 을 넣어주기위해 didMount시 onChange를 강제로 일으켜 주었음
        props.onChange({
            value: 0,
            error: true
        })
        // elInput.current.focus();
    },[])

    useEffect(() => {
        // if(useBlct !==  null && useBlct !== undefined) {
        //
        //     if(payableBlct === 0) {
        //         setRate(0)
        //     }else{
        //         setRate((useBlct / payableBlct) * 100)
        //     }
        // }
        calcRate()
    }, [useBlct])

    const calcRate = () => {
        if(useBlct !==  null && useBlct !== undefined) {

            //사용한 Bly가 지불가능한 Bly보다 클 경우 useBlct를 payableBlct(최대치로 다시 조정)
            if (useBlct > payableBlct){
                setUseBlct(payableBlct)
                setRate(100)

                props.onChange({
                    value: payableBlct,
                    error: true
                })

            }else {
                if(payableBlct === 0) {
                    setRate(0)
                }else{
                    setRate((useBlct / payableBlct) * 100)
                }
            }
        }
    }

    useEffect(()=>{
        // changeBlyValue(0)
        // onSliderChange(payableBlct)
        calcRate()
    }, [payableBlct])

    const onChange = (e) => {
        changeBlyValue(e.target.value)
    }

    const onSliderChange = (value) => {
        const blct = payableBlct * (value / 100)
        changeBlyValue(blct)
    }

    const changeBlyValue = (value) => {

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
    const onClick = () => {
        const value = props.payableBlct
        setUseBlct(value)

        props.onChange({
            value: value,
            error: false
        })
    }

    const onClearClick = () => {
        setUseBlct("");
        props.onChange({
            value: 0,
            error: false
        })
        elInput.current.focus();
    }
    return(
        <Div>
            <Div>
                <Flex fontSize={14}>
                    <Div fg={'adjust'}>보유</Div>
                    <Right>
                        <Icon name={'blocery'}/>&nbsp;
                        <span>
                        <b>{ComUtil.addCommas(ComUtil.roundDown(props.totalBlct, 2))}</b>
                         BLY / {ComUtil.addCommas((props.totalBlct * props.blctToWon).toFixed(0))}원
                    </span>
                    </Right>
                </Flex>
            </Div>

            <Div mt={20}>
                <Flex mb={8} justifyContent={'flex-end'}>
                    <Div fg={'adjust'} fontSize={12}>{`${ComUtil.addCommas(ComUtil.roundDown(ComUtil.toNum(useBlct) * ComUtil.toNum(props.blctToWon), 0))  } 원`}</Div>
                    {/*<Right><small>(1BLY = {ComUtil.addCommas(props.blctToWon)}원)</small></Right>*/}
                </Flex>
                <Flex fontSize={13} mb={23}>
                    <Div flexGrow={1} mr={8} relative>
                        <Input ref={elInput} block height={40} bc={'light'} rounded={3} type={'number'} value={useBlct} placeholder={'최소 1BLY 이상'} onChange={onChange}/>
                        <Flex absolute bg={'light'} fg={'white'} width={23} height={23} top={'50%'} yCenter right={7} rounded={'50%'} justifyContent={'center'} onClick={onClearClick}><IoMdClose color={'white'}/></Flex>
                    </Div>
                    <Div flexShrink={0}>
                        <Button bg={'white'} fg={'black'} height={40} rounded={3} bc={'light'} px={10} onClick={onClick}>전액사용</Button>
                    </Div>
                </Flex>

                <StyledSlider
                    value={rate}
                    renderTrack={Track}
                    renderThumb={Thumb}
                    onChange={onSliderChange}
                    disabled={!props.payableBlct}
                />

                {/*<Collapse isOpen={useBlct > props.payableBlct}>*/}
                    {/*<Div mt={20}>*/}
                        {/*<small className={'text-danger'}>최대 {ComUtil.addCommas(props.payableBlct)} BLY를 사용 가능합니다</small>*/}
                    {/*</Div>*/}
                {/*</Collapse>*/}
            </Div>

        </Div>

    )

}

export default BlctPayableCard