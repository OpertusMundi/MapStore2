/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import isEqual from 'lodash/isEqual';
import {
    getStyle,
    layerToGeoStylerStyle,
    flattenFeatures,
    applyDefaultStyleToLayer
} from '../../../../utils/VectorStyleUtils';

const createLayer = (options, map) => {

    let dataSource = new Cesium.GeoJsonDataSource();

    const features = flattenFeatures(options?.features || [], ({ style, ...feature }) => feature);
    const collection = {
        type: 'FeatureCollection',
        features
    };

    if (options.visibility) {
        dataSource.load(collection, {
            // ensure default style is not applied
            stroke: new Cesium.Color(0, 0, 0, 0),
            fill: new Cesium.Color(0, 0, 0, 0),
            markerColor: new Cesium.Color(0, 0, 0, 0),
            strokeWidth: 0,
            markerSize: 0
        }).then(() => {
            map.dataSources.add(dataSource);
            layerToGeoStylerStyle(options)
                .then((style) => {
                    getStyle(applyDefaultStyleToLayer({ ...options, style }), 'cesium')
                        .then((styleFunc) => {
                            if (styleFunc) {
                                styleFunc({
                                    entities: dataSource?.entities?.values,
                                    map,
                                    opacity: options.opacity ?? 1
                                });
                                map.scene.requestRender();
                            }
                        });
                });
        });
    }

    dataSource.show = !!options.visibility;

    return {
        detached: true,
        dataSource,
        remove: () => {
            if (dataSource && map) {
                map.dataSources.remove(dataSource);
                dataSource = undefined;
            }
        },
        setVisible: () => {}
    };
};

Layers.registerType('vector', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (!isEqual(newOptions.features, oldOptions.features)
        || newOptions.visibility !== oldOptions.visibility) {
            return createLayer(newOptions, map);
        }

        if (layer?.dataSource?.entities?.values
            && (
                !isEqual(newOptions.style, oldOptions.style)
                || newOptions.opacity !== oldOptions.opacity
            )
        ) {
            layerToGeoStylerStyle(newOptions)
                .then((style) => {
                    getStyle(applyDefaultStyleToLayer({ ...newOptions, style }), 'cesium')
                        .then((styleFunc) => {
                            if (styleFunc) {
                                styleFunc({
                                    entities: layer.dataSource.entities.values,
                                    map,
                                    opacity: newOptions.opacity ?? 1
                                });
                                map.scene.requestRender();
                            }
                        });
                });
        }
        return null;
    }
});
