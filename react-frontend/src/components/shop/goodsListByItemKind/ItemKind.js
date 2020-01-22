import React, {useState, useEffect} from 'react'
import Style from './ItemKind.module.scss'
import { Link } from "react-router-dom";
import classNames from 'classnames'
import {getItemByItemNo, getItemKindByCode} from '~/lib/adminApi'
import {Container, Row, Col} from 'reactstrap'

const Item = (props) =>{
    const {itemNo, itemKindName, itemKindCode, isActive, onClick = () => null} = props
    return(
    <Col xs={4} lg={3} xl={2} className={classNames('p-0 f6 d-flex align-items-center', Style.item, isActive ? Style.active : null)} onClick={onClick}>
        {/*<Link to={`/category/${itemNo}/${itemKindCode}`} className='flex-grow-1 p-2' >*/}
        <div className='flex-grow-1 p-2 d-flex align-items-center justify-content-center cursor-default'>
            <div>{itemKindName}</div>
            <div className='ml-auto'>{'>'}</div>
        </div>
        {/*</Link>*/}
    </Col>
    )
}

const ItemKind = (props) => {
    const [itemKindCode, setItemKindCode] = useState(props.itemKindCode)
    function onClick(_itemKindCode) {
        setItemKindCode(_itemKindCode)
        props.onClick(_itemKindCode)
    }
    return(
        <Container fluid>
            <Row>
                {
                    props.item && <Item itemNo={props.item.itemNo} itemKindName={'전체'} itemKindCode={'all'} isActive={itemKindCode === 'all'} onClick={onClick.bind(this, 'all')} />
                }
                {
                    props.item && props.item.itemKinds.map((itemKind)=>
                        <Item key={'category_itemKind_'+itemKind.code} itemNo={props.item.itemNo} itemKindName={itemKind.name} itemKindCode={itemKind.code} isActive={itemKindCode == itemKind.code} onClick={onClick.bind(this, itemKind.code)} />
                    )
                }
            </Row>
        </Container>
    )
}
export default ItemKind