/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import {compose, withProps} from 'recompose';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { getDefaultAggregationOperations } from '../../../../../utils/WidgetsUtils';
import {find} from 'lodash';

const propsToOptions = props => props.filter(({type} = {}) => type.indexOf("gml:") !== 0)
    .map( ({name} = {}) => ({label: name, value: name}));

/** custom color-coded charts currently support string and number types only */
const propsToTypedOptions = props => props.filter(({type} = {}) => type.indexOf("gml:") !== 0)
    .map(({name, localType} = {}) => ({ label: name, value: name, type: localType }))
    .filter(item => item.type === 'string' || item.type === 'number');

const getAllowedAggregationOptions = (propertyName, featureTypeProperties = []) => {
    const prop = find(featureTypeProperties, {name: propertyName});
    if (prop && (prop.localType === 'number' || prop.localType === 'int')) {
        return getDefaultAggregationOperations();
    }
    return [{ value: "Count", label: "widgets.operations.COUNT"}];
};

export default compose(
    withProps(({featureTypeProperties = [], data = {}} = {}) => ({
        options: propsToOptions(featureTypeProperties),
        typedOptions: propsToTypedOptions(featureTypeProperties),
        aggregationOptions:
            (data?.widgetType !== "counter" ? [{ value: "None", label: "widgets.operations.NONE" }] : [])
                .concat(getAllowedAggregationOptions(data.options && data.options.aggregationAttribute, featureTypeProperties))
    })),
    localizedProps("aggregationOptions")

);
