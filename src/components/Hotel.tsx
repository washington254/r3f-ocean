import { useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAtom } from 'jotai'
import { currentOffsetAtom, sceneAtom } from '../store/CurveStore'
import { AnimationClip, AnimationMixer, Group, LoopRepeat, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const Hotel = () => {
    const [model, setModel] = useState<Group | null>(null)
    const [sceneAt] = useAtom(sceneAtom)
    const [animations, setAnimations] = useState<AnimationClip[]>([])
    const [currentOffset] = useAtom(currentOffsetAtom)

    const t = 10.82
    const t1 = 8.828

    const mixer = useMemo(() => {
        if (!model) return
        return new AnimationMixer(model);
    }, [model])

    const actio = useMemo(() => {
        if (!mixer) return
        return mixer.clipAction(animations[0]);
    }, [mixer, animations])

    const actio1 = useMemo(() => {
        if (!mixer) return
        return mixer.clipAction(animations[1]);
    }, [mixer, animations])

    const actio2 = useMemo(() => {
        if (!mixer) return
        return mixer.clipAction(animations[2]);
    }, [mixer, animations])

    const actio3 = useMemo(() => {
        if (!mixer) return
        return mixer.clipAction(animations[3]);
    }, [mixer, animations])


    useEffect(() => {
        if (!actio) return
        if (!actio1) return
        if (!actio2) return
        if (!actio3) return
        actio.play();
        actio1.play();
        actio2.play();
        actio3.play();

        actio2.setLoop(LoopRepeat, Infinity)


        actio.paused = true
        actio1.paused = true
        actio2.paused = true
        actio3.paused = true

    }, [actio, actio1, actio2, actio3]);


    useEffect(() => {
        if (model) return
        const loader = new GLTFLoader();
        loader.load('/Hotel.glb', function (gltf) {
            const model = gltf.scene;

            model.position.set(
                -30,
                30,
                -13
            );

            model.scale.set(
                30,
                30,
                30
            );

            model.rotation.set(
                0,
                -0.8,
                0
            )
            setAnimations(gltf.animations)
            setModel(model);
        });
    }, [model, sceneAt])


    useEffect(() => {
        if (!model) return

        sceneAt.add(model)
        return () => {
            sceneAt.remove(model)
        }
    }, [model, sceneAt])

    useFrame((_, delta) => {
        if (mixer) mixer.update(delta);

        if (!model) return
        model.position.set(
            -700,
            45,
            -300
        );

        if (!actio) return
        if (!actio1) return
        if (!actio2) return
        if (!actio3) return

        actio.play();
        actio1.play();
        actio2.play();
        actio3.play();

        actio.time = currentOffset.value * t1 * 1.05
        actio1.time = currentOffset.value * t1
        actio2.time = currentOffset.value * t1
        actio3.time = currentOffset.value * t * 1.01

        const building = model.children[0].children[1]
        const targetScaleVec = new Vector3(
            0.6752614974975586,
            0.48521754145622253,
            1.8171788454055786
        )
        if (currentOffset.value > 0.2) {
            building.visible = true
            building.scale.lerp(targetScaleVec, 0.1)
        } else {
            building.scale.lerp(new Vector3(
                0.6752614974975586,
                0,
                1.8171788454055786
            ), 0.5)
            building.visible = false
        }

    }, -1)


    return null
}

export default Hotel