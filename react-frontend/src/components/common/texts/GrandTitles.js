import React from 'react'
import Css from './GrandTitles.module.scss'
import classNames from 'classnames'

const GrandTitle = (props) => {
    const {className, smallText, largeText, subText} = props
    return(
        <div className={classNames(Css.grandTitle, className)}>
            <div>{smallText}</div>
            <div>
                <div>{largeText}</div>
                <div className="ml-auto" style={{fontSize:'0.4em'}}>{subText}</div>
            </div>
        </div>
    )
}

export {
    GrandTitle
}