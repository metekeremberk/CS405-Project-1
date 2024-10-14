function multiplyMatrices(matrixA, matrixB) {
	var result = [];

	for (var i = 0; i < 4; i++) {
		result[i] = [];
		for (var j = 0; j < 4; j++) {
			var sum = 0;
			for (var k = 0; k < 4; k++) {
				sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
			}
			result[i][j] = sum;
		}
	}

	// Flatten the result array
	return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
	return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
	return new Float32Array([
		scale_x,
		0,
		0,
		0,
		0,
		scale_y,
		0,
		0,
		0,
		0,
		scale_z,
		0,
		0,
		0,
		0,
		1,
	]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
	return new Float32Array([
		1,
		0,
		0,
		x_amount,
		0,
		1,
		0,
		y_amount,
		0,
		0,
		1,
		z_amount,
		0,
		0,
		0,
		1,
	]);
}

function createRotationMatrix_Z(radian) {
	return new Float32Array([
		Math.cos(radian),
		-Math.sin(radian),
		0,
		0,
		Math.sin(radian),
		Math.cos(radian),
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
	]);
}

function createRotationMatrix_X(radian) {
	return new Float32Array([
		1,
		0,
		0,
		0,
		0,
		Math.cos(radian),
		-Math.sin(radian),
		0,
		0,
		Math.sin(radian),
		Math.cos(radian),
		0,
		0,
		0,
		0,
		1,
	]);
}

function createRotationMatrix_Y(radian) {
	return new Float32Array([
		Math.cos(radian),
		0,
		Math.sin(radian),
		0,
		0,
		1,
		0,
		0,
		-Math.sin(radian),
		0,
		Math.cos(radian),
		0,
		0,
		0,
		0,
		1,
	]);
}

function getTransposeMatrix(matrix) {
	return new Float32Array([
		matrix[0],
		matrix[4],
		matrix[8],
		matrix[12],
		matrix[1],
		matrix[5],
		matrix[9],
		matrix[13],
		matrix[2],
		matrix[6],
		matrix[10],
		matrix[14],
		matrix[3],
		matrix[7],
		matrix[11],
		matrix[15],
	]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`;

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`;

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */

/**
 *
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
	const transformationMatrix = new Float32Array([
		// you should paste the response of the chatGPT here:

		// Row 1
		0.1767766952966369, -0.0732233047033631, 0.3061862178478972, 0.3,
		// Row 2
		0.375, 0.4131759111665348, -0.3061862178478972, -0.25,
		// Row 3
		-0.3535533905932738, 0.0883883476483184, 0.4330127018922193, 0,
		// Row 4
		0, 0, 0, 1,
	]);
	return getTransposeMatrix(transformationMatrix);
}

/**
 *
 * @TASK2 Calculate the model view matrix by using the given
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
	// calculate the model view matrix by using the transformation
	// methods and return the modelView matrix in this method

	const translationMatrix = createTranslationMatrix(0.3, -0.25, 0);
	const scalingMatrix = createScaleMatrix(0.5, 0.5, 1);

	const rad = (angle) => (angle * Math.PI) / 180;

	const rotationMatrixX = createRotationMatrix_X(rad(30));
	const rotationMatrixY = createRotationMatrix_Y(rad(45));
	const rotationMatrixZ = createRotationMatrix_Z(rad(60));

	const finalMatrix = multiplyMatrices(
		multiplyMatrices(
			multiplyMatrices(
				translationMatrix,
				multiplyMatrices(rotationMatrixZ, rotationMatrixY)
			),
			rotationMatrixX
		),
		scalingMatrix
	);

	return finalMatrix;
}

/**
 *
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in
 * task2 infinitely with a period of 10 seconds.
 * First 5 seconds, the cube should transform from its initial
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
	// this metdo should return the model view matrix at the given time
	// to get a smooth animation

	const duration = 10; // Total duration of the animation cycle in seconds
	const currentTime = Date.now() / 1000 - startTime; // Get the elapsed time in seconds
	const timeInCycle = currentTime % duration; // Current time within the 10-second cycle

	// Define the maximum translation, rotation, and scaling based on getModelViewMatrix
	const initialTranslation = { x: 0.3, y: -0.25, z: 0 };
	const initialScale = { x: 0.5, y: 0.5, z: 1 };
	const initialRotation = { x: 30, y: 45, z: 60 }; // In degrees

	// Create oscillating factor based on sine wave
	const phase =
		timeInCycle < duration / 2
			? timeInCycle / (duration / 2)
			: (duration - timeInCycle) / (duration / 2);
	const oscillatingFactor = Math.sin(phase * Math.PI);

	// Interpolate translation, rotation, and scaling separately
	const translation = createTranslationMatrix(
		initialTranslation.x * oscillatingFactor,
		initialTranslation.y * oscillatingFactor,
		initialTranslation.z * oscillatingFactor
	);

	const scale = createScaleMatrix(
		initialScale.x,
		initialScale.y,
		initialScale.z
	);

	const rad = (angle) => (angle * Math.PI) / 180;

	const rotationX = createRotationMatrix_X(
		rad(initialRotation.x * oscillatingFactor)
	);
	const rotationY = createRotationMatrix_Y(
		rad(initialRotation.y * oscillatingFactor)
	);
	const rotationZ = createRotationMatrix_Z(
		rad(initialRotation.z * oscillatingFactor)
	);

	// Combine all transformations
	const finalMatrix = multiplyMatrices(
		multiplyMatrices(
			multiplyMatrices(translation, multiplyMatrices(rotationZ, rotationY)),
			rotationX
		),
		scale
	);

	return finalMatrix;
}
