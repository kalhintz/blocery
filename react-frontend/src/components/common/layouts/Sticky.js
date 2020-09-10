import React, {useRef} from 'react'
import Css from './Sticky.module.scss'
import classNames from 'classnames'
function Sticky(props){
    const {top = 0, zIndex = 10, className = null, innerRef} = props
    //const divRef = useRef(ref)
    return <div ref={innerRef} className={classNames(Css.sticky, className)} style={{top: top, zIndex: zIndex}}>{props.children}</div>
}
export default Sticky