import React, {useState, useEffect} from 'react'
import {getItemByItemNo } from '~/lib/adminApi'
import { getConsumerGoodsByItemNo, getConsumerGoodsByItemKindCode } from '~/lib/goodsApi'
import { ShopXButtonNav, HeaderTitle, Hr } from '~/components/common'
import ItemKind from './ItemKind'
import GoodsList from './GoodsList'
import { ViewButton } from '~/components/common/buttons'
import ComUtil from '~/util/ComUtil'
import { ViewModule, ViewStream } from '@material-ui/icons'

const GoodsListByItemKind = (props) => {

    const itemNo = props.match.params.itemNo
    const itemKindCode = props.match.params.itemKindCode
    const [item, setItem] = useState()

    const [goods, setGoods] = useState([])
    const [viewIndex, setViewIndex] = useState(0)

    useEffect(()=>{
        searchItemKind()
        searchGoods(itemKindCode)
    }, [])


    async function searchItemKind() {
        const {data} = await getItemByItemNo(itemNo)
        setItem(data)
    }

    async function searchGoods(itemKindCode) {
        if(itemKindCode === 'all'){
            const {data} = await getConsumerGoodsByItemNo(itemNo)
            setGoods(data)
        }else{
            const {data} = await getConsumerGoodsByItemKindCode(itemKindCode)
            setGoods(data)
        }
    }

    //품종 클릭
    function onItemKindClick(code) {
        searchGoods(code)
    }

    function onViewChange(iconIndex){
        setViewIndex(iconIndex)
        // setStyle(getStyle(iconIndex))
    }

    return(
        <div>
            {/*<Header />*/}
            <ShopXButtonNav forceBackUrl={'/category'} history={props.history} back fixed isVisibleCart>
                {item ? item.itemName : null}
            </ShopXButtonNav>

            {/*<hr className='m-0'/>*/}
            <ItemKind itemKindCode={itemKindCode} item={item} onClick={onItemKindClick}/>

            <Hr/>
            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(goods.length)}개 상품</div>}
                sectionRight={<ViewButton icons={[<ViewModule />, <ViewStream />]} onChange={onViewChange} />}
            />
            <hr className={'m-0'}/>
            <GoodsList data={goods} viewIndex={viewIndex} history={props.history}/>
        </div>
    )
}
export default GoodsListByItemKind