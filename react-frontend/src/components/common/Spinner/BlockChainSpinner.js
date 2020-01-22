import React from 'react'
import Style from './BlockChainSpinner.module.scss'
import { ChainSpinner, BlocerySymbolGreen } from '../../common'
const BlockChainSpinner = (props) => {
    return(

        <div className={Style.wrap}>
            <div className={Style.modal}>
                <div>
                    <BlocerySymbolGreen style={{width: '30px', height: '30px'}}/>
                </div>
                <div className={'small'}><ChainSpinner/></div>
                <div className={'small'}>
                    {
                        props.children ? props.children : <b>블록체인에 기록 중이며, <br/>시간이 다소 소요됩니다!</b>
                    }
                </div>
            </div>
        </div>
    )
}
export default BlockChainSpinner