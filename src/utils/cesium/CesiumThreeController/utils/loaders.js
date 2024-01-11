import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
export function loadModels(urls) {
  let promises = urls.map((url) => loaderAddGlb(url));
  return Promise.all(promises).then((res) => {
    console.log(res);
    return res;
  });
}
export function loaderAddGlb(url) {
  return new Promise((resolve, reject) => {
    let loader = new GLTFLoader();
    loader.load(url, (model) => {
      let { scene } = model;
      resolve(scene);
    });
  });
}
