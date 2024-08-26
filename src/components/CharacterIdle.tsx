
import { useEffect, useMemo, useState } from 'react'
import { currentOffsetAtom, isPlayingAtom, sceneAtom, vecDataAtom } from '../store/CurveStore';
import { useCurvedLine } from '../hooks/CurveHooks';
import { useFrame } from '@react-three/fiber';
import { AnimationClip, AnimationMixer, Group, SkeletonHelper, Vector3 } from 'three';
import { useAtom } from 'jotai';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CharacterIdle = () => {
    const [offsetVal] = useAtom(currentOffsetAtom)
    const [isPlaying] = useAtom(isPlayingAtom)
    const [vecData] = useAtom(vecDataAtom)
    const [model, setModel] = useState<Group | null>(null)
    const [sceneAt] = useAtom(sceneAtom)
    const [allAnimations, setAnimations] = useState<AnimationClip[]>([])
    const [isWalking, setIsWalking] = useState(false)

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
        loader.load('/Character.glb', function (gltf) {
            const model = gltf.scene;
            model.scale.set(5, 0, 0)
            model.children[0].rotation.set(
                0,
                Math.PI / 2,
                0
            )
            const skeleton = new SkeletonHelper(model);
            skeleton.visible = false;
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

    const mixer = useMemo(() => {
        if (!model) return
        return new AnimationMixer(model);
    }, [model])

    const walkAction = useMemo(() => {
        if (!mixer) return
        const walkAnimation = allAnimations.find(item => item.name === "Walk")
        if (!walkAnimation) return
        return mixer.clipAction(walkAnimation);
    }, [mixer, allAnimations])

    const idleAction = useMemo(() => {
        if (!mixer) return
        const idleAnimation = allAnimations.find(item => item.name === "Idle")
        if (!idleAnimation) return
        return mixer.clipAction(idleAnimation);
    }, [mixer, allAnimations])

    useFrame((_, delta) => {
        if (!model) return
        // console.log(offsetVal.value)
        if (offsetVal.value < 0.0001 || offsetVal.value > 0.986) {
            model.scale.lerp(new Vector3(0, 0, 0), 0.2)
        } else {
            model.scale.lerp(new Vector3(0.7, .7, .7), 0.2)
        }
        const quat = getCurrentTangentAngle(offsetVal.value)

        model.position.lerp(getCurrentByOffset(offsetVal.value).add(new Vector3(0, 0.6, 0)), 0.3);
        model.quaternion.slerp(quat, 0.3);
        if (mixer) mixer.update(delta);
    })

    useFrame(() => {

        if (offsetVal.value > 0.01 && offsetVal.value < 0.985 && isPlaying && !isWalking) {
            setIsWalking(true)
        }

        if ((offsetVal.value < 0.0001 || offsetVal.value > 0.985 || !isPlaying) && isWalking) {
            setIsWalking(false)
        }
    })

    useEffect(() => {
        if (!allAnimations) return
        if (!walkAction) return
        if (!idleAction) return
        if (isWalking) {
            idleAction.setEffectiveWeight(1).fadeOut(0.5)
            walkAction.reset()
                .setEffectiveWeight(1)
                .fadeIn(0.5)
                .play();
        } else {
            walkAction.setEffectiveWeight(1).fadeOut(0.5)
            idleAction.reset()
                .setEffectiveWeight(2)
                .fadeIn(0.5)
                .play();
        }
    }, [allAnimations, idleAction, isWalking, walkAction]);



    return null
}

export default CharacterIdle