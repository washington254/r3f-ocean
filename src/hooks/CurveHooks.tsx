import { useEffect, useRef, useState } from "react"
import { CatmullRomCurve3, Euler, Quaternion, Vector3 } from "three"

const quat = new Quaternion()
interface CurvedLineProps {
    points: Vector3[],
    curveType?: 'chordal' | 'catmullrom' | 'centripetal',
    openCurve?: boolean,
    segments?: number,
}


export function useCurvedLine({
    points,
    curveType = 'centripetal',
    openCurve = false,
    segments = 100,
}: CurvedLineProps) {

    const [vertices, setVertices] = useState<Vector3[] | null>(null)
    const currentVecRef = useRef(new Vector3())

    // create vertices from curves pointss
    useEffect(() => {
        if (vertices) return
        const curve = new CatmullRomCurve3(
            [...points],
            openCurve,
            curveType
        );
        setVertices(curve.getSpacedPoints(segments))
    }, [curveType, openCurve, points, segments, vertices])


    // get current vector3 by offset 0-1
    const getCurrentByOffset = (offset: number) => {
        if (!vertices) {
            return currentVecRef.current
        }


        if (offset > 1) {
            const transformedDelta = Math.floor((offset - 1) * segments);
            currentVecRef.current.copy(vertices[transformedDelta])
        }

        if (offset < 0) {
            const transformedDelta = Math.floor((offset + 1) * segments);
            currentVecRef.current.copy(vertices[transformedDelta])
        }

        if (offset >= 0 && offset < 1) {
            const transformedDelta = Math.floor(offset * segments);
            currentVecRef.current.copy(vertices[transformedDelta])
        }

        return currentVecRef.current
    }

    const xRef = useRef(new Vector3)
    const yRef = useRef(new Vector3)

    const getCurrentTangentAngle = (offset: number) => {
        if (!vertices) {
            return quat
        }

        if (offset > 1) {
            const transformedDelta = Math.floor((offset - 1) * segments);
            xRef.current.copy(vertices[transformedDelta])

            if (transformedDelta > vertices.length - 3) {
                yRef.current.copy(vertices[1])
            } else {
                yRef.current.copy(vertices[transformedDelta + 1])
            }

        }

        if (offset < 0) {
            const transformedDelta = Math.floor((offset + 1) * segments);
            xRef.current.copy(vertices[transformedDelta])


            if (transformedDelta > vertices.length - 3) {
                yRef.current.copy(vertices[1])
            } else {
                yRef.current.copy(vertices[transformedDelta + 1])
            }

        }

        if (offset >= 0 && offset < 1) {
            const transformedDelta = Math.floor(offset * segments);
            xRef.current.copy(vertices[transformedDelta]);


            if (transformedDelta > vertices.length - 3) {
                yRef.current.copy(vertices[1])
            } else {
                yRef.current.copy(vertices[transformedDelta + 1])
            }
        }




        const subVectors = new Vector3().subVectors(yRef.current, xRef.current).normalize()

        const moveDirection = new Vector3(
            subVectors.x,
            0,
            subVectors.z
        );

        quat.setFromEuler(
            new Euler(
                0,
                Math.atan2(moveDirection.x, moveDirection.z) - Math.PI / 2,
                0,
                "XYZ"
            )
        );

        return quat
    }

    return (
        {
            vertices: vertices,
            getCurrentByOffset: getCurrentByOffset,
            getCurrentTangentAngle: getCurrentTangentAngle
        }
    )
}