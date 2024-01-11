import * as Cesium from "cesium";

export function createModel(url, height, viewer) {
  viewer.entities.removeAll();

  const position = Cesium.Cartesian3.fromDegrees(108.93593, 35.40894, height);
  const heading = Cesium.Math.toRadians(135);
  const pitch = 0;
  const roll = 0;
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );

  const entity = viewer.entities.add({
    name: url,
    position: position,
    orientation: orientation,
    model: {
      uri: url,
      minimumPixelSize: 128,
      maximumScale: 1,
    },
  });
  // viewer.trackedEntity = entity;
  // setTimeout(() => (viewer.camera.zoomDistance = 400000), 1000);
}
