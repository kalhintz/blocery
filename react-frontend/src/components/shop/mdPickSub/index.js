import React, { useState, useEffect } from 'react'

import Css from './MdPickSub.module.scss'

import IconReserOff from '~/images/icons/ic_reser_off.svg'
import IconReserOn from '~/images/icons/ic_reser_on.svg'
import IconArrow from '~/images/icons/arrow.svg'
import {HalfGoodsList} from '~/components/common/lists'
import {B2cBackHeader} from '~/components/common/headers'
import {Sticky} from '~/components/common/layouts'

import {Server} from '~/components/Properties'
import {getMdPick} from '~/lib/adminApi'

import ComUtil from '~/util/ComUtil'

function FilterBar(props){
    const {count, onChange} = props
    const [filtered1, setFiltered1] = useState(false)   //true 예약상품
    const [filtered2, setFiltered2] = useState(true)    //true 최신순

    function onFilterClick(type){
        if(type === 1){
            const f = !filtered1
            setFiltered1(f)
            onChange({
                reserved: f,
                newest: filtered2
            })
        }else{
            const f = !filtered2
            setFiltered2(f)
            onChange({
                reserved: filtered1,
                newest: f
            })
        }

    }

    return(
        <div className={Css.bar}>
            <div className={Css.left}>
                <div><span className={Css.green}>{count}</span>개 상품</div>
            </div>
            <div className={Css.right}>
                <div onClick={onFilterClick.bind(this, 1)}>
                    <img src={filtered1 ? IconReserOn : IconReserOff} alt={""} />
                    <div>예약상품</div>
                </div>
                {/*<div>*/}
                {/*|*/}
                {/*</div>*/}
                <span className={Css.line}></span>
                <div onClick={onFilterClick.bind(2)}>
                    <img src={IconArrow} alt={""} />
                    <div>{filtered2 ? '최신순' : '과거순'}</div>
                </div>

                {/*<div>|</div>*/}
                {/*<div>*/}
                {/*<img src={IconList} alt={""} />*/}
                {/*</div>*/}

            </div>
        </div>
    )
}

const MdPickSub = (props) => {

    const {id} = ComUtil.getParams(props)

    const [orgGoodsList, setOrgGoodsList] = useState()
    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search(){
        const {data} = await getMdPick(id)
        setOrgGoodsList(data.mdPickGoodsList)
        setData(data)
    }


    function onClick(goods){
        props.history.push(`/goods?goodsNo=${goods.goodsNo}`)
    }
    function onFilterChange(filter){

        let mdPickGoodsList = Object.assign([], orgGoodsList)

        //예약 상품만
        if(filter.reserved){
            mdPickGoodsList = mdPickGoodsList.filter(goods => goods.directGoods === false)
        }

        //최신순 , 과거순 정렬
        ComUtil.sortNumber(mdPickGoodsList, 'goodsNo', filter.newest ? true : false)

        console.log({mdPickGoodsList})

        const newData = Object.assign({}, data)
        newData.mdPickGoodsList = mdPickGoodsList
        setData(newData)
    }


    if(!data) return null;

    return(
        <div>
            <B2cBackHeader title={'기획전'} history={props.history} />

            <img className={Css.topBg} src={data.mdPickDetailImages[0] ? Server.getImageURL() + data.mdPickDetailImages[0].imageUrl : ''} />

            <Sticky>
                <FilterBar count={data.mdPickGoodsList.length} onChange={onFilterChange}/>
            </Sticky>

            { (data.mdPickGoodsList.length == 0) &&
            <div className={Css.center}> 등록된 예약상품이 없습니다 </div>
            }
            <HalfGoodsList data={data.mdPickGoodsList} onClick={onClick} />

        </div>
    )
}
export default MdPickSub
