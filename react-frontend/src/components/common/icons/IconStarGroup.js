import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import PropTypes from 'prop-types'
const IconStarGroup = ({score, size}) => [2,4,6,8,10].map(num =>
                    <FontAwesomeIcon
                        key={'iconStarGroup_'+num}
                        style={{marginRight:1}}
                        className={classNames('b-0', num < 10 && 'mr-1')}
                        icon={faStar}
                        color={num <= score ? '#FFC108' : '#E1E1E1'}
                        size={size}
                    />
            )


IconStarGroup.propTypes = {
    score: PropTypes.number.isRequired,
    size: PropTypes.string
}
IconStarGroup.defaultProps = {
    size: 'sm'
}

export default IconStarGroup