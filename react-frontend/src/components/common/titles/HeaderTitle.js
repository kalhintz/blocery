import React from 'react'
import classNames from 'classnames'

const HeaderTitle = (props) =>
    <div className={classNames('f6 d-flex align-items-center', props.className || 'p-3')}
         //style={{height: 31.5}}
    >
        <div className={'d-flex align-items-center'}>
            {props.sectionLeft || null}
        </div>
        <div className='ml-auto text-right d-flex align-items-center'>
            {props.sectionRight || null}
        </div>
    </div>

export default HeaderTitle