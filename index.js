import * as THREE from 'three'
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';


//canvas
const canvas = document.querySelector("#Canvas");

//size
const sizes = {
    width: innerWidth,
    height:innerHeight
}

//scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height,0.1,1000);
camera.position.set(0,0,400)
scene.add(camera);

//controls
const controls = new OrbitControls(camera,canvas);
controls.enableDamping = true;
controls.dampimgFactor = 0.2;

//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});

renderer.setSize(sizes.width,sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//sphere
class Phisics{
    constructor(){
        this.position = new THREE.Vector3();
        this.radius = 100;
        this.rad1 = 0;
        this.rad2 = 0;
        this.move = true;
        this.speed = 1;
    }
 
    init(rad1,rad2){
        this.rad1 = rad1;
        this.rad2 = rad2;
        this.setPosition();
    }
 
    setPosition(rad1,rad2){
        const x = Math.cos(this.rad1 ) * Math.cos(this.rad2) * this.radius;
        const y = Math.sin(this.rad1 ) * this.radius;
        const z = Math.cos(this.rad1 ) * Math.sin(this.rad2) * this.radius;
        this.position.set(x,y,z);
    }
 
    updata(){
        if (this.move) {
            this.radius += this.speed;
            if(this.radius == 200) this.move=false
        }else {
            this.radius -= this.speed;
            if(this.radius == 100) this.move=true
        }
        this.setPosition();
    }
}

const phisicsArr = [];
const positionArr = [];
 
for(let i = 0; i < 120; i++){
    for(let j = 0; j < 120; j++){
 
        const phisics = new Phisics();
 
        const rad1 = (i * 5) * Math.PI / 180;
        const rad2 = (j * 5) * Math.PI / 180;
        phisics.init(rad1,rad2);
        phisicsArr.push(phisics);
        positionArr.push(phisics.position);
    }
}

const geometry = new THREE.BufferGeometry().setFromPoints(positionArr);
const material = new THREE.PointsMaterial({
    color:0x47656d,
    size:6,
    transparent:true,
    opacity:0.5,
    blending:THREE.AdditiveBlending,
    depthTest:false
});

const points = new THREE.Points(geometry,material);
scene.add(points);

//resize
function resize() {
    let width = innerWidth;
    let height = innerHeight;
    renderer.setSize( width, height );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

window.addEventListener( "resize", resize );

//updata
function updata() {
    const positions = points.geometry.attributes.position.array;
 
    for(let i = 0; i < phisicsArr.length; i++){
 
        //頂点座標のインスタンスを取得
        const phisics = phisicsArr[i];
 
        positions[i * 3] = phisics.position.x;
        positions[i * 3 + 1] = phisics.position.y;
        positions[i * 3 + 2] = phisics.position.z;
 
        //アニメーション
        phisics.updata();
    }
    points.geometry.attributes.position.needsUpdate = true;
 }

//tick
tick();

function tick(){
    updata();
    controls.update();
    renderer.render(scene,camera);
    window.requestAnimationFrame(tick);
}

