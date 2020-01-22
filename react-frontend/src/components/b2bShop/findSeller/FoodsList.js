import React from 'react'
import PropTypes from 'prop-types'
import { B2bSlideItemHeaderImage, B2bSlideItemContent } from '~/components/common'
import { Server } from '~/components/Properties'
const FoodsList = (props) => {
    const { data } = props

    return data.map(foods => {

        const { goodsImages } = foods
        const url = (goodsImages && goodsImages.length > 0) ? Server.getThumbnailURL() + goodsImages[0].imageUrl : ''

        return (
            <div key={'findSeller_foods_'+foods.foodsNo}>
                <div className='d-flex mt-0 ml-3 mr-3 mb-3' onClick={props.onClick.bind(this, foods.foodsNo)}>
                    <div className='mr-2' style={{width: 100, height: 100}}>
                        <B2bSlideItemHeaderImage
                            {...foods}
                            imageUrl={url}
                            // imageHeight={100}
                        />
                    </div>
                    <B2bSlideItemContent {...foods}/>
                </div>
            </div>
        )
    })
}
export default FoodsList