import React, {useState, useEffect} from 'react'
import {getItemByItemNo } from '~/lib/adminApi'
import { getConsumerGoodsByItemNo, getConsumerGoodsByItemKindCode } from '~/lib/goodsApi'
import { ShopXButtonNav} from '~/components/common'
import ItemKind from './ItemKind'
import GoodsList from './GoodsList'
import ComUtil from '~/util/ComUtil'

import {Flex, TriangleUp, TriangleDown} from '~/styledComponents/shared'
import Sorter from './Sorter'
import { useModal } from '~/util/useModal'

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
        console.log({data})
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
        console.log({code})
        searchGoods(code)
        if(code === 'all'){
            setName(item.itemName + '(전체)')
        }else{
            const _name = item.itemKinds.find(itemKind => itemKind.code === code).name
            setName(_name)
        }
    }

    function onSorterChange(filter){

        let filteredList = Object.assign([], orgGoodsList)

        console.log({filter})

        //예약 상품만
        if(filter.reserved){
            filteredList = filteredList.filter(goods => goods.directGoods === false)
        }

        //최신순 , 과거순 정렬
        ComUtil.sortNumber(filteredList, 'goodsNo', filter.newest ? true : false)

        console.log({filteredList})

        setGoods(filteredList)
        setViewType(filter.viewType)
    }

    function onNavClick(){
        setModalState(!modalOpen)
    }

    return(
        <div>
            <ShopXButtonNav
                underline
                history={props.history} historyBack fixed isVisibleCart
            >
                <Flex cursor onClick={onNavClick} alignItems={'center'}>
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
            <Sorter count={goods.length} onChange={onSorterChange}/>
            <GoodsList data={goods} viewType={viewType}/>
        </div>
    )
}
export default GoodsListByItemKind
