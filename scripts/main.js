"use strict";

import * as THREE from 'three';
import * as CANNON from 'cannon';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let objects;
let renderScene;
let renderer;
let camera;
let physicsScene;

Init();

function Init() {
    InitRenderScene();
    InitPhysicsScene();
    InitLogicScene();
}
function InitRenderScene() {
    renderScene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 0, 0);
    //创建一个透视相机，视野角度75度，长宽比与屏幕一致，近裁面是0.1，远裁面是1000

    renderer = new THREE.WebGLRenderer();
    //创建一个WebGL渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
    //设置渲染器的尺寸，尺寸与屏幕一致
    renderer.setClearColor(0x0f0f0f, 1);
    //设置渲染器背景颜色
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    //将renderer的dom元素（renderer.domElement）添加到HTML中
}
function InitLogicScene() {
    objects = [];
}
function InitPhysicsScene() {
    physicsScene = new CANNON.World();
    //创建一个物理场景
    physicsScene.gravity.set(0, -9.82, 0);
    //为物理场景设置重力
    physicsScene.broadphase = new CANNON.SAPBroadphase(physicsScene);
    physicsScene.allowSleep = true;
}

var dLight = new THREE.DirectionalLight(0xffffff);
//创建一个平行光源
dLight.position.set(0, 10, 10);
dLight.castShadow = true
renderScene.add(dLight);
dLight.shadow.camera.top = 10;

var ambient = new THREE.AmbientLight(0xf0f0f0);
//创建环境光	    
renderScene.add(ambient);

const defaultMaterial = new CANNON.Material('default');
const defalutContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.4,
    }
);
physicsScene.addContactMaterial(defalutContactMaterial);
//给world的contactMaterial，用来描述两个物理材料相撞时的系数

const orbitControls = new OrbitControls(camera, renderer.domElement);
//创建一个视角控制器

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
renderScene.add(planeMesh);
physicsScene.addBody(planeBody);
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
renderScene.add(sphereMesh);
physicsScene.addBody(sphereBody);
objects.push({
    mesh: sphereMesh,
    body: sphereBody,
});

function fixedUpdate() {
    physicsScene.step(1 / 50);
}
setInterval(fixedUpdate, 20);

function animate() {
    objects.forEach(e => {
        e.mesh.position.copy(e.body.position)
        e.mesh.quaternion.copy(e.body.quaternion)
    })

    requestAnimationFrame(animate);
    //使渲染器能够在每次屏幕刷新时对场景进行绘制的循环函数
    renderer.render(renderScene, camera);

    orbitControls.update();
}
animate();