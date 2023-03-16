import * as MyUnity from "./myUnity.js";
import * as THREE from "three";
import * as CANNON from "cannon";
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
let renderScene;
let renderer;
let camera;
let physicsScene;
let logicScene;
//let orbitControls: OrbitControls;
//创建一个视角控制器
Init();
function Init() {
    InitRenderScene();
    InitPhysicsScene();
    InitLogicScene();
} //初始化场景
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
    //orbitControls = new OrbitControls(camera, renderer.domElement);
} //初始化渲染场景
function InitPhysicsScene() {
    physicsScene = new CANNON.World();
    //创建一个物理场景
    physicsScene.gravity.set(0, -9.82, 0);
    //为物理场景设置重力
    physicsScene.broadphase = new CANNON.SAPBroadphase(physicsScene);
    physicsScene.allowSleep = true;
} //初始化物理场景
function InitLogicScene() {
    logicScene = new MyUnity.Scene();
    MyUnity.MeshRenderer.scene = renderScene;
    MyUnity.PhysicsBody.world = physicsScene;
} //初始化逻辑场景
function BuildScene() {
    var dLight = new THREE.DirectionalLight(0xffffff);
    //创建一个平行光源
    dLight.position.set(0, 10, 10);
    dLight.castShadow = true;
    renderScene.add(dLight);
    dLight.shadow.camera.top = 10;
    var ambient = new THREE.AmbientLight(0xf0f0f0);
    //创建环境光	    
    renderScene.add(ambient);
    const defaultMaterial = new CANNON.Material('default');
    const defalutContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
        friction: 0.1,
        restitution: 0.4,
    });
    physicsScene.addContactMaterial(defalutContactMaterial);
    //给world的contactMaterial，用来描述两个物理材料相撞时的系数
    const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        side: THREE.DoubleSide,
        roughness: 0.2,
        metalness: 0.1,
    });
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeShape = new CANNON.Plane();
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereShape = new CANNON.Sphere(1);
    let plane = MyUnity.GameObject.CreateInstance();
    let planeMeshRenderer = plane.AddComponent(MyUnity.MeshRenderer);
    planeMeshRenderer.mesh = new THREE.Mesh(planeGeometry, material);
    planeMeshRenderer.mesh.receiveShadow = true;
    plane.transform.rotation.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 2);
    let planePhysicsBody = plane.AddComponent(MyUnity.PhysicsBody);
    planePhysicsBody.body = new CANNON.Body({
        mass: 0,
        shape: planeShape,
        material: defaultMaterial,
    });
    let sphere = MyUnity.GameObject.CreateInstance();
    let sphereMeshRender = sphere.AddComponent(MyUnity.MeshRenderer);
    sphereMeshRender.mesh = new THREE.Mesh(sphereGeometry, material);
    sphereMeshRender.mesh.castShadow = true;
    let spherePhysicsBody = sphere.AddComponent(MyUnity.PhysicsBody);
    spherePhysicsBody.body = new CANNON.Body({
        mass: 1,
        shape: sphereShape,
        material: defaultMaterial,
    });
    sphere.transform.position.set(0, 10, 0);
} //构建场景
function FixedUpdate() {
    physicsScene.step(1 / 50);
    logicScene.FixedUpdate();
}
function Update() {
    logicScene.Update();
    requestAnimationFrame(Update);
    //使渲染器能够在每次屏幕刷新时对场景进行绘制的循环函数
    renderer.render(renderScene, camera);
    //orbitControls.update();
}
BuildScene();
Update();
setInterval(FixedUpdate, 20);
