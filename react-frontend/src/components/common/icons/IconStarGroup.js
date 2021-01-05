import React from 'react'
import {FaStar} from 'react-icons/fa'
import classNames from 'classnames'
import PropTypes from 'prop-types'
const IconStarGroup = ({score, size}) => [2,4,6,8,10].map(num =>
                    <FaStar
                        key={'iconStarGroup_'+num}
                        style={{marginRight:1}}
                        className={classNames('b-0', num < 10 && 'mr-1')}
                        color={num <= score ? '#FFC108' : '#E1E1E1'}
                        size={size=='lg'?19:size}
                    />
            )


IconStarGroup.propTypes = {
    score: PropTypes.number.isRequired,
    size: PropTypes.string
}
IconStarGroup.defaultProps = {
    size: 16
}

export default IconStarGroup