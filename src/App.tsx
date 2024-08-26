import { Perf } from 'r3f-perf'
import "maplibre-gl/dist/maplibre-gl.css"
import Map from "react-map-gl/maplibre"
import { Canvas, Coordinates, Coords } from "react-three-map/maplibre"
import Scene from "./Scene"
import Hotel from "./components/Hotel";






function App() {
  const origin: Coords = {
    latitude: 40.74663,
    longitude: -73.99202,
  }

  return (
    <>
      <Map
        style={{
          width: '100vw',
          height: '100vh',
        }}
        antialias
        initialViewState={{
          longitude: origin.longitude - 0.005,
          latitude: origin.latitude + 0.002,
          zoom: 16,
          pitch: 60
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        <Canvas
          
          latitude={origin.latitude}
          longitude={origin.longitude}
        >
          <Perf position='bottom-left' />
          

          <Coordinates
            latitude={origin.latitude}
            longitude={origin.longitude}
          >
            <Hotel />
            <Scene />
         
          </Coordinates>
          <ambientLight intensity={1} />
         
        </Canvas>
      </Map>
    </>
  )
}

export default App
