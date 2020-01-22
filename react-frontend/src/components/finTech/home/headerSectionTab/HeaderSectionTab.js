import React, { Fragment, useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Style from './HeaderSectionTab.module.scss'
const HeaderSectionTab = (props) => {
    const { tabId } = props
    return (
        <div className={Style.wrap}>
            <div className={Style.tab}>
                <Link  className={Style.link} to={'/finTech/home/1'} >도소매 가격정보</Link>
                <div className={tabId === '1' ? Style.active : null}></div>
            </div>
            <div className={Style.tab}>
                <Link className={Style.link} to={'/finTech/home/2'} >식자재 업체 정보</Link>
                <div className={tabId === '2' ? Style.active : null}></div>
            </div>
        </div>
    )
}
export default HeaderSectionTab