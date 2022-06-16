import { StoredCamera } from "./camera";

const storageKey = 'cameras';
let cameras: StoredCamera[] = [];

const section = ui.createProjectPanelSection();
section.add(new ui.Paragraph('Move the camera to an interesting location and click on Save Camera to save the current camera location! You can restore the cameras by click on fly to camera below'))

section.add(new ui.Button(ui.icons.plus, 'Save Camera', async () => {
    const name = new Date().toLocaleString();

    const camera = map.camera.getCurrentCamera();
    const stored = {
        name,
        date: new Date().toISOString(),
        x: camera.x, y: camera.y, z: camera.z, 
        heading: camera.heading, pitch: camera.pitch, roll: camera.roll 
    };

    cameras.push(stored);
    save();

    addCamera(stored);
}));

const cameraContainer = new ui.Container();
section.add(cameraContainer);

const addCamera = (camera: StoredCamera) => {
    const section = new ui.Section(new Date(camera.date).toLocaleString());

    section.createAction(ui.icons.close, 'Remove Camera', async () => {
        cameras.splice(cameras.indexOf(camera), 1);
        save();
        
        cameraContainer.remove(section);
    });

    if (cameraContainer.children[0]) {
        cameraContainer.insertBefore(section, cameraContainer.children[0]);
    } else {
        cameraContainer.add(section);
    }

    const name = new ui.TextField(null, camera.name, 'Name');
    section.add(name);

    name.onValueChange.subscribe(() => {
        camera.name = name.value;
        save();
    });

    section.add(new ui.Button('Fly to camera', () => {
        map.camera.focus(new map.camera.Camera(
            camera.x, camera.y, camera.z, 
            camera.heading, camera.pitch, camera.roll
        ));
    }));
};

const save = () => {
    Storage.user.write(storageKey, cameras);
};

Storage.user.read<StoredCamera[]>(storageKey).then(data => {
    cameras = data || [];

    for (let camera of cameras) {
        addCamera(camera);
    }
});