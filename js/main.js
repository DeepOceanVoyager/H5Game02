import * as THREE from 'three';
import * as CANNON from 'cannon';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const objects = [];

const scene = new THREE.Scene();
//创建一个渲染场景

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 8);
camera.lookAt(0, 0, 0);
//创建一个透视相机，视野角度75度，长宽比与屏幕一致，近裁面是0.1，远裁面是1000

const renderer = new THREE.WebGLRenderer();
//创建一个WebGL渲染器
renderer.setSize(window.innerWidth, window.innerHeight);
//设置渲染器的尺寸，尺寸与屏幕一致
renderer.setClearColor(0x0f0f0f, 1);
//设置渲染器背景颜色
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
//将renderer的dom元素（renderer.domElement）添加到HTML中

const orbitControls = new OrbitControls(camera, renderer.domElement);
//创建一个视角控制器

//var axisHelper = new THREE.AxesHelper(1000);
//创建辅助坐标系
//scene.add(axisHelper);

var dLight = new THREE.DirectionalLight(0xffffff);
//创建一个平行光源
dLight.position.set(0, 10, 10);
dLight.castShadow = true
scene.add(dLight);
dLight.shadow.camera.top = 10;

var ambient = new THREE.AmbientLight(0xf0f0f0);
//创建环境光	    
scene.add(ambient);

const world = new CANNON.World();
//创建一个物理场景
world.gravity.set(0, -9.82, 0);
//为物理场景设置重力
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

const defaultMaterial = new CANNON.Material('default');
const defalutContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.4,
    }
);
world.addContactMaterial(defalutContactMaterial);
//给world的contactMaterial

const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    side: THREE.DoubleSide,
    roughness: 0.2,
    metalness: 0.1,
});

const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMesh = new THREE.Mesh(planeGeometry, material);
planeMesh.receiveShadow = true;
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({
    mass: 0,
    shape: planeShape,
    position: new CANNON.Vec3(0, 0, 0),
    material: defaultMaterial,
});
planeBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI / 2
);
scene.add(planeMesh);
world.addBody(planeBody);
objects.push({
    mesh: planeMesh,
    body: planeBody,
});

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMesh = new THREE.Mesh(sphereGeometry, material);
sphereMesh.castShadow = true
const sphereShape = new CANNON.Sphere(1);
const sphereBody = new CANNON.Body({
    mass: 1,
    shape: sphereShape,
    position: new CANNON.Vec3(0, 20, 0),
    material: defaultMaterial,
});
scene.add(sphereMesh);
world.addBody(sphereBody);
objects.push({
    mesh: sphereMesh,
    body: sphereBody,
});

function fixedUpdate() {
    world.step(1 / 50);
}
//setInterval(fixedUpdate, 20);

const clock = new THREE.Clock();
let oldElapsedTime = 0;
function animate() {
    const time = clock.getElapsedTime();
    let deltaTime = time - oldElapsedTime;
    oldElapsedTime = time;

    world.step(1 / 60, deltaTime, 3);

    objects.forEach(e => {
        e.mesh.position.copy(e.body.position)
        e.mesh.quaternion.copy(e.body.quaternion)
    })

    requestAnimationFrame(animate);
    //使渲染器能够在每次屏幕刷新时对场景进行绘制的循环函数
    renderer.render(scene, camera);

    orbitControls.update();
}
animate();