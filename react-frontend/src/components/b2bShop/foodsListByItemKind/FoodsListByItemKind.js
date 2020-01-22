import React, {useState, useEffect} from 'react'
import { getB2bItemByNo } from '~/lib/adminApi'
import { getBuyerFoodsByItemNo, getBuyerFoodsByItemKindCode } from '~/lib/b2bFoodsApi'
import { B2bShopXButtonNav, HeaderTitle, Hr } from '~/components/common'
import ItemKind from './ItemKind'
import FoodsList from './FoodsList'
import { ViewButton } from '~/components/common/buttons'
import ComUtil from '~/util/ComUtil'
import { ViewModule, ViewStream } from '@material-ui/icons'

const FoodsListByItemKind = (props) => {

    const itemNo = props.match.params.itemNo
    const itemKindCode = props.match.params.itemKindCode
    const [item, setItem] = useState()

    const [foods, setFoods] = useState([])
    const [viewIndex, setViewIndex] = useState(0)

    useEffect(()=>{
        searchItemKind()
        searchFoods(itemKindCode)
    }, [])


    async function searchItemKind() {
        const {data} = await getB2bItemByNo(itemNo)
        console.log({itemNo, data})
        setItem(data)
    }

    async function searchFoods(itemKindCode) {
        if(itemKindCode === 'all'){
            const {data} = await getBuyerFoodsByItemNo(itemNo)
            setFoods(data)
        }else{
            const {data} = await getBuyerFoodsByItemKindCode(itemKindCode)
            setFoods(data)
        }
    }

    //품종 클릭
    function onItemKindClick(code) {
        searchFoods(code)
    }

    function onViewChange(iconIndex){
        setViewIndex(iconIndex)
        // setStyle(getStyle(iconIndex))
    }

    return(
        <div>
            {/*<Header />*/}
            <B2bShopXButtonNav forceBackUrl={'/b2b/category'} history={props.history} back fixed isVisibleCart>
                {item ? item.itemName : null}
            </B2bShopXButtonNav>

            {/*<hr className='m-0'/>*/}
            <ItemKind itemKindCode={itemKindCode} item={item} onClick={onItemKindClick}/>

            <Hr/>
            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(foods.length)}개 상품</div>}
                sectionRight={<ViewButton icons={[<ViewModule />, <ViewStream />]} onChange={onViewChange} />}
            />
            <hr className={'m-0'}/>
            <FoodsList data={foods} viewIndex={viewIndex} history={props.history}/>
        </div>
    )
}
export default FoodsListByItemKind