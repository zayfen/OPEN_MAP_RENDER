/**
 * Converts coordinates from a map file to coordinates used in Konva.
 * @param {number[] | { x: number, y: number, z?: number }} originVec - Original coordinates representing a position in the physical world (unit: meters)
 * @param {number} resolution - The physical world size represented by the map image (unit: meters) / pixel size of the map image
 * @returns {number[] | { x: number, y: number, z?: number }} - Converted coordinates representing a position in the Konva (unit: pixels)
 */
export function toKonvaVector(originVec, resolution) {
  if (Array.isArray(originVec)) {
    const konvaVec = originVec.map((v) => v / resolution);
    // for [x,y,z] vector, z(radian) is the orientation of the element and does not need to be converted using resolution.
    if (originVec.length === 3) {
      konvaVec[2] = Math.PI * 0.5 - originVec[2];    
    }

    // [x,y,z] => [x, -y, z]; [x1,y1,x2,y2,...] => [x1,-y1,x2,-y2,...]
    konvaVec.forEach((v, index) => {
      if (index % 2 === 1) {
        konvaVec[index] = -1 * v;
      }
    });
    return konvaVec;
  }
  
  const konvaVec =  {
    x: originVec.x / resolution,
    y: -1 * originVec.y / resolution,
  };

  if (Object.hasOwnProperty.call(originVec, "z")) {
    // z(radian) represents the orientation of the element and does not need to be converted using resolution.
    konvaVec.z = Math.PI * 0.5 - originVec.z;
  }
  
  return konvaVec;
}

/**
 * Converts the coordinate data of a map image.
 * @param {{ origin: {x: number, y: number }, width: number, height: number }} - mapImageMeta - The metadata of the map image
 * @param { number } resolution - The physical world size represented by the map image (unit: meters) / pixel size of the map image
 * @returns {{ x: number, y: number, width: number, height: number, translate: { x: number, y: number }}}
 */
export function convertMapImageKonva(mapImageMeta, resolution) {
  const { origin, width: imagePxWidth, height: imagePxHeight } = mapImageMeta; 
  const imageVec = toKonvaVector(origin, resolution);
  imageVec[1] = imageVec[1] - imagePxHeight;
  
  const topLeftMapImage = {
    x: 0 - imageVec[0],
    y: 0 - imageVec[1],
  };

  return {
    x: imageVec[0],
    y: imageVec[1],
    width: imagePxWidth,
    height: imagePxHeight,
    translate: {
      x: topLeftMapImage.x,
      y: topLeftMapImage.y,
    }
  }
}

