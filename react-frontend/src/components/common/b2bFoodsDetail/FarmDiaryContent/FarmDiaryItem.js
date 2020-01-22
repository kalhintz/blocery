import React, { Fragment } from 'react'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import { Webview } from '~/lib/webviewApi'

const FarmDiaryItem = ({cultivationStepMemo, diaryContent, diaryImages, diaryRegDate, itemName, itemKindName, diaryNo}) => {

    let src = null;
    if(diaryImages && diaryImages.length > 0)
        src =  Server.getThumbnailURL() + diaryImages[0].imageUrl

    const goFarmDiaryPage = () => {
        Webview.openPopup('/producersFarmDiary?diaryNo=' + diaryNo, true);
    };

    return(
        <Fragment>
            <hr className='m-0'/>
            <div className='p-3 mb-1' onClick={goFarmDiaryPage.bind(this)}>
                <div className='text-secondary f7'>[{itemName} > {itemKindName}] {ComUtil.utcToString(diaryRegDate)}</div>
                <div className='font-weight-light f6'>{cultivationStepMemo}</div>
                <div className='d-flex'>
                    <div><img style={{minWidth: 80, maxWidth: 100}} src={src} /></div>
                    <div className='flex-grow-1 f6 text-dark pl-1'>
                        {diaryContent}
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
export default FarmDiaryItem