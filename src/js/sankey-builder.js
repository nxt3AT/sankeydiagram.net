import * as d3 from "d3";
import * as sankey from "./d3-sankey-diagram/src/index";

import * as saveSvg from "save-svg-as-png";
import LZString from "lz-string";
import ClipboardJS from "clipboard";

import {CSS3_NAMES_TO_HEX, getColor, resetColorIndex} from "./colors";

const lineRegex = new RegExp("(.*)\\[([0-9,.?]+[$€£₽¥]?)\\]\\s*(.+?)(?:\\s\\[(.+)\\])?$");
const sankeyInput = document.getElementById("sankey-input-textarea");

let sankeySvg, sankeyBox;
let layout, diagram;

const sankeyPrecisionSetting = document.getElementById("sankey-settings-precision");
const sankeyHideZerosSetting = document.getElementById("sankey-settings-hidezeros");
const sankeySeparatorSetting = document.getElementById("sankey-settings-separators");
const sankeyColorpaletteSetting = document.getElementById("sankey-settings-colorscheme");
const sankeySuffixSetting = document.getElementById("sankey-settings-suffix");

const sankeyHideNumbersSetting = document.getElementById("sankey-settings-hidenumbers");
const sankeyCanvasWidthSetting = document.getElementById("sankey-settings-canvas-width");
const sankeyCanvasHeightSetting = document.getElementById("sankey-settings-canvas-height");

const allTabs = Array.from(document.getElementById("sankey-input-tabs").getElementsByTagName("li"));
const allTabContainers = Array.from(document.getElementById("sankey-input-box").getElementsByClassName("is-tab"));
let currentTabIndex = 0;

let inputTimer;
sankeyInput.addEventListener("keyup", function (e) {
    // check if key is a character
    if(e.key.length !== 1) {
        return;
    }

    clearTimeout(inputTimer);
    inputTimer = setTimeout(processInput, 300);
});

[sankeyPrecisionSetting, sankeyHideZerosSetting, sankeySuffixSetting, sankeySeparatorSetting, sankeyHideNumbersSetting].forEach(setting => {
    setting.addEventListener("input", function (e) {
        processInput();
    });
})

sankeyColorpaletteSetting.addEventListener("change", function (e) {
    resetColorIndex();
    processInput();
});

document.getElementById("sankey-settings-labelabove").addEventListener("change", function (e) {
    processInput();
});

sankeyCanvasWidthSetting.addEventListener("change", function (e) {
    document.getElementById("sankey-svg").setAttribute("viewBox", "0 0 " + sankeyCanvasWidthSetting.value + " " + sankeyCanvasHeightSetting.value);
    layout.size([sankeyCanvasWidthSetting.value-60, sankeyCanvasHeightSetting.value]);
    processInput();
});

sankeyCanvasHeightSetting.addEventListener("change", function (e) {
    document.getElementById("sankey-svg").setAttribute("viewBox", "0 0 " + sankeyCanvasWidthSetting.value + " " + sankeyCanvasHeightSetting.value);
    layout.size([sankeyCanvasWidthSetting.value-60, sankeyCanvasHeightSetting.value]);
    processInput();
});

document.getElementById("sankey-input-box").addEventListener("resize", function (e) {
    processInput();
});

window.addEventListener("resize", processInput);

document.querySelectorAll(".close-notification-button").forEach(element => {
   element.addEventListener("click", function (e) {
       element.parentElement.remove();
   });
});

document.querySelectorAll(".download-as-png-button").forEach(element => {
    element.addEventListener("click", function (e) {
        saveSvg.saveSvgAsPng(d3.select("svg").node(), "sankeydiagram-net-export", {
            backgroundColor: "white",
            excludeUnusedCss: true
        });
    });
});

document.querySelectorAll(".download-as-svg-button").forEach(element => {
    element.addEventListener("click", function (e) {
        saveSvg.saveSvg(d3.select("svg").node(), "sankeydiagram-net-export", {
            backgroundColor: "white",
            excludeUnusedCss: true
        });
    });
});

function generateRandomString(length) {
    let randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}
document.querySelectorAll(".anonymize-data-button").forEach(element => {
    element.addEventListener("click", function (e) {
        let scrubbedLines = "";
        let scrubbingFactor = (Math.random() * (1.150 - 0.950) + 0.950).toFixed(3);
        let replacedKeyDict = {};

        sankeyInput.value.split("\n").forEach(line => {
            if (line.startsWith("//") || line.startsWith("'")) {
                return;
            }

            if (!lineRegex.test(line)) {
                return;
            }

            const regexGroups = lineRegex.exec(line);
            let source = regexGroups[1].trim();
            let value = regexGroups[2];
            let target = regexGroups[3].trim();

            if(replacedKeyDict[source] == null) {
                replacedKeyDict[source] = generateRandomString(source.length);
            }

            if(value !== "?") {
                value = (value*scrubbingFactor).toFixed(0);
            }

            if(replacedKeyDict[target] == null) {
                replacedKeyDict[target] = generateRandomString(target.length);
            }

            scrubbedLines += replacedKeyDict[source] + " [" + value + "] " + replacedKeyDict[target] + "\n";
        });

        sankeyInput.value = scrubbedLines;

        processInput();
    });
});

new ClipboardJS(".copy-link-button", {
    text: function(trigger) {
        trigger.classList.add("is-clicked");
        setTimeout(() => trigger.classList.remove("is-clicked"), 700)
        return location.protocol + "//" + location.host + location.pathname + "?content=" + serializeData();
    }
});

document.querySelectorAll(".navbar-burger").forEach(element => {
   element.addEventListener("click", function () {
       const target = document.getElementById(element.dataset.target);

       element.classList.toggle("is-active");
       target.classList.toggle("is-active");
   });
});

document.getElementById("sankey-input-tabs").addEventListener("click", function (e) {
    if(e.target.tagName !== "A") {
        return;
    }

    allTabs[currentTabIndex].classList.remove("is-active");
    allTabContainers[currentTabIndex].classList.remove("is-active");

    let newTabIndex = allTabs.indexOf(e.target.parentElement);
    allTabs[newTabIndex].classList.add("is-active");
    allTabContainers[newTabIndex].classList.add("is-active");

    currentTabIndex = newTabIndex;
});

function calculateValue(lines, originalTarget) {
    let totalValue = 0.0;
    lines.forEach((line, index) => {
        if (line.startsWith("//") || line.startsWith("'")) {
            return;
        }

        if (!lineRegex.test(line)) {
            return;
        }

        const regexGroups = lineRegex.exec(line);
        const source = regexGroups[1].trim();
        let value = regexGroups[2];
        const target = regexGroups[3].trim();

        if(source === originalTarget) {
            if(value === "?") {
                totalValue += parseFloat(calculateValue(lines, target));
            } else {
                totalValue += parseFloat(value);
            }
        }
    });
    return totalValue;
}
function parseInputToSankey(input) {
    let lines = input.split("\n");

    let nodeKeys = [];
    let nodesList = [];
    let linksList = [];

    let precision = sankeyPrecisionSetting.value;

    let positions = undefined;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.startsWith("//") || line.startsWith("'")) {
            continue;
        }

        if(line.startsWith("\"positions\":")) {
            positions = JSON.parse("{" + input.split("\n").slice(i, input.split("\n").length).join("") + "}")["positions"];
            break;
        }

        if (!lineRegex.test(line)) {
            continue;
        }

        const regexGroups = lineRegex.exec(line);
        const source = regexGroups[1].trim();
        let value = regexGroups[2];
        const target = regexGroups[3].trim();
        const color = regexGroups[4];

        if (!nodeKeys.includes(source)) {
            nodeKeys.push(source);
            nodesList.push({"id": source});
        }

        if (!nodeKeys.includes(target)) {
            nodeKeys.push(target);
            nodesList.push({"id": target});
        }

        if (value === "?") {
            value = calculateValue(lines, target);
        }

        linksList.push({
            "source": source,
            "target": target,
            "value": sankeyHideZerosSetting.checked ? Number(parseFloat(value).toFixed(precision)) : parseFloat(value).toFixed(precision),
            "color": color in CSS3_NAMES_TO_HEX ? CSS3_NAMES_TO_HEX[color] : (color !== undefined && color.startsWith("#")) ? color : getColor(source)
        });
    }

    if(positions !== undefined) {
        if(positions.forEach) {
            layout.ordering(positions);
        }
    } else {
        layout.ordering(null);
    }

    return {
        nodes: nodesList,
        links: linksList
    };
}

function processInput() {
    let graph = parseInputToSankey(sankeyInput.value);

    sankeyBox = document.getElementById("sankey-box");
    sankeySvg = d3.select("#sankey-svg");

    layout(graph);

    sankeySvg
        .datum(graph)
        .datum(layout.scale(null))
        .transition().duration(1000).ease(d3.easeCubic)
        .call(diagram);
}

function serializeData() {
    return LZString.compressToBase64(sankeyInput.value);
}
function deserializeData(rawData) {
    let decompressedData = LZString.decompressFromBase64(rawData);
    sankeyInput.value = decompressedData;
    processInput();
    return decompressedData;
}

function findGetParameter(parameterName) {
    let result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

layout = sankey.sankey()
    .size([1840, 1080])
    .linkValue(function (d) {
        return d.value;
    });

diagram = sankey.sankeyDiagram()
    .nodeValue(function (d) {
        let precision = sankeyPrecisionSetting.value;
        let nodeValue;

        if (sankeyHideNumbersSetting.checked) {
            return "";
        }

        if (d.incoming.length > 0) {
            let incomingValue = 0.0;
            d.incoming.forEach(incomingNode => {
                incomingValue += parseFloat(incomingNode.value);
            });
            nodeValue = sankeyHideZerosSetting.checked ? Number(incomingValue.toFixed(precision)) : incomingValue.toFixed(precision);
        } else {
            nodeValue = sankeyHideZerosSetting.checked ? Number(d.value.toFixed(precision)) : d.value.toFixed(precision);
        }

        return sankeySeparatorSetting.checked ? Number(nodeValue).toLocaleString(undefined, {
            minimumFractionDigits: sankeyHideZerosSetting.checked ? undefined : precision,
            minimumSignificantDigits: sankeyHideZerosSetting.ch ? precision : undefined,
        }) : nodeValue;
    })
    .nodeTitle(function (d) {
        return d.id;
    })
    .nodeSuffix(function (d) {
        return sankeySuffixSetting.value;
    })
    .nodeTooltip(function (d) {
        let precision = sankeyPrecisionSetting.value;
        let outgoingValue = 0.0, incomingValue = 0.0;
        d.outgoing.forEach(outgoingNode => {
            outgoingValue += parseFloat(outgoingNode.value);
        });
        d.incoming.forEach(incomingNode => {
            incomingValue += parseFloat(incomingNode.value);
        });

        if (d.outgoing.length > 0 && d.incoming.length > 0 && (Math.abs(outgoingValue) !== Math.abs(incomingValue))) {
            return (sankeyHideZerosSetting.checked ? Number(d.value.toFixed(precision)) : d.value.toFixed(precision)) + "\ndifference: " + (parseFloat(incomingValue) - parseFloat(outgoingValue)).toFixed(precision);
        } else {
            return (sankeyHideZerosSetting.checked ? Number(d.value.toFixed(precision)) : d.value.toFixed(precision));
        }
    })
    .linkMinWidth(function (d) {
        return 2.5;
    })
    .linkColor(function (d) {
        return d.value != 0 ? d.color : "#FFFFFF";
    })
    .margins({top: 0, right: 0, bottom: 0, left: 10});

if(findGetParameter("content") !== null) {
    deserializeData(findGetParameter("content"));
} else {
    processInput();
}