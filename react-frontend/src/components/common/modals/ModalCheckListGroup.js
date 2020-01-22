import React, { Component, Fragment, useState, useEffect } from 'react';
import { ModalWithNav, CheckListGroup } from '~/components/common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'

//상단의 필터나 정렬에서 사용할 용도로 만들어진 컴포넌트 입니다(물론 다른 용도로 사용가능)
//기존의 ModalWithNav 컴포넌트와 CheckListGroup(신규)를 이용하여 생성하였음
//props에서는 부모로부터 초기값만 전송을 받고 내부적으로 state 관리하여 렌더링을 하고 있으며, onChange 시 해당 아이템 row 전체를 파라미터로 전송합니다
const ModalCheckListGroup = (props) => {
    const [value, setValue] = useState(props.value)
    const [label, setLabel] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if(props.data && props.data.length > 0)
            initLabel()
    }, [])

    function initLabel() {
        const { data } = props
        const item = data.find((item) => item.value === value)
        setLabel(item.label)
    }

    function onItemClick() {
        setIsOpen(true)
    }
    function onItemChange(item) {
        setValue(item.value)
        setLabel(item.label)
        setIsOpen(false)
        props.onChange(item)
    }
    function onClose() {
        setIsOpen(false)
    }

    if(!props.data || props.data.length <= 0)
        return null

    return(
        <div>
            <span
                className={classNames(props.className || null)}
                onClick={onItemClick}
                style={props.style || null}
            >
                <span className={'mr-1'}>{label}</span>
                <FontAwesomeIcon icon={faCaretDown} />
            </span>

            {/* 폰트가 자동으로? 줄어들어서 강제로 15px로 해 주었음 */}
            <div className='f4'>
                <ModalWithNav show={isOpen} title={props.title} onClose={onClose} noPadding>
                    <CheckListGroup
                        className='p-3'
                        data={props.data}
                        value={value}
                        onClick={onItemChange} />
                </ModalWithNav>
            </div>
        </div>
    )
}
export default ModalCheckListGroup