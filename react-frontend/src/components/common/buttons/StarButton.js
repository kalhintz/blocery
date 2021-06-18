import React from 'react'
import {FaStar} from 'react-icons/fa'

import PropTypes from 'prop-types'
import classNames from 'classnames'
import Style from './StarButton.module.scss'

const StarButton = (props) => {

    function onClick(){
        props.onClick({score: props.score})
    }

    return (
        <span className='d-flex justify-content-center align-items-center position-relative' onClick={onClick}>
            <FaStar
                className={classNames(Style.star, props.active ? Style.active : null, props.className)}
                color={props.active ? props.color : 'white'}
                size={props.size}
            />
        </span>
    )
}
StarButton.propTypes = {
    color: PropTypes.string,
    size: PropTypes.any,
    active: PropTypes.bool,
    readonly: PropTypes.bool
}
StarButton.defaultProps = {
    color: '#ffc107',//#ffc107   //#9C9C9C
    size: 35,
    active: false,
    readonly: false,
    onClick: () => null
}

export default StarButton