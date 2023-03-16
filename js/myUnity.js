import * as THREE from "three";
export class Scene {
    constructor() {
        this.gameObjects = [];
        GameObject.scene = this;
    }
    ;
    Update() {
        this.gameObjects.forEach(element => {
            element.components.forEach(component => {
                if (!component.isStarted) {
                    component.Start();
                    component.isStarted = true;
                }
                component.Update();
            });
        });
    }
    ;
    FixedUpdate() {
        this.gameObjects.forEach(element => {
            element.components.forEach(component => {
                component.FixedUpdate();
            });
        });
    }
    ;
}
export class GameObject {
    constructor() {
        this.transform = new Transform(this);
        this.components = [];
        this.childs = [];
    }
    static CreateInstance() {
        let instance = new GameObject();
        GameObject.scene.gameObjects.push(instance);
        return instance;
    }
    static Destroy(gameObject) {
        let index = GameObject.scene.gameObjects.indexOf(gameObject);
        if (index > -1) {
            gameObject.components.forEach(element => {
                element.OnDisable();
            });
            GameObject.scene.gameObjects.splice(index, 1);
        }
    }
    SetParent(parent) {
        parent.childs.push(this);
    }
    AddComponent(type) {
        let component = new type();
        this.components.push(component);
        component.gameObject = this;
        component.transform = this.transform;
        return component;
    }
}
export class Component {
    constructor() {
        this.isStarted = false;
    }
    Start() { }
    ;
    Update() { }
    ;
    FixedUpdate() { }
    ;
    OnDisable() { }
    ;
}
export class Transform {
    constructor(gameObject) {
        this.gameObject = gameObject;
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Quaternion();
        this.scale = new THREE.Vector3(1, 1, 1);
        this.localPosition = new THREE.Vector3();
        this.localRotation = new THREE.Quaternion();
        this.LocalScale = new THREE.Vector3(1, 1, 1);
    }
}
export class MeshRenderer extends Component {
    Start() {
        if (MeshRenderer.scene != undefined && this.mesh != undefined) {
            MeshRenderer.scene.add(this.mesh);
        }
    }
    Update() {
        if (this.mesh && this.transform != undefined) {
            this.mesh.position.copy(this.transform.position);
            this.mesh.quaternion.copy(this.transform.rotation);
            this.mesh.scale.copy(this.transform.scale);
        }
    }
    OnDisable() {
        if (MeshRenderer.scene != undefined && this.mesh != undefined) {
            MeshRenderer.scene.remove(this.mesh);
        }
    }
}
export class PhysicsBody extends Component {
    Start() {
        if (PhysicsBody.world != undefined && this.body != undefined) {
            PhysicsBody.world.addBody(this.body);
        }
    }
    Update() {
        if (this.body != undefined && this.transform != undefined) {
            this.body.position.set(this.transform.position.x, this.transform.position.y, this.transform.position.z);
            this.body.quaternion.set(this.transform.rotation.x, this.transform.rotation.y, this.transform.rotation.z, this.transform.rotation.w);
        }
    }
    FixedUpdate() {
        if (this.body != undefined && this.transform != undefined) {
            this.transform.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
            this.transform.rotation.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
        }
    }
    OnDisable() {
        if (PhysicsBody.world != undefined && this.body != undefined) {
            PhysicsBody.world.remove(this.body);
        }
    }
}
