import { SceneTransforms, defined, Cartesian3 } from "cesium";
const list = [
  { position: [108.93593, 35.40894], company: "建新煤化" },
  { position: [109.60498, 35.11662], company: "蒲白矿业" },
  { position: [108.797426, 34.10671], company: "陕煤集团" },
];

export default class CompanyLabel {
  viewer;
  constructor(viewer) {
    this.viewer = viewer;
    this.init();
  }

  init = () => {
    let { viewer } = this;
    list.forEach((item) => {
      let [lng, lat] = item.position;
      create(viewer, item.company, lng, lat, 15000);
    });
  };
}

function create(viewer, name, lng, lat, height) {
  // let div = drawLabelWithLogo("name-label-whit-logo", `${"建新煤化"}`, "");
  const div = document.createElement("div");
  const text = document.createElement("div");
  const logo = document.createElement("img");
  text.textContent = name;
  logo.src = "/icons/陕煤logo.png";
  div.appendChild(logo);
  div.appendChild(text);

  const bg = document.createElement("img");
  bg.src = "/icons/box.png";
  div.appendChild(bg);

  const divStyles = {
    position: "fixed",
    width: "109px",
    height: "36px",
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    alignItems: "center",
  };
  text.style.font = "14px bold 思源黑体";
  text.style.color = "white";
  const bgStyles = {
    display: "block",
    position: "absolute",
    top: "0",
    left: "0",
    zIndex: "-1",
  };
  Object.assign(div.style, divStyles);
  Object.assign(bg.style, bgStyles);
  // div.style.position = "fixed";
  // div.style.width = "100px";
  // div.style.height = "20px";
  // div.style.backgroundColor = "rgba(255, 255, 255, 0.8)";

  document.body.appendChild(div);
  // 定义经纬度坐标

  viewer.scene.preRender.addEventListener(function () {
    // 将经纬度坐标转换为场景坐标
    const position = Cartesian3.fromDegrees(lng, lat, height);
    if (defined(position)) {
      // 将场景坐标转换为屏幕坐标
      const screenPosition = SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        position
      );
      if (defined(screenPosition)) {
        // 将 div 元素的位置设置为屏幕坐标
        div.style.left = screenPosition.x + "px";
        div.style.top = screenPosition.y + "px";
      }
    }
  });
}
