export const vertexShader = /*glsl*/`
uniform sampler2D curveTexture;
uniform float stretchRatio;



varying vec2 vUv;
varying vec3 vViewPosition;



mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
vec3 rr = vec3(sin(roll), cos(roll), 0.0);
vec3 ww = normalize(target - origin);
vec3 uu = normalize(cross(ww, rr));
vec3 vv = normalize(cross(uu, ww));
return -mat3(uu, vv, ww);
}




void main() {
#include <beginnormal_vertex>
#include <defaultnormal_vertex>
#include <begin_vertex>

vec3 pos = position;

vec3 cpos = vec3(0.);
vec3 ctan = vec3(0.);
vec3 trans = vec3(0.);

float a = clamp(pos.z + 0.5, 0., 1.) * stretchRatio;
cpos = vec3(texture(curveTexture, vec2(a, 0.)));
ctan = vec3(texture(curveTexture, vec2(a, 1.)));
pos.z = (pos.z > 0.5) ? (pos.z - 0.5) : 0.;

mat3 rot = calcLookAtMatrix(vec3(0), -ctan, 0.);

transformed = rot * pos;
transformed += cpos;

#include <project_vertex> 
}
`

export const fragmentShader = /*glsl*/`
void main() {
  vec3 Color = vec3(0.961, 0.494, 0.243);
  gl_FragColor = vec4(Color, 1.0);
}



`