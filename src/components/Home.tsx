import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useAtom } from 'jotai'
import { currentOffsetAtom } from '../store/CurveStore'
import { GroupProps, useFrame } from '@react-three/fiber'
import { Group, Mesh } from 'three'


const Home = (props: GroupProps) => {
    const group = useRef<Group>(null)
    const { nodes, materials, animations } = useGLTF('/Home.glb')
    const { actions } = useAnimations(animations, group)

    const [currentOffset] = useAtom(currentOffsetAtom)

    useEffect(() => {
        const actio = actions["Home"]
        if (!actio) return
        actio.play();
    }, [actions]);

    useFrame(() => {
        const actio = actions["Home"]
        if (!actio) return
        actio.time = currentOffset.value * 10.83
    }, -1)


    return (
         <group ref={group} {...props} dispose={null}>
            <group name="Scene">
                <group name="Home" position={[91.568, 0.051, -65.527]} scale={0}>
                    <mesh
                        name="Cube001"
                        castShadow
                        receiveShadow
                        geometry={(nodes.Cube001 as Mesh).geometry}
                        material={materials['Brand-Orange.002']}
                        scale={2}
                    />
                </group>
            </group>
        </group>
    )
}

export default Home