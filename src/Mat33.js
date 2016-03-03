(function() {

    'use strict';

    var Vec3 = require('./Vec3');
    var EPSILON = require('./Epsilon');

    /**
     * Instantiates a Mat33 object.
     * @class Mat33
     * @classdesc A 3x3 column-major matrix.
     */
    function Mat33( that ) {
        that = that || [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
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
        }
    }

    /**
     * Returns a row of the matrix as a Vec3 object.
     * @memberof Mat33
     *
     * @param {number} index - The 0-based row index.
     * @param {Vec3||Array} vec - The vector to replace the row. Optional.
     *
     * @returns {Vec3} The row vector.
     */
    Mat33.prototype.row = function( index, vec ) {
        if ( vec ) {
            this.data[0+index] = vec[0] || vec.x;
            this.data[3+index] = vec[1] || vec.y;
            this.data[6+index] = vec[2] || vec.z;
            return this;
        }
        return new Vec3(
            this.data[0+index],
            this.data[3+index],
            this.data[6+index] );
    };

    /**
     * Returns a column of the matrix as a Vec3 object.
     * @memberof Mat33
     *
     * @param {number} index - The 0-based col index.
     * @param {Vec3||Array} vec - The vector to replace the col. Optional.
     *
     * @returns {Vec3} The column vector.
     */
    Mat33.prototype.col = function( index, vec ) {
        if ( vec ) {
            this.data[0+index*3] = vec[0] || vec.x;
            this.data[1+index*3] = vec[1] || vec.y;
            this.data[2+index*3] = vec[2] || vec.z;
            return this;
        }
        return new Vec3(
            this.data[0+index*3],
            this.data[1+index*3],
            this.data[2+index*3] );
    };

    /**
     * Returns the identity matrix.
     * @memberof Mat33
     *
     * @returns {Mat33} The identiy matrix.
     */
    Mat33.identity = function() {
        return new Mat33();
    };

    /**
     * Returns a scale matrix.
     * @memberof Mat33
     *
     * @param {Vec3|Array|number} scale - The scalar or vector scaling factor.
     *
     * @returns {Mat33} The scale matrix.
     */
    Mat33.scale = function( scale ) {
        if ( typeof scale === 'number' ) {
            return new Mat33([
                scale, 0, 0,
                0, scale, 0,
                0, 0, scale
            ]);
        } else if ( scale instanceof Array ) {
            return new Mat33([
                scale[0], 0, 0,
                0, scale[1], 0,
                0, 0, scale[2]
            ]);
        }
        return new Mat33([
            scale.x, 0, 0,
            0, scale.y, 0,
            0, 0, scale.z
        ]);
    };

    /**
     * Returns a rotation matrix defined by an axis and an angle.
     * @memberof Mat33
     *
     * @param {number} angle - The angle of the rotation, in degrees.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Mat33} The rotation matrix.
     */
    Mat33.rotationDegrees = function( angle, axis ) {
        return this.rotationRadians( angle*Math.PI/180, axis );
    };

    /**
     * Returns a rotation matrix defined by an axis and an angle.
     * @memberof Mat33
     *
     * @param {number} angle - The angle of the rotation, in radians.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Mat33} The rotation matrix.
     */
    Mat33.rotationRadians = function( angle, axis ) {
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
        return new Mat33([
            (one_c * xx) + c, (one_c * xy) + zs, (one_c * zx) - ys,
            (one_c * xy) - zs, (one_c * yy) + c, (one_c * yz) + xs,
            (one_c * zx) + ys, (one_c * yz) - xs, (one_c * zz) + c
        ]);
    };

    /**
     * Returns a rotation matrix to rotate a vector from one direction to
     * another.
     * @memberof Mat33
     *
     * @param {Vec3} from - The starting direction.
     * @param {Vec3} to - The ending direction.
     *
     * @returns {Mat33} The matrix representing the rotation.
     */
    Mat33.rotationFromTo = function( fromVec, toVec ) {
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
            return new Mat33([
                -c1*u.x*u.x - c2*v.x*v.x + c3*v.x*u.x + 1.0,
                -c1*u.y*u.x - c2*v.y*v.x + c3*v.y*u.x,
                -c1*u.z*u.x - c2*v.z*v.x + c3*v.z*u.x,
                -c1*u.x*u.y - c2*v.x*v.y + c3*v.x*u.y,
                -c1*u.y*u.y - c2*v.y*v.y + c3*v.y*u.y + 1.0,
                -c1*u.z*u.y - c2*v.z*v.y + c3*v.z*u.y,
                -c1*u.x*u.z - c2*v.x*v.z + c3*v.x*u.z,
                -c1*u.y*u.z - c2*v.y*v.z + c3*v.y*u.z,
                -c1*u.z*u.z - c2*v.z*v.z + c3*v.z*u.z + 1.0
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
        return new Mat33([
            e + ux * v.x,
            c1 + v.z,
            c2 - v.y,
            c1 - v.z,
            e + u * v.y * v.y,
            c3 + v.x,
            c2 + v.y,
            c3 - v.x,
            e + uz * v.z
        ]);
    };

    /**
     * Adds the matrix with the provided matrix argument, returning a new Ma33
     * object.
     * @memberof Mat33
     *
     * @param {Mat33|Array} that - The matrix to add.
     *
     * @returns {Mat33} The sum of the two matrices.
     */
    Mat33.prototype.addMat33 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat33([
            this.data[0] + that[0],
            this.data[1] + that[1],
            this.data[2] + that[2],
            this.data[3] + that[3],
            this.data[4] + that[4],
            this.data[5] + that[5],
            this.data[6] + that[6],
            this.data[7] + that[7],
            this.data[8] + that[8],
        ]);
    };

    /**
     * Adds the matrix with the provided matrix argument, returning a new Ma33
     * object.
     * @memberof Mat33
     *
     * @param {Mat44|Array} that - The matrix to add.
     *
     * @returns {Mat33} The sum of the two matrices.
     */
    Mat33.prototype.addMat44 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat33([
            this.data[0] + that[0],
            this.data[1] + that[1],
            this.data[2] + that[2],
            this.data[3] + that[4],
            this.data[4] + that[5],
            this.data[5] + that[6],
            this.data[6] + that[8],
            this.data[7] + that[9],
            this.data[8] + that[10],
        ]);
    };

    /**
     * Subtracts the provided matrix argument from the matrix, returning a new
     * Mat33 object.
     * @memberof Mat33
     *
     * @param {Mat33|Array} that - The matrix to add.
     *
     * @returns {Mat33} The difference of the two matrices.
     */
    Mat33.prototype.subMat33 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat33([
            this.data[0] - that[0],
            this.data[1] - that[1],
            this.data[2] - that[2],
            this.data[3] - that[3],
            this.data[4] - that[4],
            this.data[5] - that[5],
            this.data[6] - that[6],
            this.data[7] - that[7],
            this.data[8] - that[8],
        ]);
    };

    /**
     * Subtracts the provided matrix argument from the matrix, returning a new
     * Mat33 object.
     * @memberof Mat33
     *
     * @param {Mat44|Array} that - The matrix to add.
     *
     * @returns {Mat33} The difference of the two matrices.
     */
    Mat33.prototype.subMat44 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat33([
            this.data[0] - that[0],
            this.data[1] - that[1],
            this.data[2] - that[2],
            this.data[3] - that[4],
            this.data[4] - that[5],
            this.data[5] - that[6],
            this.data[6] - that[8],
            this.data[7] - that[9],
            this.data[8] - that[10],
        ]);
    };

    /**
     * Multiplies the provded vector argument by the matrix, returning a new
     * Vec3 object.
     * @memberof Mat33
     *
     * @param {Vec3|Vec4|Array} - The vector to be multiplied by the matrix.
     *
     * @returns {Vec3} The resulting vector.
     */
    Mat33.prototype.multVec3 = function( that ) {
        // ensure 'that' is a Vec3
        // it is safe to only cast if Array since the .w of a Vec4 is not used
        if ( that instanceof Array ) {
            return new Vec3(
                this.data[0] * that[0] + this.data[3] * that[1] + this.data[6] * that[2],
                this.data[1] * that[0] + this.data[4] * that[1] + this.data[7] * that[2],
                this.data[2] * that[0] + this.data[5] * that[1] + this.data[8] * that[2] );
        }
        return new Vec3(
            this.data[0] * that.x + this.data[3] * that.y + this.data[6] * that.z,
            this.data[1] * that.x + this.data[4] * that.y + this.data[7] * that.z,
            this.data[2] * that.x + this.data[5] * that.y + this.data[8] * that.z );
    };

    /**
     * Multiplies all components of the matrix by the provded scalar argument,
     * returning a new Mat33 object.
     * @memberof Mat33
     *
     * @param {number} - The scalar to multiply the matrix by.
     *
     * @returns {Mat33} The resulting matrix.
     */
    Mat33.prototype.multScalar = function( that ) {
        return new Mat33([
            this.data[0] * that,
            this.data[1] * that,
            this.data[2] * that,
            this.data[3] * that,
            this.data[4] * that,
            this.data[5] * that,
            this.data[6] * that,
            this.data[7] * that,
            this.data[8] * that
        ]);
    };

    /**
     * Multiplies the provded matrix argument by the matrix, returning a new
     * Mat33 object.
     * @memberof Mat33
     *
     * @param {Mat33|Array} - The matrix to be multiplied by the matrix.
     *
     * @returns {Mat33} The resulting matrix.
     */
    Mat33.prototype.multMat33 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat33([
            this.data[0] * that[0] + this.data[3] * that[1] + this.data[6] * that[2],
            this.data[1] * that[0] + this.data[4] * that[1] + this.data[7] * that[2],
            this.data[2] * that[0] + this.data[5] * that[1] + this.data[8] * that[2],
            this.data[0] * that[3] + this.data[3] * that[4] + this.data[6] * that[5],
            this.data[1] * that[3] + this.data[4] * that[4] + this.data[7] * that[5],
            this.data[2] * that[3] + this.data[5] * that[4] + this.data[8] * that[5],
            this.data[0] * that[6] + this.data[3] * that[7] + this.data[6] * that[8],
            this.data[1] * that[6] + this.data[4] * that[7] + this.data[7] * that[8],
            this.data[2] * that[6] + this.data[5] * that[7] + this.data[8] * that[8]
        ]);
    };

    /**
     * Multiplies the provded matrix argument by the matrix, returning a new
     * Mat33 object.
     * @memberof Mat33
     *
     * @param {Mat44|Array} - The matrix to be multiplied by the matrix.
     *
     * @returns {Mat33} The resulting matrix.
     */
    Mat33.prototype.multMat44 = function( that ) {
        that = ( that instanceof Array ) ? that : that.data;
        return new Mat33([
            this.data[0] * that[0] + this.data[3] * that[1] + this.data[6] * that[2],
            this.data[1] * that[0] + this.data[4] * that[1] + this.data[7] * that[2],
            this.data[2] * that[0] + this.data[5] * that[1] + this.data[8] * that[2],
            this.data[0] * that[4] + this.data[3] * that[5] + this.data[6] * that[6],
            this.data[1] * that[4] + this.data[4] * that[5] + this.data[7] * that[6],
            this.data[2] * that[4] + this.data[5] * that[5] + this.data[8] * that[6],
            this.data[0] * that[8] + this.data[3] * that[9] + this.data[6] * that[10],
            this.data[1] * that[8] + this.data[4] * that[9] + this.data[7] * that[10],
            this.data[2] * that[8] + this.data[5] * that[9] + this.data[8] * that[10]
        ]);
    };

    /**
     * Divides all components of the matrix by the provded scalar argument,
     * returning a new Mat33 object.
     * @memberof Mat33
     *
     * @param {number} - The scalar to divide the matrix by.
     *
     * @returns {Mat33} The resulting matrix.
     */
    Mat33.prototype.divScalar = function( that ) {
        return new Mat33([
            this.data[0] / that,
            this.data[1] / that,
            this.data[2] / that,
            this.data[3] / that,
            this.data[4] / that,
            this.data[5] / that,
            this.data[6] / that,
            this.data[7] / that,
            this.data[8] / that
        ]);
    };

    /**
     * Returns true if the all components match those of a provided matrix.
     * An optional epsilon value may be provided.
     * @memberof Mat33
     *
     * @param {Mat33|Array} that - The matrix to test equality with.
     * @param {number} epsilon - The epsilon value. Optional.
     *
     * @returns {boolean} Whether or not the matrix components match.
     */
    Mat33.prototype.equals = function( that, epsilon ) {
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
            (( this.data[8] === that[8] ) || ( Math.abs( this.data[8] - that[8] ) <= epsilon ) );
    };

    /**
     * Returns the transpose of the matrix.
     * @memberof Mat33
     *
     * @returns {Mat33} The transposed matrix.
     */
    Mat33.prototype.transpose = function() {
        return new Mat33([
            this.data[0],
            this.data[3],
            this.data[6],
            this.data[1],
            this.data[4],
            this.data[7],
            this.data[2],
            this.data[5],
            this.data[8]
        ]);
    };

    /**
     * Returns the inverse of the matrix.
     * @memberof Mat33
     *
     * @returns {Mat33} The inverted matrix.
     */
    Mat33.prototype.inverse = function() {
        var inv = new Mat33([
            // col 0
            this.data[4]*this.data[8] - this.data[7]*this.data[5],
            -this.data[1]*this.data[8] + this.data[7]*this.data[2],
            this.data[1]*this.data[5] - this.data[4]*this.data[2],
            // col 1
            -this.data[3]*this.data[8] + this.data[6]*this.data[5],
            this.data[0]*this.data[8] - this.data[6]*this.data[2],
            -this.data[0]*this.data[5] + this.data[3]*this.data[2],
            // col 2
            this.data[3]*this.data[7] - this.data[6]*this.data[4],
            -this.data[0]*this.data[7] + this.data[6]*this.data[1],
            this.data[0]*this.data[4] - this.data[3]*this.data[1]
        ]);
        // calculate determinant
        var det = this.data[0]*inv.data[0] + this.data[1]*inv.data[3] + this.data[2]*inv.data[6];
        // return
        return inv.multScalar( 1 / det );
    };

    /**
     * Decomposes the matrix into the corresponding x, y, and z axes, along with
     * a scale.
     * @memberof Mat33
     *
     * @returns {Object} The decomposed components of the matrix.
     */
    Mat33.prototype.decompose = function() {
        var col0 = this.col( 0 ),
            col1 = this.col( 1 ),
            col2 = this.col( 2 );
        return {
            left: col0.normalize(),
            up: col1.normalize(),
            forward: col2.normalize(),
            scale: new Vec3( col0.length(), col1.length(), col2.length() )
        };
    };

    /**
     * Returns a random transform matrix composed of a rotation and scale.
     * @memberof Mat33
     *
     * @returns {Mat33} A random transform matrix.
     */
    Mat33.random = function() {
        var r = Mat33.rotationRadians( Math.random() * 360, Vec3.random() );
        var s = Mat33.scale( Math.random() * 10 );
        return r.multMat33( s );
    };

    /**
     * Returns a string representation of the matrix.
     * @memberof Mat33
     *
     * @returns {String} The string representation of the matrix.
     */
    Mat33.prototype.toString = function() {
        return this.data[0] +', '+ this.data[3] +', '+ this.data[6] +',\n' +
            this.data[1] +', '+ this.data[4] +', '+ this.data[7] +',\n' +
            this.data[2] +', '+ this.data[5] +', '+ this.data[8];
    };

    /**
     * Returns an array representation of the matrix.
     * @memberof Mat33
     *
     * @returns {Array} The matrix as an array.
     */
    Mat33.prototype.toArray = function() {
        return this.data.slice( 0 );
    };

    module.exports = Mat33;

}());
