import React, { useState, useEffect } from 'react'
import {Input} from 'reactstrap'
import ComUtil from '../../../util/ComUtil'
import PropTypes from 'prop-types'

//금액(콤마가 찍히는)용 Input
const CurrencyInput = (props) => {

    const { value = '', isDecimalPoint, toFixed, ...rest} = props

    const onChange = (e) => {

        if(e.target.value.toString().length > 0){
            const val = ComUtil.toNum(e.target.value)
            e.target.value = val
        }
        props.onChange(e)//콤마가 제거된 숫자를 부모에게 전달
    }

    let val;

    if(value && value.toString().length > 0){
        val = isDecimalPoint ? value : ComUtil.toNum(value).toFixed(toFixed)
        val = ComUtil.addCommas(val)
    }else {
        val = value
    }

    return(
        <Input
            {...rest}
            value={val}
            onChange={onChange}
        />
    )
}

CurrencyInput.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    isDecimalPoint: PropTypes.bool,  //소수점 여부
    toFixed: PropTypes.number,      //버릴 소수점 자리수
    onChange: PropTypes.func.isRequired
}
CurrencyInput.defaultProps = {
    value: '',
    isDecimalPoint: false,
    toFixed: 0,
    onChange: () => null
}

export default CurrencyInput