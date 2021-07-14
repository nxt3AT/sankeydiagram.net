const lineRegex = new RegExp("(.*)\\[([0-9,.?]+[$€£₽¥]?)\\]\\s*(.+?)(?:\\s\\[(.+)\\])?$");
const zerosRegex = new RegExp("(\\.0+)$");
const sankeyInput = document.getElementById("sankey-input-textarea");

let sankeySvg, sankeyBox;
let layout, diagram;

const sankeyPrecisionSetting = document.getElementById("sankey-settings-precision");
const sankeyHideZerosSetting = document.getElementById("sankey-settings-hidezeros");
const sankeyColorpaletteSetting = document.getElementById("sankey-settings-colorscheme");

const allTabs = Array.from(document.getElementById("sankey-input-tabs").getElementsByTagName("li"));
const allTabContainers = Array.from(document.getElementById("sankey-input-box").getElementsByClassName("is-tab"));
let currentTabIndex = 0;

let inputTimer;
sankeyInput.addEventListener("keyup", function (e) {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(redraw, 300);
});

sankeyPrecisionSetting.addEventListener("input", function (e) {
    processInput();
});


sankeyHideZerosSetting.addEventListener("input", function (e) {
    processInput();
});

sankeyColorpaletteSetting.addEventListener("change", function (e) {
    colorIndex = 0;
    redraw();
});

document.getElementById("sankey-settings-labelabove").addEventListener("change", function (e) {
    redraw();
});

document.getElementById("sankey-input-box").addEventListener("resize", function (e) {
    redraw();
});

window.addEventListener("resize", processInput);

document.querySelectorAll(".close-notification-button").forEach(element => {
   element.addEventListener("click", function (e) {
       element.parentElement.remove();
   });
});

document.querySelectorAll(".download-as-png-button").forEach(element => {
    element.addEventListener("click", function (e) {
        saveSvgAsPng(d3.select("svg").node(), "sankey-builder-export", {
            backgroundColor: "white",
            excludeUnusedCss: true
        });
    });
});

document.querySelectorAll(".download-as-svg-button").forEach(element => {
    element.addEventListener("click", function (e) {
        saveSvg(d3.select("svg").node(), "sankey-builder-export", {
            backgroundColor: "white",
            excludeUnusedCss: true
        });
    });
});

function generateRandomString(length) {
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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

        redraw();
    });
});

new ClipboardJS(".copy-link-button", {
    text: function(trigger) {
        trigger.classList.add("is-clicked");
        setTimeout(() => trigger.classList.remove("is-clicked"), 700)
        return window.location.href + "?content=" + serializeData();
    }
});

document.querySelectorAll(".navbar-burger").forEach(element => {
   element.addEventListener("click", function () {
       const target = document.getElementById(element.dataset.target);

       element.classList.toggle('is-active');
       target.classList.toggle('is-active');
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
            //console.log(index + ": " + originalTarget + "->" + value + "->" + target + "=" + totalValue);
        }
    });
    return totalValue;
}
function parseInputToSankey(input) {
    let lines = [...new Set(input.split("\n"))];

    let nodeKeys = [];
    let nodesList = [];
    let linksList = [];

    let precision = sankeyPrecisionSetting.value;

    lines.forEach(line => {
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
            "value": sankeyHideZerosSetting.checked ? parseFloat(value).toFixed(precision).replace(zerosRegex, "") : parseFloat(value).toFixed(precision),
            "color": color in CSS3_NAMES_TO_HEX ? CSS3_NAMES_TO_HEX[color] : (color !== undefined && color.startsWith("#")) ? color : getColor(source)
        });
    });

    return {
        nodes: nodesList,
        links: linksList
    };
}

function redraw() {
    let graph = parseInputToSankey(sankeyInput.value);
    layout(graph);

    sankeySvg
        .datum(graph)
        .datum(layout.scale(null))
        .transition().duration(1000).ease(d3.easeCubic)
        .call(diagram);
}

function processInput() {
    let graph = parseInputToSankey(sankeyInput.value);

    sankeyBox = document.getElementById("sankey-box");
    sankeySvg = d3.select("#sankey-svg");

    let precision = sankeyPrecisionSetting.value;

    layout = d3.sankey()
        .size([1920, 1080])
        .linkValue(function (d) {
            return d.value;
        });

    diagram = d3.sankeyDiagram()
        .nodeValue(function (d) {
            if(d.incoming.length > 0) {
                let incomingValue = 0.0;
                d.incoming.forEach(incomingNode => {
                    incomingValue += parseFloat(incomingNode.value);
                });
                return sankeyHideZerosSetting.checked ? incomingValue.toFixed(precision).replace(zerosRegex, "") : incomingValue.toFixed(precision)
            } else {
                return sankeyHideZerosSetting.checked ? d.value.toFixed(precision).replace(zerosRegex, "") : d.value.toFixed(precision)
            }
        })
        .nodeTitle(function (d) {
            return d.id;
        })
        .nodeTooltip(function (d) {
            let outgoingValue = 0.0, incomingValue = 0.0;
            d.outgoing.forEach(outgoingNode => {
                outgoingValue += parseFloat(outgoingNode.value);
            });
            d.incoming.forEach(incomingNode => {
                incomingValue += parseFloat(incomingNode.value);
            });

            if(d.outgoing.length > 0 && d.incoming.length > 0 && (Math.abs(outgoingValue) !== Math.abs(incomingValue))) {
                return (sankeyHideZerosSetting.checked ? d.value.toFixed(precision).replace(zerosRegex, "") : d.value.toFixed(precision)) + "\ndifference: " + (parseFloat(incomingValue) - parseFloat(outgoingValue)).toFixed(precision);
            } else {
                return (sankeyHideZerosSetting.checked ? d.value.toFixed(precision).replace(zerosRegex, "") : d.value.toFixed(precision));
            }
        })
        .linkMinWidth(function (d) {
            return 2.5;
        })
        .linkColor(function (d) {
            return d.color;
        })
        .margins({top: 0, right: 0, bottom: 0, left: 10});

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

if(findGetParameter("content") !== null) {
    deserializeData(findGetParameter("content"));
}

processInput();
