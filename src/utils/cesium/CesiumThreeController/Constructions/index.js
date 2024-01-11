import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { loadModels } from "../utils/loaders";
import { DoubleSide, Group, MeshBasicMaterial } from "three";

/**
 * 添加厂区主要建筑物
 * @param {} _3DContainer
 */
export async function loadMainStructions(_3DContainer) {
  let models = await loadModels([
    "models/yuanqu/1_2new.glb",
    "models/yuanqu/2_2new.glb",
    "models/yuanqu/3_2new.glb",
    "models/yuanqu/4_2new.glb",
  ]);

  let modelBox = new Group();
  modelBox.add(models[0]);
  modelBox.add(models[1]);
  modelBox.add(models[2]);
  modelBox.add(models[3]);

  modelBox.position.set(-5100, -2160, 1200);
  modelBox.rotation.set(1.5707963267948966, -2.1700000000000013, 0);
  _3DContainer.add(modelBox);
  //   console.log(modelBox);
  transforme3DGroup(modelBox);
}

export async function loadTerrainLayers(_3DContainer) {
  let model = await loadModels(["/geology/DiXing.glb"]);
  console.log('"/geology/DiXing.glb"', model[0]);
  _3DContainer.add(model[0]);
}

function transforme3DGroup(scene) {
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
