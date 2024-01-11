import { Cartesian3, Color, GeoJsonDataSource } from "cesium";
import onlineJson from "../onlineJson";
import localJson from "../localJson";
import mapCof from "../mapCof";
const maincitys = ["黄陵县", "蒲城县", "延安市", "西安市"];
export default class GeojsonController {
  viewer;
  mapSources = [];

  constructor(that) {
    Object.assign(this, that);
    this.addMapSources();
  }

  addMapSources = () => {
    // CHINA
    this.viewer.dataSources
      .add(GeoJsonDataSource.load(onlineJson.China))
      .then((dataSource) => {
        dataSource.__type = "geojson";
        const entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          entity.polygon.height = 9000;
          entity.polygon.extrudedHeight = 9010;
          entity.polygon.material =
            Color.fromCssColorString("rgba(20,33,53)").withAlpha(0.8);

          entity.polygon.outlineColor = Color.fromCssColorString("#0f4d68");
          entity.polygon.outlineWidth = 5;
        }
      });
    // SHAANXI
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
    // OTHERS
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
            if (index == 8) index = 0;
            entity.polygon.material = Color.fromCssColorString(color);
            entity.polygon.height = 9100;
            entity.polygon.extrudedHeight = 9205;
            let name = entity.name;
            let position = entity.properties._center._value;
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
  };
}
