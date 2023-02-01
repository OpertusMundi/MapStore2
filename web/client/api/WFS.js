/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';
import urlUtil from 'url';
import assign from 'object-assign';
import { getToken } from '../utils/SecurityUtils';


export const toDescribeURL = (url, typeName) => {
    console.log('to describe url');
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(
        {
            ...parsed,
            search: undefined, // this allows to merge parameters correctly
            query: {
                ...parsed.query,

                service: "WFS",
                version: "2.0.0",
                typeNames: typeName,
                outputFormat: 'application/json',
                request: "DescribeFeatureType"
            }
        });
};
/**
 * Simple getFeature using http GET method with json format
 */
export const getFeatureSimple = function(baseUrl, params) {
    return axios.get(baseUrl + '?service=WFS&version=1.1.0&request=GetFeature', {
        params: assign({
            outputFormat: "application/json"
        }, params)
    }).then((response) => {
        if (typeof response.data !== 'object') {
            return JSON.parse(response.data);
        }
        return response.data;
    });
};

export const getCapabilitiesURL = (url, {version = "1.1.0"} = {}) => {
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(assign({}, parsed, {
        query: assign({
            service: "WFS",
            version,
            request: "GetCapabilities"
        }, parsed.query)
    }));
};

export const getFeatureURL = (url, typeName, { version = "1.1.0", ...params } = {}) => {
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(assign({}, parsed, {
        query: assign({
            service: "WFS",
            typeName,
            version,
            request: "GetFeature",
            ...params
        }, parsed.query)
    }));
};

export const getFeature = (url, typeName, params, config) => {
    const token = getToken();
    const newConfig = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        withCredentials: false,
    }; 
    return axios.get(getFeatureURL(url, typeName, params), newConfig);
};

export const getCapabilities = function(url) {
    
    return axios.get(getCapabilitiesURL(url));
};
/**
 * @deprecated
 */
export const describeFeatureTypeOGCSchemas = function(url, typeName) {
    const parsed = urlUtil.parse(url, true);
    const describeLayerUrl = urlUtil.format(assign({}, parsed, {
        query: assign({
            service: "WFS",
            version: "1.1.0",
            typeName: typeName,
            request: "DescribeFeatureType"
        }, parsed.query)
    }));
    return new Promise((resolve) => {
        require.ensure(['../utils/ogc/WFS'], () => {
            const {unmarshaller} = require('../utils/ogc/WFS');
            resolve(axios.get(describeLayerUrl).then((response) => {
                let json = unmarshaller.unmarshalString(response.data);
                return json && json.value;

            }));
        });
    });
};

export const describeFeatureType = function(url, typeName) {
    const token = getToken();
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        withCredentials: false,
    }; 
    return axios.get(toDescribeURL(url, typeName), config).then(({data}) => data);
};

