import React, { Fragment, useState } from 'react'
import { NoSearchResultBox, HeaderTitle, FarmDiaryCard } from '~/components/common'
import MoreButton from '../MoreButton'
import ComUtil from '~/util/ComUtil'
import { Webview } from '~/lib/webviewApi'

//TODO: 전체보기(생산자의 전체 재배일지조회) 기능은 FinTech 이후 구현

//const FarmDiaryContent = ({farmDiaries, totalCount, onMoreClick}) => {
const FarmDiaryContent = (props) => {

    const goFarmDiaryPage = (diaryNo) => {
        //Webview.openPopup('/producersFarmDiary?diaryNo=' + diaryNo, true);
        props.history.push('/producersFarmDiary?diaryNo=' + diaryNo);
    };

    return(
        <Fragment>
            <HeaderTitle
                sectionLeft={<span className='mr-2'>총 {ComUtil.addCommas(props.totalCount)}개 일지</span>}
                // sectionRight={<span className='flex-grow-1 text-info text-right'>전체보기</span>}
            />

            <hr className='m-0 mb-3'/>

            {/* content */}

            {
                props.farmDiaries.map((farmDiary, index) => <FarmDiaryCard key={'farmDiaryItem_'+index} {...farmDiary} onClick={goFarmDiaryPage.bind(this, farmDiary.diaryNo)}/>)
            }

            {
                props.farmDiaries.length < props.totalCount && <MoreButton onClick={props.onMoreClick}>({props.farmDiaries.length}/{props.totalCount})</MoreButton>
            }
            {
                props.farmDiaries.length <= 0 && <NoSearchResultBox>생산일지가 없습니다</NoSearchResultBox>
            }

        </Fragment>
    )
}
export default FarmDiaryContent