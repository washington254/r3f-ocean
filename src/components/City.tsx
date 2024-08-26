import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'
import { Group, Mesh } from 'three'



export function City(props: GroupProps) {
    const group = useRef<Group>(null)
    const { nodes, materials } = useGLTF('/map.glb')
    return (
        <group ref={group} {...props} dispose={null}>
            <group name="Scene">
                <group name="Curve1760" scale={1379.452} visible={true}>
                    <mesh
                        name="Curve1760_1"
                        // castShadow
                        receiveShadow
                        geometry={(nodes.Curve1760_1 as Mesh).geometry}
                        material={materials['Material.002']}
                    />
                    <mesh
                        name="Curve1760_2"
                        // castShadow
                        receiveShadow
                        geometry={(nodes.Curve1760_2 as Mesh).geometry}
                        material={materials['Material.003']}
                    />
                </group>
                {/* <mesh
                    name="Cube002"
                    castShadow
                    receiveShadow
                    geometry={(nodes.Cube002 as Mesh).geometry}
                    material={materials['Brand-Orange.002']}
                    position={[92.694, -0.599, -53.768]}
                    rotation={[-Math.PI, 0.751, -Math.PI]}
                    scale={0.675}
                /> */}
                {/* <mesh
                    name="Cube003"
                    castShadow
                    receiveShadow
                    geometry={(nodes.Cube003 as Mesh).geometry}
                    material={materials['Brand-Orange.002']}
                    position={[92.704, 0.022, -53.758]}
                    rotation={[-Math.PI, 0.748, -Math.PI]}
                    scale={0.784}
                />
                <mesh
                    name="Cylinder005"
                    castShadow
                    receiveShadow
                    geometry={(nodes.Cylinder005 as Mesh).geometry}
                    material={materials.Material}
                    position={[92.694, 1.091, -53.768]}
                    rotation={[0, -0.72, Math.PI]}
                    scale={0.352}>
                    <mesh
                        name="Cylinder003"
                        castShadow
                        receiveShadow
                        geometry={(nodes.Cylinder003 as Mesh).geometry}
                        material={materials['Brand-Orange.002']}
                        position={[0, 0, 0.789]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={0.96}
                    />
                </mesh> */}
                {/* <mesh
                    name="Text002"
                    castShadow
                    receiveShadow
                    geometry={(nodes.Text002 as Mesh).geometry}
                    material={materials.Material}
                    position={[92.64, 0.042, -53.754]}
                    rotation={[-Math.PI, 0.731, -Math.PI]}
                    scale={0.481}
                />
                <mesh
                    name="Cube001"
                    castShadow
                    receiveShadow
                    geometry={(nodes.Cube001 as Mesh).geometry}
                    material={materials['Brand-Orange.002']}
                    position={[91.568, 0.051, -65.527]}
                    scale={0}>
                    <mesh
                        name="Text001"
                        castShadow
                        receiveShadow
                        geometry={(nodes.Text001 as Mesh).geometry}
                        material={(nodes.Text001 as Mesh).material}
                        position={[0, 0, 512]}
                        scale={0}
                    />
                </mesh> */}
            </group>
        </group>
    )
}

useGLTF.preload('/map.glb')
