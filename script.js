import * as THREE from "three";
import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

let speed=13,spikes=.36,processing=.8;
//canvas
const canvas = document.querySelector("#webgl")

//シーン
const scene = new THREE.Scene();

//サイズ
const sizes = {
  width: innerWidth,
  height: innerHeight
}

//カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.z = 3;

//コントローラー
const controls = new OrbitControls(camera,canvas);

// 滑らかにカメラコントローラーを制御する
controls.enableDamping = true;
controls.dampingFactor = 0.2;

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  //alpha:true
});
renderer.setSize(sizes.width,sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//オブジェクトを作成
const geometry = new THREE.SphereGeometry(1.5, 128, 128);
const positionAttributeBase = geometry.getAttribute( 'position' ).clone();//頂点を操作する用のクローンを作成
const material = new THREE.MeshPhongMaterial({
    //wireframe: true,
    color: 0xffffff,
  });

//影の描画を有効化
renderer.shadowMap.enabled = true;

//ライトを追加
let lightTop = new THREE.HemisphereLight(0xffffff, 1);
lightTop.position.set(1, 1, 4);
scene.add(lightTop);

//UI
const gui = new GUI();
let propsObject = {
  Speed: 13,
  Spikes:.36,
  Processing:.8
};

gui.add(propsObject,'Speed',5,120,1).onChange(newValue =>{
  speed = newValue;
});

gui.add(propsObject,'Spikes',0.03,2,0.05).onChange(newValue =>{
  spikes = newValue;
});
gui.add(propsObject,'Processing',0.3,2.4,0.01).onChange(newValue =>{
  processing = newValue;
});

//オブジェクトをシーンに追加
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

//SimplexNoise
const simplex = new SimplexNoise();
//3Dベクトルを表すコンテナを作成
const vector = new THREE.Vector3();

//リサイズ
function resize() {
  let width = innerWidth;
  let height = innerHeight;
  renderer.setSize( width, height );
  camera.aspect = width / height;		
  camera.updateProjectionMatrix();
};

window.addEventListener( "resize", resize );


let update = () => {
  //基準を指定
  let time = performance.now() * 0.00001 * speed * Math.pow(processing, 3),
      _spikes = spikes * processing;
  const positionAttribute = geometry.getAttribute('position');
  for(let i = 0; i < positionAttributeBase.count; i++) { 
      vector.fromBufferAttribute(positionAttributeBase, i);//頂点を取り出す
      const noise = simplex.noise3d(vector.x * _spikes, vector.y * _spikes, vector.z * _spikes + time);
      const ratio = noise * 0.05 + 0.98;
      vector.multiplyScalar(ratio);//ベクトルの各要素をratio乗する
      positionAttribute.setXYZ(i, vector.x, vector.y, vector.z)//頂点座標を更新
  }
  sphere.geometry.attributes.position.needsUpdate = true;//頂点座標が変更されたことをThree.jsに通知
  sphere.geometry.computeVertexNormals();//法線ベクトルを計算
}

//アニメーション
const tick = () => {
  update();
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();