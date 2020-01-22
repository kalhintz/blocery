import React from 'react'
const EventPopup = () => {
    const setNoPupup = (e) => {
        e.target.checked ? localStorage.setItem('eventNewPopup', e.target.checked) : localStorage.removeItem('eventNewPopup')
    }
    return (
        <div style={{fontSize:'0.85rem'}}>
            <b className='text-primary'>프리미엄 채소 에어드랍 이벤트가 많은 분들의 관심속에 성황리에 조기 마감 되었습니다.</b><br/>
            참여해 주신 모든 분들께 감사의 말씀 드리며<br/>상품은 <b className='text-primary'>6/17, 6/20, 6/25일</b> 순차 발송 될 예정입니다.<br/>
            <small>(추첨 상품은 6월말 ~ 7월초 사이 발송 예정)</small><br/>
            배송관련 문의는 info@blocery.io 로 문의 주세요.<br/><br/>
            <span className="text-danger">제품 수령 및 리뷰 이벤트는 6월말 까지 계속 됩니다.</span><small>(카카오톡 블로서리 오픈채팅방 참조)</small><br/>
            블로서리는 베타 서비스에서 다시 찾아 뵙겠습니다.<br/>
            감사합니다.<br/><br/>
            <label>
                <input
                    name="isGoing"
                    type="checkbox"
                    // checked={this.state.isGoing}
                    onChange={setNoPupup}
                />
                {' '}지금부터 이창을 보지않음
            </label>
        </div>
    )
}

export default EventPopup