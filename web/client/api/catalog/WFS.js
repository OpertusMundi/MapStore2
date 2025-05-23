/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { cleanAuthParamsFromURL } from '../../utils/SecurityUtils';
import ConfigUtils from '../../utils/ConfigUtils';
import { getRecordLinks, extractOGCServicesReferences } from '../../utils/CatalogUtils';

import { getCapabilities, getCapabilitiesURL } from '../WFS';
import xml2js from 'xml2js';
import {
    validate as commonValidate,
    testService as commonTestService,
    preprocess as commonPreprocess
} from './common';

import { get, castArray } from 'lodash';

const capabilitiesCache = {};


export const searchAndPaginate = (json = {}, startPosition, maxRecords, text) => {

    const layers = castArray(get(json, '["wfs:WFS_Capabilities"].FeatureTypeList.FeatureType', []));
    
    const filteredLayers = layers
        .map((featureType) => {
            const {
                Name: name,
                Title: title,
                Abstract: description,
                DefaultSRS: srs,
                OtherSRS: OtherSRS = []
            } = featureType;
            // TODO: get operations to identify real URLs from capabilities.
            const boundingBox = featureType["ows:WGS84BoundingBox"];
            const sw = boundingBox["ows:LowerCorner"].split(" ");
            const ne = boundingBox["ows:UpperCorner"].split(" ");
            const bounds = {
                minx: parseFloat(sw[0]),
                miny: parseFloat(sw[1]),
                maxx: parseFloat(ne[0]),
                maxy: parseFloat(ne[1])
            };
            return {
                featureType,
                type: "wfs",
                url: cleanAuthParamsFromURL(json.url), // Service URL
                name,
                title,
                description,
                SRS: [srs, ...OtherSRS],
                defaultSRS: srs,
                boundingBox: {
                    bounds,
                    crs: "EPSG:4326"
                }
            };
        })
        .filter(({ title = "", name = "", description } = {}) => !text
            || title.toLowerCase().indexOf(text.toLowerCase()) !== -1
            || name.toLowerCase().indexOf(text.toLowerCase()) !== -1
            || description.toLowerCase().indexOf(text.toLowerCase()) !== -1
        );
    const records = filteredLayers
        .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, records.length),
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        records
    };
};

const recordToLayer = (record) => {
    const DEFAULT_VECTOR_STYLE = {
        "weight": 1,
        "color": "rgba(0, 0, 255, 1)",
        "opacity": 1,
        "fillColor": "rgba(0, 0, 255, 0.1)",
        "fillOpacity": 0.1,
        radius: 10
    };
    return {
        type: record.type || "wfs",
        search: {
            url: record.url,
            type: "wfs"
        },
        url: record.url,
        queryable: record.queryable,
        visibility: true,
        name: record.name,
        title: record.title || record.name,
        description: record.description || "",
        bbox: record.boundingBox,
        links: getRecordLinks(record),
        style: DEFAULT_VECTOR_STYLE,
        ...record.layerOptions
    };
};

export const getRecords = (url, startPosition, maxRecords, text, info) => {
    const cached = capabilitiesCache[url];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text, info));
        });
    }
    return getCapabilities(url).then((response) => {
        let json;
        xml2js.parseString(response.data, { explicitArray: false, stripPrefix: true }, (ignore, result) => {
            json = { ...result, url };
        });
        capabilitiesCache[url] = {
            timestamp: new Date().getTime(),
            data: json
        };
        return searchAndPaginate(json, startPosition, maxRecords, text, info);
    });
};

export const preprocess = commonPreprocess;
export const validate = commonValidate;
export const testService = commonTestService({ parseUrl: getCapabilitiesURL });
export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);
export const getCatalogRecords = ({records} = {}) => {
    if (records) {
        return records.map(record => {
            const references = [{
                type: "OGC:WFS-1.1.0-http-get-capabilities",
                url: record.url
            },
            {
                type: "OGC:WFS-1.1.0-http-get-feature",
                url: record.url
            }];
            const { wfs: ogcReferences } = extractOGCServicesReferences({ references });
            return {
                ...record,
                serviceType: 'wfs',
                isValid: !!ogcReferences,
                references,
                ogcReferences
            };
        });
    }
    return null;
};

export const getLayerFromRecord = (record, options, asPromise) => {
    const layer = recordToLayer(record, options);
    return asPromise ? Promise.resolve(layer) : layer;
};
