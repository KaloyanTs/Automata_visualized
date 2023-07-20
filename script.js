var canvas = document.getElementById("field");
var h = canvas.height,
    w = canvas.width;
var ctx = canvas.getContext("2d");
ctx.fillStyle = 'black';
ctx.strokeStyle = 'black';
ctx.lineWidth = 3;
const count=6;
var alpha;


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
{}

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
    ctx.clearRect(0,0,canvas.width,canvas.height)
    pArray.forEach(element => {
        element.draw();
    });
}

drawScene();