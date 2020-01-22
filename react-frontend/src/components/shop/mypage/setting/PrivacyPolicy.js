import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { ShopXButtonNav } from '~/components/common/index'
import { Webview } from "~/lib/webviewApi";
import { B2cPrivatePolicy } from '~/components/common/termsOfUses'

export default class PrivacyPolicy extends Component {
    constructor(props) {
        super(props)

    }

    componentDidMount(){
        window.scrollTo(0,0)
    }

    render() {
        return (
            <Fragment>
                <ShopXButtonNav history={this.props.history} historyBack fixed>개인정보 취급 방침</ShopXButtonNav>
                <Container>
                    <Row>
                        <Col className={'p-2'}>
                            <B2cPrivatePolicy/>
                        </Col>
                    </Row>
                </Container>
            </Fragment>
        )


    }

}