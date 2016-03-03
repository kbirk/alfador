(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.alfador = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {

    'use strict';

    module.exports = 0.00000000001;

}());

},{}],2:[function(require,module,exports){
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

},{"./Epsilon":1,"./Vec3":8}],3:[function(require,module,exports){
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

},{"./Epsilon":1,"./Vec3":8,"./Vec4":9}],4:[function(require,module,exports){
(function() {

    'use strict';

    var Vec3 = require('./Vec3'),
        Mat33 = require('./Mat33');

    /**
     * Instantiates a Quaternion object.
     * @class Quaternion
     * @classdesc A quaternion representing an orientation.
     */
    function Quaternion() {
        switch ( arguments.length ) {
            case 1:
                // array or Quaternion argument
                var argument = arguments[0];
                if ( argument.w !== undefined ) {
                    this.w = argument.w;
                } else if ( argument[0] !== undefined ) {
                    this.w = argument[0];
                } else {
                    this.w = 1.0;
                }
                this.x = argument.x || argument[1] || 0.0;
                this.y = argument.y || argument[2] || 0.0;
                this.z = argument.z || argument[3] || 0.0;
                break;
            case 4:
                // individual component arguments
                this.w = arguments[0];
                this.x = arguments[1];
                this.y = arguments[2];
                this.z = arguments[3];
                break;
            default:
                this.w = 1;
                this.x = 0;
                this.y = 0;
                this.z = 0;
                break;
        }
    }

    /**
     * Returns a quaternion that represents an oreintation matching
     * the identity matrix.
     * @memberof Quaternion
     *
     * @returns {Quaternion} The identity quaternion.
     */
    Quaternion.identity = function() {
        return new Quaternion( 1, 0, 0, 0 );
    };

    /**
     * Returns a new Quaternion with each component negated.
     * @memberof Quaternion
     *
     * @returns {Quaternion} The negated quaternion.
     */
     Quaternion.prototype.negate = function() {
        return new Quaternion( -this.w, -this.x, -this.y, -this.z );
    };

    /**
     * Concatenates the rotations of the two quaternions, returning
     * a new Quaternion object.
     * @memberof Quaternion
     *
     * @param {Quaternion|Array} that - The quaterion to concatenate.
     *
     * @returns {Quaternion} The resulting concatenated quaternion.
     */
    Quaternion.prototype.multQuat = function( that ) {
        that = ( that instanceof Array ) ? new Quaternion( that ) : that;
        var w = (that.w * this.w) - (that.x * this.x) - (that.y * this.y) - (that.z * this.z),
            x = this.y*that.z - this.z*that.y + this.w*that.x + this.x*that.w,
            y = this.z*that.x - this.x*that.z + this.w*that.y + this.y*that.w,
            z = this.x*that.y - this.y*that.x + this.w*that.z + this.z*that.w;
        return new Quaternion( w, x, y, z );
    };

    /**
     * Applies the orientation of the quaternion as a rotation
     * matrix to the provided vector, returning a new Vec3 object.
     * @memberof Quaternion
     *
     * @param {Vec3|Vec4|Array} that - The vector to rotate.
     *
     * @returns {Vec3} The resulting rotated vector.
     */
    Quaternion.prototype.rotate = function( that ) {
        that = ( that instanceof Array ) ? new Vec3( that ) : that;
        var vq = new Quaternion( 0, that.x, that.y, that.z ),
            r = this.multQuat( vq ).multQuat( this.inverse() );
        return new Vec3( r.x, r.y, r.z );
    };

    /**
     * Returns the rotation matrix that the quaternion represents.
     * @memberof Quaternion
     *
     * @returns {Mat33} The rotation matrix represented by the quaternion.
     */
    Quaternion.prototype.matrix = function() {
        var xx = this.x*this.x,
            yy = this.y*this.y,
            zz = this.z*this.z,
            xy = this.x*this.y,
            xz = this.x*this.z,
            xw = this.x*this.w,
            yz = this.y*this.z,
            yw = this.y*this.w,
            zw = this.z*this.w;
        return new Mat33([
            1 - 2*yy - 2*zz, 2*xy + 2*zw, 2*xz - 2*yw,
            2*xy - 2*zw, 1 - 2*xx - 2*zz, 2*yz + 2*xw,
            2*xz + 2*yw, 2*yz - 2*xw, 1 - 2*xx - 2*yy ]);
    };

    /**
     * Returns a quaternion representing the rotation defined by an axis
     * and an angle.
     * @memberof Quaternion
     *
     * @param {number} angle - The angle of the rotation, in degrees.
     * @param {Vec3|Array} axis - The axis of the rotation.
     *
     * @returns {Quaternion} The quaternion representing the rotation.
     */
    Quaternion.rotationDegrees = function( angle, axis ) {
        return Quaternion.rotationRadians( angle * ( Math.PI/180 ), axis );
    };

    /**
     * Returns a quaternion representing the rotation defined by an axis
     * and an angle.
     * @memberof Quaternion
     *
     * @param {number} angle - The angle of the rotation, in radians.
     * @param {Vec3|Array} axis - The axis of the rotation.
     *
     * @returns {Quaternion} The quaternion representing the rotation.
     */
    Quaternion.rotationRadians = function( angle, axis ) {
        if ( axis instanceof Array ) {
            axis = new Vec3( axis );
        }
        // normalize arguments
        axis = axis.normalize();
        // set quaternion for the equivolent rotation
        var modAngle = ( angle > 0 ) ? angle % (2*Math.PI) : angle % (-2*Math.PI),
            sina = Math.sin( modAngle/2 ),
            cosa = Math.cos( modAngle/2 );
        return new Quaternion(
            cosa,
            axis.x * sina,
            axis.y * sina,
            axis.z * sina ).normalize();
    };

    /**
     * Returns a quaternion that has been spherically interpolated between
     * two provided quaternions for a given t value.
     * @memberof Quaternion
     *
     * @param {Quaternion} fromRot - The rotation at t = 0.
     * @param {Quaternion} toRot - The rotation at t = 1.
     * @param {number} t - The t value, from 0 to 1.
     *
     * @returns {Quaternion} The quaternion representing the interpolated rotation.
     */
    Quaternion.slerp = function( fromRot, toRot, t ) {
        if ( fromRot instanceof Array ) {
            fromRot = new Quaternion( fromRot );
        }
        if ( toRot instanceof Array ) {
            toRot = new Quaternion( toRot );
        }
        // calculate angle between
        var cosHalfTheta = ( fromRot.w * toRot.w ) +
            ( fromRot.x * toRot.x ) +
            ( fromRot.y * toRot.y ) +
            ( fromRot.z * toRot.z );
        // if fromRot=toRot or fromRot=-toRot then theta = 0 and we can return from
        if ( Math.abs( cosHalfTheta ) >= 1 ) {
            return new Quaternion(
                fromRot.w,
                fromRot.x,
                fromRot.y,
                fromRot.z );
        }
        // cosHalfTheta must be positive to return the shortest angle
        if ( cosHalfTheta < 0 ) {
            fromRot = fromRot.negate();
            cosHalfTheta = -cosHalfTheta;
        }
        var halfTheta = Math.acos( cosHalfTheta );
        var sinHalfTheta = Math.sqrt( 1 - cosHalfTheta * cosHalfTheta );
        var scaleFrom = Math.sin( ( 1.0 - t ) * halfTheta ) / sinHalfTheta;
        var scaleTo = Math.sin( t * halfTheta ) / sinHalfTheta;
        return new Quaternion(
            fromRot.w * scaleFrom + toRot.w * scaleTo,
            fromRot.x * scaleFrom + toRot.x * scaleTo,
            fromRot.y * scaleFrom + toRot.y * scaleTo,
            fromRot.z * scaleFrom + toRot.z * scaleTo );
    };

    /**
     * Returns true if the vector components match those of a provided vector.
     * An optional epsilon value may be provided.
     * @memberof Quaternion
     *
     * @param {Quaternion|Array} - The vector to calculate the dot product with.
     * @param {number} - The epsilon value. Optional.
     *
     * @returns {boolean} Whether or not the vector components match.
     */
    Quaternion.prototype.equals = function( that, epsilon ) {
        var w = that.w !== undefined ? that.w : that[0],
            x = that.x !== undefined ? that.x : that[1],
            y = that.y !== undefined ? that.y : that[2],
            z = that.z !== undefined ? that.z : that[3];
        epsilon = epsilon === undefined ? 0 : epsilon;
        return ( this.w === w || Math.abs( this.w - w ) <= epsilon ) &&
            ( this.x === x || Math.abs( this.x - x ) <= epsilon ) &&
            ( this.y === y || Math.abs( this.y - y ) <= epsilon ) &&
            ( this.z === z || Math.abs( this.z - z ) <= epsilon );
    };

    /**
     * Returns a new Quaternion of unit length.
     * @memberof Quaternion
     *
     * @returns {Quaternion} The quaternion of unit length.
     */
    Quaternion.prototype.normalize = function() {
        var mag = Math.sqrt(
                this.x*this.x +
                this.y*this.y +
                this.z*this.z +
                this.w*this.w );
        if ( mag !== 0 ) {
            return new Quaternion(
                this.w / mag,
                this.x / mag,
                this.y / mag,
                this.z / mag );
        }
        return new Quaternion();
    };

    /**
     * Returns the conjugate of the quaternion.
     * @memberof Quaternion
     *
     * @returns {Quaternion} The conjugate of the quaternion.
     */
    Quaternion.prototype.conjugate = function() {
         return new Quaternion( this.w, -this.x, -this.y, -this.z );
    };

    /**
     * Returns the inverse of the quaternion.
     * @memberof Quaternion
     *
     * @returns {Quaternion} The inverse of the quaternion.
     */
    Quaternion.prototype.inverse = function() {
        return this.conjugate();
    };

    /**
     * Returns a random Quaternion of unit length.
     * @memberof Quaternion
     *
     * @returns {Quaternion} A random vector of unit length.
     */
    Quaternion.random = function() {
        var axis = Vec3.random().normalize(),
            angle = Math.random();
        return Quaternion.rotationRadians( angle, axis );
    };

    /**
     * Returns a string representation of the quaternion.
     * @memberof Quaternion
     *
     * @returns {String} The string representation of the quaternion.
     */
    Quaternion.prototype.toString = function() {
        return this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w;
    };

    /**
     * Returns an array representation of the quaternion.
     * @memberof Quaternion
     *
     * @returns {Array} The quaternion as an array.
     */
    Quaternion.prototype.toArray = function() {
        return [  this.w, this.x, this.y, this.z ];
    };

    module.exports = Quaternion;

}());

},{"./Mat33":2,"./Vec3":8}],5:[function(require,module,exports){
(function() {

    'use strict';

    var Vec3 = require('./Vec3');
    var Mat33 = require('./Mat33');
    var Mat44 = require('./Mat44');

    /**
     * Instantiates a Transform object.
     * @class Transform
     * @classdesc A transform representing an orientation, position, and scale.
     */
    function Transform( that ) {
        that = that || {};
        if ( that.data instanceof Array ) {
            // Mat33 or Mat44, extract transform components
            that = that.decompose();
            this.up = that.up;
            this.forward = that.forward;
            this.left = that.left;
            this.scale = that.scale;
            this.origin = that.origin || new Vec3( 0, 0, 0 );
        } else {
            // set individual components
            this.up = that.up ? new Vec3( that.up ).normalize() : new Vec3( 0, 1, 0 );
            this.forward = that.forward ? new Vec3( that.forward ).normalize() : new Vec3( 0, 0, 1 );
            this.left = that.left ? new Vec3( that.left ).normalize() : this.up.cross( this.forward ).normalize();
            this.origin = that.origin ? new Vec3( that.origin ) : new Vec3( 0, 0, 0 );
            if ( typeof that.scale === 'number' ) {
                this.scale = new Vec3( that.scale, that.scale, that.scale );
            } else {
                this.scale = that.scale ? new Vec3( that.scale ) : new Vec3( 1, 1, 1 );
            }
        }
    }

    /**
     * Returns an identity transform.
     * @memberof Transform
     *
     * @returns {Transform} An identity transform.
     */
    Transform.identity = function() {
        return new Transform({
            forward: new Vec3( 0, 0, 1 ),
            up: new Vec3( 0, 1, 0 ),
            left: new Vec3( 1, 0, 0 ),
            origin: new Vec3( 0, 0, 0 ),
            scale: new Vec3( 1, 1, 1 )
        });
    };

    /**
     * If an argument is provided, sets the forward vector, otherwise returns
     * the forward vector by value. While setting, a rotation matrix from the
     * orignal forward vector to the new is used to rotate all other axes.
     * @memberof Transform
     *
     * @param {Vec3|Array} forward - The forward vector. Optional.
     *
     * @returns {Vec3|Transform} The forward vector, or the transform for chaining.
     */
    Transform.prototype.rotateForwardTo = function( forward ) {
        if ( forward instanceof Array ) {
            forward = new Vec3( forward ).normalize();
        } else {
            forward = forward.normalize();
        }
        var rot = Mat33.rotationFromTo( this.forward, forward );
        this.forward = forward;
        this.up = rot.multVec3( this.up ).normalize();
        this.left = rot.multVec3( this.left ).normalize();
        return this;
    };

    /**
     * If an argument is provided, sets the up vector, otherwise returns
     * the up vector by value. While setting, a rotation matrix from the
     * orignal up vector to the new is used to rotate all other axes.
     * @memberof Transform
     *
     * @param {Vec3|Array} up - The up vector. Optional.
     *
     * @returns {Vec3|Transform} The up vector, or the transform for chaining.
     */
    Transform.prototype.rotateUpTo = function( up ) {
        if ( up instanceof Array ) {
            up = new Vec3( up ).normalize();
        } else {
            up = up.normalize();
        }
        var rot = Mat33.rotationFromTo( this.up, up );
        this.forward = rot.multVec3( this.forward ).normalize();
        this.up = up;
        this.left = rot.multVec3( this.left ).normalize();
        return this;
    };

    /**
     * If an argument is provided, sets the left vector, otherwise returns
     * the left vector by value. While setting, a rotation matrix from the
     * orignal left vector to the new is used to rotate all other axes.
     * @memberof Transform
     *
     * @param {Vec3|Array} left - The left vector. Optional.
     *
     * @returns {Vec3|Transform} The left vector, or the transform for chaining.
     */
    Transform.prototype.rotateLeftTo = function( left ) {
        if ( left instanceof Array ) {
            left = new Vec3( left ).normalize();
        } else {
            left = left.normalize();
        }
        var rot = Mat33.rotationFromTo( this.left, left );
        this.forward = rot.multVec3( this.forward ).normalize();
        this.up = rot.multVec3( this.up ).normalize();
        this.left = left;
        return this;
    };

    /**
     * Returns the transform's scale matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The scale matrix.
     */
    Transform.prototype.scaleMatrix = function() {
        return Mat44.scale( this.scale );
    };

    /**
     * Returns the transform's rotation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The rotation matrix.
     */
    Transform.prototype.rotationMatrix = function() {
        return new Mat44([
            this.left.x, this.left.y, this.left.z, 0,
            this.up.x, this.up.y, this.up.z, 0,
            this.forward.x, this.forward.y, this.forward.z, 0,
            0, 0, 0, 1
        ]);
    };

    /**
     * Returns the transform's translation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The translation matrix.
     */
    Transform.prototype.translationMatrix = function() {
        return Mat44.translation( this.origin );
    };

    /**
     * Returns the transform's affine-transformation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The affine-transformation matrix.
     */
    Transform.prototype.matrix = function() {
        // T * R * S
        return this.translationMatrix()
            .multMat44( this.rotationMatrix() )
            .multMat44( this.scaleMatrix() );
    };

    /**
     * Returns the inverse of the transform's scale matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse scale matrix.
     */
    Transform.prototype.inverseScaleMatrix = function() {
        return Mat44.scale( new Vec3(
            1 / this.scale.x,
            1 / this.scale.y,
            1 / this.scale.z ) );
    };

    /**
     * Returns the inverse of the transform's rotation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse rotation matrix.
     */
    Transform.prototype.inverseRotationMatrix = function() {
        return new Mat44([
            this.left.x, this.up.x, this.forward.x, 0,
            this.left.y, this.up.y, this.forward.y, 0,
            this.left.z, this.up.z, this.forward.z, 0,
            0, 0, 0, 1
        ]);
    };

    /**
     * Returns the inverse of the transform's translation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse translation matrix.
     */
    Transform.prototype.inverseTranslationMatrix = function() {
        return Mat44.translation( this.origin.negate() );
    };

    /**
     * Returns the inverse of the transform's affine-transformation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse affine-transformation matrix.
     */
    Transform.prototype.inverseMatrix = function() {
        // S^-1 * R^-1 * T^-1
        return this.inverseScaleMatrix()
            .multMat44( this.inverseRotationMatrix() )
            .multMat44( this.inverseTranslationMatrix() );
    };

    /**
     * Returns the transform's view matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The view matrix.
     */
    Transform.prototype.viewMatrix = function() {
        var nOrigin = this.origin.negate(),
            right = this.left.negate(),
            backward = this.forward.negate();
        return new Mat44([
            right.x, this.up.x, backward.x, 0,
            right.y, this.up.y, backward.y, 0,
            right.z, this.up.z, backward.z, 0,
            nOrigin.dot( right ), nOrigin.dot( this.up ), nOrigin.dot( backward ), 1 ]);
    };

    /**
     * Translates the transform in world space.
     * @memberof Transform
     *
     * @param {Vec3} translation - The translation vector.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.translateWorld = function( translation ) {
        this.origin = this.origin.add( translation );
        return this;
    };

    /**
     * Translates the transform in local space.
     * @memberof Transform
     *
     * @param {Vec3} translation - The translation vector.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.translateLocal = function( translation ) {
        if ( translation instanceof Array ) {
            translation = new Vec3( translation );
        }
        this.origin = this.origin.add( this.left.multScalar( translation.x ) )
            .add( this.up.multScalar( translation.y ) )
            .add( this.forward.multScalar( translation.z ) );
        return this;
    };

    /**
     * Rotates the transform by an angle around an axis in world space.
     * @memberof Transform
     *
     * @param {number} angle - The angle of the rotation, in degrees.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.rotateWorldDegrees = function( angle, axis ) {
        return this.rotateWorldRadians( angle * Math.PI / 180, axis );
    };

    /**
     * Rotates the transform by an angle around an axis in world space.
     * @memberof Transform
     *
     * @param {number} angle - The angle of the rotation, in radians.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.rotateWorldRadians = function( angle, axis ) {
        var rot = Mat33.rotationRadians( angle, axis );
        this.up = rot.multVec3( this.up );
        this.forward = rot.multVec3( this.forward );
        this.left = rot.multVec3( this.left );
        return this;
    };

    /**
     * Rotates the transform by an angle around an axis in local space.
     * @memberof Transform
     *
     * @param {number} angle - The angle of the rotation, in degrees.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.rotateLocalDegrees = function( angle, axis ) {
        return this.rotateWorldDegrees( angle, this.rotationMatrix().multVec3( axis ) );
    };

    /**
     * Rotates the transform by an angle around an axis in local space.
     * @memberof Transform
     *
     * @param {number} angle - The angle of the rotation, in radians.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.rotateLocalRadians = function( angle, axis ) {
        return this.rotateWorldRadians( angle, this.rotationMatrix().multVec3( axis ) );
    };

    /**
     * Transforms the vector or matrix argument from the transforms local space
     * to the world space.
     * @memberof Transform
     *
     * @param {Vec3|Vec4} vec - The vector argument to transform.
     * @param {boolean} ignoreScale - Whether or not to include the scale in the transform.
     * @param {boolean} ignoreRotation - Whether or not to include the rotation in the transform.
     * @param {boolean} ignoreTranslation - Whether or not to include the translation in the transform.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.localToWorld = function( vec, ignoreScale, ignoreRotation, ignoreTranslation ) {
        var mat = new Mat44();
        if ( !ignoreScale ) {
            mat = this.scaleMatrix().multMat44( mat );
        }
        if ( !ignoreRotation ) {
            mat = this.rotationMatrix().multMat44( mat );
        }
        if ( !ignoreTranslation ) {
            mat = this.translationMatrix().multMat44( mat );
        }
        return mat.multVec3( vec );
    };

    /**
     * Transforms the vector or matrix argument from world space to the
     * transforms local space.
     * @memberof Transform
     *
     * @param {Vec3|Vec4} vec - The vector argument to transform.
     * @param {boolean} ignoreScale - Whether or not to include the scale in the transform.
     * @param {boolean} ignoreRotation - Whether or not to include the rotation in the transform.
     * @param {boolean} ignoreTranslation - Whether or not to include the translation in the transform.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.worldToLocal = function( vec, ignoreScale, ignoreRotation, ignoreTranslation ) {
        var mat = new Mat44();
        if ( !ignoreTranslation ) {
            mat = this.inverseTranslationMatrix().multMat44( mat );
        }
        if ( !ignoreRotation ) {
            mat = this.inverseRotationMatrix().multMat44( mat );
        }
        if ( !ignoreScale ) {
            mat = this.inverseScaleMatrix().multMat44( mat );
        }
        return mat.multVec3( vec );
    };

    /**
     * Returns true if the all components match those of a provided transform.
     * An optional epsilon value may be provided.
     * @memberof Transform
     *
     * @param {Transform} that - The matrix to test equality with.
     * @param {number} epsilon - The epsilon value. Optional.
     *
     * @returns {boolean} Whether or not the transform components match.
     */
    Transform.prototype.equals = function( that, epsilon ) {
        return this.origin.equals( that.origin, epsilon ) &&
            this.forward.equals( that.forward, epsilon ) &&
            this.up.equals( that.up, epsilon ) &&
            this.left.equals( that.left, epsilon ) &&
            this.scale.equals( that.scale, epsilon );
    };

    /**
     * Returns a transform with a random origin, orientation, and scale.
     * @memberof Transform
     *
     * @returns {Transform} The random transform.
     */
    Transform.random = function() {
        return new Transform({
            origin: Vec3.random(),
            scale: Vec3.random(),
        }).rotateForwardTo( Vec3.random() );
    };

    /**
     * Returns a string representation of the transform.
     * @memberof Transform
     *
     * @returns {String} The string representation of the transform.
     */
    Transform.prototype.toString = function() {
        return this.matrix().toString();
    };

    module.exports = Transform;

}());

},{"./Mat33":2,"./Mat44":3,"./Vec3":8}],6:[function(require,module,exports){
(function () {

    'use strict';

    var Vec3 = require('./Vec3');

    function closestPointOnEdge( a, b, point ) {
        var ab = b.sub( a );
        // project c onto ab, computing parameterized position d(t) = a + t*(b * a)
        var t = new Vec3( point ).sub( a ).dot( ab ) / ab.dot( ab );
        // If outside segment, clamp t (and therefore d) to the closest endpoint
        if ( t < 0 ) {
            t = 0;
        }
        if ( t > 1 ) {
            t = 1;
        }
        // compute projected position from the clamped t
        return a.add( ab.multScalar( t ) );
    }

    /**
     * Instantiates a Triangle object.
     * @class Triangle
     * @classdesc A CCW-winded triangle object.
     */
    function Triangle() {
        switch ( arguments.length ) {
            case 1:
                // array or object argument
                var arg = arguments[0];
                this.a = new Vec3( arg[0] || arg.a );
                this.b = new Vec3( arg[1] || arg.b );
                this.c = new Vec3( arg[2] || arg.c );
                break;
            case 3:
                // individual vector arguments
                this.a = new Vec3( arguments[0] );
                this.b = new Vec3( arguments[1] );
                this.c = new Vec3( arguments[2] );
                break;
            default:
                this.a = new Vec3( 0, 0, 0 );
                this.b = new Vec3( 1, 0, 0 );
                this.c = new Vec3( 1, 1, 0 );
                break;
        }
    }

    /**
     * Returns the radius of the bounding sphere of the triangle.
     * @memberof Triangle
     *
     * @returns {number} The radius of the bounding sphere.
     */
    Triangle.prototype.radius = function() {
        var centroid = this.centroid(),
            aDist = this.a.sub( centroid ).length(),
            bDist = this.b.sub( centroid ).length(),
            cDist = this.c.sub( centroid ).length();
        return Math.max( aDist, Math.max( bDist, cDist ) );
    };

    /**
     * Returns the centroid of the triangle.
     * @memberof Triangle
     *
     * @returns {number} The centroid of the triangle.
     */
    Triangle.prototype.centroid = function() {
        return this.a
            .add( this.b )
            .add( this.c )
            .divScalar( 3 );
    };

    /**
     * Returns the normal of the triangle.
     * @memberof Triangle
     *
     * @returns {number} The normal of the triangle.
     */
    Triangle.prototype.normal = function() {
        var ab = this.b.sub( this.a ),
            ac = this.c.sub( this.a );
        return ab.cross( ac ).normalize();
    };

    /**
     * Returns the area of the triangle.
     * @memberof Triangle
     *
     * @returns {number} The area of the triangle.
     */
    Triangle.prototype.area = function() {
        var ab = this.b.sub( this.a ),
            ac = this.c.sub( this.a );
        return ab.cross( ac ).length() / 2.0;
    };

    /**
     * Returns true if the point is inside the triangle. The point must be
     * coplanar.
     * @memberof Triangle
     *
     * @param {Vec3|Array} point - The point to test.
     *
     * @returns {boolean} Whether or not the point is inside the triangle.
     */
    Triangle.prototype.isInside = function( point ) {
        var p = new Vec3( point );
        // Translate point and triangle so that point lies at origin
        var a = this.a.sub( p );
        var b = this.b.sub( p );
        var c = this.c.sub( p );
        // Compute normal vectors for triangles pab and pbc
        var u = b.cross( c );
        var v = c.cross( a );
        // Make sure they are both pointing in the same direction
        if ( u.dot( v ) < 0.0 ) {
            return false;
        }
        // Compute normal vector for triangle pca
        var w = a.cross( b );
        // Make sure it points in the same direction as the first two
        if ( u.dot( w ) < 0.0 ) {
            return false;
        }
        // Otherwise P must be in (or on) the triangle
        return true;
    };

    /**
     * Intersect the triangle and return intersection information.
     * @memberof Triangle
     *
     * @param {Vec3|Array} origin - The origin of the intersection ray
     * @param {Vec3|Array} direction - The direction of the intersection ray.
     * @param {boolean} ignoreBehind - Whether or not to ignore intersections behind the origin of the ray.
     * @param {boolean} ignoreBackface - Whether or not to ignore the backface of the triangle.
     *
     * @returns {Object|boolean} The intersection information, or false if there is no intersection.
     */
    Triangle.prototype.intersect = function( origin, direction, ignoreBehind, ignoreBackface ) {
        // Compute ray/plane intersection
        var o = new Vec3( origin );
        var d = new Vec3( direction );
        var normal = this.normal();
        var dn = d.dot( normal );
        if ( dn === 0 ) {
            // ray is parallel to plane
            // TODO: check if ray is co-linear and intersects?
            return false;
        }
        var t = this.a.sub( o ).dot( normal ) / dn;
        if ( ignoreBehind && ( t < 0 ) ) {
            // plane is behind ray
            return false;
        }
        if ( ignoreBackface ) {
            //  ignore triangles facing away from ray
            if ( ( t > 0 && dn > 0 ) || ( t < 0 && dn < 0 ) ) {
                // triangle is facing opposite the direction of intersection
                return false;
            }
        }
        var position = o.add( d.multScalar( t ) );
        // check if point is inside the triangle
        if ( !this.isInside( position ) ) {
            return false;
        }
        return {
            position: position,
            normal: normal,
            t: t
        };
    };

    /**
     * Returns the closest point on the triangle to the specified point.
     * @memberof Triangle
     *
     * @param {Vec3|Array} point - The point to test.
     *
     * @returns {Vec3} The closest point on the edge.
     */
    Triangle.prototype.closestPoint = function( point ) {
        var e0 = closestPointOnEdge( this.a, this.b, point );
        var e1 = closestPointOnEdge( this.b, this.c, point );
        var e2 = closestPointOnEdge( this.c, this.a, point );
        var d0 = ( e0.sub( point ) ).lengthSquared();
        var d1 = ( e1.sub( point ) ).lengthSquared();
        var d2 = ( e2.sub( point ) ).lengthSquared();
        if ( d0 < d1 ) {
            return ( d0 < d2 ) ? e0 : e2;
        } else {
            return ( d1 < d2 ) ? e1 : e2;
        }
    };

    /**
     * Returns a random Triangle of unit length.
     * @memberof Triangle
     *
     * @returns {Triangle} A random triangle of unit radius.
     */
    Triangle.random = function() {
        var a = Vec3.random(),
            b = Vec3.random(),
            c = Vec3.random(),
            centroid = a.add( b ).add( c ).divScalar( 3 ),
            aCent = a.sub( centroid ),
            bCent = b.sub( centroid ),
            cCent = c.sub( centroid ),
            aDist = aCent.length(),
            bDist = bCent.length(),
            cDist = cCent.length(),
            maxDist = Math.max( Math.max( aDist, bDist ), cDist ),
            scale = 1 / maxDist;
        return new Triangle(
            aCent.multScalar( scale ),
            bCent.multScalar( scale ),
            cCent.multScalar( scale ) );
    };

    /**
     * Returns true if the vector components match those of a provided triangle.
     * An optional epsilon value may be provided.
     * @memberof Triangle
     *
     * @param {Triangle} that - The vector to test equality with.
     * @param {number} epsilon - The epsilon value. Optional.
     *
     * @returns {boolean} Whether or not the vector components match.
     */
    Triangle.prototype.equals = function( that, epsilon ) {
        epsilon = epsilon === undefined ? 0 : epsilon;
        return this.a.equals( that.a, epsilon ) &&
            this.b.equals( that.b, epsilon ) &&
            this.c.equals( that.c, epsilon );
    };

    /**
     * Returns a string representation of the vector.
     * @memberof Triangle
     *
     * @returns {String} The string representation of the vector.
     */
    Triangle.prototype.toString = function() {
        return this.a.toString() + ', ' +
            this.b.toString() + ', ' +
            this.c.toString();
    };

    module.exports = Triangle;

}());

},{"./Vec3":8}],7:[function(require,module,exports){
(function() {

    'use strict';

    var EPSILON = require('./Epsilon');

    /**
     * Instantiates a Vec2 object.
     * @class Vec2
     * @classdesc A two component vector.
     */
    function Vec2() {
        switch ( arguments.length ) {
            case 1:
                // array or VecN argument
                var argument = arguments[0];
                this.x = argument.x || argument[0] || 0.0;
                this.y = argument.y || argument[1] || 0.0;
                break;
            case 2:
                // individual component arguments
                this.x = arguments[0];
                this.y = arguments[1];
                break;
            default:
                this.x = 0;
                this.y = 0;
                break;
        }
    }

    /**
     * Returns a new Vec2 with each component negated.
     * @memberof Vec2
     *
     * @returns {Vec2} The negated vector.
     */
    Vec2.prototype.negate = function() {
        return new Vec2( -this.x, -this.y );
    };

    /**
     * Adds the vector with the provided vector argument, returning a new Vec2
     * object representing the sum.
     * @memberof Vec2
     *
     * @param {Vec2|Vec3|Vec4|Array} that - The vector to add.
     *
     * @returns {Vec2} The sum of the two vectors.
     */
    Vec2.prototype.add = function( that ) {
        if ( that instanceof Array ) {
            return new Vec2( this.x + that[0], this.y + that[1] );
        }
        return new Vec2( this.x + that.x, this.y + that.y );
    };

    /**
     * Subtracts the provided vector argument from the vector, returning a new Vec2
     * object representing the difference.
     * @memberof Vec2
     *
     * @param {Vec2|Vec3|Vec4|Array} - The vector to subtract.
     *
     * @returns {Vec2} The difference of the two vectors.
     */
    Vec2.prototype.sub = function( that ) {
        if ( that instanceof Array ) {
            return new Vec2( this.x - that[0], this.y - that[1] );
        }
        return new Vec2( this.x - that.x, this.y - that.y );
    };

    /**
     * Multiplies the vector with the provided scalar argument, returning a new Vec2
     * object representing the scaled vector.
     * @memberof Vec2
     *
     * @param {number} - The scalar to multiply the vector by.
     *
     * @returns {Vec2} The scaled vector.
     */
    Vec2.prototype.multScalar = function( that ) {
        return new Vec2( this.x * that, this.y * that );
    };

    /**
     * Divides the vector with the provided scalar argument, returning a new Vec2
     * object representing the scaled vector.
     * @memberof Vec2
     *
     * @param {number} - The scalar to divide the vector by.
     *
     * @returns {Vec2} The scaled vector.
     */
    Vec2.prototype.divScalar = function( that ) {
        return new Vec2( this.x / that, this.y / that );
    };

    /**
     * Calculates and returns the dot product of the vector and the provided
     * vector argument.
     * @memberof Vec2
     *
     * @param {Vec2|Vec3|Vec4|Array} - The other vector argument.
     *
     * @returns {number} The dot product.
     */
    Vec2.prototype.dot = function( that ) {
        if ( that instanceof Array ) {
            return ( this.x * that[0] ) + ( this.y * that[1] );
        }
        return ( this.x * that.x ) + ( this.y * that.y );
    };

    /**
     * Calculates and returns 2D cross product of the vector and the provided
     * vector argument. This value represents the magnitude of the vector that
     * would result from a regular 3D cross product of the input vectors,
     * taking their Z values as 0.
     * @memberof Vec2
     *
     * @param {Vec2|Vec3|Vec4|Array} - The other vector argument.
     *
     * @returns {number} The 2D cross product.
     */
    Vec2.prototype.cross = function( that ) {
        if ( that instanceof Array ) {
            return ( this.x * that[1] ) - ( this.y * that[0] );
        }
        return ( this.x * that.y ) - ( this.y * that.x );
    };

    /**
     * If no argument is provided, this function returns the scalar length of
     * the vector. If an argument is provided, this method will return a new
     * Vec2 scaled to the provided length.
     * @memberof Vec2
     *
     * @param {number} - The length to scale the vector to. Optional.
     *
     * @returns {number|Vec2} Either the length, or new scaled vector.
     */
    Vec2.prototype.length = function( length ) {
        if ( length === undefined ) {
            var len = this.dot( this );
            if ( Math.abs( len - 1.0 ) < EPSILON ) {
                return len;
            } else {
                return Math.sqrt( len );
            }
        }
        return this.normalize().multScalar( length );
    };

    /**
     * Returns the squared length of the vector.
     * @memberof Vec2
     *
     * @returns {number} The squared length of the vector.
     */
    Vec2.prototype.lengthSquared = function() {
        return this.dot( this );
    };

    /**
     * Returns true if the vector components match those of a provided vector.
     * An optional epsilon value may be provided.
     * @memberof Vec2
     *
     * @param {Vec2|Vec3|Vec4|Array} that - The vector to test equality with.
     * @param {number} epsilon - The epsilon value. Optional.
     *
     * @returns {boolean} Whether or not the vector components match.
     */
    Vec2.prototype.equals = function( that, epsilon ) {
        var x = that.x !== undefined ? that.x : that[0],
            y = that.y !== undefined ? that.y : that[1];
        epsilon = epsilon === undefined ? 0 : epsilon;
        return ( this.x === x || Math.abs( this.x - x ) <= epsilon ) &&
            ( this.y === y || Math.abs( this.y - y ) <= epsilon );
    };

    /**
     * Returns a new Vec2 of unit length.
     * @memberof Vec2
     *
     * @returns {Vec2} The vector of unit length.
     */
    Vec2.prototype.normalize = function() {
        var mag = this.length();
        if ( mag !== 0 ) {
            return new Vec2(
                this.x / mag,
                this.y / mag );
        }
        return new Vec2();
    };

    /**
     * Returns the unsigned angle between this angle and the argument in radians.
     * @memberof Vec2
     *
     * @param {Vec2|Vec3|Vec4|Array} that - The vector to measure the angle from.
     *
     * @returns {number} The unsigned angle in radians.
     */
    Vec2.prototype.unsignedAngleRadians = function( that ) {
        var x = that.x !== undefined ? that.x : that[0];
        var y = that.y !== undefined ? that.y : that[1];
        var angle = Math.atan2( y, x ) - Math.atan2( this.y, this.x );
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return angle;
    };

    /**
     * Returns the unsigned angle between this angle and the argument in degrees.
     * @memberof Vec2
     *
     * @param {Vec2|Vec3|Vec4|Array} that - The vector to measure the angle from.
     *
     * @returns {number} The unsigned angle in degrees.
     */
    Vec2.prototype.unsignedAngleDegrees = function( that ) {
        return this.unsignedAngleRadians( that ) * ( 180 / Math.PI );
    };

    /**
     * Returns a random Vec2 of unit length.
     * @memberof Vec2
     *
     * @returns {Vec2} A random vector of unit length.
     */
    Vec2.random = function() {
        return new Vec2(
            Math.random(),
            Math.random() ).normalize();
    };

    /**
     * Returns a string representation of the vector.
     * @memberof Vec2
     *
     * @returns {String} The string representation of the vector.
     */
    Vec2.prototype.toString = function() {
        return this.x + ', ' + this.y;
    };

    /**
     * Returns an array representation of the vector.
     * @memberof Vec2
     *
     * @returns {Array} The vector as an array.
     */
    Vec2.prototype.toArray = function() {
        return [ this.x, this.y ];
    };

    module.exports = Vec2;

}());

},{"./Epsilon":1}],8:[function(require,module,exports){
(function() {

    'use strict';

    var EPSILON = require('./Epsilon');

    /**
     * Instantiates a Vec3 object.
     * @class Vec3
     * @classdesc A three component vector.
     */
    function Vec3() {
        switch ( arguments.length ) {
            case 1:
                // array or VecN argument
                var argument = arguments[0];
                this.x = argument.x || argument[0] || 0.0;
                this.y = argument.y || argument[1] || 0.0;
                this.z = argument.z || argument[2] || 0.0;
                break;
            case 3:
                // individual component arguments
                this.x = arguments[0];
                this.y = arguments[1];
                this.z = arguments[2];
                break;
            default:
                this.x = 0.0;
                this.y = 0.0;
                this.z = 0.0;
                break;
        }
    }

    /**
     * Returns a new Vec3 with each component negated.
     * @memberof Vec3
     *
     * @returns {Vec3} The negated vector.
     */
    Vec3.prototype.negate = function() {
        return new Vec3( -this.x, -this.y, -this.z );
    };

    /**
     * Adds the vector with the provided vector argument, returning a new Vec3
     * object representing the sum.
     * @memberof Vec3
     *
     * @param {Vec3|Vec4|Array} that - The vector to add.
     *
     * @returns {Vec3} The sum of the two vectors.
     */
    Vec3.prototype.add = function( that ) {
        if ( that instanceof Array ) {
            return new Vec3( this.x + that[0], this.y + that[1], this.z + that[2] );
        }
        return new Vec3( this.x + that.x, this.y + that.y, this.z + that.z );
    };

    /**
     * Subtracts the provided vector argument from the vector, returning a new
     * Vec3 object representing the difference.
     * @memberof Vec3
     *
     * @param {Vec3|Vec4|Array} - The vector to subtract.
     *
     * @returns {Vec3} The difference of the two vectors.
     */
    Vec3.prototype.sub = function( that ) {
        if ( that instanceof Array ) {
            return new Vec3( this.x - that[0], this.y - that[1], this.z - that[2] );
        }
        return new Vec3( this.x - that.x, this.y - that.y, this.z - that.z );
    };

    /**
     * Multiplies the vector with the provided scalar argument, returning a new Vec3
     * object representing the scaled vector.
     * @memberof Vec3
     *
     * @param {number} - The scalar to multiply the vector by.
     *
     * @returns {Vec3} The scaled vector.
     */
    Vec3.prototype.multScalar = function( that ) {
        return new Vec3( this.x * that, this.y * that, this.z * that );
    };

    /**
     * Divides the vector with the provided scalar argument, returning a new Vec3
     * object representing the scaled vector.
     * @memberof Vec3
     *
     * @param {number} - The scalar to divide the vector by.
     *
     * @returns {Vec3} The scaled vector.
     */
    Vec3.prototype.divScalar = function( that ) {
        return new Vec3( this.x / that, this.y / that, this.z / that );
    };

    /**
     * Calculates and returns the dot product of the vector and the provided
     * vector argument.
     * @memberof Vec3
     *
     * @param {Vec3|Vec4|Array} - The other vector argument.
     *
     * @returns {number} The dot product.
     */
    Vec3.prototype.dot = function( that ) {
        if ( that instanceof Array ) {
            return ( this.x * that[0] ) + ( this.y * that[1] ) + ( this.z * that[2] );
        }
        return ( this.x * that.x ) + ( this.y * that.y ) + ( this.z * that.z );
    };

    /**
     * Calculates and returns the cross product of the vector and the provided
     * vector argument.
     * @memberof Vec3
     *
     * @param {Vec3|Vec4|Array} - The other vector argument.
     *
     * @returns {number} The 2D cross product.
     */
    Vec3.prototype.cross = function( that ) {
        if ( that instanceof Array ) {
            return new Vec3(
                ( this.y * that[2] ) - ( that[1] * this.z ),
                (-this.x * that[2] ) + ( that[0] * this.z ),
                ( this.x * that[1] ) - ( that[0] * this.y ) );
        }
        return new Vec3(
            ( this.y * that.z ) - ( that.y * this.z ),
            (-this.x * that.z ) + ( that.x * this.z ),
            ( this.x * that.y ) - ( that.x * this.y ) );
    };

    /**
     * If no argument is provided, this function returns the scalar length of
     * the vector. If an argument is provided, this method will return a new
     * Vec3 scaled to the provided length.
     * @memberof Vec3
     *
     * @param {number} - The length to scale the vector to. Optional.
     *
     * @returns {number|Vec3} Either the length, or new scaled vector.
     */
    Vec3.prototype.length = function( length ) {
        if ( length === undefined ) {
            var len = this.dot( this );
            if ( Math.abs( len - 1.0 ) < EPSILON ) {
                return len;
            } else {
                return Math.sqrt( len );
            }
        }
        return this.normalize().multScalar( length );
    };

    /**
     * Returns the squared length of the vector.
     * @memberof Vec3
     *
     * @returns {number} The squared length of the vector.
     */
    Vec3.prototype.lengthSquared = function() {
        return this.dot( this );
    };

    /**
     * Returns true if the vector components match those of a provided vector.
     * An optional epsilon value may be provided.
     * @memberof Vec3
     *
     * @param {Vec3|Vec4|Array} that - The vector to test equality with.
     * @param {number} epsilon - The epsilon value. Optional.
     *
     * @returns {boolean} Whether or not the vector components match.
     */
    Vec3.prototype.equals = function( that, epsilon ) {
        var x = that.x !== undefined ? that.x : that[0],
            y = that.y !== undefined ? that.y : that[1],
            z = that.z !== undefined ? that.z : that[2];
        epsilon = epsilon === undefined ? 0 : epsilon;
        return ( this.x === x || Math.abs( this.x - x ) <= epsilon ) &&
            ( this.y === y || Math.abs( this.y - y ) <= epsilon ) &&
            ( this.z === z || Math.abs( this.z - z ) <= epsilon );
    };

    /**
     * Returns a new Vec3 of unit length.
     * @memberof Vec3
     *
     * @returns {Vec3} The vector of unit length.
     */
    Vec3.prototype.normalize = function() {
        var mag = this.length();
        if ( mag !== 0 ) {
            return new Vec3(
                this.x / mag,
                this.y / mag,
                this.z / mag );
        }
        return new Vec3();
    };

    /**
     * Given a plane normal, returns the projection of the vector onto the plane.
     * @memberof Vec3
     *
     * @param {Vec3|Vec4|Array} normal - The plane normal.
     *
     * @returns {number} The unsigned angle in radians.
     */
    Vec3.prototype.projectOntoPlane =  function( n ) {
        var dist = this.dot( n );
        return this.sub( n.multScalar( dist ) );
    };

    /**
     * Returns the unsigned angle between this angle and the argument, projected
     * onto a plane, in radians.
     * @memberof Vec3
     *
     * @param {Vec3|Vec4|Array} that - The vector to measure the angle from.
     * @param {Vec3|Vec4|Array} normal - The reference vector to measure the
     *                              direction of the angle. If not provided will
     *                              use a.cross( b ). (Optional)
     *
     * @returns {number} The unsigned angle in radians.
     */
    Vec3.prototype.unsignedAngleRadians = function( that, normal ) {
        var a = this;
        var b = new Vec3( that );
        var cross = a.cross( b );
        var n = new Vec3( normal || cross );
        var pa = a.projectOntoPlane( n ).normalize();
        var pb = b.projectOntoPlane( n ).normalize();
        var dot = pa.dot( pb );

        // faster, less robuest
        //var ndot = Math.max( -1, Math.min( 1, dot ) );
        //var angle = Math.acos( ndot );

        // slower, but more robust
        var angle = Math.atan2( pa.cross( pb ).length(), dot );

        if ( n.dot( cross ) < 0 ) {
            if ( angle >= Math.PI * 0.5 ) {
                angle = Math.PI + Math.PI - angle;
            } else {
                angle = 2 * Math.PI - angle;
            }
        }
        return angle;
    };

    /**
     * Returns the unsigned angle between this angle and the argument, projected
     * onto a plane, in degrees.
     * @memberof Vec3
     *
     * @param {Vec3|Vec4|Array} that - The vector to measure the angle from.
     *
     * @returns {number} The unsigned angle in degrees.
     */
    Vec3.prototype.unsignedAngleDegrees = function( that, normal ) {
        return this.unsignedAngleRadians( that, normal ) * ( 180 / Math.PI );
    };

    /**
     * Returns a random Vec3 of unit length.
     * @memberof Vec3
     *
     * @returns {Vec3} A random vector of unit length.
     */
    Vec3.random = function() {
        return new Vec3(
            Math.random(),
            Math.random(),
            Math.random() ).normalize();
    };

    /**
     * Returns a string representation of the vector.
     * @memberof Vec3
     *
     * @returns {String} The string representation of the vector.
     */
    Vec3.prototype.toString = function() {
        return this.x + ', ' + this.y + ', ' + this.z;
    };

    /**
     * Returns an array representation of the vector.
     * @memberof Vec3
     *
     * @returns {Array} The vector as an array.
     */
    Vec3.prototype.toArray = function() {
        return [ this.x, this.y, this.z ];
    };

    module.exports = Vec3;

}());

},{"./Epsilon":1}],9:[function(require,module,exports){
(function() {

    'use strict';

    var EPSILON = require('./Epsilon');

    /**
     * Instantiates a Vec4 object.
     * @class Vec4
     * @classdesc A four component vector.
     */
    function Vec4() {
        switch ( arguments.length ) {
            case 1:
                // array or VecN argument
                var argument = arguments[0];
                this.x = argument.x || argument[0] || 0.0;
                this.y = argument.y || argument[1] || 0.0;
                this.z = argument.z || argument[2] || 0.0;
                this.w = argument.w || argument[3] || 0.0;
                break;
            case 4:
                // individual component arguments
                this.x = arguments[0];
                this.y = arguments[1];
                this.z = arguments[2];
                this.w = arguments[3] || 0.0;
                break;
            default:
                this.x = 0.0;
                this.y = 0.0;
                this.z = 0.0;
                this.w = 0.0;
                break;
        }
    }

    /**
     * Returns a new Vec4 with each component negated.
     * @memberof Vec4
     *
     * @returns {Vec4} The negated vector.
     */
    Vec4.prototype.negate = function() {
        return new Vec4( -this.x, -this.y, -this.z, -this.w );
    };

    /**
     * Adds the vector with the provided vector argument, returning a new Vec4
     * object representing the sum.
     * @memberof Vec4
     *
     * @param {Vec4|Array} that - The vector to add.
     *
     * @returns {Vec4} The sum of the two vectors.
     */
    Vec4.prototype.add = function( that ) {
        if ( that instanceof Array ) {
            return new Vec4(
                this.x + that[0],
                this.y + that[1],
                this.z + that[2],
                this.w + that[3] );
        }
        return new Vec4(
            this.x + that.x,
            this.y + that.y,
            this.z + that.z,
            this.w + that.w );
    };

    /**
     * Subtracts the provided vector argument from the vector, returning a new Vec4
     * object representing the difference.
     * @memberof Vec4
     *
     * @param {Vec4|Array} - The vector to subtract.
     *
     * @returns {Vec4} The difference of the two vectors.
     */
    Vec4.prototype.sub = function( that ) {
        if ( that instanceof Array ) {
            return new Vec4(
                this.x - that[0],
                this.y - that[1],
                this.z - that[2],
                this.w - that[3] );
        }
        return new Vec4(
            this.x - that.x,
            this.y - that.y,
            this.z - that.z,
            this.w - that.w );
    };

    /**
     * Multiplies the vector with the provided scalar argument, returning a new Vec4
     * object representing the scaled vector.
     * @memberof Vec4
     *
     * @param {number} - The scalar to multiply the vector by.
     *
     * @returns {Vec4} The scaled vector.
     */
    Vec4.prototype.multScalar = function( that ) {
        return new Vec4(
            this.x * that,
            this.y * that,
            this.z * that,
            this.w * that );
    };

    /**
     * Divides the vector with the provided scalar argument, returning a new Vec4
     * object representing the scaled vector.
     * @memberof Vec4
     *
     * @param {number} - The scalar to divide the vector by.
     *
     * @returns {Vec4} The scaled vector.
     */
    Vec4.prototype.divScalar = function( that ) {
        return new Vec4(
            this.x / that,
            this.y / that,
            this.z / that,
            this.w / that );
    };

    /**
     * Calculates and returns the dot product of the vector and the provided
     * vector argument.
     * @memberof Vec4
     *
     * @param {Vec4|Array} - The other vector argument.
     *
     * @returns {number} The dot product.
     */
    Vec4.prototype.dot = function( that ) {
        if ( that instanceof Array ) {
            return ( this.x * that[0] ) +
                ( this.y * that[1] ) +
                ( this.z * that[2] ) +
                ( this.w * that[3] );
        }
        return ( this.x * that.x ) +
            ( this.y * that.y ) +
            ( this.z * that.z ) +
            ( this.w * that.w );
    };

    /**
     * If no argument is provided, this function returns the scalar length of
     * the vector. If an argument is provided, this method will return a new
     * Vec4 scaled to the provided length.
     * @memberof Vec4
     *
     * @param {number} - The length to scale the vector to. Optional.
     *
     * @returns {number|Vec4} Either the length, or new scaled vector.
     */
    Vec4.prototype.length = function( length ) {
        if ( length === undefined ) {
            var len = this.dot( this );
            if ( Math.abs( len - 1.0 ) < EPSILON ) {
                return len;
            } else {
                return Math.sqrt( len );
            }
        }
        return this.normalize().multScalar( length );
    };

    /**
     * Returns the squared length of the vector.
     * @memberof Vec4
     *
     * @returns {number} The squared length of the vector.
     */
    Vec4.prototype.lengthSquared = function() {
        return this.dot( this );
    };

    /**
     * Returns true if the vector components match those of a provided vector.
     * An optional epsilon value may be provided.
     * @memberof Vec4
     *
     * @param {Vec4|Array} that - The vector to test equality with.
     * @param {number} epsilon - The epsilon value. Optional.
     *
     * @returns {boolean} Whether or not the vector components match.
     */
    Vec4.prototype.equals = function( that, epsilon ) {
        var x = that.x !== undefined ? that.x : that[0],
            y = that.y !== undefined ? that.y : that[1],
            z = that.z !== undefined ? that.z : that[2],
            w = that.w !== undefined ? that.w : that[3];
        epsilon = epsilon === undefined ? 0 : epsilon;
        return ( this.x === x || Math.abs( this.x - x ) <= epsilon ) &&
            ( this.y === y || Math.abs( this.y - y ) <= epsilon ) &&
            ( this.z === z || Math.abs( this.z - z ) <= epsilon ) &&
            ( this.w === w || Math.abs( this.w - w ) <= epsilon );
    };

    /**
     * Returns a new Vec4 of unit length.
     * @memberof Vec4
     *
     * @returns {Vec4} The vector of unit length.
     */
    Vec4.prototype.normalize = function() {
        var mag = this.length();
        if ( mag !== 0 ) {
            return new Vec4(
                this.x / mag,
                this.y / mag,
                this.z / mag,
                this.w / mag );
        }
        return new Vec4();
    };

    /**
     * Returns a random Vec4 of unit length.
     * @memberof Vec4
     *
     * @returns {Vec4} A random vector of unit length.
     */
    Vec4.random = function() {
        return new Vec4(
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random() ).normalize();
    };

    /**
     * Returns a string representation of the vector.
     * @memberof Vec4
     *
     * @returns {String} The string representation of the vector.
     */
    Vec4.prototype.toString = function() {
        return this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w;
    };

    /**
     * Returns an array representation of the vector.
     * @memberof Vec4
     *
     * @returns {Array} The vector as an array.
     */
    Vec4.prototype.toArray = function() {
        return [ this.x, this.y, this.z, this.w ];
    };

    module.exports = Vec4;

}());

},{"./Epsilon":1}],10:[function(require,module,exports){
(function () {

    'use strict';

    module.exports = {
        Mat33: require('./Mat33'),
        Mat44: require('./Mat44'),
        Vec2: require('./Vec2'),
        Vec3: require('./Vec3'),
        Vec4: require('./Vec4'),
        Quaternion: require('./Quaternion'),
        Transform: require('./Transform'),
        Triangle: require('./Triangle')
    };

}());

},{"./Mat33":2,"./Mat44":3,"./Quaternion":4,"./Transform":5,"./Triangle":6,"./Vec2":7,"./Vec3":8,"./Vec4":9}]},{},[10])(10)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRXBzaWxvbi5qcyIsInNyYy9NYXQzMy5qcyIsInNyYy9NYXQ0NC5qcyIsInNyYy9RdWF0ZXJuaW9uLmpzIiwic3JjL1RyYW5zZm9ybS5qcyIsInNyYy9UcmlhbmdsZS5qcyIsInNyYy9WZWMyLmpzIiwic3JjL1ZlYzMuanMiLCJzcmMvVmVjNC5qcyIsInNyYy9leHBvcnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25sQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2g0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gMC4wMDAwMDAwMDAwMTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFZlYzMgPSByZXF1aXJlKCcuL1ZlYzMnKTtcclxuICAgIHZhciBFUFNJTE9OID0gcmVxdWlyZSgnLi9FcHNpbG9uJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBNYXQzMyBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgTWF0MzNcclxuICAgICAqIEBjbGFzc2Rlc2MgQSAzeDMgY29sdW1uLW1ham9yIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gTWF0MzMoIHRoYXQgKSB7XHJcbiAgICAgICAgdGhhdCA9IHRoYXQgfHwgW1xyXG4gICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgXTtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhhdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgQXJyYXkoIDE2ICk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSA9IHRoYXQuZGF0YVswXTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdID0gdGhhdC5kYXRhWzFdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gPSB0aGF0LmRhdGFbMl07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSA9IHRoYXQuZGF0YVszXTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdID0gdGhhdC5kYXRhWzRdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0gPSB0aGF0LmRhdGFbNV07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSA9IHRoYXQuZGF0YVs2XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddID0gdGhhdC5kYXRhWzddO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0gPSB0aGF0LmRhdGFbOF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJvdyBvZiB0aGUgbWF0cml4IGFzIGEgVmVjMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgMC1iYXNlZCByb3cgaW5kZXguXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8fEFycmF5fSB2ZWMgLSBUaGUgdmVjdG9yIHRvIHJlcGxhY2UgdGhlIHJvdy4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSByb3cgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUucm93ID0gZnVuY3Rpb24oIGluZGV4LCB2ZWMgKSB7XHJcbiAgICAgICAgaWYgKCB2ZWMgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4XSA9IHZlY1swXSB8fCB2ZWMueDtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzMraW5kZXhdID0gdmVjWzFdIHx8IHZlYy55O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNitpbmRleF0gPSB2ZWNbMl0gfHwgdmVjLno7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzMraW5kZXhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNitpbmRleF0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgY29sdW1uIG9mIHRoZSBtYXRyaXggYXMgYSBWZWMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSAwLWJhc2VkIGNvbCBpbmRleC5cclxuICAgICAqIEBwYXJhbSB7VmVjM3x8QXJyYXl9IHZlYyAtIFRoZSB2ZWN0b3IgdG8gcmVwbGFjZSB0aGUgY29sLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIGNvbHVtbiB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS5jb2wgPSBmdW5jdGlvbiggaW5kZXgsIHZlYyApIHtcclxuICAgICAgICBpZiAoIHZlYyApIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXgqM10gPSB2ZWNbMF0gfHwgdmVjLng7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxK2luZGV4KjNdID0gdmVjWzFdIHx8IHZlYy55O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMitpbmRleCozXSA9IHZlY1syXSB8fCB2ZWMuejtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXgqM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxK2luZGV4KjNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMitpbmRleCozXSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGlkZW50aXR5IG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIGlkZW50aXkgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5pZGVudGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc2NhbGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fG51bWJlcn0gc2NhbGUgLSBUaGUgc2NhbGFyIG9yIHZlY3RvciBzY2FsaW5nIGZhY3Rvci5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnNjYWxlID0gZnVuY3Rpb24oIHNjYWxlICkge1xyXG4gICAgICAgIGlmICggdHlwZW9mIHNjYWxlID09PSAnbnVtYmVyJyApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgICAgICBzY2FsZSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIHNjYWxlLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgc2NhbGVcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICggc2NhbGUgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgICAgICBzY2FsZVswXSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIHNjYWxlWzFdLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgc2NhbGVbMl1cclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICBzY2FsZS54LCAwLCAwLFxyXG4gICAgICAgICAgICAwLCBzY2FsZS55LCAwLFxyXG4gICAgICAgICAgICAwLCAwLCBzY2FsZS56XHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCBkZWZpbmVkIGJ5IGFuIGF4aXMgYW5kIGFuIGFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gVGhlIGFuZ2xlIG9mIHRoZSByb3RhdGlvbiwgaW4gZGVncmVlcy5cclxuICAgICAqIEBwYXJhbSB7VmVjM30gYXhpcyAtIFRoZSBheGlzIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByb3RhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnJvdGF0aW9uRGVncmVlcyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3RhdGlvblJhZGlhbnMoIGFuZ2xlKk1hdGguUEkvMTgwLCBheGlzICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCBkZWZpbmVkIGJ5IGFuIGF4aXMgYW5kIGFuIGFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gVGhlIGFuZ2xlIG9mIHRoZSByb3RhdGlvbiwgaW4gcmFkaWFucy5cclxuICAgICAqIEBwYXJhbSB7VmVjM30gYXhpcyAtIFRoZSBheGlzIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByb3RhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnJvdGF0aW9uUmFkaWFucyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICBpZiAoIGF4aXMgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgYXhpcyA9IG5ldyBWZWMzKCBheGlzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHplcm8gdmVjdG9yLCByZXR1cm4gaWRlbnRpdHlcclxuICAgICAgICBpZiAoIGF4aXMubGVuZ3RoU3F1YXJlZCgpID09PSAwICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZGVudGl0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbm9ybUF4aXMgPSBheGlzLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICB4ID0gbm9ybUF4aXMueCxcclxuICAgICAgICAgICAgeSA9IG5vcm1BeGlzLnksXHJcbiAgICAgICAgICAgIHogPSBub3JtQXhpcy56LFxyXG4gICAgICAgICAgICBtb2RBbmdsZSA9ICggYW5nbGUgPiAwICkgPyBhbmdsZSAlICgyKk1hdGguUEkpIDogYW5nbGUgJSAoLTIqTWF0aC5QSSksXHJcbiAgICAgICAgICAgIHMgPSBNYXRoLnNpbiggbW9kQW5nbGUgKSxcclxuICAgICAgICAgICAgYyA9IE1hdGguY29zKCBtb2RBbmdsZSApLFxyXG4gICAgICAgICAgICB4eCA9IHggKiB4LFxyXG4gICAgICAgICAgICB5eSA9IHkgKiB5LFxyXG4gICAgICAgICAgICB6eiA9IHogKiB6LFxyXG4gICAgICAgICAgICB4eSA9IHggKiB5LFxyXG4gICAgICAgICAgICB5eiA9IHkgKiB6LFxyXG4gICAgICAgICAgICB6eCA9IHogKiB4LFxyXG4gICAgICAgICAgICB4cyA9IHggKiBzLFxyXG4gICAgICAgICAgICB5cyA9IHkgKiBzLFxyXG4gICAgICAgICAgICB6cyA9IHogKiBzLFxyXG4gICAgICAgICAgICBvbmVfYyA9IDEuMCAtIGM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIChvbmVfYyAqIHh4KSArIGMsIChvbmVfYyAqIHh5KSArIHpzLCAob25lX2MgKiB6eCkgLSB5cyxcclxuICAgICAgICAgICAgKG9uZV9jICogeHkpIC0genMsIChvbmVfYyAqIHl5KSArIGMsIChvbmVfYyAqIHl6KSArIHhzLFxyXG4gICAgICAgICAgICAob25lX2MgKiB6eCkgKyB5cywgKG9uZV9jICogeXopIC0geHMsIChvbmVfYyAqIHp6KSArIGNcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IHRvIHJvdGF0ZSBhIHZlY3RvciBmcm9tIG9uZSBkaXJlY3Rpb24gdG9cclxuICAgICAqIGFub3RoZXIuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGZyb20gLSBUaGUgc3RhcnRpbmcgZGlyZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSB0byAtIFRoZSBlbmRpbmcgZGlyZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIG1hdHJpeCByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5yb3RhdGlvbkZyb21UbyA9IGZ1bmN0aW9uKCBmcm9tVmVjLCB0b1ZlYyApIHtcclxuICAgICAgICAvKlxyXG4gICAgICAgIFRoaXMgbWV0aG9kIGlzIGJhc2VkIG9uIHRoZSBjb2RlIGZyb206XHJcbiAgICAgICAgICAgIFRvbWFzIE1sbGVyLCBKb2huIEh1Z2hlc1xyXG4gICAgICAgICAgICBFZmZpY2llbnRseSBCdWlsZGluZyBhIE1hdHJpeCB0byBSb3RhdGUgT25lIFZlY3RvciB0byBBbm90aGVyXHJcbiAgICAgICAgICAgIEpvdXJuYWwgb2YgR3JhcGhpY3MgVG9vbHMsIDQoNCk6MS00LCAxOTk5XHJcbiAgICAgICAgKi9cclxuICAgICAgICB2YXIgZnJvbSA9IG5ldyBWZWMzKCBmcm9tVmVjICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdmFyIHRvID0gbmV3IFZlYzMoIHRvVmVjICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdmFyIGUgPSBmcm9tLmRvdCggdG8gKTtcclxuICAgICAgICB2YXIgZiA9IE1hdGguYWJzKCBlICk7XHJcbiAgICAgICAgdmFyIHgsIHUsIHY7XHJcbiAgICAgICAgdmFyIGZ4LCBmeSwgZno7XHJcbiAgICAgICAgdmFyIHV4LCB1ejtcclxuICAgICAgICB2YXIgYzEsIGMyLCBjMztcclxuICAgICAgICBpZiAoIGYgPiAxLjAgLSBFUFNJTE9OICkge1xyXG4gICAgICAgICAgICAvLyAnZnJvbScgYW5kICd0bycgYWxtb3N0IHBhcmFsbGVsXHJcbiAgICAgICAgICAgIC8vIG5lYXJseSBvcnRob2dvbmFsXHJcbiAgICAgICAgICAgIGZ4ID0gTWF0aC5hYnMoIGZyb20ueCApO1xyXG4gICAgICAgICAgICBmeSA9IE1hdGguYWJzKCBmcm9tLnkgKTtcclxuICAgICAgICAgICAgZnogPSBNYXRoLmFicyggZnJvbS56ICk7XHJcbiAgICAgICAgICAgIGlmICggZnggPCBmeSApIHtcclxuICAgICAgICAgICAgICAgIGlmICggZnggPCBmeiApIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbmV3IFZlYzMoIDEsIDAsIDAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBWZWMzKCAwLCAwLCAxICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGZ5IDwgZnogKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBWZWMzKCAwLCAxLCAwICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMCwgMSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHUgPSB4LnN1YiggZnJvbSApO1xyXG4gICAgICAgICAgICB2ID0geC5zdWIoIHRvICk7XHJcbiAgICAgICAgICAgIGMxID0gMi4wIC8gdS5kb3QoIHUgKTtcclxuICAgICAgICAgICAgYzIgPSAyLjAgLyB2LmRvdCggdiApO1xyXG4gICAgICAgICAgICBjMyA9IGMxKmMyICogdS5kb3QoIHYgKTtcclxuICAgICAgICAgICAgLy8gc2V0IG1hdHJpeCBlbnRyaWVzXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICAgICAgLWMxKnUueCp1LnggLSBjMip2Lngqdi54ICsgYzMqdi54KnUueCArIDEuMCxcclxuICAgICAgICAgICAgICAgIC1jMSp1LnkqdS54IC0gYzIqdi55KnYueCArIGMzKnYueSp1LngsXHJcbiAgICAgICAgICAgICAgICAtYzEqdS56KnUueCAtIGMyKnYueip2LnggKyBjMyp2LnoqdS54LFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueCp1LnkgLSBjMip2Lngqdi55ICsgYzMqdi54KnUueSxcclxuICAgICAgICAgICAgICAgIC1jMSp1LnkqdS55IC0gYzIqdi55KnYueSArIGMzKnYueSp1LnkgKyAxLjAsXHJcbiAgICAgICAgICAgICAgICAtYzEqdS56KnUueSAtIGMyKnYueip2LnkgKyBjMyp2LnoqdS55LFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueCp1LnogLSBjMip2Lngqdi56ICsgYzMqdi54KnUueixcclxuICAgICAgICAgICAgICAgIC1jMSp1LnkqdS56IC0gYzIqdi55KnYueiArIGMzKnYueSp1LnosXHJcbiAgICAgICAgICAgICAgICAtYzEqdS56KnUueiAtIGMyKnYueip2LnogKyBjMyp2LnoqdS56ICsgMS4wXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGUgbW9zdCBjb21tb24gY2FzZSwgdW5sZXNzICdmcm9tJz0ndG8nLCBvciAndG8nPS0nZnJvbSdcclxuICAgICAgICB2ID0gZnJvbS5jcm9zcyggdG8gKTtcclxuICAgICAgICB1ID0gMS4wIC8gKCAxLjAgKyBlICk7ICAgIC8vIG9wdGltaXphdGlvbiBieSBHb3R0ZnJpZWQgQ2hlblxyXG4gICAgICAgIHV4ID0gdSAqIHYueDtcclxuICAgICAgICB1eiA9IHUgKiB2Lno7XHJcbiAgICAgICAgYzEgPSB1eCAqIHYueTtcclxuICAgICAgICBjMiA9IHV4ICogdi56O1xyXG4gICAgICAgIGMzID0gdXogKiB2Lnk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIGUgKyB1eCAqIHYueCxcclxuICAgICAgICAgICAgYzEgKyB2LnosXHJcbiAgICAgICAgICAgIGMyIC0gdi55LFxyXG4gICAgICAgICAgICBjMSAtIHYueixcclxuICAgICAgICAgICAgZSArIHUgKiB2LnkgKiB2LnksXHJcbiAgICAgICAgICAgIGMzICsgdi54LFxyXG4gICAgICAgICAgICBjMiArIHYueSxcclxuICAgICAgICAgICAgYzMgLSB2LngsXHJcbiAgICAgICAgICAgIGUgKyB1eiAqIHYuelxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIG1hdHJpeCB3aXRoIHRoZSBwcm92aWRlZCBtYXRyaXggYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBNYTMzXHJcbiAgICAgKiBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfEFycmF5fSB0aGF0IC0gVGhlIG1hdHJpeCB0byBhZGQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgc3VtIG9mIHRoZSB0d28gbWF0cmljZXMuXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS5hZGRNYXQzMyA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICsgdGhhdFswXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICsgdGhhdFsxXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdICsgdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdICsgdGhhdFszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdICsgdGhhdFs0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdICsgdGhhdFs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdICsgdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddICsgdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdICsgdGhhdFs4XSxcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBtYXRyaXggd2l0aCB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgTWEzM1xyXG4gICAgICogb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHN1bSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuYWRkTWF0NDQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSArIHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArIHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSArIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSArIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSArIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSArIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSArIHRoYXRbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSArIHRoYXRbMTBdLFxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50IGZyb20gdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBNYXQzMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfEFycmF5fSB0aGF0IC0gVGhlIG1hdHJpeCB0byBhZGQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgZGlmZmVyZW5jZSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuc3ViTWF0MzMgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAtIHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAtIHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAtIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSAtIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSAtIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSAtIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSAtIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSAtIHRoYXRbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSAtIHRoYXRbOF0sXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBwcm92aWRlZCBtYXRyaXggYXJndW1lbnQgZnJvbSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0NDR8QXJyYXl9IHRoYXQgLSBUaGUgbWF0cml4IHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSBkaWZmZXJlbmNlIG9mIHRoZSB0d28gbWF0cmljZXMuXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS5zdWJNYXQ0NCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdIC0gdGhhdFswXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdIC0gdGhhdFsxXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdIC0gdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdIC0gdGhhdFs0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdIC0gdGhhdFs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdIC0gdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdIC0gdGhhdFs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddIC0gdGhhdFs5XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdIC0gdGhhdFsxMF0sXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgcHJvdmRlZCB2ZWN0b3IgYXJndW1lbnQgYnkgdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBWZWMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSAtIFRoZSB2ZWN0b3IgdG8gYmUgbXVsdGlwbGllZCBieSB0aGUgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgcmVzdWx0aW5nIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLm11bHRWZWMzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlICd0aGF0JyBpcyBhIFZlYzNcclxuICAgICAgICAvLyBpdCBpcyBzYWZlIHRvIG9ubHkgY2FzdCBpZiBBcnJheSBzaW5jZSB0aGUgLncgb2YgYSBWZWM0IGlzIG5vdCB1c2VkXHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbM10gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzZdICogdGhhdFsyXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzddICogdGhhdFsyXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzhdICogdGhhdFsyXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXQueCArIHRoaXMuZGF0YVszXSAqIHRoYXQueSArIHRoaXMuZGF0YVs2XSAqIHRoYXQueixcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdC54ICsgdGhpcy5kYXRhWzRdICogdGhhdC55ICsgdGhpcy5kYXRhWzddICogdGhhdC56LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNV0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOF0gKiB0aGF0LnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIGFsbCBjb21wb25lbnRzIG9mIHRoZSBtYXRyaXggYnkgdGhlIHByb3ZkZWQgc2NhbGFyIGFyZ3VtZW50LFxyXG4gICAgICogcmV0dXJuaW5nIGEgbmV3IE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgdGhlIG1hdHJpeCBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByZXN1bHRpbmcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUubXVsdFNjYWxhciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNl0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbN10gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0gKiB0aGF0XHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgcHJvdmRlZCBtYXRyaXggYXJndW1lbnQgYnkgdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBNYXQzMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfEFycmF5fSAtIFRoZSBtYXRyaXggdG8gYmUgbXVsdGlwbGllZCBieSB0aGUgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHJlc3VsdGluZyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS5tdWx0TWF0MzMgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbM10gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzZdICogdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFswXSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzVdICogdGhhdFsxXSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbM10gKyB0aGlzLmRhdGFbM10gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzZdICogdGhhdFs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFszXSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbNF0gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzNdICsgdGhpcy5kYXRhWzVdICogdGhhdFs0XSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbNl0gKyB0aGlzLmRhdGFbM10gKiB0aGF0WzddICsgdGhpcy5kYXRhWzZdICogdGhhdFs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFs2XSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbN10gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzZdICsgdGhpcy5kYXRhWzVdICogdGhhdFs3XSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbOF1cclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92ZGVkIG1hdHJpeCBhcmd1bWVudCBieSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0NDR8QXJyYXl9IC0gVGhlIG1hdHJpeCB0byBiZSBtdWx0aXBsaWVkIGJ5IHRoZSBtYXRyaXguXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgcmVzdWx0aW5nIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLm11bHRNYXQ0NCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFswXSArIHRoaXMuZGF0YVszXSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzRdICogdGhhdFsxXSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzhdICogdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFs0XSArIHRoaXMuZGF0YVszXSAqIHRoYXRbNV0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzRdICogdGhhdFs1XSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbNF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzVdICsgdGhpcy5kYXRhWzhdICogdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFs4XSArIHRoaXMuZGF0YVszXSAqIHRoYXRbOV0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzEwXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFs4XSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbOV0gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzEwXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdICogdGhhdFs4XSArIHRoaXMuZGF0YVs1XSAqIHRoYXRbOV0gKyB0aGlzLmRhdGFbOF0gKiB0aGF0WzEwXVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERpdmlkZXMgYWxsIGNvbXBvbmVudHMgb2YgdGhlIG1hdHJpeCBieSB0aGUgcHJvdmRlZCBzY2FsYXIgYXJndW1lbnQsXHJcbiAgICAgKiByZXR1cm5pbmcgYSBuZXcgTWF0MzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBkaXZpZGUgdGhlIG1hdHJpeCBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByZXN1bHRpbmcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuZGl2U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSAvIHRoYXRcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFsbCBjb21wb25lbnRzIG1hdGNoIHRob3NlIG9mIGEgcHJvdmlkZWQgbWF0cml4LlxyXG4gICAgICogQW4gb3B0aW9uYWwgZXBzaWxvbiB2YWx1ZSBtYXkgYmUgcHJvdmlkZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfEFycmF5fSB0aGF0IC0gVGhlIG1hdHJpeCB0byB0ZXN0IGVxdWFsaXR5IHdpdGguXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvbiAtIFRoZSBlcHNpbG9uIHZhbHVlLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIG1hdHJpeCBjb21wb25lbnRzIG1hdGNoLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gKCggdGhpcy5kYXRhWzBdID09PSB0aGF0WzBdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzBdIC0gdGhhdFswXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVsxXSA9PT0gdGhhdFsxXSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVsxXSAtIHRoYXRbMV0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbMl0gPT09IHRoYXRbMl0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbMl0gLSB0aGF0WzJdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzNdID09PSB0aGF0WzNdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzNdIC0gdGhhdFszXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVs0XSA9PT0gdGhhdFs0XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVs0XSAtIHRoYXRbNF0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbNV0gPT09IHRoYXRbNV0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbNV0gLSB0aGF0WzVdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzZdID09PSB0aGF0WzZdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzZdIC0gdGhhdFs2XSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVs3XSA9PT0gdGhhdFs3XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVs3XSAtIHRoYXRbN10gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbOF0gPT09IHRoYXRbOF0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbOF0gLSB0aGF0WzhdICkgPD0gZXBzaWxvbiApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNwb3NlIG9mIHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSB0cmFuc3Bvc2VkIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgaW52ZXJ0ZWQgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuaW52ZXJzZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBpbnYgPSBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICAvLyBjb2wgMFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzhdIC0gdGhpcy5kYXRhWzddKnRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbOF0gKyB0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzVdIC0gdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSxcclxuICAgICAgICAgICAgLy8gY29sIDFcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVszXSp0aGlzLmRhdGFbOF0gKyB0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzhdIC0gdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsyXSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0gKyB0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzJdLFxyXG4gICAgICAgICAgICAvLyBjb2wgMlxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzddIC0gdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVs0XSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10gKyB0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzRdIC0gdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxXVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkZXRlcm1pbmFudFxyXG4gICAgICAgIHZhciBkZXQgPSB0aGlzLmRhdGFbMF0qaW52LmRhdGFbMF0gKyB0aGlzLmRhdGFbMV0qaW52LmRhdGFbM10gKyB0aGlzLmRhdGFbMl0qaW52LmRhdGFbNl07XHJcbiAgICAgICAgLy8gcmV0dXJuXHJcbiAgICAgICAgcmV0dXJuIGludi5tdWx0U2NhbGFyKCAxIC8gZGV0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVjb21wb3NlcyB0aGUgbWF0cml4IGludG8gdGhlIGNvcnJlc3BvbmRpbmcgeCwgeSwgYW5kIHogYXhlcywgYWxvbmcgd2l0aFxyXG4gICAgICogYSBzY2FsZS5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBkZWNvbXBvc2VkIGNvbXBvbmVudHMgb2YgdGhlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLmRlY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb2wwID0gdGhpcy5jb2woIDAgKSxcclxuICAgICAgICAgICAgY29sMSA9IHRoaXMuY29sKCAxICksXHJcbiAgICAgICAgICAgIGNvbDIgPSB0aGlzLmNvbCggMiApO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxlZnQ6IGNvbDAubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIHVwOiBjb2wxLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBmb3J3YXJkOiBjb2wyLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBzY2FsZTogbmV3IFZlYzMoIGNvbDAubGVuZ3RoKCksIGNvbDEubGVuZ3RoKCksIGNvbDIubGVuZ3RoKCkgKVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSB0cmFuc2Zvcm0gbWF0cml4IGNvbXBvc2VkIG9mIGEgcm90YXRpb24gYW5kIHNjYWxlLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBBIHJhbmRvbSB0cmFuc2Zvcm0gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgciA9IE1hdDMzLnJvdGF0aW9uUmFkaWFucyggTWF0aC5yYW5kb20oKSAqIDM2MCwgVmVjMy5yYW5kb20oKSApO1xyXG4gICAgICAgIHZhciBzID0gTWF0MzMuc2NhbGUoIE1hdGgucmFuZG9tKCkgKiAxMCApO1xyXG4gICAgICAgIHJldHVybiByLm11bHRNYXQzMyggcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSArJywgJysgdGhpcy5kYXRhWzNdICsnLCAnKyB0aGlzLmRhdGFbNl0gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArJywgJysgdGhpcy5kYXRhWzRdICsnLCAnKyB0aGlzLmRhdGFbN10gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArJywgJysgdGhpcy5kYXRhWzVdICsnLCAnKyB0aGlzLmRhdGFbOF07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgbWF0cml4IGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuc2xpY2UoIDAgKTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNYXQzMztcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFZlYzMgPSByZXF1aXJlKCcuL1ZlYzMnKTtcclxuICAgIHZhciBWZWM0ID0gcmVxdWlyZSgnLi9WZWM0Jyk7XHJcbiAgICB2YXIgRVBTSUxPTiA9IHJlcXVpcmUoJy4vRXBzaWxvbicpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIE1hdDQ0XHJcbiAgICAgKiBAY2xhc3NkZXNjIEEgNHg0IGNvbHVtbi1tYWpvciBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIE1hdDQ0KCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSB0aGF0IHx8IFtcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF07XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoYXQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IEFycmF5KCAxNiApO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gPSB0aGF0LmRhdGFbMF07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSA9IHRoYXQuZGF0YVsxXTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdID0gdGhhdC5kYXRhWzJdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gPSB0aGF0LmRhdGFbM107XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSA9IHRoYXQuZGF0YVs0XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdID0gdGhhdC5kYXRhWzVdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNl0gPSB0aGF0LmRhdGFbNl07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSA9IHRoYXQuZGF0YVs3XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdID0gdGhhdC5kYXRhWzhdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOV0gPSB0aGF0LmRhdGFbOV07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMF0gPSB0aGF0LmRhdGFbMTBdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTFdID0gdGhhdC5kYXRhWzExXTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSA9IHRoYXQuZGF0YVsxMl07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gPSB0aGF0LmRhdGFbMTNdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdID0gdGhhdC5kYXRhWzE0XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE1XSA9IHRoYXQuZGF0YVsxNV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJvdyBvZiB0aGUgbWF0cml4IGFzIGEgVmVjNCBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgMC1iYXNlZCByb3cgaW5kZXguXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8fEFycmF5fSB2ZWMgLSBUaGUgdmVjdG9yIHRvIHJlcGxhY2UgdGhlIHJvdy4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSByb3cgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUucm93ID0gZnVuY3Rpb24oIGluZGV4LCB2ZWMgKSB7XHJcbiAgICAgICAgaWYgKCB2ZWMgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4XSA9IHZlY1swXSB8fCB2ZWMueDtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzQraW5kZXhdID0gdmVjWzFdIHx8IHZlYy55O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOCtpbmRleF0gPSB2ZWNbMl0gfHwgdmVjLno7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMitpbmRleF0gPSB2ZWNbM10gfHwgdmVjLnc7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzQraW5kZXhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOCtpbmRleF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMitpbmRleF0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgY29sdW1uIG9mIHRoZSBtYXRyaXggYXMgYSBWZWM0IG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSAwLWJhc2VkIGNvbCBpbmRleC5cclxuICAgICAqIEBwYXJhbSB7VmVjM3x8QXJyYXl9IHZlYyAtIFRoZSB2ZWN0b3IgdG8gcmVwbGFjZSB0aGUgY29sLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIGNvbHVtbiB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5jb2wgPSBmdW5jdGlvbiggaW5kZXgsIHZlYyApIHtcclxuICAgICAgICBpZiAoIHZlYyApIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXgqNF0gPSB2ZWNbMF0gfHwgdmVjLng7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxK2luZGV4KjRdID0gdmVjWzFdIHx8IHZlYy55O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMitpbmRleCo0XSA9IHZlY1syXSB8fCB2ZWMuejtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzMraW5kZXgqNF0gPSB2ZWNbM10gfHwgdmVjLnc7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4KjRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMStpbmRleCo0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzIraW5kZXgqNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszK2luZGV4KjRdICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaWRlbnRpdHkgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgaWRlbnRpeSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LmlkZW50aXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl8bnVtYmVyfSBzY2FsZSAtIFRoZSBzY2FsYXIgb3IgdmVjdG9yIHNjYWxpbmcgZmFjdG9yLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHNjYWxlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQuc2NhbGUgPSBmdW5jdGlvbiggc2NhbGUgKSB7XHJcbiAgICAgICAgaWYgKCB0eXBlb2Ygc2NhbGUgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgICAgIHNjYWxlLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgc2NhbGUsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCBzY2FsZSwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICggc2NhbGUgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgICAgICBzY2FsZVswXSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIHNjYWxlWzFdLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgc2NhbGVbMl0sIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgc2NhbGUueCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgc2NhbGUueSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgc2NhbGUueiwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSB0cmFuc2xhdGlvbiBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IHRyYW5zbGF0aW9uIC0gVGhlIHRyYW5zbGF0aW9uIHZlY3Rvci5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSB0cmFuc2xhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnRyYW5zbGF0aW9uID0gZnVuY3Rpb24oIHRyYW5zbGF0aW9uICkge1xyXG4gICAgICAgIGlmICggdHJhbnNsYXRpb24gaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblswXSwgdHJhbnNsYXRpb25bMV0sIHRyYW5zbGF0aW9uWzJdLCAxXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgdHJhbnNsYXRpb24ueCwgdHJhbnNsYXRpb24ueSwgdHJhbnNsYXRpb24ueiwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByb3RhdGlvbiBtYXRyaXggZGVmaW5lZCBieSBhbiBheGlzIGFuZCBhbiBhbmdsZS5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIGRlZ3JlZXMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgcm90YXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5yb3RhdGlvbkRlZ3JlZXMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRpb25SYWRpYW5zKCBhbmdsZSpNYXRoLlBJLzE4MCwgYXhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByb3RhdGlvbiBtYXRyaXggZGVmaW5lZCBieSBhbiBheGlzIGFuZCBhbiBhbmdsZS5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIHJhZGlhbnMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgcm90YXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5yb3RhdGlvblJhZGlhbnMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgaWYgKCBheGlzIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGF4aXMgPSBuZXcgVmVjMyggYXhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB6ZXJvIHZlY3RvciwgcmV0dXJuIGlkZW50aXR5XHJcbiAgICAgICAgaWYgKCBheGlzLmxlbmd0aFNxdWFyZWQoKSA9PT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5vcm1BeGlzID0gYXhpcy5ub3JtYWxpemUoKSxcclxuICAgICAgICAgICAgeCA9IG5vcm1BeGlzLngsXHJcbiAgICAgICAgICAgIHkgPSBub3JtQXhpcy55LFxyXG4gICAgICAgICAgICB6ID0gbm9ybUF4aXMueixcclxuICAgICAgICAgICAgbW9kQW5nbGUgPSAoIGFuZ2xlID4gMCApID8gYW5nbGUgJSAoMipNYXRoLlBJKSA6IGFuZ2xlICUgKC0yKk1hdGguUEkpLFxyXG4gICAgICAgICAgICBzID0gTWF0aC5zaW4oIG1vZEFuZ2xlICksXHJcbiAgICAgICAgICAgIGMgPSBNYXRoLmNvcyggbW9kQW5nbGUgKSxcclxuICAgICAgICAgICAgeHggPSB4ICogeCxcclxuICAgICAgICAgICAgeXkgPSB5ICogeSxcclxuICAgICAgICAgICAgenogPSB6ICogeixcclxuICAgICAgICAgICAgeHkgPSB4ICogeSxcclxuICAgICAgICAgICAgeXogPSB5ICogeixcclxuICAgICAgICAgICAgenggPSB6ICogeCxcclxuICAgICAgICAgICAgeHMgPSB4ICogcyxcclxuICAgICAgICAgICAgeXMgPSB5ICogcyxcclxuICAgICAgICAgICAgenMgPSB6ICogcyxcclxuICAgICAgICAgICAgb25lX2MgPSAxLjAgLSBjO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICAob25lX2MgKiB4eCkgKyBjLCAob25lX2MgKiB4eSkgKyB6cywgKG9uZV9jICogengpIC0geXMsIDAsXHJcbiAgICAgICAgICAgIChvbmVfYyAqIHh5KSAtIHpzLCAob25lX2MgKiB5eSkgKyBjLCAob25lX2MgKiB5eikgKyB4cywgMCxcclxuICAgICAgICAgICAgKG9uZV9jICogengpICsgeXMsIChvbmVfYyAqIHl6KSAtIHhzLCAob25lX2MgKiB6eikgKyBjLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCB0byByb3RhdGUgYSB2ZWN0b3IgZnJvbSBvbmUgZGlyZWN0aW9uIHRvXHJcbiAgICAgKiBhbm90aGVyLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBmcm9tIC0gVGhlIHN0YXJ0aW5nIGRpcmVjdGlvbi5cclxuICAgICAqIEBwYXJhbSB7VmVjM30gdG8gLSBUaGUgZW5kaW5nIGRpcmVjdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBtYXRyaXggcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbi5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucm90YXRpb25Gcm9tVG8gPSBmdW5jdGlvbiggZnJvbVZlYywgdG9WZWMgKSB7XHJcbiAgICAgICAgLypcclxuICAgICAgICBUaGlzIG1ldGhvZCBpcyBiYXNlZCBvbiB0aGUgY29kZSBmcm9tOlxyXG4gICAgICAgICAgICBUb21hcyBNbGxlciwgSm9obiBIdWdoZXNcclxuICAgICAgICAgICAgRWZmaWNpZW50bHkgQnVpbGRpbmcgYSBNYXRyaXggdG8gUm90YXRlIE9uZSBWZWN0b3IgdG8gQW5vdGhlclxyXG4gICAgICAgICAgICBKb3VybmFsIG9mIEdyYXBoaWNzIFRvb2xzLCA0KDQpOjEtNCwgMTk5OVxyXG4gICAgICAgICovXHJcbiAgICAgICAgdmFyIGZyb20gPSBuZXcgVmVjMyggZnJvbVZlYyApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciB0byA9IG5ldyBWZWMzKCB0b1ZlYyApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciBlID0gZnJvbS5kb3QoIHRvICk7XHJcbiAgICAgICAgdmFyIGYgPSBNYXRoLmFicyggZSApO1xyXG4gICAgICAgIHZhciB4LCB1LCB2O1xyXG4gICAgICAgIHZhciBmeCwgZnksIGZ6O1xyXG4gICAgICAgIHZhciB1eCwgdXo7XHJcbiAgICAgICAgdmFyIGMxLCBjMiwgYzM7XHJcbiAgICAgICAgaWYgKCBmID4gMS4wIC0gRVBTSUxPTiApIHtcclxuICAgICAgICAgICAgLy8gJ2Zyb20nIGFuZCAndG8nIGFsbW9zdCBwYXJhbGxlbFxyXG4gICAgICAgICAgICAvLyBuZWFybHkgb3J0aG9nb25hbFxyXG4gICAgICAgICAgICBmeCA9IE1hdGguYWJzKCBmcm9tLnggKTtcclxuICAgICAgICAgICAgZnkgPSBNYXRoLmFicyggZnJvbS55ICk7XHJcbiAgICAgICAgICAgIGZ6ID0gTWF0aC5hYnMoIGZyb20ueiApO1xyXG4gICAgICAgICAgICBpZiAoIGZ4IDwgZnkgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGZ4IDwgZnogKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBWZWMzKCAxLCAwLCAwICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMCwgMSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBmeSA8IGZ6ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMSwgMCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbmV3IFZlYzMoIDAsIDAsIDEgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1ID0geC5zdWIoIGZyb20gKTtcclxuICAgICAgICAgICAgdiA9IHguc3ViKCB0byApO1xyXG4gICAgICAgICAgICBjMSA9IDIuMCAvIHUuZG90KCB1ICk7XHJcbiAgICAgICAgICAgIGMyID0gMi4wIC8gdi5kb3QoIHYgKTtcclxuICAgICAgICAgICAgYzMgPSBjMSpjMiAqIHUuZG90KCB2ICk7XHJcbiAgICAgICAgICAgIC8vIHNldCBtYXRyaXggZW50cmllc1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS54IC0gYzIqdi54KnYueCArIGMzKnYueCp1LnggKyAxLjAsXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueCAtIGMyKnYueSp2LnggKyBjMyp2LnkqdS54LFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnggLSBjMip2Lnoqdi54ICsgYzMqdi56KnUueCxcclxuICAgICAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS55IC0gYzIqdi54KnYueSArIGMzKnYueCp1LnksXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueSAtIGMyKnYueSp2LnkgKyBjMyp2LnkqdS55ICsgMS4wLFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnkgLSBjMip2Lnoqdi55ICsgYzMqdi56KnUueSxcclxuICAgICAgICAgICAgICAgIDEuMCxcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS56IC0gYzIqdi54KnYueiArIGMzKnYueCp1LnosXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueiAtIGMyKnYueSp2LnogKyBjMyp2LnkqdS56LFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnogLSBjMip2Lnoqdi56ICsgYzMqdi56KnUueiArIDEuMCxcclxuICAgICAgICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgICAgICAgMC4wLFxyXG4gICAgICAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgICAgICAgMS4wXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGUgbW9zdCBjb21tb24gY2FzZSwgdW5sZXNzICdmcm9tJz0ndG8nLCBvciAndG8nPS0nZnJvbSdcclxuICAgICAgICB2ID0gZnJvbS5jcm9zcyggdG8gKTtcclxuICAgICAgICB1ID0gMS4wIC8gKCAxLjAgKyBlICk7ICAgIC8vIG9wdGltaXphdGlvbiBieSBHb3R0ZnJpZWQgQ2hlblxyXG4gICAgICAgIHV4ID0gdSAqIHYueDtcclxuICAgICAgICB1eiA9IHUgKiB2Lno7XHJcbiAgICAgICAgYzEgPSB1eCAqIHYueTtcclxuICAgICAgICBjMiA9IHV4ICogdi56O1xyXG4gICAgICAgIGMzID0gdXogKiB2Lnk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIGUgKyB1eCAqIHYueCxcclxuICAgICAgICAgICAgYzEgKyB2LnosXHJcbiAgICAgICAgICAgIGMyIC0gdi55LFxyXG4gICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgIGMxIC0gdi56LFxyXG4gICAgICAgICAgICBlICsgdSAqIHYueSAqIHYueSxcclxuICAgICAgICAgICAgYzMgKyB2LngsXHJcbiAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgYzIgKyB2LnksXHJcbiAgICAgICAgICAgIGMzIC0gdi54LFxyXG4gICAgICAgICAgICBlICsgdXogKiB2LnosXHJcbiAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgMC4wLFxyXG4gICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgMS4wXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgbWF0cml4IHdpdGggdGhlIHByb3ZpZGVkIG1hdHJpeCBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IE1hMzNcclxuICAgICAqIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0MzN8QXJyYXl9IHRoYXQgLSBUaGUgbWF0cml4IHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBzdW0gb2YgdGhlIHR3byBtYXRyaWNlcy5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmFkZE1hdDMzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyB0aGF0IDogdGhhdC5kYXRhO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKyB0aGF0WzBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKyB0aGF0WzFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKyB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSArIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSArIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSArIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdICsgdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldICsgdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEwXSArIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNV1cclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBtYXRyaXggd2l0aCB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgTWEzM1xyXG4gICAgICogb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHN1bSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuYWRkTWF0NDQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSArIHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArIHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSArIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSArIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSArIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSArIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSArIHRoYXRbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSArIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs5XSArIHRoYXRbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMF0gKyB0aGF0WzEwXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzExXSArIHRoYXRbMTFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdICsgdGhhdFsxMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gKyB0aGF0WzEzXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE0XSArIHRoYXRbMTRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTVdICsgdGhhdFsxNV0sXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBwcm92aWRlZCBtYXRyaXggYXJndW1lbnQgZnJvbSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIE1hdDQ0IG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0MzN8QXJyYXl9IHRoYXQgLSBUaGUgbWF0cml4IHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBkaWZmZXJlbmNlIG9mIHRoZSB0d28gbWF0cmljZXMuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5zdWJNYXQzMyA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdIC0gdGhhdFswXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdIC0gdGhhdFsxXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdIC0gdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0gLSB0aGF0WzNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0gLSB0aGF0WzRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNl0gLSB0aGF0WzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSAtIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs5XSAtIHRoYXRbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMF0gLSB0aGF0WzhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTVdXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBwcm92aWRlZCBtYXRyaXggYXJndW1lbnQgZnJvbSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIE1hdDQ0IG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0NDR8QXJyYXl9IHRoYXQgLSBUaGUgbWF0cml4IHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBkaWZmZXJlbmNlIG9mIHRoZSB0d28gbWF0cmljZXMuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5zdWJNYXQ0NCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdIC0gdGhhdFswXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdIC0gdGhhdFsxXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdIC0gdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdIC0gdGhhdFszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdIC0gdGhhdFs0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdIC0gdGhhdFs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdIC0gdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddIC0gdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdIC0gdGhhdFs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldIC0gdGhhdFs5XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEwXSAtIHRoYXRbMTBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTFdIC0gdGhhdFsxMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0gLSB0aGF0WzEyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSAtIHRoYXRbMTNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdIC0gdGhhdFsxNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNV0gLSB0aGF0WzE1XSxcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92ZGVkIHZlY3RvciBhcmd1bWVudCBieSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIFZlYzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIHZlY3RvciB0byBiZSBtdWx0aXBsaWVkIGJ5IHRoZSBtYXRyaXguXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSByZXN1bHRpbmcgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUubXVsdFZlYzMgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICAvLyBlbnN1cmUgJ3RoYXQnIGlzIGEgVmVjM1xyXG4gICAgICAgIC8vIGl0IGlzIHNhZmUgdG8gb25seSBjYXN0IGlmIEFycmF5IHNpbmNlIFZlYzQgaGFzIG93biBtZXRob2RcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMzKFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFswXSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbOF0gKiB0aGF0WzJdICsgdGhpcy5kYXRhWzEyXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzldICogdGhhdFsyXSArIHRoaXMuZGF0YVsxM10sXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzZdICogdGhhdFsxXSArIHRoaXMuZGF0YVsxMF0gKiB0aGF0WzJdICsgdGhpcy5kYXRhWzE0XVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXQueCArIHRoaXMuZGF0YVs0XSAqIHRoYXQueSArIHRoaXMuZGF0YVs4XSAqIHRoYXQueiArIHRoaXMuZGF0YVsxMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXQueCArIHRoaXMuZGF0YVs1XSAqIHRoYXQueSArIHRoaXMuZGF0YVs5XSAqIHRoYXQueiArIHRoaXMuZGF0YVsxM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXQueCArIHRoaXMuZGF0YVs2XSAqIHRoYXQueSArIHRoaXMuZGF0YVsxMF0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTRdXHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92ZGVkIHZlY3RvciBhcmd1bWVudCBieSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIFZlYzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIHZlY3RvciB0byBiZSBtdWx0aXBsaWVkIGJ5IHRoZSBtYXRyaXguXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSByZXN1bHRpbmcgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUubXVsdFZlYzQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICAvLyBlbnN1cmUgJ3RoYXQnIGlzIGEgVmVjNFxyXG4gICAgICAgIC8vIGl0IGlzIHNhZmUgdG8gb25seSBjYXN0IGlmIEFycmF5IHNpbmNlIFZlYzMgaGFzIG93biBtZXRob2RcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFswXSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbOF0gKiB0aGF0WzJdICsgdGhpcy5kYXRhWzEyXSAqIHRoYXRbM10sXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzVdICogdGhhdFsxXSArIHRoaXMuZGF0YVs5XSAqIHRoYXRbMl0gKyB0aGlzLmRhdGFbMTNdICogdGhhdFszXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzEwXSAqIHRoYXRbMl0gKyB0aGlzLmRhdGFbMTRdICogdGhhdFszXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVszXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzExXSAqIHRoYXRbMl0gKyB0aGlzLmRhdGFbMTVdICogdGhhdFszXVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXQueCArIHRoaXMuZGF0YVs0XSAqIHRoYXQueSArIHRoaXMuZGF0YVs4XSAqIHRoYXQueiArIHRoaXMuZGF0YVsxMl0gKiB0aGF0LncsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXQueCArIHRoaXMuZGF0YVs1XSAqIHRoYXQueSArIHRoaXMuZGF0YVs5XSAqIHRoYXQueiArIHRoaXMuZGF0YVsxM10gKiB0aGF0LncsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXQueCArIHRoaXMuZGF0YVs2XSAqIHRoYXQueSArIHRoaXMuZGF0YVsxMF0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTRdICogdGhhdC53LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0LnggKyB0aGlzLmRhdGFbN10gKiB0aGF0LnkgKyB0aGlzLmRhdGFbMTFdICogdGhhdC56ICsgdGhpcy5kYXRhWzE1XSAqIHRoYXQud1xyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyBhbGwgY29tcG9uZW50cyBvZiB0aGUgbWF0cml4IGJ5IHRoZSBwcm92ZGVkIHNjYWxhciBhcmd1bWVudCxcclxuICAgICAqIHJldHVybmluZyBhIG5ldyBNYXQ0NCBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSBtYXRyaXggYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgcmVzdWx0aW5nIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLm11bHRTY2FsYXIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEwXSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMV0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNF0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTVdICogdGhhdFxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHByb3ZkZWQgbWF0cml4IGFyZ3VtZW50IGJ5IHRoZSBtYXRyaXgsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQzM3xBcnJheX0gLSBUaGUgbWF0cml4IHRvIGJlIG11bHRpcGxpZWQgYnkgdGhlIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSByZXN1bHRpbmcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUubXVsdE1hdDMzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyB0aGF0IDogdGhhdC5kYXRhO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzRdICogdGhhdFsxXSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzldICogdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdICogdGhhdFswXSArIHRoaXMuZGF0YVs2XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbMTBdICogdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdICogdGhhdFswXSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbMTFdICogdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFszXSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbNF0gKyB0aGlzLmRhdGFbOF0gKiB0aGF0WzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzNdICsgdGhpcy5kYXRhWzVdICogdGhhdFs0XSArIHRoaXMuZGF0YVs5XSAqIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbM10gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzEwXSAqIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSAqIHRoYXRbM10gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzExXSAqIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbNl0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzddICsgdGhpcy5kYXRhWzhdICogdGhhdFs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFs2XSArIHRoaXMuZGF0YVs1XSAqIHRoYXRbN10gKyB0aGlzLmRhdGFbOV0gKiB0aGF0WzhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzZdICsgdGhpcy5kYXRhWzZdICogdGhhdFs3XSArIHRoaXMuZGF0YVsxMF0gKiB0aGF0WzhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0WzZdICsgdGhpcy5kYXRhWzddICogdGhhdFs3XSArIHRoaXMuZGF0YVsxMV0gKiB0aGF0WzhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTVdXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgcHJvdmRlZCBtYXRyaXggYXJndW1lbnQgYnkgdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBNYXQ0NCBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDQ0fEFycmF5fSAtIFRoZSBtYXRyaXggdG8gYmUgbXVsdGlwbGllZCBieSB0aGUgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHJlc3VsdGluZyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5tdWx0TWF0NDQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzhdICogdGhhdFsyXSArIHRoaXMuZGF0YVsxMl0gKiB0aGF0WzNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzVdICogdGhhdFsxXSArIHRoaXMuZGF0YVs5XSAqIHRoYXRbMl0gKyB0aGlzLmRhdGFbMTNdICogdGhhdFszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdICogdGhhdFswXSArIHRoaXMuZGF0YVs2XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbMTBdICogdGhhdFsyXSArIHRoaXMuZGF0YVsxNF0gKiB0aGF0WzNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzddICogdGhhdFsxXSArIHRoaXMuZGF0YVsxMV0gKiB0aGF0WzJdICsgdGhpcy5kYXRhWzE1XSAqIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbNF0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzVdICsgdGhpcy5kYXRhWzhdICogdGhhdFs2XSArIHRoaXMuZGF0YVsxMl0gKiB0aGF0WzddLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzVdICogdGhhdFs1XSArIHRoaXMuZGF0YVs5XSAqIHRoYXRbNl0gKyB0aGlzLmRhdGFbMTNdICogdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdICogdGhhdFs0XSArIHRoaXMuZGF0YVs2XSAqIHRoYXRbNV0gKyB0aGlzLmRhdGFbMTBdICogdGhhdFs2XSArIHRoaXMuZGF0YVsxNF0gKiB0aGF0WzddLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzddICogdGhhdFs1XSArIHRoaXMuZGF0YVsxMV0gKiB0aGF0WzZdICsgdGhpcy5kYXRhWzE1XSAqIHRoYXRbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbOF0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzldICsgdGhpcy5kYXRhWzhdICogdGhhdFsxMF0gKyB0aGlzLmRhdGFbMTJdICogdGhhdFsxMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXRbOF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzldICsgdGhpcy5kYXRhWzldICogdGhhdFsxMF0gKyB0aGlzLmRhdGFbMTNdICogdGhhdFsxMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbOF0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzldICsgdGhpcy5kYXRhWzEwXSAqIHRoYXRbMTBdICsgdGhpcy5kYXRhWzE0XSAqIHRoYXRbMTFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0WzhdICsgdGhpcy5kYXRhWzddICogdGhhdFs5XSArIHRoaXMuZGF0YVsxMV0gKiB0aGF0WzEwXSArIHRoaXMuZGF0YVsxNV0gKiB0aGF0WzExXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFsxMl0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzEzXSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbMTRdICsgdGhpcy5kYXRhWzEyXSAqIHRoYXRbMTVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzEyXSArIHRoaXMuZGF0YVs1XSAqIHRoYXRbMTNdICsgdGhpcy5kYXRhWzldICogdGhhdFsxNF0gKyB0aGlzLmRhdGFbMTNdICogdGhhdFsxNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbMTJdICsgdGhpcy5kYXRhWzZdICogdGhhdFsxM10gKyB0aGlzLmRhdGFbMTBdICogdGhhdFsxNF0gKyB0aGlzLmRhdGFbMTRdICogdGhhdFsxNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSAqIHRoYXRbMTJdICsgdGhpcy5kYXRhWzddICogdGhhdFsxM10gKyB0aGlzLmRhdGFbMTFdICogdGhhdFsxNF0gKyB0aGlzLmRhdGFbMTVdICogdGhhdFsxNV1cclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXZpZGVzIGFsbCBjb21wb25lbnRzIG9mIHRoZSBtYXRyaXggYnkgdGhlIHByb3ZkZWQgc2NhbGFyIGFyZ3VtZW50LFxyXG4gICAgICogcmV0dXJuaW5nIGEgbmV3IE1hdDQ0IG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gZGl2aWRlIHRoZSBtYXRyaXggYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgcmVzdWx0aW5nIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmRpdlNjYWxhciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNl0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbN10gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOV0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTBdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzExXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE0XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNV0gLyB0aGF0XHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBhbGwgY29tcG9uZW50cyBtYXRjaCB0aG9zZSBvZiBhIHByb3ZpZGVkIG1hdHJpeC5cclxuICAgICAqIEFuIG9wdGlvbmFsIGVwc2lsb24gdmFsdWUgbWF5IGJlIHByb3ZpZGVkLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaXggY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuICgoIHRoaXMuZGF0YVswXSA9PT0gdGhhdFswXSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVswXSAtIHRoYXRbMF0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbMV0gPT09IHRoYXRbMV0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbMV0gLSB0aGF0WzFdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzJdID09PSB0aGF0WzJdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzJdIC0gdGhhdFsyXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVszXSA9PT0gdGhhdFszXSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVszXSAtIHRoYXRbM10gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbNF0gPT09IHRoYXRbNF0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbNF0gLSB0aGF0WzRdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzVdID09PSB0aGF0WzVdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzVdIC0gdGhhdFs1XSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVs2XSA9PT0gdGhhdFs2XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVs2XSAtIHRoYXRbNl0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbN10gPT09IHRoYXRbN10gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbN10gLSB0aGF0WzddICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzhdID09PSB0aGF0WzhdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzhdIC0gdGhhdFs4XSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVs5XSA9PT0gdGhhdFs5XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVs5XSAtIHRoYXRbOV0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbMTBdID09PSB0aGF0WzEwXSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVsxMF0gLSB0aGF0WzEwXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVsxMV0gPT09IHRoYXRbMTFdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzExXSAtIHRoYXRbMTFdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzEyXSA9PT0gdGhhdFsxMl0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbMTJdIC0gdGhhdFsxMl0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbMTNdID09PSB0aGF0WzEzXSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVsxM10gLSB0aGF0WzEzXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVsxNF0gPT09IHRoYXRbMTRdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzE0XSAtIHRoYXRbMTRdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzE1XSA9PT0gdGhhdFsxNV0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbMTVdIC0gdGhhdFsxNV0gKSA8PSBlcHNpbG9uICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVmdCAtIFRoZSBtaW5pbXVtIHggZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IC0gVGhlIG1heGltdW0geCBleHRlbnQgb2YgdGhlIHByb2plY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIC0gVGhlIG1pbmltdW0geSBleHRlbnQgb2YgdGhlIHByb2plY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIC0gVGhlIG1heGltdW0geSBleHRlbnQgb2YgdGhlIHByb2plY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbmVhciAtIFRoZSBtaW5pbXVtIHogZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZhciAtIFRoZSBtYXhpbXVtIHogZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQub3J0aG8gPSBmdW5jdGlvbiggbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IE1hdDQ0LmlkZW50aXR5KCk7XHJcbiAgICAgICAgbWF0LmRhdGFbMF0gPSAyIC8gKCByaWdodCAtIGxlZnQgKTtcclxuICAgICAgICBtYXQuZGF0YVs1XSA9IDIgLyAoIHRvcCAtIGJvdHRvbSApO1xyXG4gICAgICAgIG1hdC5kYXRhWzEwXSA9IC0yIC8gKCBmYXIgLSBuZWFyICk7XHJcbiAgICAgICAgbWF0LmRhdGFbMTJdID0gLSggKCByaWdodCArIGxlZnQgKSAvICggcmlnaHQgLSBsZWZ0ICkgKTtcclxuICAgICAgICBtYXQuZGF0YVsxM10gPSAtKCAoIHRvcCArIGJvdHRvbSApIC8gKCB0b3AgLSBib3R0b20gKSApO1xyXG4gICAgICAgIG1hdC5kYXRhWzE0XSA9IC0oICggZmFyICsgbmVhciApIC8gKCBmYXIgLSBuZWFyICkgKTtcclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZm92IC0gVGhlIGZpZWxkIG9mIHZpZXcuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IC0gVGhlIGFzcGVjdCByYXRpby5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6TWluIC0gVGhlIG1pbmltdW0geSBleHRlbnQgb2YgdGhlIGZydXN0dW0uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gek1heCAtIFRoZSBtYXhpbXVtIHkgZXh0ZW50IG9mIHRoZSBmcnVzdHVtLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uKCBmb3YsIGFzcGVjdCwgek1pbiwgek1heCApIHtcclxuICAgICAgICB2YXIgeU1heCA9IHpNaW4gKiBNYXRoLnRhbiggZm92ICogKCBNYXRoLlBJIC8gMzYwLjAgKSApLFxyXG4gICAgICAgICAgICB5TWluID0gLXlNYXgsXHJcbiAgICAgICAgICAgIHhNaW4gPSB5TWluICogYXNwZWN0LFxyXG4gICAgICAgICAgICB4TWF4ID0gLXhNaW4sXHJcbiAgICAgICAgICAgIG1hdCA9IE1hdDQ0LmlkZW50aXR5KCk7XHJcbiAgICAgICAgbWF0LmRhdGFbMF0gPSAoMiAqIHpNaW4pIC8gKHhNYXggLSB4TWluKTtcclxuICAgICAgICBtYXQuZGF0YVs1XSA9ICgyICogek1pbikgLyAoeU1heCAtIHlNaW4pO1xyXG4gICAgICAgIG1hdC5kYXRhWzhdID0gKHhNYXggKyB4TWluKSAvICh4TWF4IC0geE1pbik7XHJcbiAgICAgICAgbWF0LmRhdGFbOV0gPSAoeU1heCArIHlNaW4pIC8gKHlNYXggLSB5TWluKTtcclxuICAgICAgICBtYXQuZGF0YVsxMF0gPSAtKCh6TWF4ICsgek1pbikgLyAoek1heCAtIHpNaW4pKTtcclxuICAgICAgICBtYXQuZGF0YVsxMV0gPSAtMTtcclxuICAgICAgICBtYXQuZGF0YVsxNF0gPSAtKCAoIDIgKiAoek1heCp6TWluKSApLyh6TWF4IC0gek1pbikpO1xyXG4gICAgICAgIG1hdC5kYXRhWzE1XSA9IDA7XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc3Bvc2Ugb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHRyYW5zcG9zZWQgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUudHJhbnNwb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzExXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE1XVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGludmVydGVkIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaW52ID0gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgLy8gY29sIDBcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsxMF0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs5XSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTNdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICAtdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVsxMF0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs5XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxNF0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTNdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzddIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxM10qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs2XSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxMF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEwXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs3XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs2XSxcclxuICAgICAgICAgICAgLy8gY29sIDFcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMTBdKnRoaXMuZGF0YVsxNV0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxMV0qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxMV0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEwXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVsxMF0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs3XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxMF0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs3XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs2XSxcclxuICAgICAgICAgICAgLy8gY29sIDJcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVs5XSp0aGlzLmRhdGFbMTVdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMTFdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEzXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVs5XSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEzXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbN10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzVdLFxyXG4gICAgICAgICAgICAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzldICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs5XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgLy8gY29sIDNcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzEwXSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzEwXSp0aGlzLmRhdGFbMTNdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxM10gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzEwXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbOV0sXHJcbiAgICAgICAgICAgIC10aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzZdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTBdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzldIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs5XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs2XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs1XVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkZXRlcm1pbmFudFxyXG4gICAgICAgIHZhciBkZXQgPSB0aGlzLmRhdGFbMF0qaW52LmRhdGFbMF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qaW52LmRhdGFbNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0qaW52LmRhdGFbOF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10qaW52LmRhdGFbMTJdO1xyXG4gICAgICAgIHJldHVybiBpbnYubXVsdFNjYWxhciggMSAvIGRldCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlY29tcG9zZXMgdGhlIG1hdHJpeCBpbnRvIHRoZSBjb3JyZXNwb25kaW5nIHgsIHksIGFuZCB6IGF4ZXMsIGFsb25nIHdpdGhcclxuICAgICAqIGEgc2NhbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgZGVjb21wb3NlZCBjb21wb25lbnRzIG9mIHRoZSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5kZWNvbXBvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBleHRyYWN0IHRyYW5zZm9ybSBjb21wb25lbnRzXHJcbiAgICAgICAgdmFyIGNvbDAgPSBuZXcgVmVjMyggdGhpcy5jb2woIDAgKSApLFxyXG4gICAgICAgICAgICBjb2wxID0gbmV3IFZlYzMoIHRoaXMuY29sKCAxICkgKSxcclxuICAgICAgICAgICAgY29sMiA9IG5ldyBWZWMzKCB0aGlzLmNvbCggMiApICksXHJcbiAgICAgICAgICAgIGNvbDMgPSBuZXcgVmVjMyggdGhpcy5jb2woIDMgKSApO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxlZnQ6IGNvbDAubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIHVwOiBjb2wxLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBmb3J3YXJkOiBjb2wyLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBvcmlnaW46IGNvbDMsXHJcbiAgICAgICAgICAgIHNjYWxlOiBuZXcgVmVjMyggY29sMC5sZW5ndGgoKSwgY29sMS5sZW5ndGgoKSwgY29sMi5sZW5ndGgoKSApXHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIHRyYW5zZm9ybSBtYXRyaXggY29tcG9zZWQgb2YgYSByb3RhdGlvbiBhbmQgc2NhbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IEEgcmFuZG9tIHRyYW5zZm9ybSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciByID0gTWF0NDQucm90YXRpb25SYWRpYW5zKCBNYXRoLnJhbmRvbSgpICogMzYwLCBWZWMzLnJhbmRvbSgpICk7XHJcbiAgICAgICAgdmFyIHMgPSBNYXQ0NC5zY2FsZSggTWF0aC5yYW5kb20oKSAqIDEwICk7XHJcbiAgICAgICAgdmFyIHQgPSBNYXQ0NC50cmFuc2xhdGlvbiggVmVjMy5yYW5kb20oKSApO1xyXG4gICAgICAgIHJldHVybiB0Lm11bHRNYXQ0NCggci5tdWx0TWF0NDQoIHMgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSArJywgJysgdGhpcy5kYXRhWzRdICsnLCAnKyB0aGlzLmRhdGFbOF0gKycsICcrIHRoaXMuZGF0YVsxMl0gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArJywgJysgdGhpcy5kYXRhWzVdICsnLCAnKyB0aGlzLmRhdGFbOV0gKycsICcrIHRoaXMuZGF0YVsxM10gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArJywgJysgdGhpcy5kYXRhWzZdICsnLCAnKyB0aGlzLmRhdGFbMTBdICsnLCAnKyB0aGlzLmRhdGFbMTRdICsnLFxcbicgK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKycsICcrIHRoaXMuZGF0YVs3XSArJywgJysgdGhpcy5kYXRhWzExXSArJywgJysgdGhpcy5kYXRhWzE1XTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBtYXRyaXggYXMgYW4gYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5zbGljZSggMCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1hdDQ0O1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgVmVjMyA9IHJlcXVpcmUoJy4vVmVjMycpLFxyXG4gICAgICAgIE1hdDMzID0gcmVxdWlyZSgnLi9NYXQzMycpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgUXVhdGVybmlvbiBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgUXVhdGVybmlvblxyXG4gICAgICogQGNsYXNzZGVzYyBBIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIGFuIG9yaWVudGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBRdWF0ZXJuaW9uKCkge1xyXG4gICAgICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIC8vIGFycmF5IG9yIFF1YXRlcm5pb24gYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIHZhciBhcmd1bWVudCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIGlmICggYXJndW1lbnQudyAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50Lnc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBhcmd1bWVudFswXSAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50WzBdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLncgPSAxLjA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudC54IHx8IGFyZ3VtZW50WzFdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50LnkgfHwgYXJndW1lbnRbMl0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gYXJndW1lbnQueiB8fCBhcmd1bWVudFszXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCBjb21wb25lbnQgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLncgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMl07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSBhcmd1bWVudHNbM107XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMudyA9IDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcXVhdGVybmlvbiB0aGF0IHJlcHJlc2VudHMgYW4gb3JlaW50YXRpb24gbWF0Y2hpbmdcclxuICAgICAqIHRoZSBpZGVudGl0eSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgaWRlbnRpdHkgcXVhdGVybmlvbi5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5pZGVudGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggMSwgMCwgMCwgMCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgUXVhdGVybmlvbiB3aXRoIGVhY2ggY29tcG9uZW50IG5lZ2F0ZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgbmVnYXRlZCBxdWF0ZXJuaW9uLlxyXG4gICAgICovXHJcbiAgICAgUXVhdGVybmlvbi5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCAtdGhpcy53LCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uY2F0ZW5hdGVzIHRoZSByb3RhdGlvbnMgb2YgdGhlIHR3byBxdWF0ZXJuaW9ucywgcmV0dXJuaW5nXHJcbiAgICAgKiBhIG5ldyBRdWF0ZXJuaW9uIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtRdWF0ZXJuaW9ufEFycmF5fSB0aGF0IC0gVGhlIHF1YXRlcmlvbiB0byBjb25jYXRlbmF0ZS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIHJlc3VsdGluZyBjb25jYXRlbmF0ZWQgcXVhdGVybmlvbi5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUubXVsdFF1YXQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IG5ldyBRdWF0ZXJuaW9uKCB0aGF0ICkgOiB0aGF0O1xyXG4gICAgICAgIHZhciB3ID0gKHRoYXQudyAqIHRoaXMudykgLSAodGhhdC54ICogdGhpcy54KSAtICh0aGF0LnkgKiB0aGlzLnkpIC0gKHRoYXQueiAqIHRoaXMueiksXHJcbiAgICAgICAgICAgIHggPSB0aGlzLnkqdGhhdC56IC0gdGhpcy56KnRoYXQueSArIHRoaXMudyp0aGF0LnggKyB0aGlzLngqdGhhdC53LFxyXG4gICAgICAgICAgICB5ID0gdGhpcy56KnRoYXQueCAtIHRoaXMueCp0aGF0LnogKyB0aGlzLncqdGhhdC55ICsgdGhpcy55KnRoYXQudyxcclxuICAgICAgICAgICAgeiA9IHRoaXMueCp0aGF0LnkgLSB0aGlzLnkqdGhhdC54ICsgdGhpcy53KnRoYXQueiArIHRoaXMueip0aGF0Lnc7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCB3LCB4LCB5LCB6ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXBwbGllcyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIHF1YXRlcm5pb24gYXMgYSByb3RhdGlvblxyXG4gICAgICogbWF0cml4IHRvIHRoZSBwcm92aWRlZCB2ZWN0b3IsIHJldHVybmluZyBhIG5ldyBWZWMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIHJvdGF0ZS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHJlc3VsdGluZyByb3RhdGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyBuZXcgVmVjMyggdGhhdCApIDogdGhhdDtcclxuICAgICAgICB2YXIgdnEgPSBuZXcgUXVhdGVybmlvbiggMCwgdGhhdC54LCB0aGF0LnksIHRoYXQueiApLFxyXG4gICAgICAgICAgICByID0gdGhpcy5tdWx0UXVhdCggdnEgKS5tdWx0UXVhdCggdGhpcy5pbnZlcnNlKCkgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHIueCwgci55LCByLnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSByb3RhdGlvbiBtYXRyaXggdGhhdCB0aGUgcXVhdGVybmlvbiByZXByZXNlbnRzLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByb3RhdGlvbiBtYXRyaXggcmVwcmVzZW50ZWQgYnkgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLm1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4eCA9IHRoaXMueCp0aGlzLngsXHJcbiAgICAgICAgICAgIHl5ID0gdGhpcy55KnRoaXMueSxcclxuICAgICAgICAgICAgenogPSB0aGlzLnoqdGhpcy56LFxyXG4gICAgICAgICAgICB4eSA9IHRoaXMueCp0aGlzLnksXHJcbiAgICAgICAgICAgIHh6ID0gdGhpcy54KnRoaXMueixcclxuICAgICAgICAgICAgeHcgPSB0aGlzLngqdGhpcy53LFxyXG4gICAgICAgICAgICB5eiA9IHRoaXMueSp0aGlzLnosXHJcbiAgICAgICAgICAgIHl3ID0gdGhpcy55KnRoaXMudyxcclxuICAgICAgICAgICAgencgPSB0aGlzLnoqdGhpcy53O1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICAxIC0gMip5eSAtIDIqenosIDIqeHkgKyAyKnp3LCAyKnh6IC0gMip5dyxcclxuICAgICAgICAgICAgMip4eSAtIDIqencsIDEgLSAyKnh4IC0gMip6eiwgMip5eiArIDIqeHcsXHJcbiAgICAgICAgICAgIDIqeHogKyAyKnl3LCAyKnl6IC0gMip4dywgMSAtIDIqeHggLSAyKnl5IF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24gZGVmaW5lZCBieSBhbiBheGlzXHJcbiAgICAgKiBhbmQgYW4gYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIGRlZ3JlZXMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1F1YXRlcm5pb259IFRoZSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucm90YXRpb25EZWdyZWVzID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHJldHVybiBRdWF0ZXJuaW9uLnJvdGF0aW9uUmFkaWFucyggYW5nbGUgKiAoIE1hdGguUEkvMTgwICksIGF4aXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uIGRlZmluZWQgYnkgYW4gYXhpc1xyXG4gICAgICogYW5kIGFuIGFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnJvdGF0aW9uUmFkaWFucyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICBpZiAoIGF4aXMgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgYXhpcyA9IG5ldyBWZWMzKCBheGlzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vcm1hbGl6ZSBhcmd1bWVudHNcclxuICAgICAgICBheGlzID0gYXhpcy5ub3JtYWxpemUoKTtcclxuICAgICAgICAvLyBzZXQgcXVhdGVybmlvbiBmb3IgdGhlIGVxdWl2b2xlbnQgcm90YXRpb25cclxuICAgICAgICB2YXIgbW9kQW5nbGUgPSAoIGFuZ2xlID4gMCApID8gYW5nbGUgJSAoMipNYXRoLlBJKSA6IGFuZ2xlICUgKC0yKk1hdGguUEkpLFxyXG4gICAgICAgICAgICBzaW5hID0gTWF0aC5zaW4oIG1vZEFuZ2xlLzIgKSxcclxuICAgICAgICAgICAgY29zYSA9IE1hdGguY29zKCBtb2RBbmdsZS8yICk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICBjb3NhLFxyXG4gICAgICAgICAgICBheGlzLnggKiBzaW5hLFxyXG4gICAgICAgICAgICBheGlzLnkgKiBzaW5hLFxyXG4gICAgICAgICAgICBheGlzLnogKiBzaW5hICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHF1YXRlcm5pb24gdGhhdCBoYXMgYmVlbiBzcGhlcmljYWxseSBpbnRlcnBvbGF0ZWQgYmV0d2VlblxyXG4gICAgICogdHdvIHByb3ZpZGVkIHF1YXRlcm5pb25zIGZvciBhIGdpdmVuIHQgdmFsdWUuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7UXVhdGVybmlvbn0gZnJvbVJvdCAtIFRoZSByb3RhdGlvbiBhdCB0ID0gMC5cclxuICAgICAqIEBwYXJhbSB7UXVhdGVybmlvbn0gdG9Sb3QgLSBUaGUgcm90YXRpb24gYXQgdCA9IDEuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdCAtIFRoZSB0IHZhbHVlLCBmcm9tIDAgdG8gMS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSBpbnRlcnBvbGF0ZWQgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24uc2xlcnAgPSBmdW5jdGlvbiggZnJvbVJvdCwgdG9Sb3QsIHQgKSB7XHJcbiAgICAgICAgaWYgKCBmcm9tUm90IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGZyb21Sb3QgPSBuZXcgUXVhdGVybmlvbiggZnJvbVJvdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHRvUm90IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHRvUm90ID0gbmV3IFF1YXRlcm5pb24oIHRvUm90ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBhbmdsZSBiZXR3ZWVuXHJcbiAgICAgICAgdmFyIGNvc0hhbGZUaGV0YSA9ICggZnJvbVJvdC53ICogdG9Sb3QudyApICtcclxuICAgICAgICAgICAgKCBmcm9tUm90LnggKiB0b1JvdC54ICkgK1xyXG4gICAgICAgICAgICAoIGZyb21Sb3QueSAqIHRvUm90LnkgKSArXHJcbiAgICAgICAgICAgICggZnJvbVJvdC56ICogdG9Sb3QueiApO1xyXG4gICAgICAgIC8vIGlmIGZyb21Sb3Q9dG9Sb3Qgb3IgZnJvbVJvdD0tdG9Sb3QgdGhlbiB0aGV0YSA9IDAgYW5kIHdlIGNhbiByZXR1cm4gZnJvbVxyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIGNvc0hhbGZUaGV0YSApID49IDEgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbihcclxuICAgICAgICAgICAgICAgIGZyb21Sb3QudyxcclxuICAgICAgICAgICAgICAgIGZyb21Sb3QueCxcclxuICAgICAgICAgICAgICAgIGZyb21Sb3QueSxcclxuICAgICAgICAgICAgICAgIGZyb21Sb3QueiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb3NIYWxmVGhldGEgbXVzdCBiZSBwb3NpdGl2ZSB0byByZXR1cm4gdGhlIHNob3J0ZXN0IGFuZ2xlXHJcbiAgICAgICAgaWYgKCBjb3NIYWxmVGhldGEgPCAwICkge1xyXG4gICAgICAgICAgICBmcm9tUm90ID0gZnJvbVJvdC5uZWdhdGUoKTtcclxuICAgICAgICAgICAgY29zSGFsZlRoZXRhID0gLWNvc0hhbGZUaGV0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGhhbGZUaGV0YSA9IE1hdGguYWNvcyggY29zSGFsZlRoZXRhICk7XHJcbiAgICAgICAgdmFyIHNpbkhhbGZUaGV0YSA9IE1hdGguc3FydCggMSAtIGNvc0hhbGZUaGV0YSAqIGNvc0hhbGZUaGV0YSApO1xyXG4gICAgICAgIHZhciBzY2FsZUZyb20gPSBNYXRoLnNpbiggKCAxLjAgLSB0ICkgKiBoYWxmVGhldGEgKSAvIHNpbkhhbGZUaGV0YTtcclxuICAgICAgICB2YXIgc2NhbGVUbyA9IE1hdGguc2luKCB0ICogaGFsZlRoZXRhICkgLyBzaW5IYWxmVGhldGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICBmcm9tUm90LncgKiBzY2FsZUZyb20gKyB0b1JvdC53ICogc2NhbGVUbyxcclxuICAgICAgICAgICAgZnJvbVJvdC54ICogc2NhbGVGcm9tICsgdG9Sb3QueCAqIHNjYWxlVG8sXHJcbiAgICAgICAgICAgIGZyb21Sb3QueSAqIHNjYWxlRnJvbSArIHRvUm90LnkgKiBzY2FsZVRvLFxyXG4gICAgICAgICAgICBmcm9tUm90LnogKiBzY2FsZUZyb20gKyB0b1JvdC56ICogc2NhbGVUbyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB2ZWN0b3IuXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtRdWF0ZXJuaW9ufEFycmF5fSAtIFRoZSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHRoZSBkb3QgcHJvZHVjdCB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIGVwc2lsb24gdmFsdWUuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2guXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIHZhciB3ID0gdGhhdC53ICE9PSB1bmRlZmluZWQgPyB0aGF0LncgOiB0aGF0WzBdLFxyXG4gICAgICAgICAgICB4ID0gdGhhdC54ICE9PSB1bmRlZmluZWQgPyB0aGF0LnggOiB0aGF0WzFdLFxyXG4gICAgICAgICAgICB5ID0gdGhhdC55ICE9PSB1bmRlZmluZWQgPyB0aGF0LnkgOiB0aGF0WzJdLFxyXG4gICAgICAgICAgICB6ID0gdGhhdC56ICE9PSB1bmRlZmluZWQgPyB0aGF0LnogOiB0aGF0WzNdO1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICByZXR1cm4gKCB0aGlzLncgPT09IHcgfHwgTWF0aC5hYnMoIHRoaXMudyAtIHcgKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnggPT09IHggfHwgTWF0aC5hYnMoIHRoaXMueCAtIHggKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnkgPT09IHkgfHwgTWF0aC5hYnMoIHRoaXMueSAtIHkgKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnogPT09IHogfHwgTWF0aC5hYnMoIHRoaXMueiAtIHogKSA8PSBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBRdWF0ZXJuaW9uIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIHF1YXRlcm5pb24gb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtYWcgPSBNYXRoLnNxcnQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLngqdGhpcy54ICtcclxuICAgICAgICAgICAgICAgIHRoaXMueSp0aGlzLnkgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy56KnRoaXMueiArXHJcbiAgICAgICAgICAgICAgICB0aGlzLncqdGhpcy53ICk7XHJcbiAgICAgICAgaWYgKCBtYWcgIT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbihcclxuICAgICAgICAgICAgICAgIHRoaXMudyAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueCAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueSAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueiAvIG1hZyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjb25qdWdhdGUgb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgY29uanVnYXRlIG9mIHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5jb25qdWdhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCB0aGlzLncsIC10aGlzLngsIC10aGlzLnksIC10aGlzLnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIGludmVyc2Ugb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25qdWdhdGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIFF1YXRlcm5pb24gb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBBIHJhbmRvbSB2ZWN0b3Igb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF4aXMgPSBWZWMzLnJhbmRvbSgpLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBhbmdsZSA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgcmV0dXJuIFF1YXRlcm5pb24ucm90YXRpb25SYWRpYW5zKCBhbmdsZSwgYXhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMueCArICcsICcgKyB0aGlzLnkgKyAnLCAnICsgdGhpcy56ICsgJywgJyArIHRoaXMudztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBxdWF0ZXJuaW9uIGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFsgIHRoaXMudywgdGhpcy54LCB0aGlzLnksIHRoaXMueiBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFF1YXRlcm5pb247XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBWZWMzID0gcmVxdWlyZSgnLi9WZWMzJyk7XHJcbiAgICB2YXIgTWF0MzMgPSByZXF1aXJlKCcuL01hdDMzJyk7XHJcbiAgICB2YXIgTWF0NDQgPSByZXF1aXJlKCcuL01hdDQ0Jyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBUcmFuc2Zvcm0gb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIFRyYW5zZm9ybVxyXG4gICAgICogQGNsYXNzZGVzYyBBIHRyYW5zZm9ybSByZXByZXNlbnRpbmcgYW4gb3JpZW50YXRpb24sIHBvc2l0aW9uLCBhbmQgc2NhbGUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRyYW5zZm9ybSggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gdGhhdCB8fCB7fTtcclxuICAgICAgICBpZiAoIHRoYXQuZGF0YSBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICAvLyBNYXQzMyBvciBNYXQ0NCwgZXh0cmFjdCB0cmFuc2Zvcm0gY29tcG9uZW50c1xyXG4gICAgICAgICAgICB0aGF0ID0gdGhhdC5kZWNvbXBvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy51cCA9IHRoYXQudXA7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yd2FyZCA9IHRoYXQuZm9yd2FyZDtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gdGhhdC5sZWZ0O1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlID0gdGhhdC5zY2FsZTtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW4gPSB0aGF0Lm9yaWdpbiB8fCBuZXcgVmVjMyggMCwgMCwgMCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIHNldCBpbmRpdmlkdWFsIGNvbXBvbmVudHNcclxuICAgICAgICAgICAgdGhpcy51cCA9IHRoYXQudXAgPyBuZXcgVmVjMyggdGhhdC51cCApLm5vcm1hbGl6ZSgpIDogbmV3IFZlYzMoIDAsIDEsIDAgKTtcclxuICAgICAgICAgICAgdGhpcy5mb3J3YXJkID0gdGhhdC5mb3J3YXJkID8gbmV3IFZlYzMoIHRoYXQuZm9yd2FyZCApLm5vcm1hbGl6ZSgpIDogbmV3IFZlYzMoIDAsIDAsIDEgKTtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gdGhhdC5sZWZ0ID8gbmV3IFZlYzMoIHRoYXQubGVmdCApLm5vcm1hbGl6ZSgpIDogdGhpcy51cC5jcm9zcyggdGhpcy5mb3J3YXJkICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luID0gdGhhdC5vcmlnaW4gPyBuZXcgVmVjMyggdGhhdC5vcmlnaW4gKSA6IG5ldyBWZWMzKCAwLCAwLCAwICk7XHJcbiAgICAgICAgICAgIGlmICggdHlwZW9mIHRoYXQuc2NhbGUgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZSA9IG5ldyBWZWMzKCB0aGF0LnNjYWxlLCB0aGF0LnNjYWxlLCB0aGF0LnNjYWxlICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjYWxlID0gdGhhdC5zY2FsZSA/IG5ldyBWZWMzKCB0aGF0LnNjYWxlICkgOiBuZXcgVmVjMyggMSwgMSwgMSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBpZGVudGl0eSB0cmFuc2Zvcm0uXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gQW4gaWRlbnRpdHkgdHJhbnNmb3JtLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0uaWRlbnRpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYW5zZm9ybSh7XHJcbiAgICAgICAgICAgIGZvcndhcmQ6IG5ldyBWZWMzKCAwLCAwLCAxICksXHJcbiAgICAgICAgICAgIHVwOiBuZXcgVmVjMyggMCwgMSwgMCApLFxyXG4gICAgICAgICAgICBsZWZ0OiBuZXcgVmVjMyggMSwgMCwgMCApLFxyXG4gICAgICAgICAgICBvcmlnaW46IG5ldyBWZWMzKCAwLCAwLCAwICksXHJcbiAgICAgICAgICAgIHNjYWxlOiBuZXcgVmVjMyggMSwgMSwgMSApXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgYW4gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHNldHMgdGhlIGZvcndhcmQgdmVjdG9yLCBvdGhlcndpc2UgcmV0dXJuc1xyXG4gICAgICogdGhlIGZvcndhcmQgdmVjdG9yIGJ5IHZhbHVlLiBXaGlsZSBzZXR0aW5nLCBhIHJvdGF0aW9uIG1hdHJpeCBmcm9tIHRoZVxyXG4gICAgICogb3JpZ25hbCBmb3J3YXJkIHZlY3RvciB0byB0aGUgbmV3IGlzIHVzZWQgdG8gcm90YXRlIGFsbCBvdGhlciBheGVzLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gZm9yd2FyZCAtIFRoZSBmb3J3YXJkIHZlY3Rvci4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN8VHJhbnNmb3JtfSBUaGUgZm9yd2FyZCB2ZWN0b3IsIG9yIHRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZUZvcndhcmRUbyA9IGZ1bmN0aW9uKCBmb3J3YXJkICkge1xyXG4gICAgICAgIGlmICggZm9yd2FyZCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICBmb3J3YXJkID0gbmV3IFZlYzMoIGZvcndhcmQgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3J3YXJkID0gZm9yd2FyZC5ub3JtYWxpemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJvdCA9IE1hdDMzLnJvdGF0aW9uRnJvbVRvKCB0aGlzLmZvcndhcmQsIGZvcndhcmQgKTtcclxuICAgICAgICB0aGlzLmZvcndhcmQgPSBmb3J3YXJkO1xyXG4gICAgICAgIHRoaXMudXAgPSByb3QubXVsdFZlYzMoIHRoaXMudXAgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB0aGlzLmxlZnQgPSByb3QubXVsdFZlYzMoIHRoaXMubGVmdCApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIGFuIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCBzZXRzIHRoZSB1cCB2ZWN0b3IsIG90aGVyd2lzZSByZXR1cm5zXHJcbiAgICAgKiB0aGUgdXAgdmVjdG9yIGJ5IHZhbHVlLiBXaGlsZSBzZXR0aW5nLCBhIHJvdGF0aW9uIG1hdHJpeCBmcm9tIHRoZVxyXG4gICAgICogb3JpZ25hbCB1cCB2ZWN0b3IgdG8gdGhlIG5ldyBpcyB1c2VkIHRvIHJvdGF0ZSBhbGwgb3RoZXIgYXhlcy5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IHVwIC0gVGhlIHVwIHZlY3Rvci4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN8VHJhbnNmb3JtfSBUaGUgdXAgdmVjdG9yLCBvciB0aGUgdHJhbnNmb3JtIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5yb3RhdGVVcFRvID0gZnVuY3Rpb24oIHVwICkge1xyXG4gICAgICAgIGlmICggdXAgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgdXAgPSBuZXcgVmVjMyggdXAgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1cCA9IHVwLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcm90ID0gTWF0MzMucm90YXRpb25Gcm9tVG8oIHRoaXMudXAsIHVwICk7XHJcbiAgICAgICAgdGhpcy5mb3J3YXJkID0gcm90Lm11bHRWZWMzKCB0aGlzLmZvcndhcmQgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB0aGlzLnVwID0gdXA7XHJcbiAgICAgICAgdGhpcy5sZWZ0ID0gcm90Lm11bHRWZWMzKCB0aGlzLmxlZnQgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBhbiBhcmd1bWVudCBpcyBwcm92aWRlZCwgc2V0cyB0aGUgbGVmdCB2ZWN0b3IsIG90aGVyd2lzZSByZXR1cm5zXHJcbiAgICAgKiB0aGUgbGVmdCB2ZWN0b3IgYnkgdmFsdWUuIFdoaWxlIHNldHRpbmcsIGEgcm90YXRpb24gbWF0cml4IGZyb20gdGhlXHJcbiAgICAgKiBvcmlnbmFsIGxlZnQgdmVjdG9yIHRvIHRoZSBuZXcgaXMgdXNlZCB0byByb3RhdGUgYWxsIG90aGVyIGF4ZXMuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSBsZWZ0IC0gVGhlIGxlZnQgdmVjdG9yLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM3xUcmFuc2Zvcm19IFRoZSBsZWZ0IHZlY3Rvciwgb3IgdGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRlTGVmdFRvID0gZnVuY3Rpb24oIGxlZnQgKSB7XHJcbiAgICAgICAgaWYgKCBsZWZ0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGxlZnQgPSBuZXcgVmVjMyggbGVmdCApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlZnQgPSBsZWZ0Lm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcm90ID0gTWF0MzMucm90YXRpb25Gcm9tVG8oIHRoaXMubGVmdCwgbGVmdCApO1xyXG4gICAgICAgIHRoaXMuZm9yd2FyZCA9IHJvdC5tdWx0VmVjMyggdGhpcy5mb3J3YXJkICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdGhpcy51cCA9IHJvdC5tdWx0VmVjMyggdGhpcy51cCApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHRoaXMubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtJ3Mgc2NhbGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHNjYWxlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5zY2FsZU1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC5zY2FsZSggdGhpcy5zY2FsZSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRyYW5zZm9ybSdzIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSByb3RhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0LngsIHRoaXMubGVmdC55LCB0aGlzLmxlZnQueiwgMCxcclxuICAgICAgICAgICAgdGhpcy51cC54LCB0aGlzLnVwLnksIHRoaXMudXAueiwgMCxcclxuICAgICAgICAgICAgdGhpcy5mb3J3YXJkLngsIHRoaXMuZm9yd2FyZC55LCB0aGlzLmZvcndhcmQueiwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRyYW5zZm9ybSdzIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSB0cmFuc2xhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNsYXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gTWF0NDQudHJhbnNsYXRpb24oIHRoaXMub3JpZ2luICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtJ3MgYWZmaW5lLXRyYW5zZm9ybWF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBhZmZpbmUtdHJhbnNmb3JtYXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLm1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIFQgKiBSICogU1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0aW9uTWF0cml4KClcclxuICAgICAgICAgICAgLm11bHRNYXQ0NCggdGhpcy5yb3RhdGlvbk1hdHJpeCgpIClcclxuICAgICAgICAgICAgLm11bHRNYXQ0NCggdGhpcy5zY2FsZU1hdHJpeCgpICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgdHJhbnNmb3JtJ3Mgc2NhbGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGludmVyc2Ugc2NhbGUgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VTY2FsZU1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC5zY2FsZSggbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIDEgLyB0aGlzLnNjYWxlLngsXHJcbiAgICAgICAgICAgIDEgLyB0aGlzLnNjYWxlLnksXHJcbiAgICAgICAgICAgIDEgLyB0aGlzLnNjYWxlLnogKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zZm9ybSdzIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBpbnZlcnNlIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5pbnZlcnNlUm90YXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0LngsIHRoaXMudXAueCwgdGhpcy5mb3J3YXJkLngsIDAsXHJcbiAgICAgICAgICAgIHRoaXMubGVmdC55LCB0aGlzLnVwLnksIHRoaXMuZm9yd2FyZC55LCAwLFxyXG4gICAgICAgICAgICB0aGlzLmxlZnQueiwgdGhpcy51cC56LCB0aGlzLmZvcndhcmQueiwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zZm9ybSdzIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBpbnZlcnNlIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5pbnZlcnNlVHJhbnNsYXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gTWF0NDQudHJhbnNsYXRpb24oIHRoaXMub3JpZ2luLm5lZ2F0ZSgpICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgdHJhbnNmb3JtJ3MgYWZmaW5lLXRyYW5zZm9ybWF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBpbnZlcnNlIGFmZmluZS10cmFuc2Zvcm1hdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUuaW52ZXJzZU1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIFNeLTEgKiBSXi0xICogVF4tMVxyXG4gICAgICAgIHJldHVybiB0aGlzLmludmVyc2VTY2FsZU1hdHJpeCgpXHJcbiAgICAgICAgICAgIC5tdWx0TWF0NDQoIHRoaXMuaW52ZXJzZVJvdGF0aW9uTWF0cml4KCkgKVxyXG4gICAgICAgICAgICAubXVsdE1hdDQ0KCB0aGlzLmludmVyc2VUcmFuc2xhdGlvbk1hdHJpeCgpICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtJ3MgdmlldyBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgdmlldyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudmlld01hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuT3JpZ2luID0gdGhpcy5vcmlnaW4ubmVnYXRlKCksXHJcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5sZWZ0Lm5lZ2F0ZSgpLFxyXG4gICAgICAgICAgICBiYWNrd2FyZCA9IHRoaXMuZm9yd2FyZC5uZWdhdGUoKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgcmlnaHQueCwgdGhpcy51cC54LCBiYWNrd2FyZC54LCAwLFxyXG4gICAgICAgICAgICByaWdodC55LCB0aGlzLnVwLnksIGJhY2t3YXJkLnksIDAsXHJcbiAgICAgICAgICAgIHJpZ2h0LnosIHRoaXMudXAueiwgYmFja3dhcmQueiwgMCxcclxuICAgICAgICAgICAgbk9yaWdpbi5kb3QoIHJpZ2h0ICksIG5PcmlnaW4uZG90KCB0aGlzLnVwICksIG5PcmlnaW4uZG90KCBiYWNrd2FyZCApLCAxIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zbGF0ZXMgdGhlIHRyYW5zZm9ybSBpbiB3b3JsZCBzcGFjZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IHRyYW5zbGF0aW9uIC0gVGhlIHRyYW5zbGF0aW9uIHZlY3Rvci5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VHJhbnNmb3JtfSBUaGUgdHJhbnNmb3JtIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS50cmFuc2xhdGVXb3JsZCA9IGZ1bmN0aW9uKCB0cmFuc2xhdGlvbiApIHtcclxuICAgICAgICB0aGlzLm9yaWdpbiA9IHRoaXMub3JpZ2luLmFkZCggdHJhbnNsYXRpb24gKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2xhdGVzIHRoZSB0cmFuc2Zvcm0gaW4gbG9jYWwgc3BhY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSB0cmFuc2xhdGlvbiAtIFRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNsYXRlTG9jYWwgPSBmdW5jdGlvbiggdHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgaWYgKCB0cmFuc2xhdGlvbiBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICB0cmFuc2xhdGlvbiA9IG5ldyBWZWMzKCB0cmFuc2xhdGlvbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9yaWdpbiA9IHRoaXMub3JpZ2luLmFkZCggdGhpcy5sZWZ0Lm11bHRTY2FsYXIoIHRyYW5zbGF0aW9uLnggKSApXHJcbiAgICAgICAgICAgIC5hZGQoIHRoaXMudXAubXVsdFNjYWxhciggdHJhbnNsYXRpb24ueSApIClcclxuICAgICAgICAgICAgLmFkZCggdGhpcy5mb3J3YXJkLm11bHRTY2FsYXIoIHRyYW5zbGF0aW9uLnogKSApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJvdGF0ZXMgdGhlIHRyYW5zZm9ybSBieSBhbiBhbmdsZSBhcm91bmQgYW4gYXhpcyBpbiB3b3JsZCBzcGFjZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiBkZWdyZWVzLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZVdvcmxkRGVncmVlcyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3RhdGVXb3JsZFJhZGlhbnMoIGFuZ2xlICogTWF0aC5QSSAvIDE4MCwgYXhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJvdGF0ZXMgdGhlIHRyYW5zZm9ybSBieSBhbiBhbmdsZSBhcm91bmQgYW4gYXhpcyBpbiB3b3JsZCBzcGFjZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZVdvcmxkUmFkaWFucyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICB2YXIgcm90ID0gTWF0MzMucm90YXRpb25SYWRpYW5zKCBhbmdsZSwgYXhpcyApO1xyXG4gICAgICAgIHRoaXMudXAgPSByb3QubXVsdFZlYzMoIHRoaXMudXAgKTtcclxuICAgICAgICB0aGlzLmZvcndhcmQgPSByb3QubXVsdFZlYzMoIHRoaXMuZm9yd2FyZCApO1xyXG4gICAgICAgIHRoaXMubGVmdCA9IHJvdC5tdWx0VmVjMyggdGhpcy5sZWZ0ICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUm90YXRlcyB0aGUgdHJhbnNmb3JtIGJ5IGFuIGFuZ2xlIGFyb3VuZCBhbiBheGlzIGluIGxvY2FsIHNwYWNlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIGRlZ3JlZXMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRlTG9jYWxEZWdyZWVzID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvdGF0ZVdvcmxkRGVncmVlcyggYW5nbGUsIHRoaXMucm90YXRpb25NYXRyaXgoKS5tdWx0VmVjMyggYXhpcyApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUm90YXRlcyB0aGUgdHJhbnNmb3JtIGJ5IGFuIGFuZ2xlIGFyb3VuZCBhbiBheGlzIGluIGxvY2FsIHNwYWNlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIHJhZGlhbnMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRlTG9jYWxSYWRpYW5zID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvdGF0ZVdvcmxkUmFkaWFucyggYW5nbGUsIHRoaXMucm90YXRpb25NYXRyaXgoKS5tdWx0VmVjMyggYXhpcyApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmb3JtcyB0aGUgdmVjdG9yIG9yIG1hdHJpeCBhcmd1bWVudCBmcm9tIHRoZSB0cmFuc2Zvcm1zIGxvY2FsIHNwYWNlXHJcbiAgICAgKiB0byB0aGUgd29ybGQgc3BhY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR9IHZlYyAtIFRoZSB2ZWN0b3IgYXJndW1lbnQgdG8gdHJhbnNmb3JtLlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVTY2FsZSAtIFdoZXRoZXIgb3Igbm90IHRvIGluY2x1ZGUgdGhlIHNjYWxlIGluIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZVJvdGF0aW9uIC0gV2hldGhlciBvciBub3QgdG8gaW5jbHVkZSB0aGUgcm90YXRpb24gaW4gdGhlIHRyYW5zZm9ybS5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlVHJhbnNsYXRpb24gLSBXaGV0aGVyIG9yIG5vdCB0byBpbmNsdWRlIHRoZSB0cmFuc2xhdGlvbiBpbiB0aGUgdHJhbnNmb3JtLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmxvY2FsVG9Xb3JsZCA9IGZ1bmN0aW9uKCB2ZWMsIGlnbm9yZVNjYWxlLCBpZ25vcmVSb3RhdGlvbiwgaWdub3JlVHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCgpO1xyXG4gICAgICAgIGlmICggIWlnbm9yZVNjYWxlICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLnNjYWxlTWF0cml4KCkubXVsdE1hdDQ0KCBtYXQgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhaWdub3JlUm90YXRpb24gKSB7XHJcbiAgICAgICAgICAgIG1hdCA9IHRoaXMucm90YXRpb25NYXRyaXgoKS5tdWx0TWF0NDQoIG1hdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoICFpZ25vcmVUcmFuc2xhdGlvbiApIHtcclxuICAgICAgICAgICAgbWF0ID0gdGhpcy50cmFuc2xhdGlvbk1hdHJpeCgpLm11bHRNYXQ0NCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQubXVsdFZlYzMoIHZlYyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zZm9ybXMgdGhlIHZlY3RvciBvciBtYXRyaXggYXJndW1lbnQgZnJvbSB3b3JsZCBzcGFjZSB0byB0aGVcclxuICAgICAqIHRyYW5zZm9ybXMgbG9jYWwgc3BhY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR9IHZlYyAtIFRoZSB2ZWN0b3IgYXJndW1lbnQgdG8gdHJhbnNmb3JtLlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVTY2FsZSAtIFdoZXRoZXIgb3Igbm90IHRvIGluY2x1ZGUgdGhlIHNjYWxlIGluIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZVJvdGF0aW9uIC0gV2hldGhlciBvciBub3QgdG8gaW5jbHVkZSB0aGUgcm90YXRpb24gaW4gdGhlIHRyYW5zZm9ybS5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlVHJhbnNsYXRpb24gLSBXaGV0aGVyIG9yIG5vdCB0byBpbmNsdWRlIHRoZSB0cmFuc2xhdGlvbiBpbiB0aGUgdHJhbnNmb3JtLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLndvcmxkVG9Mb2NhbCA9IGZ1bmN0aW9uKCB2ZWMsIGlnbm9yZVNjYWxlLCBpZ25vcmVSb3RhdGlvbiwgaWdub3JlVHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCgpO1xyXG4gICAgICAgIGlmICggIWlnbm9yZVRyYW5zbGF0aW9uICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLmludmVyc2VUcmFuc2xhdGlvbk1hdHJpeCgpLm11bHRNYXQ0NCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIWlnbm9yZVJvdGF0aW9uICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLmludmVyc2VSb3RhdGlvbk1hdHJpeCgpLm11bHRNYXQ0NCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIWlnbm9yZVNjYWxlICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLmludmVyc2VTY2FsZU1hdHJpeCgpLm11bHRNYXQ0NCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQubXVsdFZlYzMoIHZlYyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYWxsIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB0cmFuc2Zvcm0uXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1RyYW5zZm9ybX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB0cmFuc2Zvcm0gY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW4uZXF1YWxzKCB0aGF0Lm9yaWdpbiwgZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgIHRoaXMuZm9yd2FyZC5lcXVhbHMoIHRoYXQuZm9yd2FyZCwgZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgIHRoaXMudXAuZXF1YWxzKCB0aGF0LnVwLCBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgdGhpcy5sZWZ0LmVxdWFscyggdGhhdC5sZWZ0LCBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS5lcXVhbHMoIHRoYXQuc2NhbGUsIGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgdHJhbnNmb3JtIHdpdGggYSByYW5kb20gb3JpZ2luLCBvcmllbnRhdGlvbiwgYW5kIHNjYWxlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSByYW5kb20gdHJhbnNmb3JtLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oe1xyXG4gICAgICAgICAgICBvcmlnaW46IFZlYzMucmFuZG9tKCksXHJcbiAgICAgICAgICAgIHNjYWxlOiBWZWMzLnJhbmRvbSgpLFxyXG4gICAgICAgIH0pLnJvdGF0ZUZvcndhcmRUbyggVmVjMy5yYW5kb20oKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zZm9ybS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaXgoKS50b1N0cmluZygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBWZWMzID0gcmVxdWlyZSgnLi9WZWMzJyk7XHJcblxyXG4gICAgZnVuY3Rpb24gY2xvc2VzdFBvaW50T25FZGdlKCBhLCBiLCBwb2ludCApIHtcclxuICAgICAgICB2YXIgYWIgPSBiLnN1YiggYSApO1xyXG4gICAgICAgIC8vIHByb2plY3QgYyBvbnRvIGFiLCBjb21wdXRpbmcgcGFyYW1ldGVyaXplZCBwb3NpdGlvbiBkKHQpID0gYSArIHQqKGIgKiBhKVxyXG4gICAgICAgIHZhciB0ID0gbmV3IFZlYzMoIHBvaW50ICkuc3ViKCBhICkuZG90KCBhYiApIC8gYWIuZG90KCBhYiApO1xyXG4gICAgICAgIC8vIElmIG91dHNpZGUgc2VnbWVudCwgY2xhbXAgdCAoYW5kIHRoZXJlZm9yZSBkKSB0byB0aGUgY2xvc2VzdCBlbmRwb2ludFxyXG4gICAgICAgIGlmICggdCA8IDAgKSB7XHJcbiAgICAgICAgICAgIHQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHQgPiAxICkge1xyXG4gICAgICAgICAgICB0ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29tcHV0ZSBwcm9qZWN0ZWQgcG9zaXRpb24gZnJvbSB0aGUgY2xhbXBlZCB0XHJcbiAgICAgICAgcmV0dXJuIGEuYWRkKCBhYi5tdWx0U2NhbGFyKCB0ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIFRyaWFuZ2xlIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBUcmlhbmdsZVxyXG4gICAgICogQGNsYXNzZGVzYyBBIENDVy13aW5kZWQgdHJpYW5nbGUgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUcmlhbmdsZSgpIHtcclxuICAgICAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBvciBvYmplY3QgYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmEgPSBuZXcgVmVjMyggYXJnWzBdIHx8IGFyZy5hICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmIgPSBuZXcgVmVjMyggYXJnWzFdIHx8IGFyZy5iICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmMgPSBuZXcgVmVjMyggYXJnWzJdIHx8IGFyZy5jICk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCB2ZWN0b3IgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmEgPSBuZXcgVmVjMyggYXJndW1lbnRzWzBdICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmIgPSBuZXcgVmVjMyggYXJndW1lbnRzWzFdICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmMgPSBuZXcgVmVjMyggYXJndW1lbnRzWzJdICk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuYSA9IG5ldyBWZWMzKCAwLCAwLCAwICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmIgPSBuZXcgVmVjMyggMSwgMCwgMCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jID0gbmV3IFZlYzMoIDEsIDEsIDAgKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJhZGl1cyBvZiB0aGUgYm91bmRpbmcgc3BoZXJlIG9mIHRoZSB0cmlhbmdsZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSByYWRpdXMgb2YgdGhlIGJvdW5kaW5nIHNwaGVyZS5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLnJhZGl1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjZW50cm9pZCA9IHRoaXMuY2VudHJvaWQoKSxcclxuICAgICAgICAgICAgYURpc3QgPSB0aGlzLmEuc3ViKCBjZW50cm9pZCApLmxlbmd0aCgpLFxyXG4gICAgICAgICAgICBiRGlzdCA9IHRoaXMuYi5zdWIoIGNlbnRyb2lkICkubGVuZ3RoKCksXHJcbiAgICAgICAgICAgIGNEaXN0ID0gdGhpcy5jLnN1YiggY2VudHJvaWQgKS5sZW5ndGgoKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoIGFEaXN0LCBNYXRoLm1heCggYkRpc3QsIGNEaXN0ICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjZW50cm9pZCBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgY2VudHJvaWQgb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5wcm90b3R5cGUuY2VudHJvaWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hXHJcbiAgICAgICAgICAgIC5hZGQoIHRoaXMuYiApXHJcbiAgICAgICAgICAgIC5hZGQoIHRoaXMuYyApXHJcbiAgICAgICAgICAgIC5kaXZTY2FsYXIoIDMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBub3JtYWwgb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIG5vcm1hbCBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5ub3JtYWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYWIgPSB0aGlzLmIuc3ViKCB0aGlzLmEgKSxcclxuICAgICAgICAgICAgYWMgPSB0aGlzLmMuc3ViKCB0aGlzLmEgKTtcclxuICAgICAgICByZXR1cm4gYWIuY3Jvc3MoIGFjICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgYXJlYSBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgYXJlYSBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5hcmVhID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGFiID0gdGhpcy5iLnN1YiggdGhpcy5hICksXHJcbiAgICAgICAgICAgIGFjID0gdGhpcy5jLnN1YiggdGhpcy5hICk7XHJcbiAgICAgICAgcmV0dXJuIGFiLmNyb3NzKCBhYyApLmxlbmd0aCgpIC8gMi4wO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSB0cmlhbmdsZS4gVGhlIHBvaW50IG11c3QgYmVcclxuICAgICAqIGNvcGxhbmFyLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSBwb2ludCAtIFRoZSBwb2ludCB0byB0ZXN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSB0cmlhbmdsZS5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLmlzSW5zaWRlID0gZnVuY3Rpb24oIHBvaW50ICkge1xyXG4gICAgICAgIHZhciBwID0gbmV3IFZlYzMoIHBvaW50ICk7XHJcbiAgICAgICAgLy8gVHJhbnNsYXRlIHBvaW50IGFuZCB0cmlhbmdsZSBzbyB0aGF0IHBvaW50IGxpZXMgYXQgb3JpZ2luXHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLmEuc3ViKCBwICk7XHJcbiAgICAgICAgdmFyIGIgPSB0aGlzLmIuc3ViKCBwICk7XHJcbiAgICAgICAgdmFyIGMgPSB0aGlzLmMuc3ViKCBwICk7XHJcbiAgICAgICAgLy8gQ29tcHV0ZSBub3JtYWwgdmVjdG9ycyBmb3IgdHJpYW5nbGVzIHBhYiBhbmQgcGJjXHJcbiAgICAgICAgdmFyIHUgPSBiLmNyb3NzKCBjICk7XHJcbiAgICAgICAgdmFyIHYgPSBjLmNyb3NzKCBhICk7XHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZXkgYXJlIGJvdGggcG9pbnRpbmcgaW4gdGhlIHNhbWUgZGlyZWN0aW9uXHJcbiAgICAgICAgaWYgKCB1LmRvdCggdiApIDwgMC4wICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIENvbXB1dGUgbm9ybWFsIHZlY3RvciBmb3IgdHJpYW5nbGUgcGNhXHJcbiAgICAgICAgdmFyIHcgPSBhLmNyb3NzKCBiICk7XHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIGl0IHBvaW50cyBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gYXMgdGhlIGZpcnN0IHR3b1xyXG4gICAgICAgIGlmICggdS5kb3QoIHcgKSA8IDAuMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPdGhlcndpc2UgUCBtdXN0IGJlIGluIChvciBvbikgdGhlIHRyaWFuZ2xlXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJzZWN0IHRoZSB0cmlhbmdsZSBhbmQgcmV0dXJuIGludGVyc2VjdGlvbiBpbmZvcm1hdGlvbi5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gb3JpZ2luIC0gVGhlIG9yaWdpbiBvZiB0aGUgaW50ZXJzZWN0aW9uIHJheVxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSBkaXJlY3Rpb24gLSBUaGUgZGlyZWN0aW9uIG9mIHRoZSBpbnRlcnNlY3Rpb24gcmF5LlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVCZWhpbmQgLSBXaGV0aGVyIG9yIG5vdCB0byBpZ25vcmUgaW50ZXJzZWN0aW9ucyBiZWhpbmQgdGhlIG9yaWdpbiBvZiB0aGUgcmF5LlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVCYWNrZmFjZSAtIFdoZXRoZXIgb3Igbm90IHRvIGlnbm9yZSB0aGUgYmFja2ZhY2Ugb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R8Ym9vbGVhbn0gVGhlIGludGVyc2VjdGlvbiBpbmZvcm1hdGlvbiwgb3IgZmFsc2UgaWYgdGhlcmUgaXMgbm8gaW50ZXJzZWN0aW9uLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5wcm90b3R5cGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24oIG9yaWdpbiwgZGlyZWN0aW9uLCBpZ25vcmVCZWhpbmQsIGlnbm9yZUJhY2tmYWNlICkge1xyXG4gICAgICAgIC8vIENvbXB1dGUgcmF5L3BsYW5lIGludGVyc2VjdGlvblxyXG4gICAgICAgIHZhciBvID0gbmV3IFZlYzMoIG9yaWdpbiApO1xyXG4gICAgICAgIHZhciBkID0gbmV3IFZlYzMoIGRpcmVjdGlvbiApO1xyXG4gICAgICAgIHZhciBub3JtYWwgPSB0aGlzLm5vcm1hbCgpO1xyXG4gICAgICAgIHZhciBkbiA9IGQuZG90KCBub3JtYWwgKTtcclxuICAgICAgICBpZiAoIGRuID09PSAwICkge1xyXG4gICAgICAgICAgICAvLyByYXkgaXMgcGFyYWxsZWwgdG8gcGxhbmVcclxuICAgICAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgcmF5IGlzIGNvLWxpbmVhciBhbmQgaW50ZXJzZWN0cz9cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdCA9IHRoaXMuYS5zdWIoIG8gKS5kb3QoIG5vcm1hbCApIC8gZG47XHJcbiAgICAgICAgaWYgKCBpZ25vcmVCZWhpbmQgJiYgKCB0IDwgMCApICkge1xyXG4gICAgICAgICAgICAvLyBwbGFuZSBpcyBiZWhpbmQgcmF5XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBpZ25vcmVCYWNrZmFjZSApIHtcclxuICAgICAgICAgICAgLy8gIGlnbm9yZSB0cmlhbmdsZXMgZmFjaW5nIGF3YXkgZnJvbSByYXlcclxuICAgICAgICAgICAgaWYgKCAoIHQgPiAwICYmIGRuID4gMCApIHx8ICggdCA8IDAgJiYgZG4gPCAwICkgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB0cmlhbmdsZSBpcyBmYWNpbmcgb3Bwb3NpdGUgdGhlIGRpcmVjdGlvbiBvZiBpbnRlcnNlY3Rpb25cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSBvLmFkZCggZC5tdWx0U2NhbGFyKCB0ICkgKTtcclxuICAgICAgICAvLyBjaGVjayBpZiBwb2ludCBpcyBpbnNpZGUgdGhlIHRyaWFuZ2xlXHJcbiAgICAgICAgaWYgKCAhdGhpcy5pc0luc2lkZSggcG9zaXRpb24gKSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXHJcbiAgICAgICAgICAgIG5vcm1hbDogbm9ybWFsLFxyXG4gICAgICAgICAgICB0OiB0XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjbG9zZXN0IHBvaW50IG9uIHRoZSB0cmlhbmdsZSB0byB0aGUgc3BlY2lmaWVkIHBvaW50LlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSBwb2ludCAtIFRoZSBwb2ludCB0byB0ZXN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgY2xvc2VzdCBwb2ludCBvbiB0aGUgZWRnZS5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLmNsb3Nlc3RQb2ludCA9IGZ1bmN0aW9uKCBwb2ludCApIHtcclxuICAgICAgICB2YXIgZTAgPSBjbG9zZXN0UG9pbnRPbkVkZ2UoIHRoaXMuYSwgdGhpcy5iLCBwb2ludCApO1xyXG4gICAgICAgIHZhciBlMSA9IGNsb3Nlc3RQb2ludE9uRWRnZSggdGhpcy5iLCB0aGlzLmMsIHBvaW50ICk7XHJcbiAgICAgICAgdmFyIGUyID0gY2xvc2VzdFBvaW50T25FZGdlKCB0aGlzLmMsIHRoaXMuYSwgcG9pbnQgKTtcclxuICAgICAgICB2YXIgZDAgPSAoIGUwLnN1YiggcG9pbnQgKSApLmxlbmd0aFNxdWFyZWQoKTtcclxuICAgICAgICB2YXIgZDEgPSAoIGUxLnN1YiggcG9pbnQgKSApLmxlbmd0aFNxdWFyZWQoKTtcclxuICAgICAgICB2YXIgZDIgPSAoIGUyLnN1YiggcG9pbnQgKSApLmxlbmd0aFNxdWFyZWQoKTtcclxuICAgICAgICBpZiAoIGQwIDwgZDEgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIGQwIDwgZDIgKSA/IGUwIDogZTI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuICggZDEgPCBkMiApID8gZTEgOiBlMjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBUcmlhbmdsZSBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmlhbmdsZX0gQSByYW5kb20gdHJpYW5nbGUgb2YgdW5pdCByYWRpdXMuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhID0gVmVjMy5yYW5kb20oKSxcclxuICAgICAgICAgICAgYiA9IFZlYzMucmFuZG9tKCksXHJcbiAgICAgICAgICAgIGMgPSBWZWMzLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBjZW50cm9pZCA9IGEuYWRkKCBiICkuYWRkKCBjICkuZGl2U2NhbGFyKCAzICksXHJcbiAgICAgICAgICAgIGFDZW50ID0gYS5zdWIoIGNlbnRyb2lkICksXHJcbiAgICAgICAgICAgIGJDZW50ID0gYi5zdWIoIGNlbnRyb2lkICksXHJcbiAgICAgICAgICAgIGNDZW50ID0gYy5zdWIoIGNlbnRyb2lkICksXHJcbiAgICAgICAgICAgIGFEaXN0ID0gYUNlbnQubGVuZ3RoKCksXHJcbiAgICAgICAgICAgIGJEaXN0ID0gYkNlbnQubGVuZ3RoKCksXHJcbiAgICAgICAgICAgIGNEaXN0ID0gY0NlbnQubGVuZ3RoKCksXHJcbiAgICAgICAgICAgIG1heERpc3QgPSBNYXRoLm1heCggTWF0aC5tYXgoIGFEaXN0LCBiRGlzdCApLCBjRGlzdCApLFxyXG4gICAgICAgICAgICBzY2FsZSA9IDEgLyBtYXhEaXN0O1xyXG4gICAgICAgIHJldHVybiBuZXcgVHJpYW5nbGUoXHJcbiAgICAgICAgICAgIGFDZW50Lm11bHRTY2FsYXIoIHNjYWxlICksXHJcbiAgICAgICAgICAgIGJDZW50Lm11bHRTY2FsYXIoIHNjYWxlICksXHJcbiAgICAgICAgICAgIGNDZW50Lm11bHRTY2FsYXIoIHNjYWxlICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHZlY3RvciBjb21wb25lbnRzIG1hdGNoIHRob3NlIG9mIGEgcHJvdmlkZWQgdHJpYW5nbGUuXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VHJpYW5nbGV9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIHRlc3QgZXF1YWxpdHkgd2l0aC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlcHNpbG9uIC0gVGhlIGVwc2lsb24gdmFsdWUuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2guXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICBlcHNpbG9uID0gZXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMCA6IGVwc2lsb247XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYS5lcXVhbHMoIHRoYXQuYSwgZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgIHRoaXMuYi5lcXVhbHMoIHRoYXQuYiwgZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgIHRoaXMuYy5lcXVhbHMoIHRoYXQuYywgZXBzaWxvbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYS50b1N0cmluZygpICsgJywgJyArXHJcbiAgICAgICAgICAgIHRoaXMuYi50b1N0cmluZygpICsgJywgJyArXHJcbiAgICAgICAgICAgIHRoaXMuYy50b1N0cmluZygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRyaWFuZ2xlO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgRVBTSUxPTiA9IHJlcXVpcmUoJy4vRXBzaWxvbicpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgVmVjMiBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgVmVjMlxyXG4gICAgICogQGNsYXNzZGVzYyBBIHR3byBjb21wb25lbnQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBWZWMyKCkge1xyXG4gICAgICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIC8vIGFycmF5IG9yIFZlY04gYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIHZhciBhcmd1bWVudCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50LnggfHwgYXJndW1lbnRbMF0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gYXJndW1lbnQueSB8fCBhcmd1bWVudFsxXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCBjb21wb25lbnQgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBWZWMyIHdpdGggZWFjaCBjb21wb25lbnQgbmVnYXRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzJ9IFRoZSBuZWdhdGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCAtdGhpcy54LCAtdGhpcy55ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHZlY3RvciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzJcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHN1bS5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgc3VtIG9mIHRoZSB0d28gdmVjdG9ycy5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMiggdGhpcy54ICsgdGhhdFswXSwgdGhpcy55ICsgdGhhdFsxXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCArIHRoYXQueCwgdGhpcy55ICsgdGhhdC55ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBwcm92aWRlZCB2ZWN0b3IgYXJndW1lbnQgZnJvbSB0aGUgdmVjdG9yLCByZXR1cm5pbmcgYSBuZXcgVmVjMlxyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZS5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gLSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgZGlmZmVyZW5jZSBvZiB0aGUgdHdvIHZlY3RvcnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCAtIHRoYXRbMF0sIHRoaXMueSAtIHRoYXRbMV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggLSB0aGF0LngsIHRoaXMueSAtIHRoYXQueSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCBzY2FsYXIgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWMyXHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSB2ZWN0b3IgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzJ9IFRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS5tdWx0U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggKiB0aGF0LCB0aGlzLnkgKiB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGl2aWRlcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHNjYWxhciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzJcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gZGl2aWRlIHRoZSB2ZWN0b3IgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzJ9IFRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS5kaXZTY2FsYXIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCAvIHRoYXQsIHRoaXMueSAvIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSBkb3QgcHJvZHVjdCBvZiB0aGUgdmVjdG9yIGFuZCB0aGUgcHJvdmlkZWRcclxuICAgICAqIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gLSBUaGUgb3RoZXIgdmVjdG9yIGFyZ3VtZW50LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBkb3QgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXRbMF0gKSArICggdGhpcy55ICogdGhhdFsxXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0LnggKSArICggdGhpcy55ICogdGhhdC55ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyAyRCBjcm9zcyBwcm9kdWN0IG9mIHRoZSB2ZWN0b3IgYW5kIHRoZSBwcm92aWRlZFxyXG4gICAgICogdmVjdG9yIGFyZ3VtZW50LiBUaGlzIHZhbHVlIHJlcHJlc2VudHMgdGhlIG1hZ25pdHVkZSBvZiB0aGUgdmVjdG9yIHRoYXRcclxuICAgICAqIHdvdWxkIHJlc3VsdCBmcm9tIGEgcmVndWxhciAzRCBjcm9zcyBwcm9kdWN0IG9mIHRoZSBpbnB1dCB2ZWN0b3JzLFxyXG4gICAgICogdGFraW5nIHRoZWlyIFogdmFsdWVzIGFzIDAuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIG90aGVyIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgMkQgY3Jvc3MgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuY3Jvc3MgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdFsxXSApIC0gKCB0aGlzLnkgKiB0aGF0WzBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXQueSApIC0gKCB0aGlzLnkgKiB0aGF0LnggKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBubyBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBzY2FsYXIgbGVuZ3RoIG9mXHJcbiAgICAgKiB0aGUgdmVjdG9yLiBJZiBhbiBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gYSBuZXdcclxuICAgICAqIFZlYzIgc2NhbGVkIHRvIHRoZSBwcm92aWRlZCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBsZW5ndGggdG8gc2NhbGUgdGhlIHZlY3RvciB0by4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcnxWZWMyfSBFaXRoZXIgdGhlIGxlbmd0aCwgb3IgbmV3IHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKCBsZW5ndGggKSB7XHJcbiAgICAgICAgaWYgKCBsZW5ndGggPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgdmFyIGxlbiA9IHRoaXMuZG90KCB0aGlzICk7XHJcbiAgICAgICAgICAgIGlmICggTWF0aC5hYnMoIGxlbiAtIDEuMCApIDwgRVBTSUxPTiApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsZW47XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KCBsZW4gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoKS5tdWx0U2NhbGFyKCBsZW5ndGggKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc3F1YXJlZCBsZW5ndGggb2YgdGhlIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUubGVuZ3RoU3F1YXJlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRvdCggdGhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB2ZWN0b3IuXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGF0LnggIT09IHVuZGVmaW5lZCA/IHRoYXQueCA6IHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHkgPSB0aGF0LnkgIT09IHVuZGVmaW5lZCA/IHRoYXQueSA6IHRoYXRbMV07XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCA9PT0geCB8fCBNYXRoLmFicyggdGhpcy54IC0geCApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueSA9PT0geSB8fCBNYXRoLmFicyggdGhpcy55IC0geSApIDw9IGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IFZlYzIgb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgdmVjdG9yIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWFnID0gdGhpcy5sZW5ndGgoKTtcclxuICAgICAgICBpZiAoIG1hZyAhPT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMyKFxyXG4gICAgICAgICAgICAgICAgdGhpcy54IC8gbWFnLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55IC8gbWFnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMigpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHVuc2lnbmVkIGFuZ2xlIGJldHdlZW4gdGhpcyBhbmdsZSBhbmQgdGhlIGFyZ3VtZW50IGluIHJhZGlhbnMuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIG1lYXN1cmUgdGhlIGFuZ2xlIGZyb20uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHVuc2lnbmVkIGFuZ2xlIGluIHJhZGlhbnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLnVuc2lnbmVkQW5nbGVSYWRpYW5zID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGF0LnggIT09IHVuZGVmaW5lZCA/IHRoYXQueCA6IHRoYXRbMF07XHJcbiAgICAgICAgdmFyIHkgPSB0aGF0LnkgIT09IHVuZGVmaW5lZCA/IHRoYXQueSA6IHRoYXRbMV07XHJcbiAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuMiggeSwgeCApIC0gTWF0aC5hdGFuMiggdGhpcy55LCB0aGlzLnggKTtcclxuICAgICAgICBpZiAoYW5nbGUgPCAwKSB7XHJcbiAgICAgICAgICAgIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYW5nbGU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdW5zaWduZWQgYW5nbGUgYmV0d2VlbiB0aGlzIGFuZ2xlIGFuZCB0aGUgYXJndW1lbnQgaW4gZGVncmVlcy5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gbWVhc3VyZSB0aGUgYW5nbGUgZnJvbS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgdW5zaWduZWQgYW5nbGUgaW4gZGVncmVlcy5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUudW5zaWduZWRBbmdsZURlZ3JlZXMgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bnNpZ25lZEFuZ2xlUmFkaWFucyggdGhhdCApICogKCAxODAgLyBNYXRoLlBJICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBWZWMyIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjMn0gQSByYW5kb20gdmVjdG9yIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMihcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKyAnLCAnICsgdGhpcy55O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgdmVjdG9yIGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFsgdGhpcy54LCB0aGlzLnkgXTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWZWMyO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgRVBTSUxPTiA9IHJlcXVpcmUoJy4vRXBzaWxvbicpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgVmVjMyBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgVmVjM1xyXG4gICAgICogQGNsYXNzZGVzYyBBIHRocmVlIGNvbXBvbmVudCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFZlYzMoKSB7XHJcbiAgICAgICAgc3dpdGNoICggYXJndW1lbnRzLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgLy8gYXJyYXkgb3IgVmVjTiBhcmd1bWVudFxyXG4gICAgICAgICAgICAgICAgdmFyIGFyZ3VtZW50ID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gYXJndW1lbnQueCB8fCBhcmd1bWVudFswXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudC55IHx8IGFyZ3VtZW50WzFdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IGFyZ3VtZW50LnogfHwgYXJndW1lbnRbMl0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIC8vIGluZGl2aWR1YWwgY29tcG9uZW50IGFyZ3VtZW50c1xyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gYXJndW1lbnRzWzFdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gYXJndW1lbnRzWzJdO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IFZlYzMgd2l0aCBlYWNoIGNvbXBvbmVudCBuZWdhdGVkLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIG5lZ2F0ZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIC10aGlzLngsIC10aGlzLnksIC10aGlzLnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSB2ZWN0b3Igd2l0aCB0aGUgcHJvdmlkZWQgdmVjdG9yIGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgVmVjM1xyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc3VtLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgc3VtIG9mIHRoZSB0d28gdmVjdG9ycy5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54ICsgdGhhdFswXSwgdGhpcy55ICsgdGhhdFsxXSwgdGhpcy56ICsgdGhhdFsyXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMueCArIHRoYXQueCwgdGhpcy55ICsgdGhhdC55LCB0aGlzLnogKyB0aGF0LnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJ0cmFjdHMgdGhlIHByb3ZpZGVkIHZlY3RvciBhcmd1bWVudCBmcm9tIHRoZSB2ZWN0b3IsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogVmVjMyBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBkaWZmZXJlbmNlLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gLSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgZGlmZmVyZW5jZSBvZiB0aGUgdHdvIHZlY3RvcnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMueCAtIHRoYXRbMF0sIHRoaXMueSAtIHRoYXRbMV0sIHRoaXMueiAtIHRoYXRbMl0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggLSB0aGF0LngsIHRoaXMueSAtIHRoYXQueSwgdGhpcy56IC0gdGhhdC56ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHNjYWxhciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzNcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgdGhlIHZlY3RvciBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLm11bHRTY2FsYXIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMueCAqIHRoYXQsIHRoaXMueSAqIHRoYXQsIHRoaXMueiAqIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXZpZGVzIHRoZSB2ZWN0b3Igd2l0aCB0aGUgcHJvdmlkZWQgc2NhbGFyIGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgVmVjM1xyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBkaXZpZGUgdGhlIHZlY3RvciBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLmRpdlNjYWxhciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54IC8gdGhhdCwgdGhpcy55IC8gdGhhdCwgdGhpcy56IC8gdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYW5kIHJldHVybnMgdGhlIGRvdCBwcm9kdWN0IG9mIHRoZSB2ZWN0b3IgYW5kIHRoZSBwcm92aWRlZFxyXG4gICAgICogdmVjdG9yIGFyZ3VtZW50LlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gLSBUaGUgb3RoZXIgdmVjdG9yIGFyZ3VtZW50LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBkb3QgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXRbMF0gKSArICggdGhpcy55ICogdGhhdFsxXSApICsgKCB0aGlzLnogKiB0aGF0WzJdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXQueCApICsgKCB0aGlzLnkgKiB0aGF0LnkgKSArICggdGhpcy56ICogdGhhdC56ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0aGUgdmVjdG9yIGFuZCB0aGUgcHJvdmlkZWRcclxuICAgICAqIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIG90aGVyIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgMkQgY3Jvc3MgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUuY3Jvc3MgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMzKFxyXG4gICAgICAgICAgICAgICAgKCB0aGlzLnkgKiB0aGF0WzJdICkgLSAoIHRoYXRbMV0gKiB0aGlzLnogKSxcclxuICAgICAgICAgICAgICAgICgtdGhpcy54ICogdGhhdFsyXSApICsgKCB0aGF0WzBdICogdGhpcy56ICksXHJcbiAgICAgICAgICAgICAgICAoIHRoaXMueCAqIHRoYXRbMV0gKSAtICggdGhhdFswXSAqIHRoaXMueSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgKCB0aGlzLnkgKiB0aGF0LnogKSAtICggdGhhdC55ICogdGhpcy56ICksXHJcbiAgICAgICAgICAgICgtdGhpcy54ICogdGhhdC56ICkgKyAoIHRoYXQueCAqIHRoaXMueiApLFxyXG4gICAgICAgICAgICAoIHRoaXMueCAqIHRoYXQueSApIC0gKCB0aGF0LnggKiB0aGlzLnkgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIG5vIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHNjYWxhciBsZW5ndGggb2ZcclxuICAgICAqIHRoZSB2ZWN0b3IuIElmIGFuIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiBhIG5ld1xyXG4gICAgICogVmVjMyBzY2FsZWQgdG8gdGhlIHByb3ZpZGVkIGxlbmd0aC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIGxlbmd0aCB0byBzY2FsZSB0aGUgdmVjdG9yIHRvLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfFZlYzN9IEVpdGhlciB0aGUgbGVuZ3RoLCBvciBuZXcgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oIGxlbmd0aCApIHtcclxuICAgICAgICBpZiAoIGxlbmd0aCA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICB2YXIgbGVuID0gdGhpcy5kb3QoIHRoaXMgKTtcclxuICAgICAgICAgICAgaWYgKCBNYXRoLmFicyggbGVuIC0gMS4wICkgPCBFUFNJTE9OICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlbjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoIGxlbiApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpLm11bHRTY2FsYXIoIGxlbmd0aCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzcXVhcmVkIGxlbmd0aCBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5sZW5ndGhTcXVhcmVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZG90KCB0aGlzICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaCB0aG9zZSBvZiBhIHByb3ZpZGVkIHZlY3Rvci5cclxuICAgICAqIEFuIG9wdGlvbmFsIGVwc2lsb24gdmFsdWUgbWF5IGJlIHByb3ZpZGVkLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGF0LnggIT09IHVuZGVmaW5lZCA/IHRoYXQueCA6IHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHkgPSB0aGF0LnkgIT09IHVuZGVmaW5lZCA/IHRoYXQueSA6IHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHogPSB0aGF0LnogIT09IHVuZGVmaW5lZCA/IHRoYXQueiA6IHRoYXRbMl07XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCA9PT0geCB8fCBNYXRoLmFicyggdGhpcy54IC0geCApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueSA9PT0geSB8fCBNYXRoLmFicyggdGhpcy55IC0geSApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueiA9PT0geiB8fCBNYXRoLmFicyggdGhpcy56IC0geiApIDw9IGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IFZlYzMgb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgdmVjdG9yIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWFnID0gdGhpcy5sZW5ndGgoKTtcclxuICAgICAgICBpZiAoIG1hZyAhPT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMzKFxyXG4gICAgICAgICAgICAgICAgdGhpcy54IC8gbWFnLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55IC8gbWFnLFxyXG4gICAgICAgICAgICAgICAgdGhpcy56IC8gbWFnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMygpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIGEgcGxhbmUgbm9ybWFsLCByZXR1cm5zIHRoZSBwcm9qZWN0aW9uIG9mIHRoZSB2ZWN0b3Igb250byB0aGUgcGxhbmUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSBub3JtYWwgLSBUaGUgcGxhbmUgbm9ybWFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSB1bnNpZ25lZCBhbmdsZSBpbiByYWRpYW5zLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5wcm9qZWN0T250b1BsYW5lID0gIGZ1bmN0aW9uKCBuICkge1xyXG4gICAgICAgIHZhciBkaXN0ID0gdGhpcy5kb3QoIG4gKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdWIoIG4ubXVsdFNjYWxhciggZGlzdCApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdW5zaWduZWQgYW5nbGUgYmV0d2VlbiB0aGlzIGFuZ2xlIGFuZCB0aGUgYXJndW1lbnQsIHByb2plY3RlZFxyXG4gICAgICogb250byBhIHBsYW5lLCBpbiByYWRpYW5zLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gbWVhc3VyZSB0aGUgYW5nbGUgZnJvbS5cclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSBub3JtYWwgLSBUaGUgcmVmZXJlbmNlIHZlY3RvciB0byBtZWFzdXJlIHRoZVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gb2YgdGhlIGFuZ2xlLiBJZiBub3QgcHJvdmlkZWQgd2lsbFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2UgYS5jcm9zcyggYiApLiAoT3B0aW9uYWwpXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHVuc2lnbmVkIGFuZ2xlIGluIHJhZGlhbnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLnVuc2lnbmVkQW5nbGVSYWRpYW5zID0gZnVuY3Rpb24oIHRoYXQsIG5vcm1hbCApIHtcclxuICAgICAgICB2YXIgYSA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGIgPSBuZXcgVmVjMyggdGhhdCApO1xyXG4gICAgICAgIHZhciBjcm9zcyA9IGEuY3Jvc3MoIGIgKTtcclxuICAgICAgICB2YXIgbiA9IG5ldyBWZWMzKCBub3JtYWwgfHwgY3Jvc3MgKTtcclxuICAgICAgICB2YXIgcGEgPSBhLnByb2plY3RPbnRvUGxhbmUoIG4gKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB2YXIgcGIgPSBiLnByb2plY3RPbnRvUGxhbmUoIG4gKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB2YXIgZG90ID0gcGEuZG90KCBwYiApO1xyXG5cclxuICAgICAgICAvLyBmYXN0ZXIsIGxlc3Mgcm9idWVzdFxyXG4gICAgICAgIC8vdmFyIG5kb3QgPSBNYXRoLm1heCggLTEsIE1hdGgubWluKCAxLCBkb3QgKSApO1xyXG4gICAgICAgIC8vdmFyIGFuZ2xlID0gTWF0aC5hY29zKCBuZG90ICk7XHJcblxyXG4gICAgICAgIC8vIHNsb3dlciwgYnV0IG1vcmUgcm9idXN0XHJcbiAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuMiggcGEuY3Jvc3MoIHBiICkubGVuZ3RoKCksIGRvdCApO1xyXG5cclxuICAgICAgICBpZiAoIG4uZG90KCBjcm9zcyApIDwgMCApIHtcclxuICAgICAgICAgICAgaWYgKCBhbmdsZSA+PSBNYXRoLlBJICogMC41ICkge1xyXG4gICAgICAgICAgICAgICAgYW5nbGUgPSBNYXRoLlBJICsgTWF0aC5QSSAtIGFuZ2xlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYW5nbGUgPSAyICogTWF0aC5QSSAtIGFuZ2xlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhbmdsZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB1bnNpZ25lZCBhbmdsZSBiZXR3ZWVuIHRoaXMgYW5nbGUgYW5kIHRoZSBhcmd1bWVudCwgcHJvamVjdGVkXHJcbiAgICAgKiBvbnRvIGEgcGxhbmUsIGluIGRlZ3JlZXMuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSB0aGF0IC0gVGhlIHZlY3RvciB0byBtZWFzdXJlIHRoZSBhbmdsZSBmcm9tLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSB1bnNpZ25lZCBhbmdsZSBpbiBkZWdyZWVzLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS51bnNpZ25lZEFuZ2xlRGVncmVlcyA9IGZ1bmN0aW9uKCB0aGF0LCBub3JtYWwgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5zaWduZWRBbmdsZVJhZGlhbnMoIHRoYXQsIG5vcm1hbCApICogKCAxODAgLyBNYXRoLlBJICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBWZWMzIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gQSByYW5kb20gdmVjdG9yIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKyAnLCAnICsgdGhpcy55ICsgJywgJyArIHRoaXMuejtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gVGhlIHZlY3RvciBhcyBhbiBhcnJheS5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBbIHRoaXMueCwgdGhpcy55LCB0aGlzLnogXTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWZWMzO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgRVBTSUxPTiA9IHJlcXVpcmUoJy4vRXBzaWxvbicpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgVmVjNCBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgVmVjNFxyXG4gICAgICogQGNsYXNzZGVzYyBBIGZvdXIgY29tcG9uZW50IHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVmVjNCgpIHtcclxuICAgICAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBvciBWZWNOIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJndW1lbnQgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudC54IHx8IGFyZ3VtZW50WzBdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50LnkgfHwgYXJndW1lbnRbMV0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gYXJndW1lbnQueiB8fCBhcmd1bWVudFsyXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLncgPSBhcmd1bWVudC53IHx8IGFyZ3VtZW50WzNdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpbmRpdmlkdWFsIGNvbXBvbmVudCBhcmd1bWVudHNcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50c1sxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IGFyZ3VtZW50c1syXTtcclxuICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50c1szXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMudyA9IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgVmVjNCB3aXRoIGVhY2ggY29tcG9uZW50IG5lZ2F0ZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBUaGUgbmVnYXRlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNCggLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueiwgLXRoaXMudyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCB2ZWN0b3IgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWM0XHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzdW0uXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBUaGUgc3VtIG9mIHRoZSB0d28gdmVjdG9ycy5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgICAgIHRoaXMueCArIHRoYXRbMF0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgKyB0aGF0WzFdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy56ICsgdGhhdFsyXSxcclxuICAgICAgICAgICAgICAgIHRoaXMudyArIHRoYXRbM10gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICB0aGlzLnggKyB0aGF0LngsXHJcbiAgICAgICAgICAgIHRoaXMueSArIHRoYXQueSxcclxuICAgICAgICAgICAgdGhpcy56ICsgdGhhdC56LFxyXG4gICAgICAgICAgICB0aGlzLncgKyB0aGF0LncgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJ0cmFjdHMgdGhlIHByb3ZpZGVkIHZlY3RvciBhcmd1bWVudCBmcm9tIHRoZSB2ZWN0b3IsIHJldHVybmluZyBhIG5ldyBWZWM0XHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBkaWZmZXJlbmNlLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzR8QXJyYXl9IC0gVGhlIHZlY3RvciB0byBzdWJ0cmFjdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIGRpZmZlcmVuY2Ugb2YgdGhlIHR3byB2ZWN0b3JzLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy54IC0gdGhhdFswXSxcclxuICAgICAgICAgICAgICAgIHRoaXMueSAtIHRoYXRbMV0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLnogLSB0aGF0WzJdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy53IC0gdGhhdFszXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMueCAtIHRoYXQueCxcclxuICAgICAgICAgICAgdGhpcy55IC0gdGhhdC55LFxyXG4gICAgICAgICAgICB0aGlzLnogLSB0aGF0LnosXHJcbiAgICAgICAgICAgIHRoaXMudyAtIHRoYXQudyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCBzY2FsYXIgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWM0XHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSB2ZWN0b3IgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5tdWx0U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICB0aGlzLnggKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLnkgKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLnogKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLncgKiB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGl2aWRlcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHNjYWxhciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzRcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gZGl2aWRlIHRoZSB2ZWN0b3IgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5kaXZTY2FsYXIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMueCAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMueSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMueiAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMudyAvIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSBkb3QgcHJvZHVjdCBvZiB0aGUgdmVjdG9yIGFuZCB0aGUgcHJvdmlkZWRcclxuICAgICAqIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWM0fEFycmF5fSAtIFRoZSBvdGhlciB2ZWN0b3IgYXJndW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGRvdCBwcm9kdWN0LlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdFswXSApICtcclxuICAgICAgICAgICAgICAgICggdGhpcy55ICogdGhhdFsxXSApICtcclxuICAgICAgICAgICAgICAgICggdGhpcy56ICogdGhhdFsyXSApICtcclxuICAgICAgICAgICAgICAgICggdGhpcy53ICogdGhhdFszXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0LnggKSArXHJcbiAgICAgICAgICAgICggdGhpcy55ICogdGhhdC55ICkgK1xyXG4gICAgICAgICAgICAoIHRoaXMueiAqIHRoYXQueiApICtcclxuICAgICAgICAgICAgKCB0aGlzLncgKiB0aGF0LncgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBubyBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBzY2FsYXIgbGVuZ3RoIG9mXHJcbiAgICAgKiB0aGUgdmVjdG9yLiBJZiBhbiBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gYSBuZXdcclxuICAgICAqIFZlYzQgc2NhbGVkIHRvIHRoZSBwcm92aWRlZCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBsZW5ndGggdG8gc2NhbGUgdGhlIHZlY3RvciB0by4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcnxWZWM0fSBFaXRoZXIgdGhlIGxlbmd0aCwgb3IgbmV3IHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKCBsZW5ndGggKSB7XHJcbiAgICAgICAgaWYgKCBsZW5ndGggPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgdmFyIGxlbiA9IHRoaXMuZG90KCB0aGlzICk7XHJcbiAgICAgICAgICAgIGlmICggTWF0aC5hYnMoIGxlbiAtIDEuMCApIDwgRVBTSUxPTiApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsZW47XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KCBsZW4gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoKS5tdWx0U2NhbGFyKCBsZW5ndGggKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc3F1YXJlZCBsZW5ndGggb2YgdGhlIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUubGVuZ3RoU3F1YXJlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRvdCggdGhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB2ZWN0b3IuXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWM0fEFycmF5fSB0aGF0IC0gVGhlIHZlY3RvciB0byB0ZXN0IGVxdWFsaXR5IHdpdGguXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvbiAtIFRoZSBlcHNpbG9uIHZhbHVlLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZlY3RvciBjb21wb25lbnRzIG1hdGNoLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICB2YXIgeCA9IHRoYXQueCAhPT0gdW5kZWZpbmVkID8gdGhhdC54IDogdGhhdFswXSxcclxuICAgICAgICAgICAgeSA9IHRoYXQueSAhPT0gdW5kZWZpbmVkID8gdGhhdC55IDogdGhhdFsxXSxcclxuICAgICAgICAgICAgeiA9IHRoYXQueiAhPT0gdW5kZWZpbmVkID8gdGhhdC56IDogdGhhdFsyXSxcclxuICAgICAgICAgICAgdyA9IHRoYXQudyAhPT0gdW5kZWZpbmVkID8gdGhhdC53IDogdGhhdFszXTtcclxuICAgICAgICBlcHNpbG9uID0gZXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMCA6IGVwc2lsb247XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy54ID09PSB4IHx8IE1hdGguYWJzKCB0aGlzLnggLSB4ICkgPD0gZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgICggdGhpcy55ID09PSB5IHx8IE1hdGguYWJzKCB0aGlzLnkgLSB5ICkgPD0gZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgICggdGhpcy56ID09PSB6IHx8IE1hdGguYWJzKCB0aGlzLnogLSB6ICkgPD0gZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgICggdGhpcy53ID09PSB3IHx8IE1hdGguYWJzKCB0aGlzLncgLSB3ICkgPD0gZXBzaWxvbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgVmVjNCBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSB2ZWN0b3Igb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtYWcgPSB0aGlzLmxlbmd0aCgpO1xyXG4gICAgICAgIGlmICggbWFnICE9PSAwICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggLyBtYWcsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgLyBtYWcsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnogLyBtYWcsXHJcbiAgICAgICAgICAgICAgICB0aGlzLncgLyBtYWcgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBWZWM0IG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gQSByYW5kb20gdmVjdG9yIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKyAnLCAnICsgdGhpcy55ICsgJywgJyArIHRoaXMueiArICcsICcgKyB0aGlzLnc7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSB2ZWN0b3IgYXMgYW4gYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gWyB0aGlzLngsIHRoaXMueSwgdGhpcy56LCB0aGlzLncgXTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWZWM0O1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAgICAgTWF0MzM6IHJlcXVpcmUoJy4vTWF0MzMnKSxcclxuICAgICAgICBNYXQ0NDogcmVxdWlyZSgnLi9NYXQ0NCcpLFxyXG4gICAgICAgIFZlYzI6IHJlcXVpcmUoJy4vVmVjMicpLFxyXG4gICAgICAgIFZlYzM6IHJlcXVpcmUoJy4vVmVjMycpLFxyXG4gICAgICAgIFZlYzQ6IHJlcXVpcmUoJy4vVmVjNCcpLFxyXG4gICAgICAgIFF1YXRlcm5pb246IHJlcXVpcmUoJy4vUXVhdGVybmlvbicpLFxyXG4gICAgICAgIFRyYW5zZm9ybTogcmVxdWlyZSgnLi9UcmFuc2Zvcm0nKSxcclxuICAgICAgICBUcmlhbmdsZTogcmVxdWlyZSgnLi9UcmlhbmdsZScpXHJcbiAgICB9O1xyXG5cclxufSgpKTtcclxuIl19
