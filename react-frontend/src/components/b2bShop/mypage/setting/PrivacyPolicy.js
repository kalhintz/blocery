import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { B2bShopXButtonNav } from '~/components/common/index'
import { B2bPrivatePolicy } from '~/components/common/termsOfUses'

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
                <B2bShopXButtonNav history={this.props.history} historyBack fixed>개인정보 취급 방침</B2bShopXButtonNav>
                <Container>
                    <Row>
                        <Col className={'p-2'}>
                            <B2bPrivatePolicy/>
                        </Col>
                    </Row>
                </Container>
            </Fragment>
        )


    }

}