// tslint script.ts; tsc script.ts;

declare var generateCircle: any;
declare var keyInputs     : any;
declare var L             : any;
declare var lines         : any;
declare var stations      : any;
declare var visits        : any;

interface Row     { properties: any; // not much type safety here...
                  }

interface Splits  { take: Row[];
                    drop: Row[];
                  }

//
// variables
//
const tileUrl: string   = ( "https://b.basemaps.cartocdn.com/dark_all"
                          + "/{z}/{x}/{y}.jpg"
                          );
const tileOpts          = { opacity: 0.775
                          };
const origin : number[] = [  40.740
                          , -73.925
                          ];
const mapOpts           = { keyboard       : false
                          , scrollWheelZoom: false
                          };
const southWest         = [40.525, -74.20];
const northEast         = [40.975, -73.65];
const bounds            = L.latLngBounds(southWest, northEast);
const boundOpts         = { animate: false
                          };
const colorMap          = { 1: [  0, 80, 50]
                          , 2: [  0, 80, 50]
                          , 3: [  0, 80, 50]
                          , 4: [120, 60, 40]
                          , 5: [120, 60, 40]
                          , 6: [120, 60, 40]
                          , 7: [295, 55, 40]
                          , A: [240, 55, 40]
                          , C: [240, 55, 40]
                          , E: [240, 55, 40]
                          , B: [ 30, 80, 50]
                          , D: [ 30, 80, 50]
                          , F: [ 30, 80, 50]
                          , M: [ 30, 80, 50]
                          , G: [100, 80, 55]
                          , J: [ 35, 50, 40]
                          , Z: [ 35, 50, 40]
                          , L: [  0,  0, 35]
                          , N: [ 55, 90, 50]
                          , Q: [ 55, 90, 50]
                          , R: [ 55, 90, 50]
                          , W: [ 55, 90, 50]
                          , S: [  0,  0, 40]
                          };

//
// shared utility functions
//
const arrayToStr  = (array) => array.map((x) => x.toString());
const contains    = (mainString: string) => (subString: string): boolean => {
    return mainString.indexOf(subString) < 0 ? false
                                             : true;
};
const dashes      = (str: string): string => `-${str}-`;
const checkField  = (searchTerm: string, field: string) =>
                    (row: Row): boolean => {
    const column: string = row.properties[field];
    return contains(column)(dashes(searchTerm));
};
const unique      = (array) => {
    return (array.filter((v, i, a) => a.indexOf(v) === i));
};
const funIfLength = (array, f) => array.length > 0 ? f(array)
                                                       : null;
const smudge      = (colorVal) => {
    const  newVal = ((colorVal * 0.15) * (Math.random() - 0.5)) + colorVal;
    return newVal < 0 ? "0"
                      : newVal.toFixed(4).toString();
};
const arrayToHsl  = ([h, s, l]) => `hsl(${h}, ${s}%, ${l}%)`;
const randBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};
const randomHsl   = () => {
    const h = randBetween( 0, 359);
    const s = randBetween(50, 100);
    const l = randBetween(40,  80);

    return arrayToHsl(arrayToStr([h, s, l]));
};

//
// station search pattern
//
const search = (featureArray: Row[], searchTerm: string): Row[] => {
    return featureArray.filter(checkField(searchTerm, "line"));
};

//
// lines search pattern
//
const splitSearch = (featureArray: Row[], searchTerm: string): Splits => {
    const take = [] as Row[];
    const drop = [] as Row[];
    for (const row of featureArray) {
        checkField(searchTerm, "name")(row) ? take.push(row)
                                            : drop.push(row);
    }
    return {take, drop};
};

//
// geojson loader (and stylist)
//
const mapInput = (mapVar, linesInput, stationsInput, layerInput, keyInput) => {
    const rowToPopup = (layer) => layer.feature.properties.name;

    const loadData = (style, toolBool) => (dataVar) => {
        const mapData  = L.geoJson(dataVar, style);
        const newLayer = mapData.addTo(mapVar);

        _ = toolBool ? mapData.bindTooltip(rowToPopup)
                     : null;

        return newLayer;
    };

    const dataToMap = (dataVar, styleInput, toolBool) => {
        return funIfLength(dataVar, loadData(styleInput, toolBool));
    };

    const markerToCircle = () => {
        const pointToCircle = (geoJsonPoint, latlng) => L.circleMarker(latlng);

        return { pointToLayer: pointToCircle
               , style       : styleCircle()
               };
    };

    const styleCircle = () => (geoJsonFeature) => {
        return { radius     : 10
               , fillColor  : randomHsl()
               , fillOpacity: 0.5
               , stroke     : false
               };
    };

    const styleLine = (color) => {
        return { style  : {color}
               , weight : 6
               };
    };

    const linesOutput    = splitSearch(linesInput.drop, keyInput);
    const stationsOutput = search(stationsInput       , keyInput);

    let _ = layerInput !== null ? layerInput.clearLayers()
                                : null;

    const lineColor = arrayToHsl(colorMap[keyInput].map(smudge));

    _                 = dataToMap(linesOutput.take, styleLine(lineColor), false);
    const newStations = dataToMap(stationsOutput  , markerToCircle()    , true);

    //
    // check if the machine is working correctly...
    //
    // const checkOutput = ([rows, column]) => {
    //     console.log(unique(rows.map((row) => row.properties[column])));
    //     console.log(rows.length);
    // };
    // [ [linesOutput.take, "name"] as any
    // , [stationsOutput  , "line"] as any
    // ].forEach(checkOutput);

    return [linesOutput, stationsOutput, newStations];
};

//
// side effects! ...this makes things much easier
//
const checkStop  = (selection) => {
    const _ = visits.includes(selection) ? null
                                         : selectStop(selection);
};
const selectStop = (selection) => {
    visits.push(selection);
    generateCircle( "mtaIcons"
                  , 17
                  , arrayToHsl(colorMap[selection])
                  , selection
                  , 25
                  )();
    [lines, stations, stationsLayer] = mapInput( map
                                               , lines
                                               , stations
                                               , stationsLayer
                                               , selection
                                               );
};

//
// main
//
const refresh     = ()          => location.reload();
const checkKey    = (keyStroke) => {
    return contains(Object.keys(keysToStops).join(", "))(keyStroke.toString());
};
const initLines   = (linesObj)  => ({take: [], drop: linesObj});
const allStops    = arrayToStr(Object.keys(colorMap));
const keysToStops = allStops.reduce(
    (obj, stop) => {
        obj[keyInputs[stop.toLowerCase()]] = stop;
        return obj;
    }, {}
);

visits = [];
const map = L.map("map", mapOpts).setView(origin, 11);
L.tileLayer(tileUrl, tileOpts).addTo(map);

map.setMaxBounds(bounds);
map.on("drag", () => map.panInsideBounds(bounds, boundOpts));

lines    = initLines(lines.features);
stations = stations.features;

let stationsLayer = null;

window.onkeydown = (e) => {
    return e.keyCode
        ? checkKey(e.keyCode)
            ? checkStop(keysToStops[e.keyCode])
            : e.keyCode === 27 ? refresh()
                               : e.keyCode === 89 ? map.setView(origin, 11)
                                                  : null
        : null;
};

//
// demo
//
// ["G", "R", "F"].forEach(selectStop);
