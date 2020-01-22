import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { ShopXButtonNav } from '~/components/common/index'
import { B2cTermsOfUse } from '~/components/common/termsOfUses'

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
                <ShopXButtonNav history={this.props.history} historyBack fixed>이용약관</ShopXButtonNav>
                <Container>
                    <Row>
                        <Col className={'p-2'}>
                            <B2cTermsOfUse/>
                        </Col>
                    </Row>
                </Container>

            </Fragment>
        )
    }

}