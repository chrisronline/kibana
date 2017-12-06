// import {
//   getProperty,
// } from '../../../../server/mappings';

export const verifyTypeIsKeyword = {
  id: 'verify_type_is_keyword',

  async verify(/*context*/) {
    // const {
    //   currentMappingsDsl
    // } = context;

    const type = null;//getProperty(currentMappingsDsl, 'type');
    if (!type || type.type !== 'keyword') {
      throw 'Unable to start Kibana. The .kibana index needs to be updated. Please run `node scripts/update_kibana_index`.';
    }
  },

  async changeMappings(context) {
    const {
      newMappingsDsl,
      rootEsType,
    } = context;

    newMappingsDsl[rootEsType].properties.type.type = 'keyword';
    return newMappingsDsl;
  }
};
