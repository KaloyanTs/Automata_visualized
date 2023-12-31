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
const minButton = document.getElementById("minimize");
const displayResult = document.getElementById("result");
deltaInput.setAttribute("style", "height:" + (deltaInput.scrollHeight) + "px;overflow-y:hidden;");
deltaInput.addEventListener("input", OnInput, false);
deltaInput.style.height = 0;
deltaInput.style.height = (deltaInput.scrollHeight) + "px";
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const speedSlider = document.getElementById("speed");

class Automaton {
    constructor() {
        this.states = undefined;
        this.delta = undefined;
        this.alpha = undefined;
        this.positions = undefined;
        this.indexToLetter = undefined;
        this.indexToState = undefined;
        this.currentState = undefined;
        this.finalStates = undefined;
        this.initialState = undefined;
        this.graph = undefined;
    }
}

var A = undefined;

function OnInput() {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
}

document.getElementById("animation").addEventListener('change', (event) => {
    document.getElementById("check").disabled = !document.getElementById("animation").checked;
    document.getElementById("speed").disabled = !document.getElementById("animation").checked;
    if (!document.getElementById("animation").checked) {
        checkFast();
    }
})

speedSlider.onmouseover = () => { speedSlider.title = speedSlider.value / 1000 + " sec"; }
speedSlider.onmousedown = () => { speedSlider.title = speedSlider.value / 1000 + " sec"; }
speedSlider.onmouseup = () => { speedSlider.title = speedSlider.value / 1000 + " sec"; }
speedSlider.onclick = () => { speedSlider.title = speedSlider.value / 1000 + " sec"; }
speedSlider.oninput = () => { speedSlider.title = speedSlider.value / 1000 + " sec"; }

var wordInput = document.getElementById("word");
wordInput.oninput = function () {
    if (wordInput.value.length > 0 && (typeof A == 'undefined' || !A.alpha.has(wordInput.value.slice(-1))))
        wordInput.value = wordInput.value.slice(0, -1);
    else if (!document.getElementById("animation").checked)
        checkFast();
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
    A.indexToLetter = [];
    for (l of alpha) {
        if (!A.alpha.has(l)) {
            A.alpha.set(l, letterCount);
            A.indexToLetter.push(l);
            ++letterCount;
        }
    }
}

document.getElementById("final").oninput = getFinal;

function getFinal() {
    const txt = document.getElementById("final").value;
    var comma = (txt.slice(-1) == ",");
    var f = txt.split(",");
    for (let i = 0; i < f.length; i++) {
        f[i] = f[i].trim();
    }
    f = f.filter((str) => str != "");
    document.getElementById("final").value = f;
    if (comma) {
        document.getElementById("final").value += ",";
    }
    if (typeof A == 'undefined') return;
    A.finalStates = new Set();
    for (l of f) {
        A.finalStates.add(l);
    }
}

function getInitial() {
    A.initialState = document.getElementById("initial").value;
    if (!A.states.has(A.initialState))
        throw "Automaton does not have a valid initial state...";
}


function buildAutomata() {
    A = new Automaton();
    try {
        getAlpha();
        getFinal();
        var lines = deltaInput.value.split("\n");
        A.states = new Map();
        A.indexToState = [];
        var stateIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split("-");
            if (lines[i].length != 3) { alert("bad delta function..."); A.states = undefined; return; }
            for (let j = 0; j < lines[i].length; j++) {
                lines[i][j] = lines[i][j].trim();
                if (j < 2) {
                    if (!A.states.has(lines[i][j])) {
                        A.states.set(lines[i][j], stateIndex);
                        A.indexToState.push(lines[i][j]);
                        ++stateIndex;
                    }
                }
            }
        }
        getInitial();
    } catch (error) {
        alert(error);
        A = undefined;
        displayResult.innerHTML = "No automaton";
        return;
    }

    var angle = 2 * Math.PI / A.states.size;
    A.positions = new Map();
    let i = 0;
    for (st of A.states) {
        A.positions.set(st[0], [Math.cos(i * angle), Math.sin(i * angle)]);
        ++i;
    }

    A.delta = new Array(A.states.size);
    A.graph = new Array(A.states.size);
    for (let i = 0; i < A.delta.length; i++) {
        A.delta[i] = new Array(A.alpha.size);
        A.graph[i] = new Array(A.states.size);
        for (let j = 0; j < A.graph[i].length; j++) {
            A.graph[i][j] = [];
        }
    }

    var ruleCount = 0;
    for (const line of lines) {
        if (typeof A.delta[A.states.get(line[0])][A.alpha.get(line[2])] === 'undefined') ++ruleCount;
        A.delta[A.states.get(line[0])][A.alpha.get(line[2])] = A.states.get(line[1]);
        A.graph[A.states.get(line[0])][A.states.get(line[1])].push(A.alpha.get(line[2]));
    }
    if (ruleCount != A.states.size * A.alpha.size) {
        alert("bad delta function...\nautomaton is not a DFA...");
        A = undefined;
        return;
    }

    drawScene();

    if (!document.getElementById("animation").checked)
        checkFast();
}

document.getElementById("build").onclick = buildAutomata;

// check word --------------------------------------------------------------------------------------------------

document.getElementById("check").onclick = async () => {
    displayResult.innerHTML = "checking...";
    displayResult.style.color = "black";
    var word = document.getElementById("word").value;
    A.currentState = A.states.get(A.initialState);
    var save = A.currentState;
    drawScene();
    await sleep(speedSlider.value);
    for (const a of word) {
        if (!A.alpha.has(a)) {
            A.currentState = undefined;
            break;
        }
        A.currentState = undefined;
        drawScene();
        await sleep(speedSlider.value / 4);
        A.currentState = A.delta[save][A.alpha.get(a)];
        save = A.currentState;
        drawScene();
        await sleep(speedSlider.value);
    }
    drawScene();
    await sleep(speedSlider.value / 2);
    var res = A.finalStates.has(A.indexToState[A.currentState]);
    if (res) { displayResult.innerHTML = "YES"; displayResult.style.color = "green"; }
    else { displayResult.innerHTML = "NO"; displayResult.style.color = "red"; }
    A.currentState = undefined;
    drawScene();
}

function checkFast() {
    var word = document.getElementById("word").value;
    A.currentState = A.states.get(A.initialState);
    var save = A.currentState;
    for (const a of word) {
        if (!A.alpha.has(a)) {
            A.currentState = undefined;
            break;
        }
        A.currentState = A.delta[A.currentState][A.alpha.get(a)];
    }
    var res = A.finalStates.has(A.indexToState[A.currentState]);
    if (res) { displayResult.innerHTML = "YES"; displayResult.style.color = "green"; }
    else { displayResult.innerHTML = "NO"; displayResult.style.color = "red"; }
}

// minimal automaton

minButton.onclick = minimize;

function minimize() {
    if (typeof A == 'undefined') { alert("No automaton built..."); return; }
    var arr = new Array(A.states.size);
    for (let i = 0; i < arr.length; i++)
        arr[i] = i;
    var ind = new Array(A.states.size);
    for (const st of arr) {
        ind[st] = (A.finalStates.has(A.indexToState[st]) ? 1 : 0);
    }
    arr.sort((a, b) => { return ind[a] - ind[b]; });
    var buf = new Array(A.states.size);
    for (let i = 0; i < A.states.size * A.alpha.size; i++) {
        arr.sort((a, b) => { return ind[A.delta[a][i % A.alpha.size]] - ind[A.delta[b][i % A.alpha.size]] });
        var c = 0;
        for (let j = 0; j < ind.length - 1; j++) {
            buf[j] = c;
            if (ind[arr[j]] != ind[arr[j + 1]] || ind[A.delta[arr[j]][i % A.alpha.size]] != ind[A.delta[arr[j + 1]][i % A.alpha.size]])
                ++c;
        }
        buf[ind.length - 1] = c;
        ind = JSON.parse(JSON.stringify(buf));
    }

    B = new Automaton();
    B.initialState = ind[A.states.get(A.initialState)];

    B.finalStates = new Set();
    for (const st of A.finalStates) {
        B.finalStates.add(ind[A.states.get(st)]);
    }

    B.states = new Map();
    for (let i = 0; i < ind.length; i++)
        B.states.set(ind[i], ind[i]);

    B.alpha = new Map(A.alpha);

    var angle = 2 * Math.PI / B.states.size;
    B.positions = new Map();
    let i = 0;
    for (st of B.states) {
        B.positions.set(st[0], [Math.cos(i * angle), Math.sin(i * angle)]);
        ++i;
    }

    B.delta = new Array(B.states.size);
    B.graph = new Array(B.states.size);
    for (let i = 0; i < B.delta.length; i++) {
        B.delta[i] = new Array(B.alpha.size);
        B.graph[i] = new Array(B.states.size);
        for (let j = 0; j < B.graph[i].length; j++) {
            B.graph[i][j] = [];
        }
    }

    B.indexToLetter = JSON.parse(JSON.stringify(A.indexToLetter));

    for (let i = 0; i < A.states.size; i++)
        for (let a = 0; a < A.alpha.size; a++) {
            B.delta[ind[i]][a] = ind[A.delta[i][a]];
            B.graph[ind[i]][B.delta[ind[i]][a]].push(a);
            B.graph[ind[i]][B.delta[ind[i]][a]] = B.graph[ind[i]][B.delta[ind[i]][a]]
                .filter((element, index) => {
                    return B.graph[ind[i]][B.delta[ind[i]][a]].indexOf(element) === index;
                });
        }

    //todo print to check for errors

    B.indexToState = new Array(B.states.size);
    for (const st of B.states) {
        B.indexToState[st[1]] = st[0];
    }

    A = B;
    drawScene();
}

// geometry functions -------------------------------------------------------------------------------------------

function rotateVector(v, angle) {
    var aux = [Math.cos(angle), Math.sin(angle)];
    return [v[0] * aux[0] - v[1] * aux[1], v[0] * aux[1] + v[1] * aux[0]];
}

function distance2D(A, B) {
    return Math.sqrt((A[0] - B[0]) * (A[0] - B[0]) + (A[1] - B[1]) * (A[1] - B[1]));
}

function getRandomInt(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}

//end of geometries ---------------------------------------------------------------------------------------------

// drawing functions --------------------------------------------------------------------------------------------

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
    for (let i = 0; i < A.graph.length; i++) {
        for (let j = 0; j < A.graph[i].length; j++) {
            drawTransition(i, j);
            //todo letter badly working
        }
    }
}

function drawState(name, posX, posY) {
    var f = A.finalStates.has(name);
    var i = A.initialState == name;
    posX = w / 2 + posX * (Math.min(w, h) - 80) / 2;
    posY = h / 2 - posY * (Math.min(w, h) - 80) / 2;
    ctx.beginPath();
    if (typeof A.currentState != 'undefined' && A.indexToState[A.currentState] == name) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 6;
    }
    else if (i) ctx.strokeStyle = "red";
    ctx.arc(posX, posY, 20, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    if (f) {
        ctx.beginPath();
        ctx.arc(posX, posY, 15, 0, 2 * Math.PI);
        ctx.stroke();
    }
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillText(name, posX, posY);
}

function drawTransition(from, to) {
    if (A.graph[from][to].length == 0) return;
    var letter = A.graph[from][to].map(a => A.indexToLetter[a]).join(",");
    var fromPosX = w / 2 + A.positions.get(A.indexToState[from])[0] * (Math.min(w, h) - 80) / 2;
    var fromPosY = h / 2 - A.positions.get(A.indexToState[from])[1] * (Math.min(w, h) - 80) / 2;
    var toPosX = w / 2 + A.positions.get(A.indexToState[to])[0] * (Math.min(w, h) - 80) / 2;
    var toPosY = h / 2 - A.positions.get(A.indexToState[to])[1] * (Math.min(w, h) - 80) / 2;
    var dir = [toPosX - fromPosX, toPosY - fromPosY];
    var len = distance2D([0, 0], dir);
    dir[0] = dir[0] / len * 20;
    dir[1] = dir[1] / len * 20;
    var dirRotPlus = rotateVector(dir, Math.PI / 6);
    var dirRotMinus = rotateVector(dir, -Math.PI / 6);
    if (from != to)
        drawArrow(ctx, fromPosX + dirRotMinus[0], fromPosY + dirRotMinus[1], toPosX - dirRotPlus[0], toPosY - dirRotPlus[1], 0.97);
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    if (from != to) {
        ctx.fillText(letter, (fromPosX + toPosX + dirRotMinus[0] - dirRotPlus[0]) / 2 + dir[1] / 2,
            (fromPosY + toPosY + dirRotMinus[1] - dirRotPlus[1]) / 2 - dir[0] / 2);
    }
    else {
        ctx.fillText(letter, fromPosX, fromPosY + 8);
    }
    ctx.strokeStyle = 'black';
}

const drawArrow = (context, x1, y1, x2, y2, t = 0.9) => {
    const arrow = {
        dx: x2 - x1,
        dy: y2 - y1
    };
    const middle = {
        x: arrow.dx * t + x1,
        y: arrow.dy * t + y1
    };
    const tip = {
        dx: x2 - middle.x,
        dy: y2 - middle.y
    };
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(middle.x, middle.y);
    context.moveTo(middle.x + 0.5 * tip.dy, middle.y - 0.5 * tip.dx);
    context.lineTo(middle.x - 0.5 * tip.dy, middle.y + 0.5 * tip.dx);
    context.lineTo(x2, y2);
    context.closePath();
    context.stroke();
};

//end of drawing functions -----------------------------------------------------------------------------------------