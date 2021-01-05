import React, { useState, useEffect } from 'react'
import Css from './MdPick.module.scss'
import classNames from 'classnames'
import { Server } from '~/components/Properties'
import {Link} from 'react-router-dom'
import {getMdPickListFront, setLastSeenMdPick} from '~/lib/shopApi'
import { B2cHeader } from '~/components/common/headers'

const MdPick = (props) => {

    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {
        const { data } = await getMdPickListFront()
        setData(data)
        // console.log("MdPick !!!!!!!!!!!!!!!!!!!!!");
        //mdPick마지막 본시간 update
        setLastSeenMdPick(); //MdPick에 진입한 시간 update to Consumer

    }

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!data) return null
    return(
        <div>
            <B2cHeader mdPick/>
            {/*<ShopXButtonNav underline fixed isVisibleXButton={false} isVisibleCart>*/}
            {/*기획전*/}
            {/*</ShopXButtonNav>*/}
            <div className={Css.grandTitleBox}>
                <div><span className={Css.green}>{data.length}개</span><span>의 기획전이</span></div>
                <div>진행중입니다.</div>
            </div>
            {
                data.map(item =>
                    <Link key={item.mdPickId} to={`/mdPick/sub?id=${item.mdPickId}`}>
                        <div className={classNames('mb-5',Css.item)}>
                            <div
                                className={classNames(Css.backgroundBox, Css.leftRound)}
                                style={{background: `url(${item.mdPickMainImages[0] ? Server.getImageURL() + item.mdPickMainImages[0].imageUrl: ''}) no-repeat`}}
                            >
                                <div className={classNames(Css.descLayer, Css.leftRound)}>
                                    <div className={Css.green}>{item.mdPickTitle}</div>
                                    <div>{item.mdPickTitle1}</div>
                                    <div>{item.mdPickTitle2}</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )
            }
        </div>
    )
}
export default MdPick