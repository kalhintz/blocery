import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Css from './QtyInputGroup.module.scss'
import ComUtil from '../../../util/ComUtil'
import {Input} from 'reactstrap'

import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';


const QtyInputGroup = (props) => {


    const onChange = (e) => {
        const val = ComUtil.toNum(e.target.value)
        changeState(val <= 0 ? 1 : val)
    }

    const onDecreaseClick = () => {
        const val = ComUtil.toNum(props.value) <= 1 ? 1 : ComUtil.toNum(props.value) -1
        changeState(val)
    }

    const onIncreaseClick = (e) => {
        const val = ComUtil.toNum(props.value) +1
        changeState(val)
    }

    const changeState = (_value) => {
        props.onChange({
            name: props.name,
            value: _value
        })
    }

    //mounted
    // useEffect(() => {
    //     console.log('마운트 될 때만 실행됩니다.');
    // }, []);

    //업데이트 되었을때
    // useEffect(() => {
    // },[value]);
    
    return(
        <div className={Css.wrap}>
            <div className={Css.button} onClick={onDecreaseClick}><AiOutlineMinus/></div>
            <Input type="number" readOnly={props.readonly} placeholder={props.placeholder} onChange={onChange} value={props.value}/>
            <div className={Css.button} onClick={onIncreaseClick}><AiOutlinePlus /></div>
        </div>
    )
}

QtyInputGroup.propTypes = {
    name: PropTypes.any,
    value: PropTypes.number,
    readOnly: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
}

QtyInputGroup.defaultProps = {
    value: 1,
    name: '',
    readonly: false,
    placeholder: '',
    onChange: () => null,
}

export default QtyInputGroup