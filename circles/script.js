/* jshint esversion: 6 */
/* jshint -W014        */

var arrayToString = (array) => array.map((item) => item.toString());

var createSvg = (containerId) => (svgShape) => (attributes, text="") => {
    var newSvg = document.createElementNS( "http://www.w3.org/2000/svg"
                                         , svgShape
                                         );
    attributes.forEach(([prop, value]) => newSvg.setAttribute(prop, value));
    newSvg.innerHTML = text;

    document.getElementById(containerId).appendChild(newSvg);
};

var createCircle = (containerId) => (x, y) => (r, color) => (id) => {

    var circleAttributes = [ ["id"  , id   ]
                           , ["cx"  , x    ]
                           , ["cy"  , y    ]
                           , ["r"   , r    ]
                           , ["fill", color]
                           ];

    createSvg(containerId)("circle")(circleAttributes);
};
var createText = (containerId) => (x, y) => (text, color, size) => (id) => {

    var textAttributes = [ ["id"                , id         ]
                         , ["x"                 , x          ]
                         , ["y"                 , y          ]
                         , ["fill"              , color      ]
                         , ["font-size"         , `${size}px`]
                         , ["text-anchor"       , "middle"   ]
                         , ["alignment-baseline", "middle"   ]
                         ];

    createSvg(containerId)("text")(textAttributes, text);
};

var changeColor = (color) => (id) => () => {
    document.getElementById(id).style.color = color;
};

var createPair = (containerId) => (r, circleColor) =>
                 (text, textColor, textSize) => (x, y) => (id) => {
    createCircle(containerId)(x, y)(r, circleColor)(id + "circle");
    createText(containerId)(x, y + 2)(text, textColor, textSize)(id + "text");
};

var x = 0;
var generateCircle = (containerId, r, circleColor, text, textSize) => () => {
    var textColor = ["N", "Q", "R", "W"].includes(text) ? "hsl(0, 0%,   0%)"
                                                        : "hsl(0, 0%, 100%)";
    var y = 40;
    createPair(containerId)(r, circleColor)
              (text, textColor, textSize)(x, y)("");
    x += 40;
};

//
// main
//
// var containerId = "circles"
// var r           = 20
// var circleColor = "hsl(55, 90%, 50%)"
// var text        = "N"
// var textSize    = 30
// document.addEventListener("click", generateCircle( containerId
//                                                  , r
//                                                  , circleColor
//                                                  , text
//                                                  , textSize
//                                                  )
//                          );
