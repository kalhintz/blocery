import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
export default props => {
    const {onClick, ...rest} = props
    return(
        <FontAwesomeIcon
            icon={faBars}
            size={'lg'}
            onClick={onClick}
            {...rest}
        />
    )
}