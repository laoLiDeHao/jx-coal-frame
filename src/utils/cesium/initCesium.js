import {
  Cartesian3,
  createOsmBuildingsAsync,
  Ion,
  Math as CesiumMath,
  Terrain,
  Viewer,
  GeoJsonDataSource,
  Color,
  SceneMode,
  EllipsoidTerrainProvider,
  createWorldTerrainAsync,
  TerrainProvider,
  CesiumTerrainProvider,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  PinBuilder,
  VerticalOrigin,
  defined,
  SceneTransforms,
  HorizontalOrigin,
  Cartesian2,
} from "cesium";
import onlineJson from "./onlineJson";
import { createModel } from "./tools/models";
import localJson from "./localJson";
import mapCof from "./mapCof";
import { drawLabelWithLogo } from "./tools/htmlTools";
import CompanyLabel from "./htmlLabel/companyLabel";
import GeojsonController from "./GeojsonController";
import { gcj02towgs84 } from "./CoordinateConvert/gcj02towgs84";
import CesiumThreeController from "./CesiumThreeController";
import { jxGeo } from "./datacache/geojson";
const maincitys = ["黄陵县", "蒲城县", "延安市", "西安市"];

export default class CesiumController {
  instance = null;
  viewer = null;
  threeContainer = null;
  constructor(id) {
    window.CESIUM_BASE_URL = "/Cesium";
    this.init(id);
    window.CCR = this;
  }

  init = async (containerId) => {
    Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMzE4NzVhMC04ZmFiLTRlOGMtYTg3Yy02Y2I0ZWQ4MTE4ZGMiLCJpZCI6MTA0MDM2LCJpYXQiOjE2NTk5NjEwNzB9.k83zE1JsnFnsSeGpzA9yX-SOqRY0Ot9Js3I_Z8BfTok";

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    const viewer = new Viewer(containerId, {
      terrain: Terrain.fromWorldTerrain(),
      //   baseLayerPicker: false,
    });

    // Fly the camera to San Francisco at the given longitude, latitude, and height.
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(108.93593, 35.40894, 400000),
    });
    // viewer.scene.screenSpaceCameraController.enableRotate = false;

    const center = gcj02towgs84([108.93593, 35.40894]);

    const centerEntityHigh = viewer.entities.add({
      position: Cartesian3.fromDegrees(center[0], center[1], 9000),
      point: {
        show: false,
      },
      label: {
        show: false,
      },
    });

    const centerEntityLow = viewer.entities.add({
      position: Cartesian3.fromDegrees(center[0], center[1], 1300),
      point: {
        show: false,
      },
      label: {
        show: false,
      },
    });

    this.viewer = viewer;
    // this.addChina();
    // this.addShaanxi();
    // this.addLocalJson();
    // this.addPin();
    // this.addModel();
    // threejs
    this.threeContainer = new CesiumThreeController(viewer, jxGeo);
    // geojson
    this.geojson = new GeojsonController(this);
    // lable
    this.companyLabel = new CompanyLabel(viewer);

    viewer.canvas.addEventListener("wheel", (e) => {
      var delta = e.deltaY; // 获取滚轮的滚动方向和速度
      var camera = viewer.camera;

      // 调整相机的高度
      this.cameraHeight = camera.positionCartographic.height;
      console.log(this.cameraHeight, viewer.dataSources._dataSources);
      if (this.cameraHeight < 30000) {
        viewer.dataSources._dataSources.forEach((item) => {
          if (item.__type == "geojson") item.show = false;
        });
        // viewer.trackedEntity = centerEntityHigh;
      } else {
        viewer.dataSources._dataSources.forEach((item) => {
          if (item.__type == "geojson") item.show = true;
        });
        // viewer.trackedEntity = centerEntityLow;
      }
    });

    return viewer;
  };

  addChina() {
    this.viewer.dataSources

      .add(GeoJsonDataSource.load(onlineJson.China))
      .then((dataSource) => {
        dataSource.__type = "geojson";
        const entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          // console.log(entity);
          entity.polygon.height = 9000;
          entity.polygon.extrudedHeight = 9010;
          entity.polygon.material =
            Color.fromCssColorString("rgba(20,33,53)").withAlpha(0.8);

          entity.polygon.outlineColor = Color.fromCssColorString("#0f4d68");
          entity.polygon.outlineWidth = 5;
        }
      });

    // this.terrainHide();
    /*
      .then((dataSource) => {
        console.log("GeoJsonDataSource", dataSource);
        const entities = dataSource.entities.values;

        const colorHash = {};
        console.log("GeoJsonDataSource-entities", entities);

        for (let i = 0; i < entities.length; i++) {
          //For each entity, create a random color based on the state name.
          //Some states have multiple entities, so we store the color in a
          //hash so that we use the same color for the entire state.
          const entity = entities[i];
          //   if (entity.properties._level == "province")
          //     console.log("entity", entity.properties._name._value);
          const name = entity.name;
          let color = colorHash[name];
          if (!color) {
            color = Color.fromRandom({
              alpha: 1.0,
            });
            colorHash[name] = color;
          }

          //Set the polygon material to our random color.
          entity.polygon.material = color;
          //Remove the outlines.
          entity.polygon.outline = false;

          //Extrude the polygon based on the state's population.  Each entity
          //stores the properties for the GeoJSON feature it was created from
          //Since the population is a huge number, we divide by 50.
          entity.polygon.extrudedHeight = Math.random() * 50000;
        }
      });
      */

    /*
      var handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);

    const clickHandler = (movement) => {
      var pick = this.viewer.scene.pick(movement.position);
      if (pick) {
        console.log(pick.id.properties);
      }
    };

    handler.setInputAction(clickHandler, ScreenSpaceEventType.LEFT_CLICK);
    */
    // handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, clickHandler);
  }

  addShaanxi() {
    this.viewer.dataSources
      .add(
        GeoJsonDataSource.load(onlineJson.Shannxi, {
          stroke: Color.fromCssColorString("aqua"),
          fill: Color.fromCssColorString("#00BFFF").withAlpha(0),
          strokeWidth: 3,
        })
      )
      .then((dataSource) => {
        dataSource.__type = "geojson";
        const entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          entity.polygon.height = 9010;
          entity.polygon.extrudedHeight = 9100;
          let name = entity.name;
          let position = entity.properties._center._value;
          console.log(name, entity);
          if (maincitys.includes(name))
            this.viewer.entities.add({
              position: Cartesian3.fromDegrees(position[0], position[1], 15500),
              label: {
                text: name,
                font: "14px sans-serif",
              },
            });
        }
      });
  }

  addLocalJson() {
    let index = 0;
    localJson.forEach(({ url }) => {
      this.viewer.dataSources
        .add(
          GeoJsonDataSource.load(url, {
            stroke: Color.fromCssColorString("#0040FF"),
            fill: Color.fromCssColorString("#00BFFF"),
          })
        )
        .then((dataSource) => {
          dataSource.__type = "geojson";
          const entities = dataSource.entities.values;
          for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const color = mapCof.geoColor[index++];
            // console.log(color);
            if (index == 8) index = 0;
            entity.polygon.material = Color.fromCssColorString(color);
            entity.polygon.height = 9100;
            entity.polygon.extrudedHeight = 9205;
            let name = entity.name;
            let position = entity.properties._center._value;
            console.log(name, entity);
            if (maincitys.includes(name))
              this.viewer.entities.add({
                position: Cartesian3.fromDegrees(
                  position[0],
                  position[1],
                  15500
                ),
                label: {
                  text: name,
                  font: "14px sans-serif",
                },
              });
          }
        });
    });
  }
  terrainHide = () => {
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
  };

  terrainShow = () => {
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
  };
  to3D = () => {
    this.viewer.scene.mode = SceneMode.SCENE3D;
  };
  to2D = () => {
    this.viewer.scene.mode = SceneMode.SCENE2D;
  };

  addPin = () => {
    let viewer = this.viewer;
    const pinBuilder = new PinBuilder();
    const bluePin = viewer.entities.add({
      name: "Blank blue pin",
      position: Cartesian3.fromDegrees(108.93593, 35.40894, 5000),
      billboard: {
        image: pinBuilder.fromColor(Color.ROYALBLUE, 48).toDataURL(),
        verticalOrigin: VerticalOrigin.BOTTOM,
      },
    });

    const questionPin = viewer.entities.add({
      name: "Question mark",
      position: Cartesian3.fromDegrees(109.93593, 35.40894, 5000),
      billboard: {
        image: pinBuilder.fromText("?", Color.BLACK, 48).toDataURL(),
        verticalOrigin: VerticalOrigin.BOTTOM,
      },
    });

    // const cdPin = viewer.entities.add({
    //   name: "Question mark",
    //   position: Cartesian3.fromDegrees(108.93593, 35.00894, 5000),
    //   billboard: {
    //     image: pinBuilder.fromText("?", Color.BLACK, 48).toDataURL(),
    //     verticalOrigin: VerticalOrigin.BOTTOM,
    //   },
    // });

    const label = viewer.entities.add({
      position: Cartesian3.fromDegrees(108.93593, 35.00894, 5000),
      label: {
        text: "Philadelphia",
      },
    });
  };

  addModel = () => {
    createModel("/models/bunny.gltf", 1400.3, this.viewer);
  };
}
