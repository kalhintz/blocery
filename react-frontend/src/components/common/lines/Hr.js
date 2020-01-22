import React from 'react'
import classNames from 'classnames'
const Hr = (props) => <hr className={classNames('m-0 border-0 blocery-bg-dark-gray font-weight-bold', props.className)} style={{height: 10}}/>
export default Hr