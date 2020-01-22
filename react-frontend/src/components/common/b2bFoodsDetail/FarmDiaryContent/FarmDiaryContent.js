import React, { Fragment, useState } from 'react'
import FarmDiaryItem from './FarmDiaryItem'
import { NoSearchResultBox, HeaderTitle } from '~/components/common'
import MoreButton from '../MoreButton'
import ComUtil from '~/util/ComUtil'

//TODO: 전체보기(생산자의 전체 재배일지조회) 기능은 FinTech 이후 구현

const FarmDiaryContent = ({farmDiaries, totalCount, onMoreClick}) => {
    return(
        <Fragment>
            <HeaderTitle
                sectionLeft={<span className='mr-2'>총 {ComUtil.addCommas(totalCount)}개 일지</span>}
                // sectionRight={<span className='flex-grow-1 text-primary text-right'>전체보기</span>}
            />

            {
                totalCount === 0 && <hr className='m-0'/>
            }
            {/* content */}
            {
                farmDiaries.map((farmDiary, index) => <FarmDiaryItem key={'farmDiaryItem_'+index} {...farmDiary}/>)
            }
            {
                farmDiaries.length < totalCount && <MoreButton onClick={onMoreClick}>({farmDiaries.length}/{totalCount})</MoreButton>
            }
            {
                farmDiaries.length <= 0 && <NoSearchResultBox>생산일지가 없습니다</NoSearchResultBox>
            }

        </Fragment>
    )
}
export default FarmDiaryContent