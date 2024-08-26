import { useEffect, useMemo, useRef, useState } from "react"
import { 
    CatmullRomCurve3, 
    CylinderGeometry, 
    DataTexture, 
    FloatType, 
    Mesh, 
    RGBAFormat, 
    Scene as THREEScene, 
    ShaderMaterial, 
    SphereGeometry, 
    DirectionalLight, 
    HemisphereLight, 
    AmbientLight,
    Vector3,
    MeshStandardMaterial,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useFrame } from "@react-three/fiber";
import { currentOffsetAtom, isPlayingAtom, sceneAtom, vecDataAtom } from "./store/CurveStore";
import { useAtom } from "jotai";
import { button, useControls } from "leva";
import CharacterIdle from "./components/CharacterIdle";

const Scene = () => {

    const [, setIsPlaying] = useAtom(isPlayingAtom)
    const [vecData] = useAtom(vecDataAtom)

    useControls({
        play: button(() => {
            setIsPlaying(true)
        }),
        pause: button(() => {
            setIsPlaying(false)
        }),
    })

    return (
        <>
            <AddScene />
            <CustomLights />
            {
                vecData.length && (
                    <>
                        <CharacterIdle />
                        <AnimatedCustomPath />
                    </>
                )
            }
            <PathSetValues />
        </>
    )
}


export default Scene

const points = [
    new Vector3(
        0,
        0,
        0,
    ),
    new Vector3(
        -6.4,
        0,
        -3.2,
    ),
    new Vector3(
        -115.2,
        0,
        -57.6,
    ),
    new Vector3(
        -128,
        0,
        -64,
    ),
    new Vector3(
        -131.55,
        0,
        -57.2,
    ),
    new Vector3(
        -195.45,
        0,
        65.2,
    ),
    new Vector3(
        -199,
        0,
        72,
    ),
    new Vector3(
        -220.1,
        0,
        64.8,
    ),
    new Vector3(
        -461.5,
        0,
        -76.5,
    ),
    new Vector3(
        -697.75,
        0,
        -210.15,
    ),
    new Vector3(
        -724,
        0,
        -225,
    ),
]

const AddScene = () => {

    const sceneRef = useRef<THREEScene | null>(null)
    const [sceneAt] = useAtom(sceneAtom)

    useEffect(() => {

        if (!sceneRef || !sceneRef.current) return
        sceneRef.current.add(sceneAt)

        return () => {
            if (!sceneRef || !sceneRef.current) return
            // eslint-disable-next-line react-hooks/exhaustive-deps
            sceneRef.current.remove(sceneAt)
        }

    }, [sceneAt, sceneRef])

    return <scene ref={sceneRef} />
}

const CustomLights = () => {

    const dirLight = useMemo(() => new DirectionalLight(0xffd7b5, 2), []);
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = false;
    const hemiLight = useMemo(() => new HemisphereLight("white", '#f88', 1.5), []);
    const ambientLight = useMemo(() => new AmbientLight('white', 1), []);
    const [sceneAt] = useAtom(sceneAtom)

    useEffect(() => {
        sceneAt.add(dirLight)
        sceneAt.add(hemiLight)
        sceneAt.add(ambientLight)
        return () => {
            sceneAt.remove(dirLight)
            sceneAt.remove(hemiLight)
            sceneAt.remove(ambientLight)
        }
    }, [ambientLight, dirLight, hemiLight, sceneAt])

    return null
}

const PathSetValues = () => {
    const [vecData, setVecData] = useAtom(vecDataAtom)
    useEffect(() => {
        if (vecData.length) return

        setVecData(
            points
        )
    }, [setVecData, vecData.length])

    return null
}




const AnimatedCustomPath = () => {

    const [vecData] = useAtom(vecDataAtom)
    const [offsetVal] = useAtom(currentOffsetAtom)
    const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom)

    const [get, set] = useControls(() => ({
        progress: {
            min: 0,
            max: 0.99,
            step: 0.001,
            value: 0
        }
    }))

    const [mat, setMat] = useState<ShaderMaterial | MeshStandardMaterial | null>(null);

    const [mesh, setMesh] = useState<Mesh | null>(null)
    useEffect(() => {
        const csegs = 500;
        const rsegs = 12;
        const r = 3;
        const geo = mergeGeometries([
            new SphereGeometry(r, rsegs, rsegs * 0.5, 0, Math.PI * 2, 0, Math.PI * 0.5).translate(0, 0.5, 0),
            new CylinderGeometry(r, r, 1, rsegs, csegs, true),
            new SphereGeometry(r, rsegs, rsegs * 0.5, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5).translate(0, -0.5, 0)
        ]);
        geo.rotateX(-Math.PI * 0.5).rotateY(Math.PI); 
    
        const curve = new CatmullRomCurve3(vecData);
    
        const data: number[] = [];
        const wtt = (vArr: Vector3[]) => {
            vArr.forEach(v => { data.push(v.x, v.y, v.z, 0) });
        }
        const texSize = 1024;
        const pData = curve.getSpacedPoints(texSize - 1);
        const ffData = curve.computeFrenetFrames(texSize - 1);
        wtt(pData);
        wtt(ffData.tangents);
    
        const dataTexture = new DataTexture(new Float32Array(data), texSize, 2, RGBAFormat, FloatType);
        dataTexture.needsUpdate = true;

       
        const material = new MeshStandardMaterial({
            color: "#f57e3e",
            metalness: 0, 
            roughness: 0.15, 
        });
        
        const customUniforms = {
            curveTexture: { value: dataTexture },
            stretchRatio: { value: 0.1 },
            time: { value: 0 } // Adding time for dynamic effects if needed
        };
        
        material.onBeforeCompile = function(shader) {
            shader.uniforms.curveTexture = customUniforms.curveTexture;
            shader.uniforms.stretchRatio = customUniforms.stretchRatio;
            shader.uniforms.time = customUniforms.time;
            material.userData.shader = shader;
        
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                    #include <common>
        
                    uniform sampler2D curveTexture;
                    uniform float stretchRatio;
                    varying vec2 vUv;
        
                    mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
                        vec3 rr = vec3(sin(roll), cos(roll), 0.0);
                        vec3 ww = normalize(target - origin);
                        vec3 uu = normalize(cross(ww, rr));
                        vec3 vv = normalize(cross(uu, ww));
                        return mat3(uu, vv, ww);
                    }
                `
            );
        
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                    #include <begin_vertex>
                    vec3 pos = position;
        
                    vec3 cpos = vec3(0.);
                    vec3 ctan = vec3(0.);
        
                    float a = clamp(pos.z + 0.5, 0., 1.) * stretchRatio;
                    cpos = vec3(texture(curveTexture, vec2(a, 0.)));
                    ctan = vec3(texture(curveTexture, vec2(a, 1.)));
                    pos.z = (pos.z > 0.5) ? (pos.z - 0.5) : 0.;
        
                    mat3 rot = calcLookAtMatrix(vec3(0), -ctan, 0.);
        
                    transformed = rot * pos;
                    transformed += cpos;
                    vUv = uv;
            
                `
            );
        
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <packing>',
                `
                    #include <packing>
                    varying vec2 vUv;

                    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
                    vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

                    float cnoise(vec2 P){
                    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
                    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
                    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
                    vec4 ix = Pi.xzxz;
                    vec4 iy = Pi.yyww;
                    vec4 fx = Pf.xzxz;
                    vec4 fy = Pf.yyww;
                    vec4 i = permute(permute(ix) + iy);
                    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
                    vec4 gy = abs(gx) - 0.5;
                    vec4 tx = floor(gx + 0.5);
                    gx = gx - tx;
                    vec2 g00 = vec2(gx.x,gy.x);
                    vec2 g10 = vec2(gx.y,gy.y);
                    vec2 g01 = vec2(gx.z,gy.z);
                    vec2 g11 = vec2(gx.w,gy.w);
                    vec4 norm = 1.79284291400159 - 0.85373472095314 * 
                        vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
                    g00 *= norm.x;
                    g01 *= norm.y;
                    g10 *= norm.z;
                    g11 *= norm.w;
                    float n00 = dot(g00, vec2(fx.x, fy.x));
                    float n10 = dot(g10, vec2(fx.y, fy.y));
                    float n01 = dot(g01, vec2(fx.z, fy.z));
                    float n11 = dot(g11, vec2(fx.w, fy.w));
                    vec2 fade_xy = fade(Pf.xy);
                    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
                    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
                    return 2.3 * n_xy;
                    }
            
                  
                `
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                    #include <dithering_fragment>
                    
                    vec2 noiseCoords = vUv * 10.0; 
                    
                    // Use smoothstep for a smooth gradient transition
                    float noiseValue = smoothstep(0.5, 0.7, sin(cnoise(noiseCoords) * 1.1));
            
                    vec4 color = gl_FragColor;
                    color += vec4(vec3(noiseValue) * 0.3, 0.6); 
                    gl_FragColor = gl_FragColor;
                `
            );
                   
        };
        
        setMat(material);
        const mesh = new Mesh(geo, material);
        mesh.position.set(0, 0.55, 0);
        mesh.scale.set(1, 1, 1);
      
        mesh.frustumCulled = false;
        setMesh(mesh);
        
        
    }, []);
    useFrame(() => {
    if (!mat) return;

  
    const shader = mat.userData.shader;
    if (shader && shader.uniforms && shader.uniforms.stretchRatio) {
     
        if (!isPlaying) {
            offsetVal.value = get.progress;
            shader.uniforms.stretchRatio.value = offsetVal.value;
            return;
        }

        if (offsetVal.value > 1) {
            setIsPlaying(false);
            return;
        }

        if (offsetVal.value < 0.001 || offsetVal.value > 0.985) {
            offsetVal.value += 0.00002;
        } else {
            offsetVal.value += 0.001;
        }

        set({ progress: offsetVal.value });

        shader.uniforms.stretchRatio.value = offsetVal.value;
    }
});


    const [sceneAt] = useAtom(sceneAtom)

    useEffect(() => {
        if (!mesh) return
        sceneAt.add(mesh)
        return () => {
            sceneAt.remove(mesh)
        }
    }, [mesh, sceneAt])

    return null
}