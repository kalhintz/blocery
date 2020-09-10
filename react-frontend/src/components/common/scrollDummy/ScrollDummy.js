import React from 'react'
const ScrollDummy = React.forwardRef((props, ref) => (<div ref={ref} className="FancyButton" style={{ float:"left", clear: "both" }}></div>));

const scrollIntoView = (refElement) => refElement.scrollIntoView({ behavior: "smooth" });

export {
    ScrollDummy,
    scrollIntoView
}
