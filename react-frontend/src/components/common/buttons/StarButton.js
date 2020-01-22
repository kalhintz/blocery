import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Style from './StarButton.module.scss'

const StarButton = (props) => {

    function onClick(){
        props.onClick({score: props.score})
    }

    return (
        <span className='d-flex justify-content-center align-items-center position-relative' onClick={onClick}>
            <FontAwesomeIcon
                className={classNames(Style.star, props.active ? Style.active : null, props.className)}
                inverse={props.active ? false : true}
                icon={faStar}
                color={props.color}
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
    size: '2x',
    active: false,
    readonly: false,
    onClick: () => null
}

export default StarButton