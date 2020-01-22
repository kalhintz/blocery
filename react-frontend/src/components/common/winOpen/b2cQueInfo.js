import React, { Component, Fragment } from 'react'
import { ShopXButtonNav } from '~/components/common'
class b2cQueInfo extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <Fragment>
                <ShopXButtonNav close>입점문의</ShopXButtonNav>
                <iframe src={"https://docs.google.com/forms/d/e/1FAIpQLSfD3RtDIWFVfy1bu1z51R8NmvA9kyFlTFJpNH3PBMn8RQjA1Q/viewform"}
                        width={'100%'}
                        height="100vh"
                        frameborder="0"
                        marginheight="0" marginwidth="0"
                        style={{height:'100vh', border: '0', overflow: 'hidden'}}></iframe>
            </Fragment>
        )
    }
}
export default b2cQueInfo