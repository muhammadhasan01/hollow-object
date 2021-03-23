const degreesToRadians = function(deg) {
  return deg * Math.PI / 180.0;
};

/**
* Transpose the values of a mat4
*
* @param {mat4} out the receiving matrix
* @param {ReadonlyMat4} a the source matrix
* @returns {mat4} out
*/
const transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        let a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        let a12 = a[6],
            a13 = a[7];
        let a23 = a[11];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    return out;
}

// oblique perspective function
const oblique = function(out, theta, phi) {
    var t = degreesToRadians(theta);
    var p = degreesToRadians(phi);

    var cotT = -1 / Math.tan(t);
    var cotP = -1 / Math.tan(p);

    out[0] = 1;
    out[1] = 0;
    out[2] = cotT;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = cotP;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    transpose(out, out);

    return out;
};