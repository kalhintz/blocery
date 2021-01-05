import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
const TabSection = (props) => {
    return (
        <div
            onClick={props.onClick}
            // style={{width:'25%'}}
            className={classNames('f5 flex-grow-1 text-center pt-2 pb-2', props.isActive ? 'bg-light text-dark' : 'bg-secondary text-white')}
        >
            {props.text}
        </div>
    )
}

TabSection.propTypes = {
    items: PropTypes.array.isRequired
}
TabSection.defaultProps = {
    items: []
}
export default TabSection