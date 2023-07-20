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
        this.indexToLetter = undefined;
        this.indexToState = undefined;
        this.activeTransition = undefined;
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
    A.indexToLetter = [];
    for (l of alpha) {
        if (!A.alpha.has(l)) {
            A.alpha.set(l, letterCount);
            A.indexToLetter.push(l);
            ++letterCount;
        }
    }
}

function buildAutomata() {
    getAlpha();
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
    for (let i = 0; i < A.delta.length; i++) {
        for (let j = 0; j < A.delta[i].length; j++) {
            drawTransition(A.indexToState[i], A.indexToState[A.delta[i][j]], A.indexToLetter[j]);
            //todo letter badly working
        }
    }
}

function drawState(name, posX, posY) {
    ctx.beginPath();
    posX = w / 2 + posX * (Math.min(w, h) - 80) / 2;
    posY = h / 2 - posY * (Math.min(w, h) - 80) / 2;
    ctx.arc(posX, posY, 20, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillText(name, posX, posY);
}

function drawTransition(from, to, letter) {
    if (A.activeTransition == [from, letter]) { ctx.strokeStyle = "red"; }
    if (from == to) {
        const pos = A.positions.get(from);
        var fromPosX = w / 2 + pos[0] * (Math.min(w, h) - 80) / 2;
        var fromPosY = h / 2 - pos[1] * (Math.min(w, h) - 80) / 2;
        var scaled = [pos[0] * 20, pos[1] * 20];
        ctx.beginPath();
        ctx.arc(fromPosX + scaled[0], fromPosY - scaled[1], 20, 0, 2 * Math.PI);
        //todo a lot of calculations
        // check cases by starting end ending angle
        ctx.stroke();
        console.log(fromPosX, fromPosY);
        return;
    }
    var fromPosX = w / 2 + A.positions.get(from)[0] * (Math.min(w, h) - 80) / 2;
    var fromPosY = h / 2 - A.positions.get(from)[1] * (Math.min(w, h) - 80) / 2;
    var toPosX = w / 2 + A.positions.get(to)[0] * (Math.min(w, h) - 80) / 2;
    var toPosY = h / 2 - A.positions.get(to)[1] * (Math.min(w, h) - 80) / 2;
    var dir = [toPosX - fromPosX, toPosY - fromPosY];
    var len = distance2D([0, 0], dir);
    dir[0] = dir[0] / len * 20;
    dir[1] = dir[1] / len * 20;
    var dirRotPlus = rotateVector(dir, Math.PI / 6);
    var dirRotMinus = rotateVector(dir, -Math.PI / 6);
    drawArrow(ctx, fromPosX + dirRotMinus[0], fromPosY + dirRotMinus[1], toPosX - dirRotPlus[0], toPosY - dirRotPlus[1], 0.97);
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, (fromPosX + toPosX + dirRotMinus[0] - dirRotPlus[0]) / 2 + dir[1] / 2,
        (fromPosY + toPosY + dirRotMinus[1] - dirRotPlus[1]) / 2 - dir[0] / 2);
    
    ctx.strokeStyle='black';
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

drawState("state1", .5, .5);

//end of drawing functions -----------------------------------------------------------------------------------------