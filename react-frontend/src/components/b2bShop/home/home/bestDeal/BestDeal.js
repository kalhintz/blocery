import React, { Fragment, useState, useEffect } from 'react'
import { ViewButton } from '~/components/common/buttons'
import { B2bSlideItemHeaderImage, B2bSlideItemContent } from '~/components/common/slides'
import { ViewModule, ViewStream, ViewModuleOutlined} from '@material-ui/icons'
import { getBuyerFoodsDefined } from '~/lib/b2bFoodsApi'
import { BlocerySpinner, HeaderTitle } from '~/components/common'

import { Doc } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'

import { Server } from '~/components/Properties'
const BestDeal = (props) => {

    const [data, setData] = useState([])
    const [count, setCount] = useState(0)
    const [style, setStyle] = useState(getStyle(0))
    const [loading, setLoading] = useState(false)
    const [viewIndex, setViewIndex] = useState(0)

    useEffect(() => {
        search()
    }, [])

    async function search() {

        setLoading(true)

        const { data } = await getBuyerFoodsDefined('bestSelling')

        setData(data)
        setCount(data.length)
        setLoading(false)
    }

    function onViewChange(iconIndex){
        setViewIndex(iconIndex)
        setStyle(getStyle(iconIndex))
    }

    //뷰에 따른 스타일 리턴
    function getStyle(iconIndex) {
        const isBig = Doc.isBigWidth()

        let width;

        //가로 뷰 일 경우는 항상 100%
        if(iconIndex === 1) width = '100%'

        else{
            if(isBig) width = 150   //큰화면 : 150px 고정
            else width = '50%'      //작은화면 : 50% 고정

        }
        return {
            width: width
        }
    }


    //상품클릭
    function onClick(item){
        props.history.push(`/b2b/foods?foodsNo=${item.foodsNo}`)
    }

    return (
        <Fragment>
            {
                loading && <BlocerySpinner/>
            }
            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(count)}개 상품</div>}
                sectionRight={<ViewButton icons={[<ViewModule />, <ViewStream />]} onChange={onViewChange} />}
            />
            <hr className='m-0'/>
            <div className='d-flex flex-wrap align-content-stretch m-1'>
                {
                    data.map((foods, index) => {

                        return(
                            <div key={`bestDeal${foods.foodsNo}${index}`} style={style} onClick={onClick.bind(this, foods)}>
                                <div className='m-1 border'>
                                    <B2bSlideItemHeaderImage
                                        {...foods}
                                        imageUrl={Server.getImageURL() + foods.goodsImages[0].imageUrl}
                                        imageHeight={viewIndex === 0 ? 150 : 250}
                                    />
                                    <B2bSlideItemContent
                                        {...foods}
                                        className={'m-2'}
                                    />
                                </div>
                            </div>
                        )
                    })
                }


            </div>
        </Fragment>
    )
}
export default BestDeal