import React, {useEffect, useState} from 'react'
import {Div, Flex, TriangleUp, TriangleDown, Span, Mask} from '~/styledComponents/shared'
import {ShopXButtonNav} from "~/components/common";
import GoodsList from "~/components/shop/goodsListByItemKind/GoodsList";
import {useModal} from "~/util/useModal";
import ComUtil from "~/util/ComUtil";
import {getItems} from "~/lib/adminApi";
import {getGiftSet, getConsumerGoodsByItemNo} from "~/lib/goodsApi";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";

const Modal = styled(Div)`
    background-color: ${color.white};
    padding: 22px 0;
    & > div{
        margin-bottom: 19px;
    }
    & > div:last-child{
        margin-bottom: 0;
    }
`;

const Item = styled.div`
    font-size: ${getValue(16)};
    color: ${props => props.active ? color.green : color.dark};
    font-weight: ${props => props.active && 'bold'};
    cursor: pointer;
    text-align: center;
`;

const GiftSet = (props) => {
    // const rops.match.params.itemKindCode
    const [itemNo, setItemNo] = useState(0)
    const [items, setItems] = useState()
    const [name, setName] = useState('선물세트')

    const [goods, setGoods] = useState([])
    const [viewType, setViewType] = useState('list')

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    useEffect(()=>{
        searchItems()
        searchGoods()
    }, [])

    useEffect(() =>{
        if(modalOpen)
            ComUtil.noScrollBody()
        else
            ComUtil.scrollBody()

    }, [modalOpen])


    async function searchItems() {
        const {data} = await getItems(true)
        setItems(data)
    }

    async function searchGoods() {
        if(itemNo == 0){
            const {data} = await getGiftSet(0);
            setGoods(data)
        }else{
            const {data} = await getGiftSet(itemNo)
            setGoods(data)
        }
    }

    function onNavClick(){
        setModalOpen(!modalOpen)
    }

    async function onClickItemName(itemNo, itemName) {
        onNavClick();
        setItemNo(itemNo)

        if(itemNo == 0) {
            setName('선물세트(전체)')
        } else {
            setName(itemName)
        }

        const {data} = await getGiftSet(itemNo)
        setGoods(data)
    }

    return(
        <Div>
            <ShopXButtonNav
                underline
                historyBack fixed isVisibleCart
            >
                <Flex alignItems={'center'} onClick={onNavClick} alignItems={'center'}>
                    {name}
                    {
                        modalOpen ? <TriangleUp ml={7} /> : <TriangleDown ml={7}/>
                    }
                </Flex>
            </ShopXButtonNav>

            {
                modalOpen &&
                    <Mask underNav onClick={onNavClick}>
                        <Modal onClick={(e)=> e.stopPropagation()}>
                            <Item active={itemNo == 0} onClick={onClickItemName.bind(this, 0)}>선물세트(전체)</Item>
                            {
                                items &&
                                items.map(item =>
                                    <Item key={'item'+item.itemNo}
                                          active={itemNo == item.itemNo}
                                          onClick={onClickItemName.bind(this, item.itemNo, item.itemName)}
                                    >
                                        {item.itemName}
                                    </Item>
                                )
                            }
                        </Modal>
                    </Mask>
            }

            {/*<ItemKind*/}
            {/*    isOpen={modalOpen}*/}
            {/*    item={item}*/}
            {/*    itemKindCode={itemKindCode}*/}
            {/*    onClose={()=> setModalState(false)}*/}
            {/*    onClick={onItemKindClick}/>*/}

            <Div fontSize={18} bold m={16}><Span fg='green'>{goods.length}개</Span> 상품</Div>
            <GoodsList data={goods} viewType={viewType}/>
        </Div>
    )

}

export default GiftSet