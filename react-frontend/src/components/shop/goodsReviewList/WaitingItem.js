import React from 'react'
import ComUtil from '../../../util/ComUtil'
import { StarButton } from '../../../components/common'
const WaitingItem = (props) => {
    const {goodsNm, imgUrl, consumerOkDate, onClick} = props
    return(
        <div style={{boxShadow: '1px 1px 2px gray'}} className='d-flex mb-2 p-3 bg-white'>
            <div className='mr-3'>
                <img style={{borderRadius: '100%', width: 50, height: 50, objectFit: 'cover'}} src={imgUrl} />
            </div>
            <div className='flex-grow-1'>
                <div className='font-weight-border'>{goodsNm}</div>
                <div className='text-secondary small'>
                    {
                        consumerOkDate && ComUtil.utcToString(consumerOkDate)
                    }
                    {consumerOkDate ? ' 구매확정' : ' 배송중'}</div>
                <div className='d-flex justify-content-between text-center m-2'>
                    {
                        [2,4,6,8,10].map( score  => <StarButton key={'star'+score} score={score} onClick={onClick.bind(this, props, score)}/>)
                    }
                </div>
            </div>
        </div>
    )
}
export default WaitingItem