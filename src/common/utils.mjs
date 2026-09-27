
export const cloneObjectSafe = o => {
  const n = {};
  for (const k in o)
    n[k] = o[k];
  return n;
}
export const cloneArraySafe = o => {
  const n = Array(o.length).fill();
  for (let i = 0; i < o.length; i+=1)
    n[i] = o[i];
  return n;
}
const appendScript = (code) => {
  const elm = document.createElement("script");
  elm.setAttribute("type", "application/javascript");
  elm.textContent = code;
  document.body.appendChild(elm);
}
export const tryLoadOans = () => {
  fetch("coui://html_ui/Pages/VCockpit/Instruments/a22x/DisplayUnits/gm5-a220-amm.js").then(res => {
    res.text().then(code => {
      appendScript(code);
    }).catch(() => null)
  }).catch(() => null)
}