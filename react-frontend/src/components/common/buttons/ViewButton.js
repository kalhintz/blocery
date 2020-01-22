import React, { useState } from 'react'

/*
* 사용법 :
* 1. 사용할 아이콘 정의 : import { ViewModule, ViewStream, ViewModuleOutlined} from '@material-ui/icons'
* 2. 아이콘을 넣어서 컴포넌트 호출 : <ViewButton icons={[<ViewModule />, <ViewStream />]} onChange={onViewChange} />
* */

const ViewButton = ({icons, selectedIndex = 0, onChange}) => {
    const [index, setIndex] = useState(selectedIndex)
    function onClick(idx){
        //인덱스가 끝까지 도달하면 처음으로
        if(idx === icons.length -1){
            idx = 0
        }
        else{
            idx++
        }
        setIndex(idx)//렌더링

        onChange(idx)//부모에게 바뀐 아이콘 인덱스를 넘겨줍니다
    }
    return(
        icons.map((icon, idx) => idx === index && <span key={'viewButton_'+idx} onClick={onClick.bind(this, idx)}>{icon}</span>)
    )
}
export default ViewButton