import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { B2bShopXButtonNav } from '~/components/common/index'
import { B2bTermsOfUse } from '~/components/common/termsOfUses'

export default class TermsOfUse extends Component {
    constructor(props) {
        super(props)

    }
    componentDidMount(){
        window.scrollTo(0,0)
    }
    render() {
        return (
            <Fragment>
                <B2bShopXButtonNav history={this.props.history} historyBack fixed>이용약관</B2bShopXButtonNav>
                <Container>
                    <Row>
                        <Col className={'p-2'}>
                            <B2bTermsOfUse/>
                        </Col>
                    </Row>
                </Container>

            </Fragment>
        )
    }

}