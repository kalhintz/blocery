import React from 'react'
import PropTypes from 'prop-types'
import { MainGoodsCard } from '../cards'
import ReactSwipe from 'react-swipe'
import Style from './MainGoodsCarousel.module.scss'
import {MdNavigateBefore, MdNavigateNext} from 'react-icons/md'
import { Server } from '../../Properties'

const MainGoodsCarousel = (props) => {
    const serverImageUrl = Server.getImageURL()
    let reactSwipeEl
    return (
        <div className={Style.container}>
            <i className={Style.btnBefore} onClick={() => reactSwipeEl.prev()}><MdNavigateBefore /></i>
            <i className={Style.btnNext} onClick={() => reactSwipeEl.next()}><MdNavigateNext /></i>
            <ReactSwipe
                className="carousel"
                swipeOptions={{ continuous: false }}
                ref={el => (reactSwipeEl = el)}
            >

                {/* react-swipe 에서 컴포넌트를 사용하려면 div 를 감싸줘야 함 */}
                {
                    props.data.map((goods, index)=>{

                        let item = Object.assign({}, goods);

                        return (
                            <div key={'goods'+index}>
                                <MainGoodsCard
                                    {...item}
                                    imageUrl={serverImageUrl+item.goodsImages[0].imageUrl}
                                    onClick={props.onClick.bind(this, item)}
                                />
                            </div>
                        )
                    })
                }


            </ReactSwipe>
        </div>
    )
}

MainGoodsCarousel.propTypes = {
    data: PropTypes.array.isRequired
}
MainGoodsCarousel.defaultProps = {
    data: []
}
export default MainGoodsCarousel