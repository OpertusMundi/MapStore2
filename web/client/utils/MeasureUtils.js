/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { isArray, head, isNaN } from 'lodash';

export const MeasureTypes = {
    LENGTH: 'length',
    AREA: 'area',
    POINT_COORDINATES: 'POINT_COORDINATES',
    HEIGHT_FROM_TERRAIN: 'HEIGHT_FROM_TERRAIN',
    POLYLINE_DISTANCE_3D: 'POLYLINE_DISTANCE_3D',
    AREA_3D: 'AREA_3D',
    SLOPE: 'SLOPE',
    ANGLE_3D: 'ANGLE_3D'
};

export const defaultUnitOfMeasure = {
    [MeasureTypes.LENGTH]: { unit: 'm', label: 'm', value: 'm' },
    [MeasureTypes.AREA]: { unit: 'sqm', label: 'm²', value: 'sqm' },
    [MeasureTypes.POLYLINE_DISTANCE_3D]: { unit: 'm', label: 'm', value: 'm' },
    [MeasureTypes.AREA_3D]: { unit: 'sqm', label: 'm²', value: 'sqm' },
    [MeasureTypes.POINT_COORDINATES]: { unit: 'm', label: 'm', value: 'm' },
    [MeasureTypes.HEIGHT_FROM_TERRAIN]: { unit: 'm', label: 'm', value: 'm' },
    [MeasureTypes.SLOPE]: { unit: 'deg', label: '°', value: 'deg' },
    [MeasureTypes.ANGLE_3D]: { unit: 'deg', label: '°', value: 'deg' }
};

export const measureIcons = {
    [MeasureTypes.POLYLINE_DISTANCE_3D]: 'polyline-3d',
    [MeasureTypes.AREA_3D]: 'polygon-3d',
    [MeasureTypes.POINT_COORDINATES]: 'point-coordinates',
    [MeasureTypes.HEIGHT_FROM_TERRAIN]: 'height-from-terrain',
    [MeasureTypes.ANGLE_3D]: 'angle',
    [MeasureTypes.SLOPE]: 'slope'
};

export const defaultUnitOfMeasureOptions = {
    [MeasureTypes.POLYLINE_DISTANCE_3D]: [
        { value: 'ft', label: 'ft' },
        { value: 'm', label: 'm' },
        { value: 'km', label: 'km' },
        { value: 'mi', label: 'mi' },
        { value: 'nm', label: 'nm' }
    ],
    [MeasureTypes.AREA_3D]: [
        { value: 'sqft', label: 'ft²' },
        { value: 'sqm', label: 'm²' },
        { value: 'sqkm', label: 'km²' },
        { value: 'sqmi', label: 'mi²' },
        { value: 'sqnm', label: 'nm²' }
    ],
    [MeasureTypes.HEIGHT_FROM_TERRAIN]: [
        { value: 'ft', label: 'ft' },
        { value: 'm', label: 'm' }
    ],
    [MeasureTypes.ANGLE_3D]: [
        { value: 'deg', label: '°' },
        { value: 'rad', label: 'rad' }
    ],
    [MeasureTypes.SLOPE]: [
        { value: 'deg', label: '°' },
        { value: 'percentage', label: '%' }
    ],
    [MeasureTypes.POINT_COORDINATES]: [
        { value: 'ft', label: 'ft' },
        { value: 'm', label: 'm' }
    ]
};

export const mapUomAreaToLength = {
    sqft: { value: 'ft', label: 'ft' },
    sqm: { value: 'm', label: 'm' },
    sqkm: { value: 'km', label: 'km' },
    sqmi: { value: 'mi', label: 'mi' },
    sqnm: { value: 'nm', label: 'nm' }
};

export function degToDms(deg) {
    // convert decimal deg to minutes and seconds
    var d = Math.floor(deg);
    var minfloat = (deg - d) * 60;
    var m = Math.floor(minfloat);
    var secfloat = (minfloat - m) * 60;
    var s = Math.floor(secfloat);

    return "" + d + "° " + m + "' " + s + "'' ";
}

export function getFormattedBearingValue(azimuth = 0, {measureTrueBearing = false, fractionDigits =  0} = {}) {
    let bearing = "";
    if (!measureTrueBearing) {
        if (azimuth >= 0 && azimuth < 90) {
            bearing = "N " + degToDms(azimuth) + "E";
        } else if (azimuth > 90 && azimuth <= 180) {
            bearing = "S " + degToDms(180.0 - azimuth) + "E";
        } else if (azimuth > 180 && azimuth < 270) {
            bearing = "S " + degToDms(azimuth - 180.0 ) + "W";
        } else if (azimuth >= 270 && azimuth <= 360) {
            bearing = "N " + degToDms(360 - azimuth ) + "W";
        }
    } else {
        let prefix = "";
        if (azimuth >= 0 && azimuth < 10) {
            prefix = "00";
        } else if (azimuth > 10 && azimuth < 100) {
            prefix = "0";
        }
        const adjValue = fractionDigits > 0  ? azimuth.toFixed(fractionDigits) : Math.floor(azimuth);
        bearing =  prefix + adjValue + "°";
    }

    return bearing;
}


export const CONVERSION_RATE = {
    // length
    "yd": {
        "ft": 3,
        "m": 0.9144,
        "km": 0.0009144,
        "yd": 1,
        "mi": 0.00056818181818,
        "nm": 0.00049373650107
    },
    "ft": {
        "ft": 1,
        "m": 0.3048,
        "km": 0.0003048,
        "yd": 0.33333333333334,
        "mi": 0.0001893932,
        "nm": 0.000164579
    },
    "m": {
        "ft": 3.28084,
        "m": 1,
        "km": 0.001,
        "yd": 1.0936132983377,
        "mi": 0.000621371,
        "nm": 0.000539956803
    },
    "km": {
        "ft": 3280.84,
        "m": 1000,
        "km": 1,
        "yd": 1093.6132983377,
        "mi": 0.62137121212121,
        "nm": 0.53995682073433948212
    },
    "mi": {
        "ft": 5280.0001689599821475,
        "m": 1609.3440514990027168,
        "km": 1.6093440514990027257,
        "yd": 1760,
        "mi": 1,
        "nm": 0.86897626970788488521
    },
    "nm": {
        "ft": 6076.1156799999789655,
        "m": 1852.0000592639937622,
        "km": 1.8520000592639938031,
        "yd": 2025.3718285214,
        "mi": 1.1507794848484809158,
        "nm": 1
    },
    "sqft": {
        "sqft": 1,
        "sqm": 0.09290304,
        "sqkm": 9.2903043596611E-8,
        "sqmi": 3.587E-8,
        "sqnm": 2.7051601137505E-8
    },
    "sqyd": {
        "sqft": 8.9999247491639,
        "sqm": 0.83612040133779,
        "sqkm": 8.3612040133779e-7,
        "sqyd": 1,
        "sqmi": 3.228278917579e-7,
        "sqnm": 2.4346237458194e-7
    },
    // area
    "sqm": {
        "sqft": 10.76391,
        "sqm": 1,
        "sqkm": 1.0E-6,
        "sqyd": 1.196,
        "sqmi": 3.8610215854245e-7,
        "sqnm": 2.91181e-7
    },
    "sqkm": {
        "sqft": 10763910,
        "sqm": 1.0E6,
        "sqkm": 1,
        "sqyd": 1196000,
        "sqmi": 0.38610215854245,
        "sqnm": 0.291181
    },
    "sqmi": {
        "sqft": 27878398.920726,
        "sqm": 2589988.110336,
        "sqkm": 2.589988110336,
        "sqyd": 27878398.920726,
        "sqmi": 1,
        "sqnm": 0.75415532795574
    },
    "sqnm": {
        "sqft": 36966388.603652,
        "sqm": 3434290.0120544,
        "sqkm": 3.4342900120544,
        "sqyd": 36966388.603652,
        "sqmi": 1.325986786715,
        "sqnm": 1
    }
};

const ANGLE_CONVERSIONS = {
    deg: {
        rad: value => value * Math.PI / 180,
        percentage: value => Math.round(Math.tan(value * Math.PI / 180) * 100)
    },
    rad: {
        deg: value => value * 180 / Math.PI,
        percentage: value => Math.round(Math.tan(value) * 100)
    },
    percentage: {
        deg: value => Math.atan(value / 100) * 180 / Math.PI,
        rad: value => Math.atan(value / 100)
    }
};

export function convertUom(value, source = "m", dest = "m") {

    if (ANGLE_CONVERSIONS[source] && ANGLE_CONVERSIONS[source][dest]) {
        return ANGLE_CONVERSIONS[source][dest](value);
    }

    if (!!CONVERSION_RATE[source] && !!CONVERSION_RATE[source][dest]) {
        return value * CONVERSION_RATE[source][dest];
    }
    return value;
}


export const validateCoord = c => (!isNaN(parseFloat(c[0])) && !isNaN(parseFloat(c[1])));

/**
 * validate a geometry feature,
 * if invalid return an empty one
*/
export const validateFeatureCoordinates = ({coordinates, type} = {}) => {
    let filteredCoords = coordinates;
    if (type === "LineString") {
        filteredCoords = coordinates.filter(validateCoord);
        if (filteredCoords.length < 2) {
            // if invalid return empty LineString
            return [];
        }
    } else if (type === "Polygon") {
        filteredCoords = head(coordinates).filter(validateCoord);
        if (filteredCoords.length < 3) {
            // if invalid return empty Polygon
            return [[]];
        }
        // close polygon
        filteredCoords = [filteredCoords.concat([head(filteredCoords)])];
    }
    return filteredCoords;
};

export const isValidGeometry = ({coordinates, type} = {}) => {
    if (!type || !coordinates || coordinates && isArray(coordinates) && coordinates.length === 0) {
        return false;
    }
    let validatedCoords = validateFeatureCoordinates({coordinates, type});
    validatedCoords = type === "Polygon" ? head(validatedCoords) : validatedCoords;
    return validatedCoords.length > 0;
};

