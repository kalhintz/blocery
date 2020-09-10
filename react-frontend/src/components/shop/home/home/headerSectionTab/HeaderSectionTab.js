import React, { Fragment, useState, useEffect } from 'react'
import Style from './HeaderSectionTab.module.scss'
import {isTimeSaleBadge, isBlyTimeBadge} from '~/lib/shopApi'
import classNames from 'classnames'

import {Link} from '~/styledComponents/shared'

import styled from 'styled-components'

import { getValue } from '~/styledComponents/Util'
const SectionLink = styled(Link)`
    font-size: ${getValue(14)};
`

const store = [
    {value: 1, label: '추천', to: '/home/1'},
    {value: 2, label: '블리타임', to: '/home/2'},
    {value: 3, label: '포텐타임', to: '/home/3'},
    {value: 4, label: '마감임박', to: '/home/4'},
    {value: 5, label: '베스트', to: '/home/5'},
    {value: 6, label: '신상품', to: '/home/6'},
    {value: 7, label: '단골상품', to: '/home/7'},
]

const HeaderSectionTab = (props) => {
    const { tabId, history, onClick } = props

    console.log(history)

    const [swiper, updateSwiper] = useState(null);
    const [timeSaleBadge, setTimeSaleBadge] = useState(false);
    const [blyTimeBadge, setBlyTimeBadge] = useState(false);

    getTimeSaleBadge(); //need await?
    getBlyTimeBadge();

    const swipeOptions = {
        lazy: false,
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 4.5,
        // slidesPerView: 'auto',
        initialSlide: tabId, //디폴트 0
        freeMode: true,
        on: {
            init: function () {
            },
            slideChange: function(){
            },
            slideChangeTransitionEnd: function () {

            },
            click: function () {
            }
        }
    }
    useEffect(()=>{
        if(swiper){
            swiper.slideTo(tabId)
        }
    })


    async function getTimeSaleBadge() {
        let {data: timeSaleBadge} = await isTimeSaleBadge();
        setTimeSaleBadge(timeSaleBadge);
        console.log('timeSaleBadge:' + timeSaleBadge);
    }

    async function getBlyTimeBadge() {
        let {data: blyTimeBadge} = await isBlyTimeBadge();
        setBlyTimeBadge(blyTimeBadge);
        console.log('blyTimeBadge:' + blyTimeBadge);
    }

    return (

        <div className={Style.wrap}>
        {/*<Swiper {...swipeOptions}*/}
                {/*initialSlide={tabId}*/}
                {/*getSwiper={updateSwiper}*/}
        {/*>*/}

            {
                store.map((item, index )=> (
                    <div key={'sectionTab'+index} className={Style.tab}>
                        {
                            (item.label === "포텐타임") ? (
                                    /* 아래 Link의 props 에 notiNew notiTop={5} 를 넣어주면 N 가 뜨게됨 */
                                <SectionLink notiNew={timeSaleBadge} notiTop={5} className={classNames(Style.link, history.location.pathname === item.to && Style.active)}
                                      to={item.to}
                                >
                                    {item.label}
                                </SectionLink>
                            ) : (item.label === "블리타임") ? (
                                    <SectionLink notiNew={blyTimeBadge} notiTop={5} className={classNames(Style.link, history.location.pathname === item.to && Style.active)}
                                          to={item.to}
                                    >
                                        {item.label}
                                    </SectionLink>
                                ) :
                                    (
                                    <SectionLink className={classNames(Style.link, history.location.pathname === item.to && Style.active)}
                                            to={item.to}
                                    >
                                        {item.label}
                                    </SectionLink>
                                )
                        }

                        {/*<a className={classNames(Style.link, tabId === item.value && Style.active)} onClick={onClick.bind(this, item.value)}>*/}
                            {/*{item.label}*/}
                        {/*</a>*/}
                        <div className={history.location.pathname === item.to ? Style.underLineActive : null}></div>
                    </div>
                ))
            }



        {/*</Swiper>*/}

        </div>

        // <div className={Style.wrap}>
        //     <div className={Style.tab}>
        //         {/*<Link  className={Style.link} to={'/home/1'} >오늘의추천</Link>*/}
        //         <a className={Style.link} onClick={onClick.bind(this, 0)}>
        //             추천(오늘의추천)
        //         </a>
        //         <div className={tabId === 1 ? Style.active : null}></div>
        //     </div>
        //     <div className={Style.tab}>
        //         {/*<Link className={Style.link} to={'/home/2'} >마감임박</Link>*/}
        //         <a className={Style.link} onClick={onClick.bind(this, 1)}>
        //             기획전(마감임박)
        //         </a>
        //         <div className={tabId === 2 ? Style.active : null}></div>
        //     </div>
        //     <div className={Style.tab}>
        //         {/*<Link className={Style.link} to={'/home/3'} >베스트</Link>*/}
        //         <a className={Style.link} onClick={onClick.bind(this, 2)}>
        //             베스트(베스트)
        //         </a>
        //         <div className={tabId === 3 ? Style.active : null}></div>
        //     </div>
        //     <div className={Style.tab}>
        //         {/*<Link className={Style.link} to={'/home/4'} >단골상품</Link>*/}
        //         <a className={Style.link} onClick={onClick.bind(this, 3)}>
        //             신상품
        //         </a>
        //         <div className={tabId === 4 ? Style.active : null}></div>
        //     </div>
        //     <div className={Style.tab}>
        //         {/*<Link className={Style.link} to={'/home/4'} >단골상품</Link>*/}
        //         <a className={Style.link} onClick={onClick.bind(this, 4)}>
        //             단골상품
        //         </a>
        //         <div className={tabId === 5 ? Style.active : null}></div>
        //     </div>
        //     <div className={Style.tab}>
        //         {/*<Link className={Style.link} to={'/home/4'} >단골상품</Link>*/}
        //         <a className={Style.link} onClick={onClick.bind(this, 5)}>
        //             메뉴-1
        //         </a>
        //         <div className={tabId === 6 ? Style.active : null}></div>
        //     </div>
        //     <div className={Style.tab}>
        //         {/*<Link className={Style.link} to={'/home/4'} >단골상품</Link>*/}
        //         <a className={Style.link} onClick={onClick.bind(this, 6)}>
        //             메뉴-2
        //         </a>
        //         <div className={tabId === 7 ? Style.active : null}></div>
        //     </div>
        //
        // </div>


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