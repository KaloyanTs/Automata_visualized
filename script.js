var canvas = document.getElementById("field");
var h = canvas.height,
    w = canvas.width;
var ctx = canvas.getContext("2d");
ctx.fillStyle = 'black';
ctx.strokeStyle = 'black';
ctx.lineWidth = 3;
const count = 6;
var alpha;
const deltaInput = document.getElementById("delta");
deltaInput.setAttribute("style", "height:" + (deltaInput.scrollHeight) + "px;overflow-y:hidden;");
deltaInput.addEventListener("input", OnInput, false);

class Automaton {
    constructor() {
        this.states = undefined;
        this.delta = undefined;
        this.alpha = undefined;
        this.positions = undefined;
    }
}

var A = new Automaton();

function OnInput() {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
}


document.getElementById("alphabet").oninput = getAlpha;

function getAlpha() {
    const txt = document.getElementById("alphabet").value;
    var comma = (txt.slice(-1) == ",");
    alpha = txt.split(",");
    for (let i = 0; i < alpha.length; i++) {
        alpha[i] = alpha[i].trim();
    }
    alpha = alpha.filter((str) => str != "");
    document.getElementById("alphabet").value = alpha;
    if (comma) {
        document.getElementById("alphabet").value += ",";
    }
    A.alpha = new Map();
    var letterCount = 0;
    for (l of alpha) {
        if (!A.alpha.has(l)) {
            A.alpha.set(l, letterCount);
            ++letterCount;
        }
    }
}

function buildAutomata() {
    getAlpha();
    var lines = deltaInput.value.split("\n");
    A.states = new Map();
    var stateIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].split("-");
        if (lines[i].length != 3) { alert("bad delta function..."); A.states = undefined; return; }
        for (let j = 0; j < lines[i].length; j++) {
            lines[i][j] = lines[i][j].trim();
            if (j < 2) {
                if (!A.states.has(lines[i][j])) {
                    A.states.set(lines[i][j], stateIndex);
                    ++stateIndex;
                }
            }
        }
    }

    var angle = 2 * Math.PI / A.states.size;
    A.positions = new Map();
    let i = 0;
    for (st of A.states) {
        A.positions.set(st[0], [Math.cos(i * angle), Math.sin(i * angle)]);
        ++i;
    }

    A.delta = new Array(A.states.size);
    for (let i = 0; i < A.delta.length; i++) {
        A.delta[i] = new Array(A.alpha.size);
    }

    var ruleCount = 0;
    for (const line of lines) {
        console.log(line);
        if (typeof A.delta[A.states.get(line[0])][A.alpha.get(line[2])] === 'undefined') ++ruleCount;
        A.delta[A.states.get(line[0])][A.alpha.get(line[2])] = A.states.get(line[1]);
        //todo remove console.log("set " + line[0] + "->" + line[2] + "to " + A.delta[A.states.get(line[0])][A.alpha.get(line[2])])
    }
    if (ruleCount != A.states.size * A.alpha.size) {
        alert("bad delta function...\nautomaton is not a DFA...");
        A = new Automaton();
        return;
    }

    drawScene();

    //todo finish -> drawScene
}

document.getElementById("build").onclick = buildAutomata;

document.getElementById("check").onclick = getAlpha;

pArray = [];

function distance2D(A, B) {
    return Math.sqrt((A[0] - B[0]) * (A[0] - B[0]) + (A[1] - B[1]) * (A[1] - B[1]));
}

function getRandomInt(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}

function generatePoints() {
    pArray = [];
    for (let index = 0; index < count; index++) {
        const element = new Point(getRandomInt(-400, 400), getRandomInt(-200, 200));
        pArray.push(element);
    }
    pArray.sort(function (a, b) { return a.x - b.x });
}

function drawScene() {
    if (typeof A.states === 'undefined' || A.states.length == 0) { alert("automata not built yet...\nsome error should be fixed..."); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var angle = 2 * Math.PI / A.states.size;
    let i = 0;
    for (const state of A.states) {
        const pos = A.positions.get(state[0]);
        drawState(state[0], pos[0], pos[1]);
        ++i;
    }
}

function drawState(name, posX, posY) {
    ctx.beginPath();
    posX = w / 2 + posX * (Math.min(w, h) - 50) / 2;
    posY = h / 2 - posY * (Math.min(w, h) - 50) / 2;
    ctx.arc(posX, posY, 20, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillText(name, posX, posY);
}

function drawTransition(from, to, letter)
{
    return;
    //todo 
}

drawState("state1", .5, .5);