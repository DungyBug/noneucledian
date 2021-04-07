import State from "./global";
import * as BABYLON from "babylonjs";

export let refractionMaterial
let refractionTexture;

setTimeout(() => {
    refractionMaterial = new BABYLON.StandardMaterial("refraction", State.ultra3.scene);
    refractionTexture = new BABYLON.RefractionTexture("th", 2048, State.ultra3.scene);
    refractionTexture.refractionPlane = new BABYLON.Plane(0, 0, 0, 0);
    refractionTexture.depth = 5;
        
    refractionMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    refractionMaterial.refractionTexture = refractionTexture;
    refractionMaterial.indexOfRefraction = 0.9;
    refractionMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    
    BABYLON.Effect.ShadersStore["portalVertexShader"]= "\r\n"+
    "precision highp float;\r\n"+
    "// Attributes\r\n"+
    "attribute vec3 position;\r\n"+
    "attribute vec2 uv;\r\n"+
    "// Uniforms\r\n"+
    "uniform mat4 worldViewProjection;\r\n"+
    "// Varying\r\n"+
    "varying vec4 pos;\r\n"+
    "void main(void) {\r\n"+
    "    gl_Position = worldViewProjection * vec4(position, 1.0);\r\n"+
    "    pos = worldViewProjection * vec4(position, 1.0);\r\n"+
    "}\r\n";
    BABYLON.Effect.ShadersStore["portalFragmentShader"]= "\r\n"+
    "precision highp float;\r\n"+
    "varying vec4 pos;\r\n"+
    "uniform sampler2D textureSampler;\r\n"+
    "void main(void) {\r\n"+
    "   vec3 ndc = pos.xyz / pos.w;\r\n"+
    "   vec2 viewportCoord = ndc.xy * 0.5 + 0.5;\r\n"+
    "   gl_FragColor = texture2D(textureSampler, viewportCoord);\r\n"+ // texture2D(textureSampler, viewportCoord)
    "}\r\n";

    BABYLON.Effect.ShadersStore["planetVertexShader"]=                "precision highp float;\r\n"+

    "// Attributes\r\n"+
    "attribute vec3 position;\r\n"+
    "varying vec3 pos;\r\n"+
    "uniform mat4 worldViewProjection;\r\n"+

    "void main(void) {\r\n"+
    "    gl_Position = worldViewProjection * vec4(position, 1.0);\r\n"+
    "    pos = position;\r\n"+
    "}\r\n";

    BABYLON.Effect.ShadersStore["planetFragmentShader"]=                "precision highp float;\r\n"+
    "varying vec3 pos;\r\n"+

    "vec3 linearInterpolateColor(vec3 a, vec3 b, float x) {\r\n"+
    "    return a + (b - a) * x;\r\n"+
    "}\r\n"+

    "void main(void) {\r\n"+
    "    float radius = 95.0; // The diameter of our planet\r\n"+
    "    float delta = 10.0;\r\n"+
    "    vec3 color = vec3(1.0, 1.0, 1.0);\r\n"+
    "    vec3 groundColor = vec3(0.1, 0.005, 0.0);\r\n"+
    "    vec3 midColor = vec3(0.4, 0.4, 0.4);\r\n"+
    "    vec3 mountainColor = vec3(1.0, 1.0, 1.0);\r\n"+
    "    \r\n"+
    "    float dist = clamp(length(pos) - radius, -delta / 2.0, delta / 2.0);\r\n"+
    "    \r\n"+
    "    float coff = 2.0;\r\n"+
    "    coff *= dist / delta + 0.5;\r\n"+
    "    \r\n"+
    "    if(coff < 1.0) {\r\n"+
    "        color = linearInterpolateColor(groundColor, midColor, coff);\r\n"+
    "    } else if(coff < 2.0) {\r\n"+
    "        color = linearInterpolateColor(midColor, mountainColor, coff - 1.0);\r\n"+
    "    } else {\r\n"+
    "        color = mountainColor;\r\n"+
    "    }\r\n"+
    "    \r\n"+
    "    gl_FragColor = vec4(color, 1.0);\r\n"+
    "}\r\n";
    
}, 20)

setTimeout(() => {
    for(let i = 0; i < State.ultra3.scene.meshes.length; i++) {
        refractionTexture.renderList.push(State.ultra3.scene.meshes[i]);
    }
}, 3000);