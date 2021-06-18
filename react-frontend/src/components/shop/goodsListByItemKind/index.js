import React, {useState, useEffect, Fragment} from 'react'
import {getItemByItemNo } from '~/lib/adminApi'
import {
    getConsumerGoodsByItemNo,
    getConsumerGoodsByItemKindCode,
    getConsumerGoodsByProducerNoSorted, getConsumerGoodsByProducerNoAndItemNoSorted
} from '~/lib/goodsApi'
import {
    HeaderTitle,
    NoSearchResultBox,
    ShopXButtonNav,
    SlideItemContent,
    SlideItemHeaderImage,
    ViewButton
} from '~/components/common'
import ItemKind from './ItemKind'
import GoodsList from './GoodsList'
import ComUtil from '~/util/ComUtil'

import {Flex, TriangleUp, TriangleDown, Span, Div} from '~/styledComponents/shared'
import Sorter from './Sorter'
import { useModal } from '~/util/useModal'
import ModalCheckListGroup from "~/components/common/modals/ModalCheckListGroup";
import {MdViewModule, MdViewStream} from "react-icons/md";
import {Server} from "~/components/Properties";
import {Icon} from "~/components/common/icons";

const sorters = [
    {value: 1, label: '최신순', sorter: {direction: 'DESC', property: 'timestamp'}},
    //TODO: 인기는 현재 적용불가(backend 배치에서 작업해야 할 것으로 보임)
    // {value: 2, label: '인기'},
    {value: 3, label: '예약상품순', sorter: {direction: 'DESC', property: 'saleEnd'}},
    {value: 4, label: '낮은가격순', sorter: {direction: 'ASC', property: 'currentPrice'}},
    {value: 5, label: '높은가격순', sorter: {direction: 'DESC', property: 'currentPrice'}},
    {value: 6, label: '할인율순', sorter: {direction: 'DESC', property: 'discountRate'}},
]

const GoodsListByItemKind = (props) => {

    const itemNo = props.match.params.itemNo
    const itemKindCode = props.match.params.itemKindCode
    const [item, setItem] = useState()
    const [name, setName] = useState()

    const [goods, setGoods] = useState([])
    const [orgGoodsList, setOrgGoodsList] = useState()
    const [viewType, setViewType] = useState('list')

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()


    useEffect(()=>{
        searchItemKind()
        searchGoods(itemKindCode)
    }, [])

    useEffect(() =>{

        if(modalOpen)
            ComUtil.noScrollBody()
        else
            ComUtil.scrollBody()

    }, [modalOpen])


    async function searchItemKind() {
        const {data} = await getItemByItemNo(itemNo)
        setItem(data)
        setName(data.itemName)
    }

    async function searchGoods(itemKindCode) {
        if(itemKindCode === 'all'){
            const {data} = await getConsumerGoodsByItemNo(itemNo)
            setOrgGoodsList(data)
            setGoods(data)
        }else{
            const {data} = await getConsumerGoodsByItemKindCode(itemKindCode)
            setOrgGoodsList(data)
            setGoods(data)
        }
    }

    //품종 클릭
    function onItemKindClick(code) {     //itemKindCode
        searchGoods(code)
        if(code === 'all'){
            setName(item.itemName + '(전체)')
        }else{
            const _name = item.itemKinds.find(itemKind => itemKind.code === code).name
            setName(_name)
        }
    }

    function onViewChange(iconIndex) {
        if(iconIndex === 0) {
            setViewType('halfCard')
        } else {
            setViewType('list')
        }
    }

    function onSorterChange(filter){
        let filteredList = Object.assign([], orgGoodsList)

        //예약 상품만
        if(filter.reserved){
            filteredList = filteredList.filter(goods => goods.directGoods === false)
        }

        //정렬
        // ComUtil.sortNumber(filteredList, 'goodsNo', filter.newest ? true : false)
        if(filter.label == "최신순") {
            ComUtil.sortNumber(filteredList, 'goodsNo', true)
        } else if(filter.label == "낮은가격순") {
            ComUtil.sortNumber(filteredList, 'currentPrice', false)
        } else if(filter.label == "높은가격순") {
            ComUtil.sortNumber(filteredList, 'currentPrice', true)
        } else if(filter.label == "할인율순") {
            ComUtil.sortNumber(filteredList, 'discountRate', true)
        } else if(filter.label == "예약상품순") {
            ComUtil.sortNumber(filteredList, 'directGoods', false)
        }

        setGoods(filteredList)
        // setViewType('list')
    }

    function onNavClick(){
        setModalState(!modalOpen)
    }

    return(
        <div>
            <ShopXButtonNav
                underline
                historyBack fixed isVisibleCart
            >
                <Flex cursor={1} onClick={onNavClick} alignItems={'center'}>
                    {name}
                    {
                        modalOpen ? <TriangleUp ml={7} /> : <TriangleDown ml={7}/>
                    }
                </Flex>
            </ShopXButtonNav>

            <ItemKind
                isOpen={modalOpen}
                item={item}
                itemKindCode={itemKindCode}
                onClose={()=> setModalState(false)}
                onClick={onItemKindClick}/>

            {/*<Sorter count={goods.length} onChange={onSorterChange}/>*/}
            <HeaderTitle
                sectionLeft={<Div fontSize={18} bold><Span fg='green'>{goods.length}개</Span> 상품</Div>}
                sectionRight={
                    <Fragment>
                        <ModalCheckListGroup
                            title={'정렬 설정'}
                            className={'f5 mr-2 text-secondary'}
                            data={sorters}
                            value={sorters[0].value}
                            onChange={onSorterChange}
                        />
                        {/*<Div onChange={onViewChange}><Icon name={viewType === 'list' ? 'viewTypeList' : 'viewTypeHalfCard'}/></Div>*/}
                        <ViewButton icons={[<MdViewModule />, <MdViewStream />]} onChange={onViewChange} />
                    </Fragment>
                }
            />

            <GoodsList data={goods} viewType={viewType}/>
        </div>
    )
}
export default GoodsListByItemKind
