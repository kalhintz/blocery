import React, { Fragment, useState } from 'react'

import { ModalWithNav } from '~/components/common'

const ModalButton = (props) => {

    const { ...rest } = props

    const [isOpen, setIsOpen] = useState(false)

    async function onClick(e) {
        e.preventDefault();
        if(await props.onClick()){
            toggle()
        }
    }

    function toggle() {
        setIsOpen(!isOpen)
    }

    return(
        <Fragment>
            <u><a href={'#'} className={'text-info'} onClick={onClick} {...rest} >{props.label}</a></u>
            <ModalWithNav show={isOpen} title={props.title} onClose={toggle} noPadding>
                {
                    props.children
                }
            </ModalWithNav>
        </Fragment>

    )
}
export default ModalButton