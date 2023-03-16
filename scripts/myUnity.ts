import * as THREE from "three"
import * as CANNON from "cannon"
export class Scene {
    gameObjects: GameObject[];
    constructor() {
        this.gameObjects = [];
        GameObject.scene = this;
    };
    Update(): void {
        this.gameObjects.forEach(element => {
            element.components.forEach(component => {
                if (!component.isStarted) {
                    component.Start();
                    component.isStarted = true;
                }
                component.Update();
            });
        });
    };
    FixedUpdate(): void {
        this.gameObjects.forEach(element => {
            element.components.forEach(component => {
                component.FixedUpdate();
            });
        });
    };
}
export class GameObject {
    readonly transform: Transform;
    readonly components: Component[];
    readonly childs: GameObject[];
    static scene: Scene;
    constructor() {
        this.transform = new Transform(this);
        this.components = [];
        this.childs = [];
    }
    static CreateInstance(): GameObject {
        let instance = new GameObject();
        GameObject.scene.gameObjects.push(instance);
        return instance;
    }
    static Destroy(gameObject: GameObject) {
        let index = GameObject.scene.gameObjects.indexOf(gameObject);
        if (index > -1) {
            gameObject.components.forEach(element => {
                element.OnDisable();
            });
            GameObject.scene.gameObjects.splice(index, 1);
        }
    }
    SetParent(parent: GameObject) {
        parent.childs.push(this);
    }
    AddComponent<T extends Component>(type: (new () => T)): T {
        let component = new type();
        this.components.push(component);
        component.gameObject = this;
        component.transform = this.transform;
        return component;
    }
}
export abstract class Component {
    isStarted: boolean = false;
    gameObject: GameObject | undefined;
    transform: Transform | undefined;
    Start(): void { };
    Update(): void { };
    FixedUpdate(): void { };
    OnDisable(): void { };
}
export class Transform {
    gameObject: GameObject;
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
    scale: THREE.Vector3;
    localPosition: THREE.Vector3;
    localRotation: THREE.Quaternion;
    LocalScale: THREE.Vector3;
    constructor(gameObject: GameObject) {
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
    static scene: THREE.Scene;
    mesh: THREE.Mesh | undefined;
    Start(): void {
        if (MeshRenderer.scene != undefined && this.mesh != undefined) {
            MeshRenderer.scene.add(this.mesh);
        }
    }
    Update(): void {
        if (this.mesh && this.transform != undefined) {
            this.mesh.position.copy(this.transform.position);
            this.mesh.quaternion.copy(this.transform.rotation);
            this.mesh.scale.copy(this.transform.scale);
        }
    }
    OnDisable(): void {
        if (MeshRenderer.scene != undefined && this.mesh != undefined) {
            MeshRenderer.scene.remove(this.mesh);
        }
    }
}
export class PhysicsBody extends Component {
    static world: CANNON.World;
    body: CANNON.Body | undefined;
    Start(): void {
        if (PhysicsBody.world != undefined && this.body != undefined) {
            PhysicsBody.world.addBody(this.body);
        }
    }
    Update(): void {
        if (this.body != undefined && this.transform != undefined) {
            this.body.position.set(
                this.transform.position.x,
                this.transform.position.y,
                this.transform.position.z);
            this.body.quaternion.set(
                this.transform.rotation.x,
                this.transform.rotation.y,
                this.transform.rotation.z,
                this.transform.rotation.w);
        }
    }
    FixedUpdate(): void {
        if (this.body != undefined && this.transform != undefined) {
            this.transform.position.set(
                this.body.position.x,
                this.body.position.y,
                this.body.position.z);
            this.transform.rotation.set(
                this.body.quaternion.x,
                this.body.quaternion.y,
                this.body.quaternion.z,
                this.body.quaternion.w
            )
        }
    }
    OnDisable(): void {
        if (PhysicsBody.world != undefined && this.body != undefined) {
            PhysicsBody.world.remove(this.body);
        }
    }
}