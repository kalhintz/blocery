import React from 'react'
import Style from './CategoryItems.module.scss'
import classNames from 'classnames'
import { Container, Row, Col } from 'reactstrap'
import { Link } from 'react-router-dom'
import { faGenderless } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CategoryItems = (props) => {
    const {data} = props

    function onItemClick(url) {
        const state = {
            type: 'ITEM',
            payload: {
                url: url
            }
        }

        props.onClick(state)
    }

    return(
        data.map((item, index)=>(
            <div key={'categoryItem'+index} className={Style.wrap}>
                <div className='d-flex p-2 pl-3 pr-3 font-weight-bolder cursor-default' onClick={onItemClick.bind(this, `/b2b/category/${item.itemNo}/all`)}>
                    <div>{item.itemName}</div>
                    <div className='ml-auto'>{'>'}</div>
                </div>
                <Container>
                    <Row>
                        {
                            item.itemKinds && item.itemKinds.map((itemKind, index)=>
                                <Col key={'itemKind'+index} xs={6} md={4} lg={3} xl={2} className={classNames('f6 p-2 pl-3 d-flex align-items-center', Style.item)}>
                                    <Link to={`/b2b/category/${item.itemNo}/${itemKind.code}`} className='d-flex align-items-center' >
                                        <span className={classNames('d-flex justify-content-center align-items-center', Style.icon)}>
                                            <FontAwesomeIcon icon={faGenderless} />
                                        </span>{itemKind.name}
                                    </Link>
                                    {/*<li className='p-1'><Link to={`/b2b/category/${item.itemNo}/${itemKind.code}`} >{itemKind.name}</Link></li>*/}
                                </Col>
                            )
                        }
                    </Row>
                </Container>


                {/*<ul className={classNames(Style.item, 'p-2 pl-3 pr-3 m-0 f6 text-dark')} >*/}

                {/*</ul>*/}
            </div>
        ))
    )
}
export default CategoryItems