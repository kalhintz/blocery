import React, { Component, Fragment } from 'react'
import { B2bShopXButtonNav } from '~/components/common'
class b2bQueInfo extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <Fragment>
                <B2bShopXButtonNav close>입점문의</B2bShopXButtonNav>
                <iframe src={"https://docs.google.com/forms/d/e/1FAIpQLSfj7Qn5gZ2wgT-dok79MQ0yff3N1pAlUxe8ohuMcJy832kywA/viewform"}
                        width={'100%'}
                        height="100vh"
                        frameborder="0"
                        marginheight="0" marginwidth="0"
                        style={{height:'100vh', border: '0', overflow: 'hidden'}}></iframe>
            </Fragment>
        )
    }
}
export default b2bQueInfo