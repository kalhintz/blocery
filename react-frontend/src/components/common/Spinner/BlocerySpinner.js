import React from 'react'
import Style from './BlocerySpinner.module.scss'
import MarketBlySpinner from '~/images/icons/marketbly_spinner.gif'

const BlocerySpinner = () => {
    return(

        <div className={Style.wrap}>
            <div className={Style.modal}>
                <div>
                    <img src = {MarketBlySpinner} style={{width:'100%', height:'100%'}}/>
                </div>
                {/*<div className={'small'}><Spinner/></div>*/}
            </div>
        </div>
    )
}
export default BlocerySpinner