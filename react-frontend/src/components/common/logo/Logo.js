import React from 'react'
import PropTypes from 'prop-types'
import LogoGreen from '../../../../src/images/logo/Blocery_logo_green.png'
import LogoWhite from '../../../../src/images/logo/Blocery_logo_white.png'
import LogoBlack from '../../../../src/images/logo/Blocery_logo_black.png'
import LogoGreenVertical from '../../../../src/images/logo/Blocery_logo_green_vertical.png'
import SymbolGreen from '../../../../src/images/logo/Blocery_symbol_green.png'
import MarketBlyLogoWhiteImage from '~/images/logo/MarketBly_logo_white.png'
import NiceFoodLogoWhiteImage from '~/images/logo/NiceFood_logo_white.png'
import MarketBlyLogoColorRectangleImage from '~/images/logo/MarketBly_Logo_Color_Rectangle.jpeg'
import NiceFoodLogoColorRectangleImage from '~/images/logo/NiceFood_Logo_Color_Rectangle.jpeg'

const BloceryLogoGreen = (props) => <img src={LogoGreen} className={props.className || null} style={props.style} />
const BloceryLogoWhite = (props) => <img src={LogoWhite} className={props.className || null} style={props.style} />
const BloceryLogoBlack = (props) => <img src={LogoBlack} className={props.className || null} style={props.style} />
const BloceryLogoGreenVertical = (props) => <img src={LogoGreenVertical} className={props.className || null} style={props.style} />
const BlocerySymbolGreen = (props) => <img src={SymbolGreen} className={props.className || null} style={props.style} />
const MarketBlyLogoWhite = (props) => <img src={MarketBlyLogoWhiteImage} className={props.className || null} style={props.style} />
const NiceFoodLogoWhite = (props) => <img src={NiceFoodLogoWhiteImage} className={props.className || null} style={props.style} />
const MarketBlyLogoColorRectangle = (props) => <img src={MarketBlyLogoColorRectangleImage} className={props.className || null} style={props.style} />
const NiceFoodLogoColorRectangle = (props) => <img src={NiceFoodLogoColorRectangleImage} className={props.className || null} style={props.style} />

BloceryLogoGreen.propTypes = {
    style: PropTypes.object
}
BloceryLogoGreen.defaultProps = {
    style: {width: '100px', height: '100%'}
}
BloceryLogoWhite.propTypes = {
    style: PropTypes.object
}
BloceryLogoWhite.defaultProps = {
    style: {width: '100px', height: '100%'}
}
BloceryLogoBlack.propTypes = {
    style: PropTypes.object
}
BloceryLogoBlack.defaultProps = {
    style: {width: '100px', height: '100%'}
}
BloceryLogoGreenVertical.propTypes = {
    style: PropTypes.object
}
BloceryLogoGreenVertical.defaultProps = {
    style: {width: '100px', height: '100%'}
}
BlocerySymbolGreen.propTypes = {
    style: PropTypes.object
}
BlocerySymbolGreen.defaultProps = {
    style: {width: '100px', height: '100%'}
}
MarketBlyLogoWhite.defaultProps = {
    style: {width: '100px', height: '100%'}
}
NiceFoodLogoWhite.defaultProps = {
    style: {width: '100px', height: '100%'}
}
MarketBlyLogoColorRectangle.defaultProps = {
    style: {width: '100px', height: '100%'}
}
NiceFoodLogoColorRectangle.defaultProps = {
    style: {width: '100px', height: '100%'}
}
export {
    BloceryLogoGreen,
    BloceryLogoWhite,
    BloceryLogoBlack,
    BloceryLogoGreenVertical,
    BlocerySymbolGreen,
    MarketBlyLogoWhite,
    NiceFoodLogoWhite,
    MarketBlyLogoColorRectangle,
    NiceFoodLogoColorRectangle
}