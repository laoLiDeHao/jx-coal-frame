/**
 * @description 绘制带logo的css2标签
 * @param {*} className dom的类名
 * @param {*} textContent dom的内容
 * @param {*} logourl domLogo的地址
 * @param  {...any} position dom的位置
 * @returns
 */
export function drawLabelWithLogo(className, textContent, logourl = "") {
  const labelDiv = document.createElement("div");
  labelDiv.className = className;

  let logo = document.createElement("div");
  logo.className = "logo";
  logo.src = logourl;
  labelDiv.appendChild(logo);
  let text = document.createElement("span");
  text.innerText = textContent;
  labelDiv.appendChild(text);

  // labelDiv.innerHTML = textContent
  labelDiv.style.backgroundColor = "transparent";

  let container = document.createElement("div");
  container.appendChild(labelDiv);

  return container;
}
