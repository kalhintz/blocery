import React, { useState, useEffect } from 'react'
import ComUtil from '~/util/ComUtil'
import { HeaderTitle, NoSearchResultBox, FoodsQueModalButton } from '~/components/common'
import FoodsQnAItem from './FoodsQnAItem'
import MoreButton from '../MoreButton'
const FoodsQnAContent = ({foods, foodsQnAs=[], totalCount=0, onMoreClick = () => null, onFoodsQnASaved = ()=> null}) => {

    return(
        <div>
            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(totalCount)}개 문의</div>}
                sectionRight={
                    <FoodsQueModalButton className={'text-primary'} foods={foods} onClose={onFoodsQnASaved} >상품 문의하기</FoodsQueModalButton>
                }
            />
            {
                totalCount <= 0 && <hr className='m-0'/>
            }
            {
                foodsQnAs.map((foodsQnA, index) => (
                    <FoodsQnAItem key={'foodsQnA'+index} {...foodsQnA} />
                ))
            }
            {
                foodsQnAs.length < totalCount && <MoreButton onClick={onMoreClick}>({foodsQnAs.length}/{totalCount})</MoreButton>
            }
            {
                foodsQnAs.length <= 0 && <NoSearchResultBox>상품문의가 없습니다</NoSearchResultBox>
            }
        </div>
    )

}
export default FoodsQnAContent