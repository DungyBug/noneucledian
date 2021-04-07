export const Vector = {
    mag: function(x: number, y: number, z: number) {
        return Math.sqrt(x*x + y*y + z*z);
    },

    mult: function(x: number, y: number, z: number, xmult: number, ymult: number, zmult: number) {
        return {x: x * xmult, y: y * ymult, z: z * zmult};
    },

    normalize: function(x: number, y: number, z: number) {
        var e = this.mag(x, y, z);
        if(e !== 0) {
            return this.mult(x, y, z, 1/e, 1/e, 1/e);
        } else {
            return {
                x: 0,
                y: 0,
                z: 0
            };
        }
    },

    setMag: function(x: number, y: number, z: number, x2: number, y2: number, z2: number) {
        let normalized = this.normalize(x, y, z);
        return this.mult(normalized.x, normalized.y, normalized.z, x2, y2, z2);
    }
}