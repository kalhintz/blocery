import React, { useState, useEffect } from 'react'
import { List } from '../components/List'
import { getOrderByProducerNo } from '~/lib/producerApi'
import ComUtil from '~/util/ComUtil'
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap'
import Order from '~/components/producer/web/order'

function OrderList(props) {

    const [data, setData] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [orderSeq, setOrderSeq] = useState(null)


    useEffect(() => {
        search()
    }, [])

    async function search() {
        const {status, data} = await getOrderByProducerNo()

        if (status === 200) {

            let items = []

            console.log({orderList: data})
            ComUtil.sortNumber(data, 'orderSeq', true)

            if(data.length <= 5)
                items = data
            else
                items = data.slice(0,5)

            items = items.map(item => {
                return {
                    ...item,
                    imageUrl: item.orderImg,
                    subTitle: '주문일시 '+ ComUtil.utcToString(item.orderDate, 'YY.MM.DD HH:MM'),
                    badgeText: item.directGoods ? '즉시' : '예약'
                }
            })

            setData(items)
        }
    }

    function onHeaderRightSectionClick(){
        props.history.push('/producer/web/order/orderList')
    }

    function onClick(param){
        console.log(param)

        setOrderSeq(param.orderSeq)
        toggle()
    }

    function toggle(){
        setIsOpen(!isOpen)
    }

    return(
        <>
        <List header={'최근주문상품'}
              headerRightSection={'more >'}
              onHeaderRightSectionClick={onHeaderRightSectionClick}
              data={data}
              titleKey={'goodsNm'}
              subTitleKey={'subTitle'}
              badgeTextKey={'badgeText'}
              onImgClick={onClick}
              onTitleClick={onClick}
              onBadgeClick={onClick}
        />

        <Modal isOpen={isOpen} toggle={toggle} className={''} centered>
            <ModalHeader toggle={toggle}>주문내역</ModalHeader>
            <ModalBody>
                <Order orderSeq={orderSeq} onClose={search}/>
            </ModalBody>
        </Modal>

        </>
    )
}
export default OrderList