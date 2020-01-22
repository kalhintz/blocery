import React from 'react'
import Css from './Sticky.module.scss'
import classNames from 'classnames'
function Sticky(props){
    const {top = 0, zIndex = 9999, className = null} = props
    return <div className={classNames(Css.sticky, className)} style={{top: top, zIndex: zIndex}}>{props.children}</div>
}
export default Sticky