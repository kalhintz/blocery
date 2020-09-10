import React from 'react'
import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함
import PropTypes from 'prop-types'

const Style = {
    wrap: {
        boxShadow: '1px 1px 2px gray'
    },
    active: {
        borderBottom: '3px solid #24855b'
    }
}

const HeaderBox = ({text, active, onClick}) => {
    return(

        <div className='flex-grow-1' >
            <div style={active ? Style.active : null} className={classNames('text-center p-2', !active && 'text-secondary')} onClick={onClick}>{text}</div>
        </div>

    )
}
HeaderBox.propTypes = {
    text: PropTypes.string,
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired
}
HeaderBox.defaultProps = {
    text: '',
    active: false,
    onClick: () => null
}
export default HeaderBox