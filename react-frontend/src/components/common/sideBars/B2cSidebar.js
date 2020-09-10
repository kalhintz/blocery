import React, {useState, useEffect} from 'react'
import Css from './B2cSidebar.module.scss'
import B2cLastSeenGoodsList from './B2cLastSeenGoodsList'
import {IconBackClose} from '~/components/common/icons'
import ComUtil from '~/util/ComUtil'

import classNames from 'classnames'


export default function B2cSidebar(props){
    function onClick(item){
        ComUtil.scrollBody()
        props.history.push(`/goods?goodsNo=`+item.goodsNo)
        props.onClose()
    }
    return(
        <>
        {/*<div className={Css.mask} onClick={props.onClose}>*/}
        <div style={{width: props.width || '90%', left: props.left || '90%'}} className={classNames(Css.modal)} onClick={(e)=>{
            e.stopPropagation()
            e.preventDefault()
            return
        }}>
            <div className={Css.modalBody}>
                <div className={Css.header}>
                    <div>최근 본 상품정보</div>
                    <div onClick={props.onClose}>
                        <IconBackClose/>
                    </div>
                </div>
                <B2cLastSeenGoodsList onClick={onClick}/>
            </div>
        </div>
        {/*</div>*/}
        </>
    )
}


