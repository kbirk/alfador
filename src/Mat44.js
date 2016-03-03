(function() {

    'use strict';

    var Vec3 = require('./Vec3');
    var Vec4 = require('./Vec4');
    var EPSILON = require('./Epsilon');

    /**
     * Instantiates a Mat44 object.
     * @class Mat44
     * @classdesc A 4x4 column-major matrix.
     */
    function Mat44( that ) {
        that = that || [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        if ( that instanceof Array ) {
            this.data = that;
        } else {
            this.data = new Array( 16 );
            this.data[0] = that.data[0];
            this.data[1] = that.data[1];
            this.data[2] = that.data[2];
            this.data[3] = that.data[3];
            this.data[4] = that.data[4];
            this.data[5] = that.data[5];
            this.data[6] = that.data[6];
            this.data[7] = that.data[7];
            this.data[8] = that.data[8];
            this.data[9] = that.data[9];
            this.data[10] = that.data[10];
            this.data[11] = that.data[11];
            this.data[12] = that.data[12];
            this.data[13] = that.data[13];
            this.data[14] = that.data[14];
            this.data[15] = that.data[15];
        }
    }

    /**
     * Returns a row of the matrix as a Vec4 object.
     * @memberof Mat44
     *
     * @param {number} index - The 0-based row index.
     * @param {Vec3||Array} vec - The vector to replace the row. Optional.
     *
     * @returns {Vec4} The row vector.
     */
    Mat44.prototype.row = function( index, vec ) {
        if ( vec ) {
            this.data[0+index] = vec[0] || vec.x;
            this.data[4+index] = vec[1] || vec.y;
            this.data[8+index] = vec[2] || vec.z;
            this.data[12+index] = vec[3] || vec.w;
            return this;
        }
        return new Vec4(
            this.data[0+index],
            this.data[4+index],
            this.data[8+index],
            this.data[12+index] );
    };

    /**
     * Returns a column of the matrix as a Vec4 object.
     * @memberof Mat44
     *
     * @param {number} index - The 0-based col index.
     * @param {Vec3||Array} vec - The vector to replace the col. Optional.
     *
     * @returns {Vec4} The column vector.
     */
    Mat44.prototype.col = function( index, vec ) {
        if ( vec ) {
            this.data[0+index*4] = vec[0] || vec.x;
            this.data[1+index*4] = vec[1] || vec.y;
            this.data[2+index*4] = vec[2] || vec.z;
            this.data[3+index*4] = vec[3] || vec.w;
            return this;
        }
        return new Vec4(
            this.data[0+index*4],
            this.data[1+index*4],
            this.data[2+index*4],
            this.data[3+index*4] );
    };

    /**
     * Returns the identity matrix.
     * @memberof Mat44
     *
     * @returns {Mat44} The identiy matrix.
     */
    Mat44.identity = function() {
        return new Mat44();
    };

    /**
     * Returns a scale matrix.
     * @memberof Mat44
     *
     * @param {Vec3|Array|number} scale - The scalar or vector scaling factor.
     *
     * @returns {Mat44} The scale matrix.
     */
    Mat44.scale = function( scale ) {
        if ( typeof scale === 'number' ) {
            return new Mat44([
                scale, 0, 0, 0,
                0, scale, 0, 0,
                0, 0, scale, 0,
                0, 0, 0, 1
            ]);
        } else if ( scale instanceof Array ) {
            return new Mat44([
                scale[0], 0, 0, 0,
                0, scale[1], 0, 0,
                0, 0, scale[2], 0,
                0, 0, 0, 1
            ]);
        }
        return new Mat44([
            scale.x, 0, 0, 0,
            0, scale.y, 0, 0,
            0, 0, scale.z, 0,
            0, 0, 0, 1
        ]);
    };

    /**
     * Returns a translation matrix.
     * @memberof Mat44
     *
     * @param {Vec3|Array} translation - The translation vector.
     *
     * @returns {Mat44} The translation matrix.
     */
    Mat44.translation = function( translation ) {
        if ( translation instanceof Array ) {
            return new Mat44([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                translation[0], translation[1], translation[2], 1
            ]);
        }
        return new Mat44([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            translation.x, translation.y, translation.z, 1
        ]);
    };

    /**
     * Returns a rotation matrix defined by an axis and an angle.
     * @memberof Mat44
     *
     * @param {number} angle - The angle of the rotation, in degrees.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Mat44} The rotation matrix.
     */
    Mat44.rotationDegrees = function( angle, axis ) {
        return this.rotationRadians( angle*Math.PI/180, axis );
    };

    /**
     * Returns a rotation matrix defined by an axis and an angle.
     * @memberof Mat44
     *
     * @param {number} angle - The angle of the rotation, in radians.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Mat44} The rotation matrix.
     */
    Mat44.rotationRadians = function( angle, axis ) {
        if ( axis instanceof Array ) {
            axis = new Vec3( axis );
        }
        // zero vector, return identity
        if ( axis.lengthSquared() === 0 ) {
            return this.identity();
        }
        var normAxis = axis.normalize(),
            x = normAxis.x,
            y = normAxis.y,
            z = normAxis.z,
            modAngle = ( angle > 0 ) ? angle % (2*Math.PI) : angle % (-2*Math.PI),
            s = Math.sin( modAngle ),
            c = Math.cos( modAngle ),
            xx = x * x,
            yy = y * y,
            zz = z * z,
            xy = x * y,
            yz = y * z,
            zx = z * x,
            xs = x * s,
            ys = y * s,
            zs = z * s,
            one_c = 1.0 - c;
        return new Mat44([
            (one_c * xx) + c, (one_c * xy) + zs, (one_c * zx) - ys, 0,
            (one_c * xy) - zs, (one_c * yy) + c, (one_c * yz) + xs, 0,
            (one_c * zx) + ys, (one_c * yz) - xs, (one_c * zz) + c, 0,
            0, 0, 0, 1
        ]);
    };

    /**
     * Returns a rotation matrix to rotate a vector from one direction to
     * another.
     * @memberof Mat44
     *
     * @param {Vec3} from - The starting direction.
     * @param {Vec3} to - The ending direction.
     *
     * @returns {Mat44} The matrix representing the rotation.
     */
    Mat44.rotationFromTo = function( fromVec, toVec ) {
        /*
        This method is based on the code from:
            Tomas Mller, John Hughes
            Efficiently Building a Matrix to Rotate One Vector to Another
            Journal of Graphics Tools, 4(4):1-4, 1999
        */
        var from = new Vec3( fromVec ).normalize();
        var to = new Vec3( toVec ).normalize();
        var e = from.dot( to );
        var f = Math.abs( e );
        var x, u, v;
        var fx, fy, fz;
        var ux, uz;
        var c1, c2, c3;
        if ( f > 1.0 - EPSILON ) {
            // 'from' and 'to' almost parallel
            // nearly orthogonal
            fx = Math.abs( from.x );
            fy = Math.abs( from.y );
            fz = Math.abs( from.z );
            if ( fx < fy ) {
                if ( fx < fz ) {
                    x = new Vec3( 1, 0, 0 );
                } else {
                    x = new Vec3( 0, 0, 1 );
                }
            } else {
                if ( fy < fz ) {
                    x = new Vec3( 0, 1, 0 );
                } else {
                    x = new Vec3( 0, 0, 1 );
                }
            }
            u = x.sub( from );
            v = x.sub( to );
            c1 = 2.0 / u.dot( u );
            c2 = 2.0 / v.dot( v );
            c3 = c1*c2 * u.dot( v );
            // set matrix entries
            return new Mat44([
                -c1*u.x*u.x - c2*v.x*v.x + c3*v.x*u.x + 1.0,
                -c1*u.y*u.x - c2*v.y*v.x + c3*v.y*u.x,
                -c1*u.z*u.x - c2*v.z*v.x + c3*v.z*u.x,
                0.0,
                -c1*u.x*u.y - c2*v.x*v.y + c3*v.x*u.y,
                -c1*u.y*u.y - c2*v.y*v.y + c3*v.y*u.y + 1.0,
                -c1*u.z*u.y - c2*v.z*v.y + c3*v.z*u.y,
                1.0,
                -c1*u.x*u.z - c2*v.x*v.z + c3*v.x*u.z,
                -c1*u.y*u.z - c2*v.y*v.z + c3*v.y*u.z,
                -c1*u.z*u.z - c2*v.z*v.z + c3*v.z*u.z + 1.0,
                 0.0,
                 0.0,
                 0.0,
                 0.0,
                 1.0
            ]);
        }
        // the most common case, unless 'from'='to', or 'to'=-'from'
        v = from.cross( to );
        u = 1.0 / ( 1.0 + e );    // optimization by Gottfried Chen
        ux = u * v.x;
        uz = u * v.z;
        c1 = ux * v.y;
        c2 = ux * v.z;
        c3 = uz * v.y;
        return new Mat44([
            e + ux * v.x,
            c1 + v.z,
            c2 - v.y,
            0.0,
            c1 - v.z,
            e + u * v.y * v.y,
            c3 + v.x,
            0.0,
            c2 + v.y,
            c3 - v.x,
            e + uz * v.z,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0
        ]);
    };

    /**
     * Adds the matrix with the provided matrix argument, returning a new Ma33
     * object.
     * @memberof Mat44
     *
     * @param {Mat33|Array} that - The matrix to add.
     *
     * @returns {Mat44} The sum of the two matrices.
     */
    Mat44.prototype.addMat33 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat44([
            this.data[0] + that[0],
            this.data[1] + that[1],
            this.data[2] + that[2],
            this.data[3],
            this.data[4] + that[3],
            this.data[5] + that[4],
            this.data[6] + that[5],
            this.data[7],
            this.data[8] + that[6],
            this.data[9] + that[7],
            this.data[10] + that[8],
            this.data[11],
            this.data[12],
            this.data[13],
            this.data[14],
            this.data[15]
        ]);
    };

    /**
     * Adds the matrix with the provided matrix argument, returning a new Ma33
     * object.
     * @memberof Mat44
     *
     * @param {Mat44|Array} that - The matrix to add.
     *
     * @returns {Mat44} The sum of the two matrices.
     */
    Mat44.prototype.addMat44 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat44([
            this.data[0] + that[0],
            this.data[1] + that[1],
            this.data[2] + that[2],
            this.data[3] + that[3],
            this.data[4] + that[4],
            this.data[5] + that[5],
            this.data[6] + that[6],
            this.data[7] + that[7],
            this.data[8] + that[8],
            this.data[9] + that[9],
            this.data[10] + that[10],
            this.data[11] + that[11],
            this.data[12] + that[12],
            this.data[13] + that[13],
            this.data[14] + that[14],
            this.data[15] + that[15],
        ]);
    };

    /**
     * Subtracts the provided matrix argument from the matrix, returning a new
     * Mat44 object.
     * @memberof Mat44
     *
     * @param {Mat33|Array} that - The matrix to add.
     *
     * @returns {Mat44} The difference of the two matrices.
     */
    Mat44.prototype.subMat33 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat44([
            this.data[0] - that[0],
            this.data[1] - that[1],
            this.data[2] - that[2],
            this.data[3],
            this.data[4] - that[3],
            this.data[5] - that[4],
            this.data[6] - that[5],
            this.data[7],
            this.data[8] - that[6],
            this.data[9] - that[7],
            this.data[10] - that[8],
            this.data[11],
            this.data[12],
            this.data[13],
            this.data[14],
            this.data[15]
        ]);
    };

    /**
     * Subtracts the provided matrix argument from the matrix, returning a new
     * Mat44 object.
     * @memberof Mat44
     *
     * @param {Mat44|Array} that - The matrix to add.
     *
     * @returns {Mat44} The difference of the two matrices.
     */
    Mat44.prototype.subMat44 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat44([
            this.data[0] - that[0],
            this.data[1] - that[1],
            this.data[2] - that[2],
            this.data[3] - that[3],
            this.data[4] - that[4],
            this.data[5] - that[5],
            this.data[6] - that[6],
            this.data[7] - that[7],
            this.data[8] - that[8],
            this.data[9] - that[9],
            this.data[10] - that[10],
            this.data[11] - that[11],
            this.data[12] - that[12],
            this.data[13] - that[13],
            this.data[14] - that[14],
            this.data[15] - that[15],
        ]);
    };

    /**
     * Multiplies the provded vector argument by the matrix, returning a new
     * Vec3 object.
     * @memberof Mat44
     *
     * @param {Vec3|Vec4|Array} - The vector to be multiplied by the matrix.
     *
     * @returns {Vec3} The resulting vector.
     */
    Mat44.prototype.multVec3 = function( that ) {
        // ensure 'that' is a Vec3
        // it is safe to only cast if Array since Vec4 has own method
        if ( that instanceof Array ) {
            return new Vec3(
                this.data[0] * that[0] + this.data[4] * that[1] + this.data[8] * that[2] + this.data[12],
                this.data[1] * that[0] + this.data[5] * that[1] + this.data[9] * that[2] + this.data[13],
                this.data[2] * that[0] + this.data[6] * that[1] + this.data[10] * that[2] + this.data[14]
            );
        }
        return new Vec3(
            this.data[0] * that.x + this.data[4] * that.y + this.data[8] * that.z + this.data[12],
            this.data[1] * that.x + this.data[5] * that.y + this.data[9] * that.z + this.data[13],
            this.data[2] * that.x + this.data[6] * that.y + this.data[10] * that.z + this.data[14]
        );
    };

    /**
     * Multiplies the provded vector argument by the matrix, returning a new
     * Vec3 object.
     * @memberof Mat44
     *
     * @param {Vec3|Vec4|Array} - The vector to be multiplied by the matrix.
     *
     * @returns {Vec4} The resulting vector.
     */
    Mat44.prototype.multVec4 = function( that ) {
        // ensure 'that' is a Vec4
        // it is safe to only cast if Array since Vec3 has own method
        if ( that instanceof Array ) {
            return new Vec4(
                this.data[0] * that[0] + this.data[4] * that[1] + this.data[8] * that[2] + this.data[12] * that[3],
                this.data[1] * that[0] + this.data[5] * that[1] + this.data[9] * that[2] + this.data[13] * that[3],
                this.data[2] * that[0] + this.data[6] * that[1] + this.data[10] * that[2] + this.data[14] * that[3],
                this.data[3] * that[0] + this.data[7] * that[1] + this.data[11] * that[2] + this.data[15] * that[3]
            );
        }
        return new Vec4(
            this.data[0] * that.x + this.data[4] * that.y + this.data[8] * that.z + this.data[12] * that.w,
            this.data[1] * that.x + this.data[5] * that.y + this.data[9] * that.z + this.data[13] * that.w,
            this.data[2] * that.x + this.data[6] * that.y + this.data[10] * that.z + this.data[14] * that.w,
            this.data[3] * that.x + this.data[7] * that.y + this.data[11] * that.z + this.data[15] * that.w
        );
    };

    /**
     * Multiplies all components of the matrix by the provded scalar argument,
     * returning a new Mat44 object.
     * @memberof Mat44
     *
     * @param {number} - The scalar to multiply the matrix by.
     *
     * @returns {Mat44} The resulting matrix.
     */
    Mat44.prototype.multScalar = function( that ) {
        return new Mat44([
            this.data[0] * that,
            this.data[1] * that,
            this.data[2] * that,
            this.data[3] * that,
            this.data[4] * that,
            this.data[5] * that,
            this.data[6] * that,
            this.data[7] * that,
            this.data[8] * that,
            this.data[9] * that,
            this.data[10] * that,
            this.data[11] * that,
            this.data[12] * that,
            this.data[13] * that,
            this.data[14] * that,
            this.data[15] * that
        ]);
    };

    /**
     * Multiplies the provded matrix argument by the matrix, returning a new
     * Mat44 object.
     * @memberof Mat44
     *
     * @param {Mat33|Array} - The matrix to be multiplied by the matrix.
     *
     * @returns {Mat44} The resulting matrix.
     */
    Mat44.prototype.multMat33 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat44([
            this.data[0] * that[0] + this.data[4] * that[1] + this.data[8] * that[2],
            this.data[1] * that[0] + this.data[5] * that[1] + this.data[9] * that[2],
            this.data[2] * that[0] + this.data[6] * that[1] + this.data[10] * that[2],
            this.data[3] * that[0] + this.data[7] * that[1] + this.data[11] * that[2],
            this.data[0] * that[3] + this.data[4] * that[4] + this.data[8] * that[5],
            this.data[1] * that[3] + this.data[5] * that[4] + this.data[9] * that[5],
            this.data[2] * that[3] + this.data[6] * that[4] + this.data[10] * that[5],
            this.data[3] * that[3] + this.data[7] * that[4] + this.data[11] * that[5],
            this.data[0] * that[6] + this.data[4] * that[7] + this.data[8] * that[8],
            this.data[1] * that[6] + this.data[5] * that[7] + this.data[9] * that[8],
            this.data[2] * that[6] + this.data[6] * that[7] + this.data[10] * that[8],
            this.data[3] * that[6] + this.data[7] * that[7] + this.data[11] * that[8],
            this.data[12],
            this.data[13],
            this.data[14],
            this.data[15]
        ]);
    };

    /**
     * Multiplies the provded matrix argument by the matrix, returning a new
     * Mat44 object.
     * @memberof Mat44
     *
     * @param {Mat44|Array} - The matrix to be multiplied by the matrix.
     *
     * @returns {Mat44} The resulting matrix.
     */
    Mat44.prototype.multMat44 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat44([
            this.data[0] * that[0] + this.data[4] * that[1] + this.data[8] * that[2] + this.data[12] * that[3],
            this.data[1] * that[0] + this.data[5] * that[1] + this.data[9] * that[2] + this.data[13] * that[3],
            this.data[2] * that[0] + this.data[6] * that[1] + this.data[10] * that[2] + this.data[14] * that[3],
            this.data[3] * that[0] + this.data[7] * that[1] + this.data[11] * that[2] + this.data[15] * that[3],
            this.data[0] * that[4] + this.data[4] * that[5] + this.data[8] * that[6] + this.data[12] * that[7],
            this.data[1] * that[4] + this.data[5] * that[5] + this.data[9] * that[6] + this.data[13] * that[7],
            this.data[2] * that[4] + this.data[6] * that[5] + this.data[10] * that[6] + this.data[14] * that[7],
            this.data[3] * that[4] + this.data[7] * that[5] + this.data[11] * that[6] + this.data[15] * that[7],
            this.data[0] * that[8] + this.data[4] * that[9] + this.data[8] * that[10] + this.data[12] * that[11],
            this.data[1] * that[8] + this.data[5] * that[9] + this.data[9] * that[10] + this.data[13] * that[11],
            this.data[2] * that[8] + this.data[6] * that[9] + this.data[10] * that[10] + this.data[14] * that[11],
            this.data[3] * that[8] + this.data[7] * that[9] + this.data[11] * that[10] + this.data[15] * that[11],
            this.data[0] * that[12] + this.data[4] * that[13] + this.data[8] * that[14] + this.data[12] * that[15],
            this.data[1] * that[12] + this.data[5] * that[13] + this.data[9] * that[14] + this.data[13] * that[15],
            this.data[2] * that[12] + this.data[6] * that[13] + this.data[10] * that[14] + this.data[14] * that[15],
            this.data[3] * that[12] + this.data[7] * that[13] + this.data[11] * that[14] + this.data[15] * that[15]
        ]);
    };

    /**
     * Divides all components of the matrix by the provded scalar argument,
     * returning a new Mat44 object.
     * @memberof Mat44
     *
     * @param {number} - The scalar to divide the matrix by.
     *
     * @returns {Mat44} The resulting matrix.
     */
    Mat44.prototype.divScalar = function( that ) {
        return new Mat44([
            this.data[0] / that,
            this.data[1] / that,
            this.data[2] / that,
            this.data[3] / that,
            this.data[4] / that,
            this.data[5] / that,
            this.data[6] / that,
            this.data[7] / that,
            this.data[8] / that,
            this.data[9] / that,
            this.data[10] / that,
            this.data[11] / that,
            this.data[12] / that,
            this.data[13] / that,
            this.data[14] / that,
            this.data[15] / that
        ]);
    };

    /**
     * Returns true if the all components match those of a provided matrix.
     * An optional epsilon value may be provided.
     * @memberof Mat44
     *
     * @param {Mat44|Array} that - The matrix to test equality with.
     * @param {number} epsilon - The epsilon value. Optional.
     *
     * @returns {boolean} Whether or not the matrix components match.
     */
    Mat44.prototype.equals = function( that, epsilon ) {
        epsilon = epsilon === undefined ? 0 : epsilon;
        that = ( that instanceof Array ) ? that : that.data;
        return (( this.data[0] === that[0] ) || ( Math.abs( this.data[0] - that[0] ) <= epsilon ) ) &&
            (( this.data[1] === that[1] ) || ( Math.abs( this.data[1] - that[1] ) <= epsilon ) ) &&
            (( this.data[2] === that[2] ) || ( Math.abs( this.data[2] - that[2] ) <= epsilon ) ) &&
            (( this.data[3] === that[3] ) || ( Math.abs( this.data[3] - that[3] ) <= epsilon ) ) &&
            (( this.data[4] === that[4] ) || ( Math.abs( this.data[4] - that[4] ) <= epsilon ) ) &&
            (( this.data[5] === that[5] ) || ( Math.abs( this.data[5] - that[5] ) <= epsilon ) ) &&
            (( this.data[6] === that[6] ) || ( Math.abs( this.data[6] - that[6] ) <= epsilon ) ) &&
            (( this.data[7] === that[7] ) || ( Math.abs( this.data[7] - that[7] ) <= epsilon ) ) &&
            (( this.data[8] === that[8] ) || ( Math.abs( this.data[8] - that[8] ) <= epsilon ) ) &&
            (( this.data[9] === that[9] ) || ( Math.abs( this.data[9] - that[9] ) <= epsilon ) ) &&
            (( this.data[10] === that[10] ) || ( Math.abs( this.data[10] - that[10] ) <= epsilon ) ) &&
            (( this.data[11] === that[11] ) || ( Math.abs( this.data[11] - that[11] ) <= epsilon ) ) &&
            (( this.data[12] === that[12] ) || ( Math.abs( this.data[12] - that[12] ) <= epsilon ) ) &&
            (( this.data[13] === that[13] ) || ( Math.abs( this.data[13] - that[13] ) <= epsilon ) ) &&
            (( this.data[14] === that[14] ) || ( Math.abs( this.data[14] - that[14] ) <= epsilon ) ) &&
            (( this.data[15] === that[15] ) || ( Math.abs( this.data[15] - that[15] ) <= epsilon ) );
    };

    /**
     * Returns an orthographic projection matrix.
     *
     * @param {number} left - The minimum x extent of the projection.
     * @param {number} right - The maximum x extent of the projection.
     * @param {number} bottom - The minimum y extent of the projection.
     * @param {number} top - The maximum y extent of the projection.
     * @param {number} near - The minimum z extent of the projection.
     * @param {number} far - The maximum z extent of the projection.
     *
     * @returns {Mat44} The orthographic projection matrix.
     */
    Mat44.ortho = function( left, right, bottom, top, near, far ) {
        var mat = Mat44.identity();
        mat.data[0] = 2 / ( right - left );
        mat.data[5] = 2 / ( top - bottom );
        mat.data[10] = -2 / ( far - near );
        mat.data[12] = -( ( right + left ) / ( right - left ) );
        mat.data[13] = -( ( top + bottom ) / ( top - bottom ) );
        mat.data[14] = -( ( far + near ) / ( far - near ) );
        return mat;
    };

    /**
     * Returns a perspective projection matrix.
     *
     * @param {number} fov - The field of view.
     * @param {number} aspect - The aspect ratio.
     * @param {number} zMin - The minimum y extent of the frustum.
     * @param {number} zMax - The maximum y extent of the frustum.
     *
     * @returns {Mat44} The perspective projection matrix.
     */
    Mat44.perspective = function( fov, aspect, zMin, zMax ) {
        var yMax = zMin * Math.tan( fov * ( Math.PI / 360.0 ) ),
            yMin = -yMax,
            xMin = yMin * aspect,
            xMax = -xMin,
            mat = Mat44.identity();
        mat.data[0] = (2 * zMin) / (xMax - xMin);
        mat.data[5] = (2 * zMin) / (yMax - yMin);
        mat.data[8] = (xMax + xMin) / (xMax - xMin);
        mat.data[9] = (yMax + yMin) / (yMax - yMin);
        mat.data[10] = -((zMax + zMin) / (zMax - zMin));
        mat.data[11] = -1;
        mat.data[14] = -( ( 2 * (zMax*zMin) )/(zMax - zMin));
        mat.data[15] = 0;
        return mat;
    };

    /**
     * Returns the transpose of the matrix.
     * @memberof Mat44
     *
     * @returns {Mat44} The transposed matrix.
     */
    Mat44.prototype.transpose = function() {
        return new Mat44([
            this.data[0],
            this.data[4],
            this.data[8],
            this.data[12],
            this.data[1],
            this.data[5],
            this.data[9],
            this.data[13],
            this.data[2],
            this.data[6],
            this.data[10],
            this.data[14],
            this.data[3],
            this.data[7],
            this.data[11],
            this.data[15]
        ]);
    };

    /**
     * Returns the inverse of the matrix.
     * @memberof Mat44
     *
     * @returns {Mat44} The inverted matrix.
     */
    Mat44.prototype.inverse = function() {
        var inv = new Mat44([
            // col 0
            this.data[5]*this.data[10]*this.data[15] -
                this.data[5]*this.data[11]*this.data[14] -
                this.data[9]*this.data[6]*this.data[15] +
                this.data[9]*this.data[7]*this.data[14] +
                this.data[13]*this.data[6]*this.data[11] -
                this.data[13]*this.data[7]*this.data[10],
            -this.data[1]*this.data[10]*this.data[15] +
                this.data[1]*this.data[11]*this.data[14] +
                this.data[9]*this.data[2]*this.data[15] -
                this.data[9]*this.data[3]*this.data[14] -
                this.data[13]*this.data[2]*this.data[11] +
                this.data[13]*this.data[3]*this.data[10],
            this.data[1]*this.data[6]*this.data[15] -
                this.data[1]*this.data[7]*this.data[14] -
                this.data[5]*this.data[2]*this.data[15] +
                this.data[5]*this.data[3]*this.data[14] +
                this.data[13]*this.data[2]*this.data[7] -
                this.data[13]*this.data[3]*this.data[6],
            -this.data[1]*this.data[6]*this.data[11] +
                this.data[1]*this.data[7]*this.data[10] +
                this.data[5]*this.data[2]*this.data[11] -
                this.data[5]*this.data[3]*this.data[10] -
                this.data[9]*this.data[2]*this.data[7] +
                this.data[9]*this.data[3]*this.data[6],
            // col 1
            -this.data[4]*this.data[10]*this.data[15] +
                this.data[4]*this.data[11]*this.data[14] +
                this.data[8]*this.data[6]*this.data[15] -
                this.data[8]*this.data[7]*this.data[14] -
                this.data[12]*this.data[6]*this.data[11] +
                this.data[12]*this.data[7]*this.data[10],
            this.data[0]*this.data[10]*this.data[15] -
                this.data[0]*this.data[11]*this.data[14] -
                this.data[8]*this.data[2]*this.data[15] +
                this.data[8]*this.data[3]*this.data[14] +
                this.data[12]*this.data[2]*this.data[11] -
                this.data[12]*this.data[3]*this.data[10],
            -this.data[0]*this.data[6]*this.data[15] +
                this.data[0]*this.data[7]*this.data[14] +
                this.data[4]*this.data[2]*this.data[15] -
                this.data[4]*this.data[3]*this.data[14] -
                this.data[12]*this.data[2]*this.data[7] +
                this.data[12]*this.data[3]*this.data[6],
            this.data[0]*this.data[6]*this.data[11] -
                this.data[0]*this.data[7]*this.data[10] -
                this.data[4]*this.data[2]*this.data[11] +
                this.data[4]*this.data[3]*this.data[10] +
                this.data[8]*this.data[2]*this.data[7] -
                this.data[8]*this.data[3]*this.data[6],
            // col 2
            this.data[4]*this.data[9]*this.data[15] -
                this.data[4]*this.data[11]*this.data[13] -
                this.data[8]*this.data[5]*this.data[15] +
                this.data[8]*this.data[7]*this.data[13] +
                this.data[12]*this.data[5]*this.data[11] -
                this.data[12]*this.data[7]*this.data[9],
            -this.data[0]*this.data[9]*this.data[15] +
                this.data[0]*this.data[11]*this.data[13] +
                this.data[8]*this.data[1]*this.data[15] -
                this.data[8]*this.data[3]*this.data[13] -
                this.data[12]*this.data[1]*this.data[11] +
                this.data[12]*this.data[3]*this.data[9],
            this.data[0]*this.data[5]*this.data[15] -
                this.data[0]*this.data[7]*this.data[13] -
                this.data[4]*this.data[1]*this.data[15] +
                this.data[4]*this.data[3]*this.data[13] +
                this.data[12]*this.data[1]*this.data[7] -
                this.data[12]*this.data[3]*this.data[5],
            -this.data[0]*this.data[5]*this.data[11] +
                this.data[0]*this.data[7]*this.data[9] +
                this.data[4]*this.data[1]*this.data[11] -
                this.data[4]*this.data[3]*this.data[9] -
                this.data[8]*this.data[1]*this.data[7] +
                this.data[8]*this.data[3]*this.data[5],
            // col 3
            -this.data[4]*this.data[9]*this.data[14] +
                this.data[4]*this.data[10]*this.data[13] +
                this.data[8]*this.data[5]*this.data[14] -
                this.data[8]*this.data[6]*this.data[13] -
                this.data[12]*this.data[5]*this.data[10] +
                this.data[12]*this.data[6]*this.data[9],
            this.data[0]*this.data[9]*this.data[14] -
                this.data[0]*this.data[10]*this.data[13] -
                this.data[8]*this.data[1]*this.data[14] +
                this.data[8]*this.data[2]*this.data[13] +
                this.data[12]*this.data[1]*this.data[10] -
                this.data[12]*this.data[2]*this.data[9],
            -this.data[0]*this.data[5]*this.data[14] +
                this.data[0]*this.data[6]*this.data[13] +
                this.data[4]*this.data[1]*this.data[14] -
                this.data[4]*this.data[2]*this.data[13] -
                this.data[12]*this.data[1]*this.data[6] +
                this.data[12]*this.data[2]*this.data[5],
            this.data[0]*this.data[5]*this.data[10] -
                this.data[0]*this.data[6]*this.data[9] -
                this.data[4]*this.data[1]*this.data[10] +
                this.data[4]*this.data[2]*this.data[9] +
                this.data[8]*this.data[1]*this.data[6] -
                this.data[8]*this.data[2]*this.data[5]
        ]);
        // calculate determinant
        var det = this.data[0]*inv.data[0] +
            this.data[1]*inv.data[4] +
            this.data[2]*inv.data[8] +
            this.data[3]*inv.data[12];
        return inv.multScalar( 1 / det );
    };

    /**
     * Decomposes the matrix into the corresponding x, y, and z axes, along with
     * a scale.
     * @memberof Mat44
     *
     * @returns {Object} The decomposed components of the matrix.
     */
    Mat44.prototype.decompose = function() {
        // extract transform components
        var col0 = new Vec3( this.col( 0 ) ),
            col1 = new Vec3( this.col( 1 ) ),
            col2 = new Vec3( this.col( 2 ) ),
            col3 = new Vec3( this.col( 3 ) );
        return {
            left: col0.normalize(),
            up: col1.normalize(),
            forward: col2.normalize(),
            origin: col3,
            scale: new Vec3( col0.length(), col1.length(), col2.length() )
        };
    };

    /**
     * Returns a random transform matrix composed of a rotation and scale.
     * @memberof Mat44
     *
     * @returns {Mat44} A random transform matrix.
     */
    Mat44.random = function() {
        var r = Mat44.rotationRadians( Math.random() * 360, Vec3.random() );
        var s = Mat44.scale( Math.random() * 10 );
        var t = Mat44.translation( Vec3.random() );
        return t.multMat44( r.multMat44( s ) );
    };

    /**
     * Returns a string representation of the matrix.
     * @memberof Mat44
     *
     * @returns {String} The string representation of the matrix.
     */
    Mat44.prototype.toString = function() {
        return this.data[0] +', '+ this.data[4] +', '+ this.data[8] +', '+ this.data[12] +',\n' +
            this.data[1] +', '+ this.data[5] +', '+ this.data[9] +', '+ this.data[13] +',\n' +
            this.data[2] +', '+ this.data[6] +', '+ this.data[10] +', '+ this.data[14] +',\n' +
            this.data[3] +', '+ this.data[7] +', '+ this.data[11] +', '+ this.data[15];
    };

    /**
     * Returns an array representation of the matrix.
     * @memberof Mat44
     *
     * @returns {Array} The matrix as an array.
     */
    Mat44.prototype.toArray = function() {
        return this.data.slice( 0 );
    };

    module.exports = Mat44;

}());
