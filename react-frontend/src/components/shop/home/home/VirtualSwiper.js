import React from 'react';
import Swiper from 'react-id-swiper'
import TodaysDeal from './todaysDeal'
import BestDeal from './bestDeal'
import FavoriteGoods from './favoriteGoods'

export default class VirtualSwiper extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

            tabId: this.props.tabId,

            //더미 슬라이드
            slides: [0,1,2,3,4],
            // virtual data
            virtualData: {
                slides: [],
            },
            options: {
                // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
                virtual: {
                    slides: [<TodaysDeal />,
                        <div style={{height: 473}}>기획전</div>,
                        <BestDeal/>,
                        <div style={{height: 473}}>신상품</div>,
                        <FavoriteGoods/>],
                    // slides: [
                    //
                    //         <TodaysDeal />
                    //     ,
                    //     <div>menu2</div>,
                    //     <div>menu3</div>,
                    //     <div style={{height: 500}}>menu4</div>,
                    //     <div style={{height: 500}}>menu5</div>,
                    // ],
                    renderExternal: this.renderExternal
                },
                on: {
                    init: function () {
                    },
                    slideChange: function () {
                        props.onChange(this.activeIndex)
                    },
                    slideChangeTransitionEnd: function () {
                    },
                    click: function () {
                    }
                }
            }
        }

        this.swiper = undefined
    }
    renderExternal = (data) => {
        // assign virtual slides data
        this.setState({
            virtualData: data,
        });
    }
    componentDidMount() {
    }
    componentDidUpdate(){
        // console.log('didUPdate', this.swiper)
        this.swiper.slideTo(this.props.tabId)
    }



    render() {
        return(
            <Swiper
                {...this.state.options}
                initialSlide={this.props.tabId}
                getSwiper={(s) => this.swiper = s}
            >

                    {/* It is important to set "left" style prop on every slide */}
                    {this.state.virtualData.slides.map((slide, index) => (
                        <div
                             key={index}
                             // style={{left: `${this.state.virtualData.offset}px`}}
                        >
                            {
                                slide
                            }
                        </div>
                    ))}
            </Swiper>
        )
    }
}