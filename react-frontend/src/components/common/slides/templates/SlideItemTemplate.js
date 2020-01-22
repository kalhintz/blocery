import React, { Fragment, useState, useEffect } from 'react'
import classNames from 'classnames'
import Style from './SlideItemTemplate.module.scss'
function SlideItemTemplate(props){
    return (
        <div className={classNames(Style.slide, props.className)} onClick={()=>props.onClick(props)} >
            { props.children }
        </div>
    )
}
export default SlideItemTemplate