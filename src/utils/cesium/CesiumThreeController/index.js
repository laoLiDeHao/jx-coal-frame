import * as THREE from "three";
import * as Cesium from "cesium";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { loadMainStructions, loadTerrainLayers } from "./Constructions";
export default class CesiumThreeController {
  cesium = {
    viewer: null,
  };
  three = {
    renderer: null,
    camera: null,
    scene: null,
    control: null,
  };
  minWGS84 = [115.56936458615716, 39.284100766866445];
  maxWGS84 = [117.10745052365716, 41.107831235616445];
  sceneContainer;
  // cesium 容器
  cesiumContainer = document.getElementById("cesiumContainer");
  _3Dobjects = []; //Could be any Three.js object mesh
  constructor(viewer, data) {
    this.initData(data)
      .then((data) => this.initConfig(data))
      .then(() => this.initView(viewer));
  }
  initData = async (datasource) => {
    let data = null;
    if (typeof datasource == "string") {
      data = await fetch(datasource).then((res) => {
        console.log("fetch", res);
        return res.json();
      });
    } else {
      data = datasource;
    }

    return data;
  };
  initConfig = (data) => {
    let coordinates = data.features[0].geometry.coordinates[0];
    // 边界
    let maxLng = coordinates[0][0],
      maxLat = coordinates[0][1];
    let minLng = coordinates[0][0],
      minLat = coordinates[0][1];
    coordinates.forEach(([lng, lat]) => {
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
    });
    const minWGS84 = [minLng, minLat];
    const maxWGS84 = [maxLng, maxLat];

    // 中心
    const center = [(maxLng + minLng) / 2, (maxLat + minLat) / 2];

    const config = {
      minWGS84,
      maxWGS84,
      center,
      geojson: data,
    };
    Object.assign(this, config);
    console.log("geo data get", { config });
    return this;
  };
  initView = (viewer) => {
    this.cesium.viewer = viewer;
    let { three, cesium } = this;
    this.initThree();
    this.init3DObject();
    this.loop();
  };
  initThree = () => {
    let { three, cesium, minWGS84, maxWGS84, _3Dobjects } = this;
    let fov = 45;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let aspect = width / height;
    let near = 1;
    let far = 10 * 1000 * 1000;
    three.scene = new THREE.Scene();
    three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    three.renderer = new THREE.WebGLRenderer({ alpha: true });
    let Amlight = new THREE.AmbientLight(0xffffff, 2);
    three.scene.add(Amlight);
    // 注意这里，直接把three容器（canvas 添加到 cesium中，在cesium的canvas之下），
    // 这样的话，两个canvas才会重叠起来。
    this.cesium.viewer.cesiumWidget.canvas.parentElement.appendChild(
      three.renderer.domElement
    );

    let control = new TransformControls(
      three.camera,
      three.renderer.domElement
    );
    three.control = control;

    const sceneContainer = new THREE.Group();
    three.scene.add(sceneContainer);
    three.scene.add(control);

    const _3DOB2 = new _3DObject();
    _3DOB2.threeMesh = sceneContainer;
    _3DOB2.minWGS84 = minWGS84;
    _3DOB2.maxWGS84 = maxWGS84;
    _3Dobjects.push(_3DOB2);

    this.sceneContainer = sceneContainer;
  };

  init3DObject = () => {
    this.createPolygon(); //
    this.createThreeObject();
  };
  loop = () => {
    requestAnimationFrame(this.loop);
    this.renderCesium();
    this.renderThreeObj();
  };

  renderCesium = () => {
    this.cesium.viewer.render();
  };
  renderThreeObj = () => {
    let { three, cesium, _3Dobjects, minWGS84, maxWGS84 } = this;
    // register Three.js scene with Cesium
    three.camera.fov = Cesium.Math.toDegrees(cesium.viewer.camera.frustum.fovy); // ThreeJS FOV is vertical
    //three.camera.updateProjectionMatrix();
    let cartToVec = function (cart) {
      return new THREE.Vector3(cart.x, cart.y, cart.z);
    };

    // Configure Three.js meshes to stand against globe center position up direction
    for (let id in _3Dobjects) {
      minWGS84 = _3Dobjects[id].minWGS84;
      maxWGS84 = _3Dobjects[id].maxWGS84;
      // convert lat/long center position to Cartesian3
      let center = Cesium.Cartesian3.fromDegrees(
        (minWGS84[0] + maxWGS84[0]) / 2,
        (minWGS84[1] + maxWGS84[1]) / 2
      );
      // get forward direction for orienting model
      let centerHigh = Cesium.Cartesian3.fromDegrees(
        (minWGS84[0] + maxWGS84[0]) / 2,
        (minWGS84[1] + maxWGS84[1]) / 2,
        1
      );
      // use direction from bottom left to top left as up-vector
      let bottomLeft = cartToVec(
        Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1])
      );
      let topLeft = cartToVec(
        Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1])
      );
      let latDir = new THREE.Vector3()
        .subVectors(bottomLeft, topLeft)
        .normalize();
      // configure entity position and orientation
      _3Dobjects[id].threeMesh.position.copy(center);
      _3Dobjects[id].threeMesh.lookAt(centerHigh.x, centerHigh.y, centerHigh.z);
      _3Dobjects[id].threeMesh.up.copy(latDir);
    }
    // Clone Cesium Camera projection position so the
    // Three.js Object will appear to be at the same place as above the Cesium Globe
    three.camera.matrixAutoUpdate = false;
    let cvm = cesium.viewer.camera.viewMatrix;
    let civm = cesium.viewer.camera.inverseViewMatrix;

    // 注意这里，经大神博客得知，three高版本这行代码需要放在 three.camera.matrixWorld 之前
    three.camera.lookAt(0, 0, 0);

    three.camera.matrixWorld.set(
      civm[0],
      civm[4],
      civm[8],
      civm[12],
      civm[1],
      civm[5],
      civm[9],
      civm[13],
      civm[2],
      civm[6],
      civm[10],
      civm[14],
      civm[3],
      civm[7],
      civm[11],
      civm[15]
    );

    three.camera.matrixWorldInverse.set(
      cvm[0],
      cvm[4],
      cvm[8],
      cvm[12],
      cvm[1],
      cvm[5],
      cvm[9],
      cvm[13],
      cvm[2],
      cvm[6],
      cvm[10],
      cvm[14],
      cvm[3],
      cvm[7],
      cvm[11],
      cvm[15]
    );

    // 设置three宽高
    let width = cesiumContainer.clientWidth;
    let height = cesiumContainer.clientHeight;

    let aspect = width / height;
    three.camera.aspect = aspect;
    three.camera.updateProjectionMatrix();
    three.renderer.setSize(width, height);
    three.renderer.clear();
    three.renderer.render(three.scene, three.camera);
  };
  createPolygon = () => {
    let { minWGS84, maxWGS84, cesium, geojson } = this;
    let entity = {
      name: "Polygon",
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          minWGS84[0],
          minWGS84[1],
          maxWGS84[0],
          minWGS84[1],
          maxWGS84[0],
          maxWGS84[1],
          minWGS84[0],
          maxWGS84[1],
        ]),
        material: Cesium.Color.BLUE.withAlpha(0.4),
      },
    };
    let Polygon = cesium.viewer.entities.add(entity);
    // console.log({ geojson });

    cesium.viewer.dataSources
      .add(Cesium.GeoJsonDataSource.load(geojson))
      .then((dataSource) => {
        const entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          entity.polygon.height = 0;
          entity.polygon.extrudedHeight = 1800;
          entity.polygon.material =
            Cesium.Color.fromCssColorString("rgba(20,33,53)").withAlpha(0.8);

          entity.polygon.outlineColor =
            Cesium.Color.fromCssColorString("#0f4d68");
          entity.polygon.outlineWidth = 5;
        }
      });
  };
  createThreeObject = () => {
    let { three, cesium, _3Dobjects, minWGS84, maxWGS84, sceneContainer } =
      this;
    // add scene build function
    // this.getModel();
    // this.cube();
    loadMainStructions(sceneContainer);
    loadTerrainLayers(sceneContainer);
  };

  addThreeObjets = (threeObj = createCube()) => {
    let { three, minWGS84, maxWGS84 } = this;
    let dodecahedronMeshYup = new THREE.Group();
    dodecahedronMeshYup.add(threeObj);
    three.scene.add(dodecahedronMeshYup); // don’t forget to add it to the Three.js scene manually
    let _3DOB = new _3DObject();
    _3DOB.threeMesh = dodecahedronMeshYup;
    _3DOB.minWGS84 = minWGS84;
    _3DOB.maxWGS84 = maxWGS84;
    this._3Dobjects.push(_3DOB);
  };
  getModel = (geometry) => {
    let { three, cesium, _3Dobjects, minWGS84, maxWGS84 } = this;
    geometry = new THREE.DodecahedronGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x0ff });
    let dodecahedronMesh = new THREE.Mesh(geometry, material);
    // let dodecahedronMesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
    dodecahedronMesh.scale.set(5000, 5000, 5000); //scale object to be visible at planet scale
    dodecahedronMesh.position.z += 25000.0; // translate "up" in Three.js space so the "bottom" of the mesh is the handle
    dodecahedronMesh.rotation.x = Math.PI / 2; // rotate mesh for Cesium's Y-up system
    let dodecahedronMeshYup = new THREE.Group();
    dodecahedronMeshYup.add(dodecahedronMesh);
    three.scene.add(dodecahedronMeshYup); // don’t forget to add it to the Three.js scene manually
    //Assign Three.js object mesh to our object array
    let _3DOB = new _3DObject();
    _3DOB.threeMesh = dodecahedronMeshYup;
    _3DOB.minWGS84 = minWGS84;
    _3DOB.maxWGS84 = maxWGS84;
    // _3Dobjects.push(_3DOB);
  };
  cube = () => {
    let { three, cesium, _3Dobjects, minWGS84, maxWGS84, sceneContainer } =
      this;

    let loader = new GLTFLoader();
    loader.load("models/yuanqu/1_2new.glb", (gltf) => {
      console.log("gltf load success", gltf);
      let { scene } = gltf;

      scene.position.set(-5100, -2200, 1200);
      scene.rotation.set(1.5707963267948966, -2.1700000000000013, 0);

      console.log({ sceneContainer });
      sceneContainer.add(scene);
    });
  };
}

function _3DObject() {
  //THREEJS 3DObject.mesh
  this.threeMesh = null;
  //location bounding box
  this.minWGS84 = null;
  this.maxWGS84 = null;
}

function createCube() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const dodecahedronMesh = new THREE.Mesh(geometry, material);
  dodecahedronMesh.scale.set(15000, 15000, 15000); //scale object to be visible at planet scale
  dodecahedronMesh.position.z += 7000.0; // translate "up" in Three.js space so the "bottom" of the mesh is the handle
  dodecahedronMesh.rotation.x = Math.PI / 2; // rotate mesh for Cesium's Y-up system
  return dodecahedronMesh;
}

function transforme3DGroup() {
  let stander = "p";
  window.addEventListener("keydown", ({ key }) => {
    console.log(key);
    if (key == "r") stander = "r";
    if (key == "p") stander = "p";
    if (key == "h") stander = "h";

    if (stander == "p") {
      if (key == "ArrowRight") scene.position.x -= 10;
      if (key == "ArrowLeft") scene.position.x += 10;
      if (key == "ArrowUp") scene.position.y -= 10;
      if (key == "ArrowDown") scene.position.y += 10;
    } else if (stander == "r") {
      if (key == "ArrowUp") scene.rotation.y -= 0.01;
      if (key == "ArrowDown") scene.rotation.y += 0.01;
    } else if (stander == "h") {
      if (key == "ArrowUp") scene.position.z -= 10;
      if (key == "ArrowDown") scene.position.z += 10;
    }

    if (key == "v") console.log(scene);
  });
}
