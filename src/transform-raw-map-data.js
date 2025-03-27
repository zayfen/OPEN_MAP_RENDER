/**
 * Convert raw map image data to Konva format
 */

import { toKonvaVector, convertMapImageKonva } from "./coodinate-transformation";

export function transformRawMapData(rawMapData) {
  const { 
    element_list: elementList, 
    zone_list: zoneList, 
    map_name: mapName, 
    url: mapImageUrl, 
    resolution, 
    origin: mapImageOrigin, 
    width: mapImageWidth, 
    height: mapImageHeight
  } = rawMapData;

  elementList.forEach((element) => {
    element.vector_list = toKonvaVector(element.vector_list, resolution);
    element.clean_path_list = element.clean_path_list.map(path => toKonvaVector(path, resolution));
  });

  zoneList.forEach((zone) => {
    zone.zone_node_list = zone.zone_node_list.map((node) => {
      node.vector_list = toKonvaVector(node.vector_list, resolution);
      return node;
    });
  })
  const mapImageMeta = convertMapImageKonva({ origin: mapImageOrigin, width: mapImageWidth, height: mapImageHeight }, resolution);
  return {
    mapName,
    mapImage: {
      url: mapImageUrl,
      ...mapImageMeta,
    },
    elementList,
    zoneList,
  }
}