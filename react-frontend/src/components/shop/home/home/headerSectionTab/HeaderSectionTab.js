import React, { Fragment, useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Style from './HeaderSectionTab.module.scss'
const HeaderSectionTab = (props) => {
    const { tabId } = props
    return (
        <div className={Style.wrap}>
            <div className={Style.tab}>
                <Link  className={Style.link} to={'/home/1'} >오늘의추천</Link>
                <div className={tabId === '1' ? Style.active : null}></div>
            </div>
            <div className={Style.tab}>
                <Link className={Style.link} to={'/home/2'} >마감임박</Link>
                <div className={tabId === '2' ? Style.active : null}></div>
            </div>
            <div className={Style.tab}>
                <Link className={Style.link} to={'/home/3'} >베스트</Link>
                <div className={tabId === '3' ? Style.active : null}></div>
            </div>
            <div className={Style.tab}>
                <Link className={Style.link} to={'/home/4'} >단골상품</Link>
                <div className={tabId === '4' ? Style.active : null}></div>
            </div>

        </div>


    )
}
export default HeaderSectionTab

{/*<div className={Style.wrap}>*/}
{/**/}
{/*<span onClick={onClick.bind(this, '1')}><Link style={{ textDecoration: 'none' }} className={Style.link} to={'/home/1'} >오늘의추천</Link>{tabId === '1' && UnderLine}</span>*/}
{/*<span onClick={onClick.bind(this, '2')}><Link style={{ textDecoration: 'none' }} className={Style.link} to={'/home/2'} >마감임박</Link>{tabId === '2' && UnderLine}</span>*/}
{/*<span onClick={onClick.bind(this, '3')}><Link style={{ textDecoration: 'none' }} className={Style.link} to={'/home/3'} >베스트</Link>{tabId === '3' && UnderLine}</span>*/}
{/*<span onClick={onClick.bind(this, '4')}><Link style={{ textDecoration: 'none' }} className={Style.link} to={'/home/4'} >단골상품</Link>{tabId === '4' && UnderLine}</span>*/}
{/*</div>*/}