import React from 'react'
import ComUtil from '~/util/ComUtil'
import { HeaderTitle, NoSearchResultBox, GoodsQueModalButton } from '~/components/common'
import GoodsQnAItem from './GoodsQnAItem'
import MoreButton from '../MoreButton'
const GoodsQnAContent = ({goods, goodsQnAs=[], totalCount=0, onMoreClick = () => null, onGoodsQnASaved = ()=> null}) => {

    return(
        <div>
            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(totalCount)}개 문의</div>}
                sectionRight={
                    <GoodsQueModalButton goods={goods} onClose={onGoodsQnASaved} >상품 문의하기</GoodsQueModalButton>
                }
            />
            {
                totalCount <= 0 && <hr className='m-0'/>
            }
            {
                goodsQnAs.map((goodsQnA, index) => (
                    <GoodsQnAItem key={'goodsQnA'+index} {...goodsQnA} />
                ))
            }
            {
                goodsQnAs.length < totalCount && <MoreButton onClick={onMoreClick}>({goodsQnAs.length}/{totalCount})</MoreButton>
            }
            {
                goodsQnAs.length <= 0 && <NoSearchResultBox>상품문의 없습니다</NoSearchResultBox>
            }
        </div>
    )

}
export default GoodsQnAContent