
import { useEffect, useMemo, useState } from 'react'
import { currentOffsetAtom, isPlayingAtom, sceneAtom, vecDataAtom } from '../store/CurveStore';
import { useCurvedLine } from '../hooks/CurveHooks';
import { useFrame } from '@react-three/fiber';
import { AnimationClip, AnimationMixer, Group, SkeletonHelper, Vector3 } from 'three';
import { useAtom } from 'jotai';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const Character = () => {
    const [offsetVal] = useAtom(currentOffsetAtom)
    const [isPlaying] = useAtom(isPlayingAtom)
    const [vecData] = useAtom(vecDataAtom)
    const [model, setModel] = useState<Group | null>(null)
    const [sceneAt] = useAtom(sceneAtom)
    const [walkAnimation, setWalkAnimation] = useState<AnimationClip[]>([])

    const {
        getCurrentByOffset,
        getCurrentTangentAngle
    } = useCurvedLine(
        {
            points: vecData,
            curveType: 'centripetal',
            openCurve: false,
            segments: 2000,
        }
    )

    useEffect(() => {
        if (model) return
        const loader = new GLTFLoader();
        loader.load('/Char.glb', function (gltf) {
            console.log(gltf)
            const model = gltf.scene;
            model.scale.set(0, 0, 0)
            model.children[0].rotation.set(Math.PI / 2, 0, -Math.PI / 2)
            const skeleton = new SkeletonHelper(model);
            skeleton.visible = false;
            setWalkAnimation(gltf.animations)
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

    const mixer = useMemo(() => {
        if (!model) return
        return new AnimationMixer(model);
    }, [model])

    const action = useMemo(() => {
        if (!mixer) return
        return mixer.clipAction(walkAnimation[0]);
    }, [mixer, walkAnimation])

    useFrame((_, delta) => {
        if (!model) return

        if (offsetVal.value < 0.0001 || offsetVal.value > 0.986) {
            model.scale.lerp(new Vector3(0, 0, 0), 0.2)
        } else {
            model.scale.lerp(new Vector3(50, 50, 50), 0.2)
        }
        const quat = getCurrentTangentAngle(offsetVal.value)

        model.position.lerp(getCurrentByOffset(offsetVal.value).add(new Vector3(0, 0.6, 0)), 0.3);
        model.quaternion.slerp(quat, 0.3);
        if (mixer) mixer.update(delta);
    })

    useEffect(() => {
        if (!walkAnimation) return
        if (!action) return
        action?.play()

        if (isPlaying) {
            action.paused = false
        } else {
            action.paused = true
        }

    }, [action, isPlaying, model, walkAnimation]);



    return null
}

export default Character