var canvas = document.getElementById("field");
var h = canvas.height,
    w = canvas.width;
var ctx = canvas.getContext("2d");
ctx.fillStyle = 'black';
ctx.strokeStyle = 'black';
ctx.lineWidth = 3;
const count=6;
var alpha;
const deltaInput=document.getElementById("delta");
deltaInput.setAttribute("style", "height:" + (deltaInput.scrollHeight) + "px;overflow-y:hidden;");
deltaInput.addEventListener("input", OnInput, false);

function OnInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}

var states=undefined;


document.getElementById("alphabet").oninput=getAlpha;

function getAlpha(){
    const txt=document.getElementById("alphabet").value;
    var comma=(txt.slice(-1)==",");
    alpha=txt.split(",");
    for (let i = 0; i < alpha.length; i++) {
        alpha[i]=alpha[i].trim(); 
    }
    alpha=alpha.filter((str) => str != "");
    console.log(alpha);
    document.getElementById("alphabet").value=alpha;
    if (comma) {
        document.getElementById("alphabet").value+=",";
    }
}

function buildAutomata()
{
    var lines=deltaInput.value.split("\n");
    console.log(lines);
    states=new Set();
    for (let i = 0; i < lines.length; i++) {
        lines[i]=lines[i].split("-");
        if(lines[i].length!=3){alert("bad delta function...");states=undefined;return;}
        for (let j = 0; j < lines[i].length; j++) {
            lines[i][j]=lines[i][j].trim();
            if(j<2)states.add(lines[i][j]);
        }
    }

    console.log(states);

    drawScene();

    //todo build delta function as table
    //todo finish -> drawScene
}

document.getElementById("build").onclick=buildAutomata;

document.getElementById("check").onclick=getAlpha;

pArray=[];

function distance2D(A, B) {
    return Math.sqrt((A[0] - B[0]) * (A[0] - B[0]) + (A[1] - B[1]) * (A[1] - B[1]));
}

function getRandomInt(from,to) {
    return Math.floor(Math.random() * (to-from+1))+from;
}

function generatePoints()
{
    pArray=[];
    for (let index = 0; index < count; index++) {
        const element = new Point(getRandomInt(-400,400),getRandomInt(-200,200));
        pArray.push(element);
    }
    pArray.sort(function(a,b){return a.x-b.x});
}

function drawScene()
{
    if(typeof states === 'undefined'||states.size==0)
    {alert("automata not built yet...\nsome error should be fixed...");return;}
    ctx.clearRect(0,0,canvas.width,canvas.height);
    var angle=2*Math.PI/states.size;
    console.log(angle);
}

function drawState(name,pos)
{

    //todo
}