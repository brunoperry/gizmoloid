#version 300 es

precision highp float;
precision highp int;

in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uCameraMatrix;

out vec2 v_texcoord;

void main() {

    mat4 m = uPMatrix * uCameraMatrix * uMVMatrix;

    gl_Position = m * a_position;
    v_texcoord = a_texcoord;
}