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
            this.data = new Array( 9 );
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
     * @param {Vec3|Array} vec - The vector to replace the row. Optional.
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
     * @param {Vec3|Array} vec - The vector to replace the col. Optional.
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
     * @param {number} angle - The angle of the rotation, in radians.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Mat33} The rotation matrix.
     */
    Mat33.rotation = function( angle, axis ) {
        if ( axis instanceof Array ) {
            axis = new Vec3( axis );
        }
        // zero vector, return identity
        if ( axis.lengthSquared() === 0 ) {
            throw 'Cannot create rotation matrix for a zero vector axis';
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
        fromVec = new Vec3( fromVec ).normalize();
        toVec = new Vec3( toVec ).normalize();
        var e = fromVec.dot( toVec );
        var f = Math.abs( e );
        var x, u, v;
        var fx, fy, fz;
        var ux, uz;
        var c1, c2, c3;
        if ( f > 1.0 - EPSILON ) {
            // 'from' and 'to' almost parallel
            // nearly orthogonal
            fx = Math.abs( fromVec.x );
            fy = Math.abs( fromVec.y );
            fz = Math.abs( fromVec.z );
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
            u = x.sub( fromVec );
            v = x.sub( toVec );
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
        v = fromVec.cross( toVec );
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
            this.data[8] + that[8]
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
            this.data[8] + that[10]
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
            this.data[8] - that[8]
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
            this.data[8] - that[10]
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
     * Returns the rotation matrix from the affine-transformation.
     * @memberof Mat33
     *
     * @returns {Mat33} The rotation matrix.
     */
    Mat33.prototype.rotation = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] ).normalize();
        var y = new Vec3( this.data[3], this.data[4], this.data[5] ).normalize();
        var z = new Vec3( this.data[6], this.data[7], this.data[8] ).normalize();
        return new Mat33([
            x.x, x.y, x.z,
            y.x, y.y, y.z,
            z.x, z.y, z.z
        ]);
    };

    /**
     * Returns the scale matrix from the affine-transformation.
     * @memberof Mat33
     *
     * @returns {Mat33} The scale matrix.
     */
    Mat33.prototype.scale = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] );
        var y = new Vec3( this.data[3], this.data[4], this.data[5] );
        var z = new Vec3( this.data[6], this.data[7], this.data[8] );
        return Mat33.scale([ x.length(), y.length(), z.length() ]);
    };

    /**
     * Returns the inverse of the transform's rotation matrix.
     * @memberof Mat33
     *
     * @returns {Mat33} The inverse rotation matrix.
     */
    Mat33.prototype.inverseRotation = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] ).normalize();
        var y = new Vec3( this.data[3], this.data[4], this.data[5] ).normalize();
        var z = new Vec3( this.data[6], this.data[7], this.data[8] ).normalize();
        return new Mat33([
            x.x, y.x, z.x,
            x.y, y.y, z.y,
            x.z, y.z, z.z
        ]);
    };

    /**
     * Returns the inverse of the transform's scale matrix.
     * @memberof Mat33
     *
     * @returns {Mat33} The inverse scale matrix.
     */
    Mat33.prototype.inverseScale = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] );
        var y = new Vec3( this.data[3], this.data[4], this.data[5] );
        var z = new Vec3( this.data[6], this.data[7], this.data[8] );
        var scale = new Vec3( x.length(), y.length(), z.length() );
        return Mat33.scale([
            1 / scale.x,
            1 / scale.y,
            1 / scale.z
        ]);
    };

    /**
     * Returns a random transform matrix composed of a rotation and scale.
     * @memberof Mat33
     *
     * @returns {Mat33} A random transform matrix.
     */
    Mat33.random = function() {
        var r = Mat33.rotation( Math.random() * 360, Vec3.random() );
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
        return [
            this.data[0],
            this.data[1],
            this.data[2],
            this.data[3],
            this.data[4],
            this.data[5],
            this.data[6],
            this.data[7],
            this.data[8],
        ];
    };

    module.exports = Mat33;

}());

},{"./Epsilon":1,"./Vec3":8}],3:[function(require,module,exports){
(function() {

    'use strict';

    var Vec3 = require('./Vec3');
    var Vec4 = require('./Vec4');
    var Mat33 = require('./Mat33');
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
     * @param {Vec3|Array} vec - The vector to replace the row. Optional.
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
     * @param {Vec3|Array} vec - The vector to replace the col. Optional.
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
     * @param {number} angle - The angle of the rotation, in radians.
     * @param {Vec3} axis - The axis of the rotation.
     *
     * @returns {Mat44} The rotation matrix.
     */
    Mat44.rotation = function( angle, axis ) {
        if ( axis instanceof Array ) {
            axis = new Vec3( axis );
        }
        // zero vector, return identity
        if ( axis.lengthSquared() === 0 ) {
            throw 'Cannot create rotation matrix for a zero vector axis';
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
        fromVec = new Vec3( fromVec ).normalize();
        toVec = new Vec3( toVec ).normalize();
        var e = fromVec.dot( toVec );
        var f = Math.abs( e );
        var x, u, v;
        var fx, fy, fz;
        var ux, uz;
        var c1, c2, c3;
        if ( f > 1.0 - EPSILON ) {
            // 'from' and 'to' almost parallel
            // nearly orthogonal
            fx = Math.abs( fromVec.x );
            fy = Math.abs( fromVec.y );
            fz = Math.abs( fromVec.z );
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
            u = x.sub( fromVec );
            v = x.sub( toVec );
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
        v = fromVec.cross( toVec );
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
            this.data[15] + that[15]
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
            this.data[15] - that[15]
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
     * @param {number} fovy - The vertical field of view, in radians.
     * @param {number} aspect - The aspect ratio.
     * @param {number} near - The near clipping plane of the frustum.
     * @param {number} far - The far clipping plane of the frustum.
     *
     * @returns {Mat44} The perspective projection matrix.
     */
    Mat44.perspective = function( fovy, aspect, near, far ) {
        var f = 1.0 / Math.tan( fovy / 2.0 );
        var nf = 1.0 / ( near - far );
        var mat = Mat44.identity();
        mat.data[0] = f / aspect;
        mat.data[5] = f;
        mat.data[10] = ( far + near ) * nf;
        mat.data[11] = -1;
        mat.data[14] = ( 2.0 * far * near ) * nf;
        mat.data[15] = 0;
        return mat;
    };

    /**
     * Returns the a view matrix for the affine-transformation of the current matrix.
     *
     * @returns {Mat44} The view matrix.
     */
    Mat44.prototype.view = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] ).normalize();
        var y = new Vec3( this.data[4], this.data[5], this.data[6] ).normalize();
        var z = new Vec3( this.data[8], this.data[9], this.data[10] ).normalize();
        var t = new Vec3( -this.data[12], -this.data[13], -this.data[14] );
        return new Mat44([
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            t.dot( x ), t.dot( y ), t.dot( z ), 1
        ]);
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
     * Returns the rotation matrix from the affine-transformation.
     * @memberof Mat44
     *
     * @returns {Mat44} The rotation matrix.
     */
    Mat44.prototype.rotation = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] ).normalize();
        var y = new Vec3( this.data[4], this.data[5], this.data[6] ).normalize();
        var z = new Vec3( this.data[8], this.data[9], this.data[10] ).normalize();
        return new Mat44([
            x.x, x.y, x.z, 0,
            y.x, y.y, y.z, 0,
            z.x, z.y, z.z, 0,
            0, 0, 0, 1
        ]);
    };

    /**
     * Returns the translation matrix from the affine-transformation.
     * @memberof Mat44
     *
     * @returns {Mat44} The translation matrix.
     */
    Mat44.prototype.translation = function() {
        return Mat44.translation([ this.data[12], this.data[13], this.data[14] ]);
    };

    /**
     * Returns the scale matrix from the affine-transformation.
     * @memberof Mat44
     *
     * @returns {Mat44} The scale matrix.
     */
    Mat44.prototype.scale = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] );
        var y = new Vec3( this.data[4], this.data[5], this.data[6] );
        var z = new Vec3( this.data[8], this.data[9], this.data[10] );
        return Mat44.scale([ x.length(), y.length(), z.length() ]);
    };

    /**
     * Returns the inverse of the transform's rotation matrix.
     * @memberof Mat44
     *
     * @returns {Mat44} The inverse rotation matrix.
     */
    Mat44.prototype.inverseRotation = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] ).normalize();
        var y = new Vec3( this.data[4], this.data[5], this.data[6] ).normalize();
        var z = new Vec3( this.data[8], this.data[9], this.data[10] ).normalize();
        return new Mat44([
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            0, 0, 0, 1
        ]);
    };

    /**
     * Returns the inverse of the transform's translation matrix.
     * @memberof Mat44
     *
     * @returns {Mat44} The inverse translation matrix.
     */
    Mat44.prototype.inverseTranslation = function() {
        return Mat44.translation([ -this.data[12], -this.data[13], -this.data[14] ]);
    };

    /**
     * Returns the inverse of the transform's scale matrix.
     * @memberof Mat44
     *
     * @returns {Mat44} The inverse scale matrix.
     */
    Mat44.prototype.inverseScale = function() {
        var x = new Vec3( this.data[0], this.data[1], this.data[2] );
        var y = new Vec3( this.data[4], this.data[5], this.data[6] );
        var z = new Vec3( this.data[8], this.data[9], this.data[10] );
        var scale = new Vec3( x.length(), y.length(), z.length() );
        return Mat44.scale([
            1 / scale.x,
            1 / scale.y,
            1 / scale.z
        ]);
    };

    /**
     * Returns a random transform matrix composed of a rotation and scale.
     * @memberof Mat44
     *
     * @returns {Mat44} A random transform matrix.
     */
    Mat44.random = function() {
        var r = Mat44.rotation( Math.random() * 360, Vec3.random() );
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
        return [
            this.data[0],
            this.data[1],
            this.data[2],
            this.data[3],
            this.data[4],
            this.data[5],
            this.data[6],
            this.data[7],
            this.data[8],
            this.data[9],
            this.data[10],
            this.data[11],
            this.data[12],
            this.data[13],
            this.data[14],
            this.data[15]
        ];
    };

    /**
     * Returns an the matrix representation as a 3x3 Mat33 object.
     * @memberof Mat44
     *
     * @returns {Mat33} The matrix as an array.
     */
    Mat44.prototype.toMat33 = function() {
        return new Mat33([
            this.data[0],
            this.data[1],
            this.data[2],
            this.data[4],
            this.data[5],
            this.data[6],
            this.data[8],
            this.data[9],
            this.data[10]
        ]);
    };

    /**
     * Returns an array representation of the matrix.
     * @memberof Mat33
     *
     * @returns {Array} The matrix as an array.
     */
    Mat33.prototype.toMat44 = function() {
        return new Mat44([
            this.data[0],
            this.data[1],
            this.data[2],
            0.0,
            this.data[3],
            this.data[4],
            this.data[5],
            0.0,
            this.data[6],
            this.data[7],
            this.data[8],
            0.0,
            0.0,
            0.0,
            0.0,
            1.0
        ]);
    };

    module.exports = Mat44;

}());

},{"./Epsilon":1,"./Mat33":2,"./Vec3":8,"./Vec4":9}],4:[function(require,module,exports){
(function() {

    'use strict';

    var Vec3 = require('./Vec3');
    var Mat33 = require('./Mat33');
    var Mat44 = require('./Mat44');

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
     * Returns the x-axis of the rotation matrix that the quaternion represents.
     * @memberof Quaternion
     *
     * @returns {Vec3} The x-axis of the rotation matrix represented by the quaternion.
     */
    Quaternion.prototype.xAxis = function() {
        var yy = this.y*this.y,
            zz = this.z*this.z,
            xy = this.x*this.y,
            xz = this.x*this.z,
            yw = this.y*this.w,
            zw = this.z*this.w;
        return new Vec3(
            1 - 2*yy - 2*zz,
            2*xy + 2*zw,
            2*xz - 2*yw ).normalize();
    };

    /**
     * Returns the y-axis of the rotation matrix that the quaternion represents.
     * @memberof Quaternion
     *
     * @returns {Vec3} The y-axis of the rotation matrix represented by the quaternion.
     */
    Quaternion.prototype.yAxis = function() {
        var xx = this.x*this.x,
            zz = this.z*this.z,
            xy = this.x*this.y,
            xw = this.x*this.w,
            yz = this.y*this.z,
            zw = this.z*this.w;
        return new Vec3(
            2*xy - 2*zw,
            1 - 2*xx - 2*zz,
            2*yz + 2*xw ).normalize();
    };

    /**
     * Returns the z-axis of the rotation matrix that the quaternion represents.
     * @memberof Quaternion
     *
     * @returns {Vec3} The z-axis of the rotation matrix represented by the quaternion.
     */
    Quaternion.prototype.zAxis = function() {
        var xx = this.x*this.x,
            yy = this.y*this.y,
            xz = this.x*this.z,
            xw = this.x*this.w,
            yz = this.y*this.z,
            yw = this.y*this.w;
        return new Vec3(
            2*xz + 2*yw,
            2*yz - 2*xw,
            1 - 2*xx - 2*yy ).normalize();
    };

    /**
     * Returns the axes of the rotation matrix that the quaternion represents.
     * @memberof Quaternion
     *
     * @returns {Object} The axes of the matrix represented by the quaternion.
     */
    Quaternion.prototype.axes = function() {
        var xx = this.x*this.x,
            yy = this.y*this.y,
            zz = this.z*this.z,
            xy = this.x*this.y,
            xz = this.x*this.z,
            xw = this.x*this.w,
            yz = this.y*this.z,
            yw = this.y*this.w,
            zw = this.z*this.w;
        return {
            x: new Vec3( 1 - 2*yy - 2*zz, 2*xy + 2*zw, 2*xz - 2*yw ),
            y: new Vec3( 2*xy - 2*zw, 1 - 2*xx - 2*zz, 2*yz + 2*xw ),
            z: new Vec3( 2*xz + 2*yw, 2*yz - 2*xw, 1 - 2*xx - 2*yy )
        };
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
     * @param {number} angle - The angle of the rotation, in radians.
     * @param {Vec3|Array} axis - The axis of the rotation.
     *
     * @returns {Quaternion} The quaternion representing the rotation.
     */
    Quaternion.rotation = function( angle, axis ) {
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
     * Returns a rotation matrix to rotate a vector from one direction to
     * another.
     * @memberof Quaternion
     *
     * @param {Vec3} from - The starting direction.
     * @param {Vec3} to - The ending direction.
     *
     * @returns {Quaternion} The quaternion representing the rotation.
     */
    Quaternion.rotationFromTo = function( fromVec, toVec ) {
        fromVec = new Vec3( fromVec );
        toVec = new Vec3( toVec );
        var cross = fromVec.cross( toVec );
        var dot = fromVec.dot( toVec );
        var fLen = fromVec.length();
        var tLen = toVec.length();
        var w = Math.sqrt( ( fLen * fLen ) * ( tLen * tLen ) ) + dot;
        return new Quaternion( w, cross.x, cross.y, cross.z ).normalize();
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
        return Quaternion.rotation( angle, axis );
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

    /**
     * Decomposes the matrix into the corresponding rotation, and scale components.
     * a scale.
     * @memberof Mat33
     *
     * @returns {Object} The decomposed components of the matrix.
     */
    Mat33.prototype.decompose = function() {
        // axis vectors
        var x = new Vec3( this.data[0], this.data[1], this.data[2] );
        var y = new Vec3( this.data[3], this.data[4], this.data[5] );
        var z = new Vec3( this.data[6], this.data[7], this.data[8] );
        // scale needs unnormalized vectors
        var scale = new Vec3( x.length(), y.length(), z.length() );
        // rotation needs normalized vectors
        x = x.normalize();
        y = y.normalize();
        z = z.normalize();
        var trace = x.x + y.y + z.z;
        var s;
        var rotation;
        if ( trace > 0 ) {
            s = 0.5 / Math.sqrt( trace + 1.0 );
            rotation = new Quaternion(
                0.25 / s,
                ( y.z - z.y ) * s,
                ( z.x - x.z ) * s,
                ( x.y - y.x ) * s );
        } else if ( x.x > y.y && x.x > z.z ) {
            s = 2.0 * Math.sqrt( 1.0 + x.x - y.y - z.z );
            rotation = new Quaternion(
                ( y.z - z.y ) / s,
                0.25 * s,
                ( y.x + x.y ) / s,
                ( z.x + x.z ) / s );
        } else if ( y.y > z.z ) {
            s = 2.0 * Math.sqrt( 1.0 + y.y - x.x - z.z );
            rotation = new Quaternion(
                ( z.x - x.z ) / s,
                ( y.x + x.y ) / s,
                0.25 * s,
                ( z.y + y.z ) / s );
        } else {
            s = 2.0 * Math.sqrt( 1.0 + z.z - x.x - y.y );
            rotation = new Quaternion(
                ( x.y - y.x ) / s,
                ( z.x + x.z ) / s,
                ( z.y + y.z ) / s,
                0.25 * s );
        }
        return {
            rotation: rotation,
            scale: scale
        };
    };

    /**
     * Decomposes the matrix into the corresponding rotation, translation, and scale components.
     * @memberof Mat44
     *
     * @returns {Object} The decomposed components of the matrix.
     */
    Mat44.prototype.decompose = function() {
        // translation
        var translation = new Vec3( this.data[12], this.data[13], this.data[14] );
        // axis vectors
        var x = new Vec3( this.data[0], this.data[1], this.data[2] );
        var y = new Vec3( this.data[4], this.data[5], this.data[6] );
        var z = new Vec3( this.data[8], this.data[9], this.data[10] );
        // scale needs unnormalized vectors
        var scale = new Vec3( x.length(), y.length(), z.length() );
        // rotation needs normalized vectors
        x = x.normalize();
        y = y.normalize();
        z = z.normalize();
        var trace = x.x + y.y + z.z;
        var s;
        var rotation;
        if ( trace > 0 ) {
            s = 0.5 / Math.sqrt( trace + 1.0 );
            rotation = new Quaternion(
                0.25 / s,
                ( y.z - z.y ) * s,
                ( z.x - x.z ) * s,
                ( x.y - y.x ) * s );
        } else if ( x.x > y.y && x.x > z.z ) {
            s = 2.0 * Math.sqrt( 1.0 + x.x - y.y - z.z );
            rotation = new Quaternion(
                ( y.z - z.y ) / s,
                0.25 * s,
                ( y.x + x.y ) / s,
                ( z.x + x.z ) / s );
        } else if ( y.y > z.z ) {
            s = 2.0 * Math.sqrt( 1.0 + y.y - x.x - z.z );
            rotation = new Quaternion(
                ( z.x - x.z ) / s,
                ( y.x + x.y ) / s,
                0.25 * s,
                ( z.y + y.z ) / s );
        } else {
            s = 2.0 * Math.sqrt( 1.0 + z.z - x.x - y.y );
            rotation = new Quaternion(
                ( x.y - y.x ) / s,
                ( z.x + x.z ) / s,
                ( z.y + y.z ) / s,
                0.25 * s );
        }
        return {
            rotation: rotation,
            scale: scale,
            translation: translation
        };
    };

    module.exports = Quaternion;

}());

},{"./Mat33":2,"./Mat44":3,"./Vec3":8}],5:[function(require,module,exports){
(function() {

    'use strict';

    var Vec3 = require('./Vec3');
    var Mat44 = require('./Mat44');
    var Quaternion = require('./Quaternion');

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
            this.rotation = that.rotation;
            this.translation = that.translation || new Vec3();
            this.scale = that.scale;
        } else {
            // set individual components, by value
            this.rotation = that.rotation ? new Quaternion( that.rotation ) : new Quaternion();
            this.translation = that.translation ? new Vec3( that.translation ) : new Vec3();
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
            rotation: new Quaternion(),
            translation: new Vec3(),
            scale: new Vec3( 1, 1, 1 )
        });
    };

    /**
     * Rotates the transform such that x-axis matches the provided vector.
     * @memberof Transform
     *
     * @param {Vec3|Array} x - The x-axis to rotate to.
     *
     * @returns {Transform} The transform object, for chaining.
     */
    Transform.prototype.rotateXTo = function( x ) {
        var rot = Quaternion.rotationFromTo( this.xAxis(), x );
        this.rotation = rot.multQuat( this.rotation );
        return this;
    };

    /**
     * Rotates the transform such that y-axis matches the provided vector.
     * @memberof Transform
     *
     * @param {Vec3|Array} y - The y-axis to rotate to.
     *
     * @returns {Transform} The transform object, for chaining.
     */
    Transform.prototype.rotateYTo = function( y ) {
        var rot = Quaternion.rotationFromTo( this.yAxis(), y );
        this.rotation = rot.multQuat( this.rotation );
        return this;
    };

    /**
     * Rotates the transform such that z-axis matches the provided vector.
     * @memberof Transform
     *
     * @param {Vec3|Array} z - The z-axis to rotate to.
     *
     * @returns {Transform} The transform object, for chaining.
     */
    Transform.prototype.rotateZTo = function( z ) {
        var rot = Quaternion.rotationFromTo( this.zAxis(), z );
        this.rotation = rot.multQuat( this.rotation );
        return this;
    };

    /**
     * Returns the x-axis of the transform.
     * @memberof Transform
     *
     * @returns {Vec3} The x-axis of the transform.
     */
    Transform.prototype.xAxis = function() {
        return this.rotation.xAxis();
    };

    /**
     * Returns the y-axis of the transform.
     * @memberof Transform
     *
     * @returns {Vec3} The y-axis of the transform.
     */
    Transform.prototype.yAxis = function() {
        return this.rotation.yAxis();
    };

    /**
     * Returns the z-axis of the transform.
     * @memberof Transform
     *
     * @returns {Vec3} The z-axis of the transform.
     */
    Transform.prototype.zAxis = function() {
        return this.rotation.zAxis();
    };

    /**
     * Returns the axes of the transform.
     * @memberof Transform
     *
     * @returns {Object} The axes of the transform.
     */
    Transform.prototype.axes = function() {
        return this.rotation.axes();
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
        return this.rotation.matrix().toMat44();
    };

    /**
     * Returns the transform's translation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The translation matrix.
     */
    Transform.prototype.translationMatrix = function() {
        return Mat44.translation( this.translation );
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
        return Mat44.scale([
            1 / this.scale.x,
            1 / this.scale.y,
            1 / this.scale.z
        ]);
    };

    /**
     * Returns the inverse of the transform's rotation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse rotation matrix.
     */
    Transform.prototype.inverseRotationMatrix = function() {
        return this.rotation.matrix().inverse().toMat44();
    };

    /**
     * Returns the inverse of the transform's translation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse translation matrix.
     */
    Transform.prototype.inverseTranslationMatrix = function() {
        return Mat44.translation( this.translation.negate() );
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
        return this.matrix().view();
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
        this.translation = this.translation.add( translation );
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
        var axes = this.axes();
        this.translation = this.translation
            .add( axes.x.multScalar( translation.x ) )
            .add( axes.y.multScalar( translation.y ) )
            .add( axes.z.multScalar( translation.z ) );
        return this;
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
    Transform.prototype.rotateWorld = function( angle, axis ) {
        var rot = Quaternion.rotation( angle, axis );
        this.rotation = rot.multQuat( this.rotation );
        return this;
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
    Transform.prototype.rotateLocal = function( angle, axis ) {
        return this.rotateWorld( angle, this.rotationMatrix().multVec3( axis ) );
    };

    /**
     * Transforms the vector or matrix argument from the transforms local space
     * to the world space.
     * @memberof Transform
     *
     * @param {Vec3|Vec4} vec - The vector argument to transform.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.localToWorld = function( vec ) {
        return this.matrix().multVec3( vec );
    };

    /**
     * Transforms the vector or matrix argument from world space to the
     * transforms local space.
     * @memberof Transform
     *
     * @param {Vec3|Vec4} vec - The vector argument to transform.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.worldToLocal = function( vec ) {
        return this.inverseMatrix().multVec3( vec );
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
        return this.matrix().equals( that.matrix(), epsilon );
    };

    /**
     * Returns a transform with a random translation, orientation, and scale.
     * @memberof Transform
     *
     * @returns {Transform} The random transform.
     */
    Transform.random = function() {
        return new Transform({
            translation: Vec3.random(),
            scale: Vec3.random(),
        }).rotateXTo( Vec3.random() );
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

},{"./Mat44":3,"./Quaternion":4,"./Vec3":8}],6:[function(require,module,exports){
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
        if ( mag === 0 ) {
            throw 'Cannot normalize a vector of zero length';
        }
        return new Vec2(
            this.x / mag,
            this.y / mag );
    };

    /**
     * Returns the unsigned angle between this angle and the argument in radians.
     * @memberof Vec2
     *
     * @param {Vec2|Vec3|Vec4|Array} that - The vector to measure the angle from.
     *
     * @returns {number} The unsigned angle in radians.
     */
    Vec2.prototype.unsignedAngle = function( that ) {
        var x = that.x !== undefined ? that.x : that[0];
        var y = that.y !== undefined ? that.y : that[1];
        var angle = Math.atan2( y, x ) - Math.atan2( this.y, this.x );
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return angle;
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
        if ( mag === 0 ) {
            throw 'Cannot normalize a vector of zero length';
        }
        return new Vec3(
            this.x / mag,
            this.y / mag,
            this.z / mag );
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
    Vec3.prototype.unsignedAngle = function( that, normal ) {
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
        if ( mag === 0 ) {
            throw 'Cannot normalize a vector of zero length';
        }
        return new Vec4(
            this.x / mag,
            this.y / mag,
            this.z / mag,
            this.w / mag );
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRXBzaWxvbi5qcyIsInNyYy9NYXQzMy5qcyIsInNyYy9NYXQ0NC5qcyIsInNyYy9RdWF0ZXJuaW9uLmpzIiwic3JjL1RyYW5zZm9ybS5qcyIsInNyYy9UcmlhbmdsZS5qcyIsInNyYy9WZWMyLmpzIiwic3JjL1ZlYzMuanMiLCJzcmMvVmVjNC5qcyIsInNyYy9leHBvcnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25nQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSAwLjAwMDAwMDAwMDAxO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgVmVjMyA9IHJlcXVpcmUoJy4vVmVjMycpO1xyXG4gICAgdmFyIEVQU0lMT04gPSByZXF1aXJlKCcuL0Vwc2lsb24nKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBNYXQzM1xyXG4gICAgICogQGNsYXNzZGVzYyBBIDN4MyBjb2x1bW4tbWFqb3IgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBNYXQzMyggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gdGhhdCB8fCBbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICBdO1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGF0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBBcnJheSggOSApO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gPSB0aGF0LmRhdGFbMF07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSA9IHRoYXQuZGF0YVsxXTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdID0gdGhhdC5kYXRhWzJdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gPSB0aGF0LmRhdGFbM107XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSA9IHRoYXQuZGF0YVs0XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdID0gdGhhdC5kYXRhWzVdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNl0gPSB0aGF0LmRhdGFbNl07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSA9IHRoYXQuZGF0YVs3XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdID0gdGhhdC5kYXRhWzhdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByb3cgb2YgdGhlIG1hdHJpeCBhcyBhIFZlYzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIDAtYmFzZWQgcm93IGluZGV4LlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSB2ZWMgLSBUaGUgdmVjdG9yIHRvIHJlcGxhY2UgdGhlIHJvdy4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSByb3cgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUucm93ID0gZnVuY3Rpb24oIGluZGV4LCB2ZWMgKSB7XHJcbiAgICAgICAgaWYgKCB2ZWMgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4XSA9IHZlY1swXSB8fCB2ZWMueDtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzMraW5kZXhdID0gdmVjWzFdIHx8IHZlYy55O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNitpbmRleF0gPSB2ZWNbMl0gfHwgdmVjLno7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzMraW5kZXhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNitpbmRleF0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgY29sdW1uIG9mIHRoZSBtYXRyaXggYXMgYSBWZWMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSAwLWJhc2VkIGNvbCBpbmRleC5cclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gdmVjIC0gVGhlIHZlY3RvciB0byByZXBsYWNlIHRoZSBjb2wuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgY29sdW1uIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLmNvbCA9IGZ1bmN0aW9uKCBpbmRleCwgdmVjICkge1xyXG4gICAgICAgIGlmICggdmVjICkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMCtpbmRleCozXSA9IHZlY1swXSB8fCB2ZWMueDtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEraW5kZXgqM10gPSB2ZWNbMV0gfHwgdmVjLnk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyK2luZGV4KjNdID0gdmVjWzJdIHx8IHZlYy56O1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMCtpbmRleCozXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEraW5kZXgqM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyK2luZGV4KjNdICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaWRlbnRpdHkgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgaWRlbnRpeSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLmlkZW50aXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMygpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl8bnVtYmVyfSBzY2FsZSAtIFRoZSBzY2FsYXIgb3IgdmVjdG9yIHNjYWxpbmcgZmFjdG9yLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHNjYWxlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMuc2NhbGUgPSBmdW5jdGlvbiggc2NhbGUgKSB7XHJcbiAgICAgICAgaWYgKCB0eXBlb2Ygc2NhbGUgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgICAgIHNjYWxlLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgc2NhbGUsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCBzY2FsZVxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCBzY2FsZSBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgICAgIHNjYWxlWzBdLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgc2NhbGVbMV0sIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCBzY2FsZVsyXVxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHNjYWxlLngsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIHNjYWxlLnksIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIHNjYWxlLnpcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IGRlZmluZWQgYnkgYW4gYXhpcyBhbmQgYW4gYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucm90YXRpb24gPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgaWYgKCBheGlzIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGF4aXMgPSBuZXcgVmVjMyggYXhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB6ZXJvIHZlY3RvciwgcmV0dXJuIGlkZW50aXR5XHJcbiAgICAgICAgaWYgKCBheGlzLmxlbmd0aFNxdWFyZWQoKSA9PT0gMCApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCBjcmVhdGUgcm90YXRpb24gbWF0cml4IGZvciBhIHplcm8gdmVjdG9yIGF4aXMnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbm9ybUF4aXMgPSBheGlzLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICB4ID0gbm9ybUF4aXMueCxcclxuICAgICAgICAgICAgeSA9IG5vcm1BeGlzLnksXHJcbiAgICAgICAgICAgIHogPSBub3JtQXhpcy56LFxyXG4gICAgICAgICAgICBtb2RBbmdsZSA9ICggYW5nbGUgPiAwICkgPyBhbmdsZSAlICgyKk1hdGguUEkpIDogYW5nbGUgJSAoLTIqTWF0aC5QSSksXHJcbiAgICAgICAgICAgIHMgPSBNYXRoLnNpbiggbW9kQW5nbGUgKSxcclxuICAgICAgICAgICAgYyA9IE1hdGguY29zKCBtb2RBbmdsZSApLFxyXG4gICAgICAgICAgICB4eCA9IHggKiB4LFxyXG4gICAgICAgICAgICB5eSA9IHkgKiB5LFxyXG4gICAgICAgICAgICB6eiA9IHogKiB6LFxyXG4gICAgICAgICAgICB4eSA9IHggKiB5LFxyXG4gICAgICAgICAgICB5eiA9IHkgKiB6LFxyXG4gICAgICAgICAgICB6eCA9IHogKiB4LFxyXG4gICAgICAgICAgICB4cyA9IHggKiBzLFxyXG4gICAgICAgICAgICB5cyA9IHkgKiBzLFxyXG4gICAgICAgICAgICB6cyA9IHogKiBzLFxyXG4gICAgICAgICAgICBvbmVfYyA9IDEuMCAtIGM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIChvbmVfYyAqIHh4KSArIGMsIChvbmVfYyAqIHh5KSArIHpzLCAob25lX2MgKiB6eCkgLSB5cyxcclxuICAgICAgICAgICAgKG9uZV9jICogeHkpIC0genMsIChvbmVfYyAqIHl5KSArIGMsIChvbmVfYyAqIHl6KSArIHhzLFxyXG4gICAgICAgICAgICAob25lX2MgKiB6eCkgKyB5cywgKG9uZV9jICogeXopIC0geHMsIChvbmVfYyAqIHp6KSArIGNcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IHRvIHJvdGF0ZSBhIHZlY3RvciBmcm9tIG9uZSBkaXJlY3Rpb24gdG9cclxuICAgICAqIGFub3RoZXIuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGZyb20gLSBUaGUgc3RhcnRpbmcgZGlyZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSB0byAtIFRoZSBlbmRpbmcgZGlyZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIG1hdHJpeCByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5yb3RhdGlvbkZyb21UbyA9IGZ1bmN0aW9uKCBmcm9tVmVjLCB0b1ZlYyApIHtcclxuICAgICAgICAvKlxyXG4gICAgICAgIFRoaXMgbWV0aG9kIGlzIGJhc2VkIG9uIHRoZSBjb2RlIGZyb206XHJcbiAgICAgICAgICAgIFRvbWFzIE1sbGVyLCBKb2huIEh1Z2hlc1xyXG4gICAgICAgICAgICBFZmZpY2llbnRseSBCdWlsZGluZyBhIE1hdHJpeCB0byBSb3RhdGUgT25lIFZlY3RvciB0byBBbm90aGVyXHJcbiAgICAgICAgICAgIEpvdXJuYWwgb2YgR3JhcGhpY3MgVG9vbHMsIDQoNCk6MS00LCAxOTk5XHJcbiAgICAgICAgKi9cclxuICAgICAgICBmcm9tVmVjID0gbmV3IFZlYzMoIGZyb21WZWMgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB0b1ZlYyA9IG5ldyBWZWMzKCB0b1ZlYyApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciBlID0gZnJvbVZlYy5kb3QoIHRvVmVjICk7XHJcbiAgICAgICAgdmFyIGYgPSBNYXRoLmFicyggZSApO1xyXG4gICAgICAgIHZhciB4LCB1LCB2O1xyXG4gICAgICAgIHZhciBmeCwgZnksIGZ6O1xyXG4gICAgICAgIHZhciB1eCwgdXo7XHJcbiAgICAgICAgdmFyIGMxLCBjMiwgYzM7XHJcbiAgICAgICAgaWYgKCBmID4gMS4wIC0gRVBTSUxPTiApIHtcclxuICAgICAgICAgICAgLy8gJ2Zyb20nIGFuZCAndG8nIGFsbW9zdCBwYXJhbGxlbFxyXG4gICAgICAgICAgICAvLyBuZWFybHkgb3J0aG9nb25hbFxyXG4gICAgICAgICAgICBmeCA9IE1hdGguYWJzKCBmcm9tVmVjLnggKTtcclxuICAgICAgICAgICAgZnkgPSBNYXRoLmFicyggZnJvbVZlYy55ICk7XHJcbiAgICAgICAgICAgIGZ6ID0gTWF0aC5hYnMoIGZyb21WZWMueiApO1xyXG4gICAgICAgICAgICBpZiAoIGZ4IDwgZnkgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGZ4IDwgZnogKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBWZWMzKCAxLCAwLCAwICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMCwgMSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBmeSA8IGZ6ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMSwgMCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbmV3IFZlYzMoIDAsIDAsIDEgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1ID0geC5zdWIoIGZyb21WZWMgKTtcclxuICAgICAgICAgICAgdiA9IHguc3ViKCB0b1ZlYyApO1xyXG4gICAgICAgICAgICBjMSA9IDIuMCAvIHUuZG90KCB1ICk7XHJcbiAgICAgICAgICAgIGMyID0gMi4wIC8gdi5kb3QoIHYgKTtcclxuICAgICAgICAgICAgYzMgPSBjMSpjMiAqIHUuZG90KCB2ICk7XHJcbiAgICAgICAgICAgIC8vIHNldCBtYXRyaXggZW50cmllc1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS54IC0gYzIqdi54KnYueCArIGMzKnYueCp1LnggKyAxLjAsXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueCAtIGMyKnYueSp2LnggKyBjMyp2LnkqdS54LFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnggLSBjMip2Lnoqdi54ICsgYzMqdi56KnUueCxcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS55IC0gYzIqdi54KnYueSArIGMzKnYueCp1LnksXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueSAtIGMyKnYueSp2LnkgKyBjMyp2LnkqdS55ICsgMS4wLFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnkgLSBjMip2Lnoqdi55ICsgYzMqdi56KnUueSxcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS56IC0gYzIqdi54KnYueiArIGMzKnYueCp1LnosXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueiAtIGMyKnYueSp2LnogKyBjMyp2LnkqdS56LFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnogLSBjMip2Lnoqdi56ICsgYzMqdi56KnUueiArIDEuMFxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdGhlIG1vc3QgY29tbW9uIGNhc2UsIHVubGVzcyAnZnJvbSc9J3RvJywgb3IgJ3RvJz0tJ2Zyb20nXHJcbiAgICAgICAgdiA9IGZyb21WZWMuY3Jvc3MoIHRvVmVjICk7XHJcbiAgICAgICAgdSA9IDEuMCAvICggMS4wICsgZSApOyAgICAvLyBvcHRpbWl6YXRpb24gYnkgR290dGZyaWVkIENoZW5cclxuICAgICAgICB1eCA9IHUgKiB2Lng7XHJcbiAgICAgICAgdXogPSB1ICogdi56O1xyXG4gICAgICAgIGMxID0gdXggKiB2Lnk7XHJcbiAgICAgICAgYzIgPSB1eCAqIHYuejtcclxuICAgICAgICBjMyA9IHV6ICogdi55O1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICBlICsgdXggKiB2LngsXHJcbiAgICAgICAgICAgIGMxICsgdi56LFxyXG4gICAgICAgICAgICBjMiAtIHYueSxcclxuICAgICAgICAgICAgYzEgLSB2LnosXHJcbiAgICAgICAgICAgIGUgKyB1ICogdi55ICogdi55LFxyXG4gICAgICAgICAgICBjMyArIHYueCxcclxuICAgICAgICAgICAgYzIgKyB2LnksXHJcbiAgICAgICAgICAgIGMzIC0gdi54LFxyXG4gICAgICAgICAgICBlICsgdXogKiB2LnpcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBtYXRyaXggd2l0aCB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgTWEzM1xyXG4gICAgICogb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQzM3xBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHN1bSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuYWRkTWF0MzMgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSArIHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArIHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSArIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSArIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSArIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSArIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSArIHRoYXRbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSArIHRoYXRbOF1cclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBtYXRyaXggd2l0aCB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgTWEzM1xyXG4gICAgICogb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHN1bSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuYWRkTWF0NDQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSArIHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArIHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSArIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSArIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSArIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSArIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSArIHRoYXRbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSArIHRoYXRbMTBdXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBwcm92aWRlZCBtYXRyaXggYXJndW1lbnQgZnJvbSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0MzN8QXJyYXl9IHRoYXQgLSBUaGUgbWF0cml4IHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSBkaWZmZXJlbmNlIG9mIHRoZSB0d28gbWF0cmljZXMuXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS5zdWJNYXQzMyA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdIC0gdGhhdFswXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdIC0gdGhhdFsxXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdIC0gdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdIC0gdGhhdFszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdIC0gdGhhdFs0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdIC0gdGhhdFs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdIC0gdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddIC0gdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdIC0gdGhhdFs4XVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50IGZyb20gdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBNYXQzMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDQ0fEFycmF5fSB0aGF0IC0gVGhlIG1hdHJpeCB0byBhZGQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgZGlmZmVyZW5jZSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuc3ViTWF0NDQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAtIHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAtIHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAtIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSAtIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSAtIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSAtIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSAtIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSAtIHRoYXRbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSAtIHRoYXRbMTBdXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgcHJvdmRlZCB2ZWN0b3IgYXJndW1lbnQgYnkgdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBWZWMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSAtIFRoZSB2ZWN0b3IgdG8gYmUgbXVsdGlwbGllZCBieSB0aGUgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgcmVzdWx0aW5nIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLm11bHRWZWMzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlICd0aGF0JyBpcyBhIFZlYzNcclxuICAgICAgICAvLyBpdCBpcyBzYWZlIHRvIG9ubHkgY2FzdCBpZiBBcnJheSBzaW5jZSB0aGUgLncgb2YgYSBWZWM0IGlzIG5vdCB1c2VkXHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbM10gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzZdICogdGhhdFsyXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzddICogdGhhdFsyXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzhdICogdGhhdFsyXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXQueCArIHRoaXMuZGF0YVszXSAqIHRoYXQueSArIHRoaXMuZGF0YVs2XSAqIHRoYXQueixcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdC54ICsgdGhpcy5kYXRhWzRdICogdGhhdC55ICsgdGhpcy5kYXRhWzddICogdGhhdC56LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNV0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOF0gKiB0aGF0LnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIGFsbCBjb21wb25lbnRzIG9mIHRoZSBtYXRyaXggYnkgdGhlIHByb3ZkZWQgc2NhbGFyIGFyZ3VtZW50LFxyXG4gICAgICogcmV0dXJuaW5nIGEgbmV3IE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgdGhlIG1hdHJpeCBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByZXN1bHRpbmcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUubXVsdFNjYWxhciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNl0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbN10gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0gKiB0aGF0XHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgcHJvdmRlZCBtYXRyaXggYXJndW1lbnQgYnkgdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBNYXQzMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfEFycmF5fSAtIFRoZSBtYXRyaXggdG8gYmUgbXVsdGlwbGllZCBieSB0aGUgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHJlc3VsdGluZyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS5tdWx0TWF0MzMgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbM10gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzZdICogdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFswXSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzVdICogdGhhdFsxXSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbM10gKyB0aGlzLmRhdGFbM10gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzZdICogdGhhdFs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFszXSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbNF0gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzNdICsgdGhpcy5kYXRhWzVdICogdGhhdFs0XSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbNl0gKyB0aGlzLmRhdGFbM10gKiB0aGF0WzddICsgdGhpcy5kYXRhWzZdICogdGhhdFs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFs2XSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbN10gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzZdICsgdGhpcy5kYXRhWzVdICogdGhhdFs3XSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbOF1cclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92ZGVkIG1hdHJpeCBhcmd1bWVudCBieSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0NDR8QXJyYXl9IC0gVGhlIG1hdHJpeCB0byBiZSBtdWx0aXBsaWVkIGJ5IHRoZSBtYXRyaXguXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgcmVzdWx0aW5nIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLm11bHRNYXQ0NCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFswXSArIHRoaXMuZGF0YVszXSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzRdICogdGhhdFsxXSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzhdICogdGhhdFsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFs0XSArIHRoaXMuZGF0YVszXSAqIHRoYXRbNV0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzRdICogdGhhdFs1XSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbNF0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzVdICsgdGhpcy5kYXRhWzhdICogdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFs4XSArIHRoaXMuZGF0YVszXSAqIHRoYXRbOV0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzEwXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFs4XSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbOV0gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzEwXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdICogdGhhdFs4XSArIHRoaXMuZGF0YVs1XSAqIHRoYXRbOV0gKyB0aGlzLmRhdGFbOF0gKiB0aGF0WzEwXVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERpdmlkZXMgYWxsIGNvbXBvbmVudHMgb2YgdGhlIG1hdHJpeCBieSB0aGUgcHJvdmRlZCBzY2FsYXIgYXJndW1lbnQsXHJcbiAgICAgKiByZXR1cm5pbmcgYSBuZXcgTWF0MzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBkaXZpZGUgdGhlIG1hdHJpeCBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByZXN1bHRpbmcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuZGl2U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSAvIHRoYXRcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFsbCBjb21wb25lbnRzIG1hdGNoIHRob3NlIG9mIGEgcHJvdmlkZWQgbWF0cml4LlxyXG4gICAgICogQW4gb3B0aW9uYWwgZXBzaWxvbiB2YWx1ZSBtYXkgYmUgcHJvdmlkZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfEFycmF5fSB0aGF0IC0gVGhlIG1hdHJpeCB0byB0ZXN0IGVxdWFsaXR5IHdpdGguXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvbiAtIFRoZSBlcHNpbG9uIHZhbHVlLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIG1hdHJpeCBjb21wb25lbnRzIG1hdGNoLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gKCggdGhpcy5kYXRhWzBdID09PSB0aGF0WzBdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzBdIC0gdGhhdFswXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVsxXSA9PT0gdGhhdFsxXSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVsxXSAtIHRoYXRbMV0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbMl0gPT09IHRoYXRbMl0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbMl0gLSB0aGF0WzJdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzNdID09PSB0aGF0WzNdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzNdIC0gdGhhdFszXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVs0XSA9PT0gdGhhdFs0XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVs0XSAtIHRoYXRbNF0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbNV0gPT09IHRoYXRbNV0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbNV0gLSB0aGF0WzVdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzZdID09PSB0aGF0WzZdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzZdIC0gdGhhdFs2XSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVs3XSA9PT0gdGhhdFs3XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVs3XSAtIHRoYXRbN10gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbOF0gPT09IHRoYXRbOF0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbOF0gLSB0aGF0WzhdICkgPD0gZXBzaWxvbiApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNwb3NlIG9mIHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSB0cmFuc3Bvc2VkIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgaW52ZXJ0ZWQgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuaW52ZXJzZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBpbnYgPSBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICAvLyBjb2wgMFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzhdIC0gdGhpcy5kYXRhWzddKnRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbOF0gKyB0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzVdIC0gdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSxcclxuICAgICAgICAgICAgLy8gY29sIDFcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVszXSp0aGlzLmRhdGFbOF0gKyB0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzhdIC0gdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsyXSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0gKyB0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzJdLFxyXG4gICAgICAgICAgICAvLyBjb2wgMlxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzddIC0gdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVs0XSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10gKyB0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzRdIC0gdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxXVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkZXRlcm1pbmFudFxyXG4gICAgICAgIHZhciBkZXQgPSB0aGlzLmRhdGFbMF0qaW52LmRhdGFbMF0gKyB0aGlzLmRhdGFbMV0qaW52LmRhdGFbM10gKyB0aGlzLmRhdGFbMl0qaW52LmRhdGFbNl07XHJcbiAgICAgICAgLy8gcmV0dXJuXHJcbiAgICAgICAgcmV0dXJuIGludi5tdWx0U2NhbGFyKCAxIC8gZGV0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcm90YXRpb24gbWF0cml4IGZyb20gdGhlIGFmZmluZS10cmFuc2Zvcm1hdGlvbi5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLnJvdGF0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSBuZXcgVmVjMyggdGhpcy5kYXRhWzBdLCB0aGlzLmRhdGFbMV0sIHRoaXMuZGF0YVsyXSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciB5ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVszXSwgdGhpcy5kYXRhWzRdLCB0aGlzLmRhdGFbNV0gKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB2YXIgeiA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbNl0sIHRoaXMuZGF0YVs3XSwgdGhpcy5kYXRhWzhdICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHgueCwgeC55LCB4LnosXHJcbiAgICAgICAgICAgIHkueCwgeS55LCB5LnosXHJcbiAgICAgICAgICAgIHoueCwgei55LCB6LnpcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzY2FsZSBtYXRyaXggZnJvbSB0aGUgYWZmaW5lLXRyYW5zZm9ybWF0aW9uLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgc2NhbGUgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbMF0sIHRoaXMuZGF0YVsxXSwgdGhpcy5kYXRhWzJdICk7XHJcbiAgICAgICAgdmFyIHkgPSBuZXcgVmVjMyggdGhpcy5kYXRhWzNdLCB0aGlzLmRhdGFbNF0sIHRoaXMuZGF0YVs1XSApO1xyXG4gICAgICAgIHZhciB6ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVs2XSwgdGhpcy5kYXRhWzddLCB0aGlzLmRhdGFbOF0gKTtcclxuICAgICAgICByZXR1cm4gTWF0MzMuc2NhbGUoWyB4Lmxlbmd0aCgpLCB5Lmxlbmd0aCgpLCB6Lmxlbmd0aCgpIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zZm9ybSdzIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIGludmVyc2Ugcm90YXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuaW52ZXJzZVJvdGF0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSBuZXcgVmVjMyggdGhpcy5kYXRhWzBdLCB0aGlzLmRhdGFbMV0sIHRoaXMuZGF0YVsyXSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciB5ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVszXSwgdGhpcy5kYXRhWzRdLCB0aGlzLmRhdGFbNV0gKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB2YXIgeiA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbNl0sIHRoaXMuZGF0YVs3XSwgdGhpcy5kYXRhWzhdICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHgueCwgeS54LCB6LngsXHJcbiAgICAgICAgICAgIHgueSwgeS55LCB6LnksXHJcbiAgICAgICAgICAgIHgueiwgeS56LCB6LnpcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc2Zvcm0ncyBzY2FsZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSBpbnZlcnNlIHNjYWxlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLmludmVyc2VTY2FsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVswXSwgdGhpcy5kYXRhWzFdLCB0aGlzLmRhdGFbMl0gKTtcclxuICAgICAgICB2YXIgeSA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbM10sIHRoaXMuZGF0YVs0XSwgdGhpcy5kYXRhWzVdICk7XHJcbiAgICAgICAgdmFyIHogPSBuZXcgVmVjMyggdGhpcy5kYXRhWzZdLCB0aGlzLmRhdGFbN10sIHRoaXMuZGF0YVs4XSApO1xyXG4gICAgICAgIHZhciBzY2FsZSA9IG5ldyBWZWMzKCB4Lmxlbmd0aCgpLCB5Lmxlbmd0aCgpLCB6Lmxlbmd0aCgpICk7XHJcbiAgICAgICAgcmV0dXJuIE1hdDMzLnNjYWxlKFtcclxuICAgICAgICAgICAgMSAvIHNjYWxlLngsXHJcbiAgICAgICAgICAgIDEgLyBzY2FsZS55LFxyXG4gICAgICAgICAgICAxIC8gc2NhbGUuelxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gdHJhbnNmb3JtIG1hdHJpeCBjb21wb3NlZCBvZiBhIHJvdGF0aW9uIGFuZCBzY2FsZS5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gQSByYW5kb20gdHJhbnNmb3JtIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHIgPSBNYXQzMy5yb3RhdGlvbiggTWF0aC5yYW5kb20oKSAqIDM2MCwgVmVjMy5yYW5kb20oKSApO1xyXG4gICAgICAgIHZhciBzID0gTWF0MzMuc2NhbGUoIE1hdGgucmFuZG9tKCkgKiAxMCApO1xyXG4gICAgICAgIHJldHVybiByLm11bHRNYXQzMyggcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSArJywgJysgdGhpcy5kYXRhWzNdICsnLCAnKyB0aGlzLmRhdGFbNl0gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArJywgJysgdGhpcy5kYXRhWzRdICsnLCAnKyB0aGlzLmRhdGFbN10gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArJywgJysgdGhpcy5kYXRhWzVdICsnLCAnKyB0aGlzLmRhdGFbOF07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgbWF0cml4IGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0sXHJcbiAgICAgICAgXTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNYXQzMztcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFZlYzMgPSByZXF1aXJlKCcuL1ZlYzMnKTtcclxuICAgIHZhciBWZWM0ID0gcmVxdWlyZSgnLi9WZWM0Jyk7XHJcbiAgICB2YXIgTWF0MzMgPSByZXF1aXJlKCcuL01hdDMzJyk7XHJcbiAgICB2YXIgRVBTSUxPTiA9IHJlcXVpcmUoJy4vRXBzaWxvbicpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIE1hdDQ0XHJcbiAgICAgKiBAY2xhc3NkZXNjIEEgNHg0IGNvbHVtbi1tYWpvciBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIE1hdDQ0KCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSB0aGF0IHx8IFtcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF07XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoYXQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IEFycmF5KCAxNiApO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gPSB0aGF0LmRhdGFbMF07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSA9IHRoYXQuZGF0YVsxXTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdID0gdGhhdC5kYXRhWzJdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gPSB0aGF0LmRhdGFbM107XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSA9IHRoYXQuZGF0YVs0XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdID0gdGhhdC5kYXRhWzVdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNl0gPSB0aGF0LmRhdGFbNl07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSA9IHRoYXQuZGF0YVs3XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdID0gdGhhdC5kYXRhWzhdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOV0gPSB0aGF0LmRhdGFbOV07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMF0gPSB0aGF0LmRhdGFbMTBdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTFdID0gdGhhdC5kYXRhWzExXTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSA9IHRoYXQuZGF0YVsxMl07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gPSB0aGF0LmRhdGFbMTNdO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdID0gdGhhdC5kYXRhWzE0XTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE1XSA9IHRoYXQuZGF0YVsxNV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJvdyBvZiB0aGUgbWF0cml4IGFzIGEgVmVjNCBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgMC1iYXNlZCByb3cgaW5kZXguXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IHZlYyAtIFRoZSB2ZWN0b3IgdG8gcmVwbGFjZSB0aGUgcm93LiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIHJvdyB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5yb3cgPSBmdW5jdGlvbiggaW5kZXgsIHZlYyApIHtcclxuICAgICAgICBpZiAoIHZlYyApIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXhdID0gdmVjWzBdIHx8IHZlYy54O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNCtpbmRleF0gPSB2ZWNbMV0gfHwgdmVjLnk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4K2luZGV4XSA9IHZlY1syXSB8fCB2ZWMuejtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyK2luZGV4XSA9IHZlY1szXSB8fCB2ZWMudztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNCtpbmRleF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4K2luZGV4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyK2luZGV4XSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBjb2x1bW4gb2YgdGhlIG1hdHJpeCBhcyBhIFZlYzQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIDAtYmFzZWQgY29sIGluZGV4LlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSB2ZWMgLSBUaGUgdmVjdG9yIHRvIHJlcGxhY2UgdGhlIGNvbC4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSBjb2x1bW4gdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuY29sID0gZnVuY3Rpb24oIGluZGV4LCB2ZWMgKSB7XHJcbiAgICAgICAgaWYgKCB2ZWMgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4KjRdID0gdmVjWzBdIHx8IHZlYy54O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMStpbmRleCo0XSA9IHZlY1sxXSB8fCB2ZWMueTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzIraW5kZXgqNF0gPSB2ZWNbMl0gfHwgdmVjLno7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszK2luZGV4KjRdID0gdmVjWzNdIHx8IHZlYy53O1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMCtpbmRleCo0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEraW5kZXgqNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyK2luZGV4KjRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMytpbmRleCo0XSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGlkZW50aXR5IG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGlkZW50aXkgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5pZGVudGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc2NhbGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fG51bWJlcn0gc2NhbGUgLSBUaGUgc2NhbGFyIG9yIHZlY3RvciBzY2FsaW5nIGZhY3Rvci5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnNjYWxlID0gZnVuY3Rpb24oIHNjYWxlICkge1xyXG4gICAgICAgIGlmICggdHlwZW9mIHNjYWxlID09PSAnbnVtYmVyJyApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgICAgICBzY2FsZSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIHNjYWxlLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgc2NhbGUsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIHNjYWxlIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICAgICAgc2NhbGVbMF0sIDAsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCBzY2FsZVsxXSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIHNjYWxlWzJdLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHNjYWxlLngsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIHNjYWxlLnksIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIHNjYWxlLnosIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgdHJhbnNsYXRpb24gbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSB0cmFuc2xhdGlvbiAtIFRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgdHJhbnNsYXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC50cmFuc2xhdGlvbiA9IGZ1bmN0aW9uKCB0cmFuc2xhdGlvbiApIHtcclxuICAgICAgICBpZiAoIHRyYW5zbGF0aW9uIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb25bMF0sIHRyYW5zbGF0aW9uWzFdLCB0cmFuc2xhdGlvblsyXSwgMVxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uLngsIHRyYW5zbGF0aW9uLnksIHRyYW5zbGF0aW9uLnosIDFcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IGRlZmluZWQgYnkgYW4gYXhpcyBhbmQgYW4gYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucm90YXRpb24gPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgaWYgKCBheGlzIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGF4aXMgPSBuZXcgVmVjMyggYXhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB6ZXJvIHZlY3RvciwgcmV0dXJuIGlkZW50aXR5XHJcbiAgICAgICAgaWYgKCBheGlzLmxlbmd0aFNxdWFyZWQoKSA9PT0gMCApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCBjcmVhdGUgcm90YXRpb24gbWF0cml4IGZvciBhIHplcm8gdmVjdG9yIGF4aXMnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbm9ybUF4aXMgPSBheGlzLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICB4ID0gbm9ybUF4aXMueCxcclxuICAgICAgICAgICAgeSA9IG5vcm1BeGlzLnksXHJcbiAgICAgICAgICAgIHogPSBub3JtQXhpcy56LFxyXG4gICAgICAgICAgICBtb2RBbmdsZSA9ICggYW5nbGUgPiAwICkgPyBhbmdsZSAlICgyKk1hdGguUEkpIDogYW5nbGUgJSAoLTIqTWF0aC5QSSksXHJcbiAgICAgICAgICAgIHMgPSBNYXRoLnNpbiggbW9kQW5nbGUgKSxcclxuICAgICAgICAgICAgYyA9IE1hdGguY29zKCBtb2RBbmdsZSApLFxyXG4gICAgICAgICAgICB4eCA9IHggKiB4LFxyXG4gICAgICAgICAgICB5eSA9IHkgKiB5LFxyXG4gICAgICAgICAgICB6eiA9IHogKiB6LFxyXG4gICAgICAgICAgICB4eSA9IHggKiB5LFxyXG4gICAgICAgICAgICB5eiA9IHkgKiB6LFxyXG4gICAgICAgICAgICB6eCA9IHogKiB4LFxyXG4gICAgICAgICAgICB4cyA9IHggKiBzLFxyXG4gICAgICAgICAgICB5cyA9IHkgKiBzLFxyXG4gICAgICAgICAgICB6cyA9IHogKiBzLFxyXG4gICAgICAgICAgICBvbmVfYyA9IDEuMCAtIGM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIChvbmVfYyAqIHh4KSArIGMsIChvbmVfYyAqIHh5KSArIHpzLCAob25lX2MgKiB6eCkgLSB5cywgMCxcclxuICAgICAgICAgICAgKG9uZV9jICogeHkpIC0genMsIChvbmVfYyAqIHl5KSArIGMsIChvbmVfYyAqIHl6KSArIHhzLCAwLFxyXG4gICAgICAgICAgICAob25lX2MgKiB6eCkgKyB5cywgKG9uZV9jICogeXopIC0geHMsIChvbmVfYyAqIHp6KSArIGMsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IHRvIHJvdGF0ZSBhIHZlY3RvciBmcm9tIG9uZSBkaXJlY3Rpb24gdG9cclxuICAgICAqIGFub3RoZXIuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGZyb20gLSBUaGUgc3RhcnRpbmcgZGlyZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSB0byAtIFRoZSBlbmRpbmcgZGlyZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIG1hdHJpeCByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5yb3RhdGlvbkZyb21UbyA9IGZ1bmN0aW9uKCBmcm9tVmVjLCB0b1ZlYyApIHtcclxuICAgICAgICAvKlxyXG4gICAgICAgIFRoaXMgbWV0aG9kIGlzIGJhc2VkIG9uIHRoZSBjb2RlIGZyb206XHJcbiAgICAgICAgICAgIFRvbWFzIE1sbGVyLCBKb2huIEh1Z2hlc1xyXG4gICAgICAgICAgICBFZmZpY2llbnRseSBCdWlsZGluZyBhIE1hdHJpeCB0byBSb3RhdGUgT25lIFZlY3RvciB0byBBbm90aGVyXHJcbiAgICAgICAgICAgIEpvdXJuYWwgb2YgR3JhcGhpY3MgVG9vbHMsIDQoNCk6MS00LCAxOTk5XHJcbiAgICAgICAgKi9cclxuICAgICAgICBmcm9tVmVjID0gbmV3IFZlYzMoIGZyb21WZWMgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB0b1ZlYyA9IG5ldyBWZWMzKCB0b1ZlYyApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciBlID0gZnJvbVZlYy5kb3QoIHRvVmVjICk7XHJcbiAgICAgICAgdmFyIGYgPSBNYXRoLmFicyggZSApO1xyXG4gICAgICAgIHZhciB4LCB1LCB2O1xyXG4gICAgICAgIHZhciBmeCwgZnksIGZ6O1xyXG4gICAgICAgIHZhciB1eCwgdXo7XHJcbiAgICAgICAgdmFyIGMxLCBjMiwgYzM7XHJcbiAgICAgICAgaWYgKCBmID4gMS4wIC0gRVBTSUxPTiApIHtcclxuICAgICAgICAgICAgLy8gJ2Zyb20nIGFuZCAndG8nIGFsbW9zdCBwYXJhbGxlbFxyXG4gICAgICAgICAgICAvLyBuZWFybHkgb3J0aG9nb25hbFxyXG4gICAgICAgICAgICBmeCA9IE1hdGguYWJzKCBmcm9tVmVjLnggKTtcclxuICAgICAgICAgICAgZnkgPSBNYXRoLmFicyggZnJvbVZlYy55ICk7XHJcbiAgICAgICAgICAgIGZ6ID0gTWF0aC5hYnMoIGZyb21WZWMueiApO1xyXG4gICAgICAgICAgICBpZiAoIGZ4IDwgZnkgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGZ4IDwgZnogKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBWZWMzKCAxLCAwLCAwICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMCwgMSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBmeSA8IGZ6ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMSwgMCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbmV3IFZlYzMoIDAsIDAsIDEgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1ID0geC5zdWIoIGZyb21WZWMgKTtcclxuICAgICAgICAgICAgdiA9IHguc3ViKCB0b1ZlYyApO1xyXG4gICAgICAgICAgICBjMSA9IDIuMCAvIHUuZG90KCB1ICk7XHJcbiAgICAgICAgICAgIGMyID0gMi4wIC8gdi5kb3QoIHYgKTtcclxuICAgICAgICAgICAgYzMgPSBjMSpjMiAqIHUuZG90KCB2ICk7XHJcbiAgICAgICAgICAgIC8vIHNldCBtYXRyaXggZW50cmllc1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS54IC0gYzIqdi54KnYueCArIGMzKnYueCp1LnggKyAxLjAsXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueCAtIGMyKnYueSp2LnggKyBjMyp2LnkqdS54LFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnggLSBjMip2Lnoqdi54ICsgYzMqdi56KnUueCxcclxuICAgICAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS55IC0gYzIqdi54KnYueSArIGMzKnYueCp1LnksXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueSAtIGMyKnYueSp2LnkgKyBjMyp2LnkqdS55ICsgMS4wLFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnkgLSBjMip2Lnoqdi55ICsgYzMqdi56KnUueSxcclxuICAgICAgICAgICAgICAgIDEuMCxcclxuICAgICAgICAgICAgICAgIC1jMSp1LngqdS56IC0gYzIqdi54KnYueiArIGMzKnYueCp1LnosXHJcbiAgICAgICAgICAgICAgICAtYzEqdS55KnUueiAtIGMyKnYueSp2LnogKyBjMyp2LnkqdS56LFxyXG4gICAgICAgICAgICAgICAgLWMxKnUueip1LnogLSBjMip2Lnoqdi56ICsgYzMqdi56KnUueiArIDEuMCxcclxuICAgICAgICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgICAgICAgMC4wLFxyXG4gICAgICAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgICAgICAgMS4wXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGUgbW9zdCBjb21tb24gY2FzZSwgdW5sZXNzICdmcm9tJz0ndG8nLCBvciAndG8nPS0nZnJvbSdcclxuICAgICAgICB2ID0gZnJvbVZlYy5jcm9zcyggdG9WZWMgKTtcclxuICAgICAgICB1ID0gMS4wIC8gKCAxLjAgKyBlICk7ICAgIC8vIG9wdGltaXphdGlvbiBieSBHb3R0ZnJpZWQgQ2hlblxyXG4gICAgICAgIHV4ID0gdSAqIHYueDtcclxuICAgICAgICB1eiA9IHUgKiB2Lno7XHJcbiAgICAgICAgYzEgPSB1eCAqIHYueTtcclxuICAgICAgICBjMiA9IHV4ICogdi56O1xyXG4gICAgICAgIGMzID0gdXogKiB2Lnk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIGUgKyB1eCAqIHYueCxcclxuICAgICAgICAgICAgYzEgKyB2LnosXHJcbiAgICAgICAgICAgIGMyIC0gdi55LFxyXG4gICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgIGMxIC0gdi56LFxyXG4gICAgICAgICAgICBlICsgdSAqIHYueSAqIHYueSxcclxuICAgICAgICAgICAgYzMgKyB2LngsXHJcbiAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgYzIgKyB2LnksXHJcbiAgICAgICAgICAgIGMzIC0gdi54LFxyXG4gICAgICAgICAgICBlICsgdXogKiB2LnosXHJcbiAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgMC4wLFxyXG4gICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgMS4wXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgbWF0cml4IHdpdGggdGhlIHByb3ZpZGVkIG1hdHJpeCBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IE1hMzNcclxuICAgICAqIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0MzN8QXJyYXl9IHRoYXQgLSBUaGUgbWF0cml4IHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBzdW0gb2YgdGhlIHR3byBtYXRyaWNlcy5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmFkZE1hdDMzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyB0aGF0IDogdGhhdC5kYXRhO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKyB0aGF0WzBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKyB0aGF0WzFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKyB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSArIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSArIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSArIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdICsgdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldICsgdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEwXSArIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNV1cclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBtYXRyaXggd2l0aCB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgTWEzM1xyXG4gICAgICogb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHN1bSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuYWRkTWF0NDQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IHRoYXQgOiB0aGF0LmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSArIHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArIHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSArIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSArIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSArIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSArIHRoYXRbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSArIHRoYXRbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSArIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs5XSArIHRoYXRbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMF0gKyB0aGF0WzEwXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzExXSArIHRoYXRbMTFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdICsgdGhhdFsxMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gKyB0aGF0WzEzXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE0XSArIHRoYXRbMTRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTVdICsgdGhhdFsxNV1cclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJ0cmFjdHMgdGhlIHByb3ZpZGVkIG1hdHJpeCBhcmd1bWVudCBmcm9tIHRoZSBtYXRyaXgsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQzM3xBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGRpZmZlcmVuY2Ugb2YgdGhlIHR3byBtYXRyaWNlcy5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLnN1Yk1hdDMzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyB0aGF0IDogdGhhdC5kYXRhO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gLSB0aGF0WzBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gLSB0aGF0WzFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gLSB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSAtIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSAtIHRoYXRbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSAtIHRoYXRbNV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdIC0gdGhhdFs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldIC0gdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEwXSAtIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNV1cclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJ0cmFjdHMgdGhlIHByb3ZpZGVkIG1hdHJpeCBhcmd1bWVudCBmcm9tIHRoZSBtYXRyaXgsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGRpZmZlcmVuY2Ugb2YgdGhlIHR3byBtYXRyaWNlcy5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLnN1Yk1hdDQ0ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyB0aGF0IDogdGhhdC5kYXRhO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gLSB0aGF0WzBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gLSB0aGF0WzFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gLSB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gLSB0aGF0WzNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0gLSB0aGF0WzRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0gLSB0aGF0WzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNl0gLSB0aGF0WzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbN10gLSB0aGF0WzddLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0gLSB0aGF0WzhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOV0gLSB0aGF0WzldLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTBdIC0gdGhhdFsxMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMV0gLSB0aGF0WzExXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSAtIHRoYXRbMTJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdIC0gdGhhdFsxM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNF0gLSB0aGF0WzE0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE1XSAtIHRoYXRbMTVdXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgcHJvdmRlZCB2ZWN0b3IgYXJndW1lbnQgYnkgdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBWZWMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSAtIFRoZSB2ZWN0b3IgdG8gYmUgbXVsdGlwbGllZCBieSB0aGUgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgcmVzdWx0aW5nIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLm11bHRWZWMzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlICd0aGF0JyBpcyBhIFZlYzNcclxuICAgICAgICAvLyBpdCBpcyBzYWZlIHRvIG9ubHkgY2FzdCBpZiBBcnJheSBzaW5jZSBWZWM0IGhhcyBvd24gbWV0aG9kXHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzhdICogdGhhdFsyXSArIHRoaXMuZGF0YVsxMl0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzVdICogdGhhdFsxXSArIHRoaXMuZGF0YVs5XSAqIHRoYXRbMl0gKyB0aGlzLmRhdGFbMTNdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzJdICogdGhhdFswXSArIHRoaXMuZGF0YVs2XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbMTBdICogdGhhdFsyXSArIHRoaXMuZGF0YVsxNF1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNF0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOF0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNV0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOV0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNl0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbMTBdICogdGhhdC56ICsgdGhpcy5kYXRhWzE0XVxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgcHJvdmRlZCB2ZWN0b3IgYXJndW1lbnQgYnkgdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBWZWMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSAtIFRoZSB2ZWN0b3IgdG8gYmUgbXVsdGlwbGllZCBieSB0aGUgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBUaGUgcmVzdWx0aW5nIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLm11bHRWZWM0ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlICd0aGF0JyBpcyBhIFZlYzRcclxuICAgICAgICAvLyBpdCBpcyBzYWZlIHRvIG9ubHkgY2FzdCBpZiBBcnJheSBzaW5jZSBWZWMzIGhhcyBvd24gbWV0aG9kXHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzhdICogdGhhdFsyXSArIHRoaXMuZGF0YVsxMl0gKiB0aGF0WzNdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFswXSArIHRoaXMuZGF0YVs1XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbOV0gKiB0aGF0WzJdICsgdGhpcy5kYXRhWzEzXSAqIHRoYXRbM10sXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzZdICogdGhhdFsxXSArIHRoaXMuZGF0YVsxMF0gKiB0aGF0WzJdICsgdGhpcy5kYXRhWzE0XSAqIHRoYXRbM10sXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzddICogdGhhdFsxXSArIHRoaXMuZGF0YVsxMV0gKiB0aGF0WzJdICsgdGhpcy5kYXRhWzE1XSAqIHRoYXRbM11cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNF0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOF0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTJdICogdGhhdC53LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNV0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOV0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTNdICogdGhhdC53LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNl0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbMTBdICogdGhhdC56ICsgdGhpcy5kYXRhWzE0XSAqIHRoYXQudyxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdICogdGhhdC54ICsgdGhpcy5kYXRhWzddICogdGhhdC55ICsgdGhpcy5kYXRhWzExXSAqIHRoYXQueiArIHRoaXMuZGF0YVsxNV0gKiB0aGF0LndcclxuICAgICAgICApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgYWxsIGNvbXBvbmVudHMgb2YgdGhlIG1hdHJpeCBieSB0aGUgcHJvdmRlZCBzY2FsYXIgYXJndW1lbnQsXHJcbiAgICAgKiByZXR1cm5pbmcgYSBuZXcgTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBtdWx0aXBseSB0aGUgbWF0cml4IGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHJlc3VsdGluZyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5tdWx0U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs5XSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMF0gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTFdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gKiB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE1XSAqIHRoYXRcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92ZGVkIG1hdHJpeCBhcmd1bWVudCBieSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIE1hdDQ0IG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0MzN8QXJyYXl9IC0gVGhlIG1hdHJpeCB0byBiZSBtdWx0aXBsaWVkIGJ5IHRoZSBtYXRyaXguXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgcmVzdWx0aW5nIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLm11bHRNYXQzMyA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gdGhhdCA6IHRoYXQuZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdICogdGhhdFswXSArIHRoaXMuZGF0YVs0XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbOF0gKiB0aGF0WzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzVdICogdGhhdFsxXSArIHRoaXMuZGF0YVs5XSAqIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzEwXSAqIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbN10gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzExXSAqIHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbM10gKyB0aGlzLmRhdGFbNF0gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzhdICogdGhhdFs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFszXSArIHRoaXMuZGF0YVs1XSAqIHRoYXRbNF0gKyB0aGlzLmRhdGFbOV0gKiB0aGF0WzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzNdICsgdGhpcy5kYXRhWzZdICogdGhhdFs0XSArIHRoaXMuZGF0YVsxMF0gKiB0aGF0WzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0WzNdICsgdGhpcy5kYXRhWzddICogdGhhdFs0XSArIHRoaXMuZGF0YVsxMV0gKiB0aGF0WzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0WzZdICsgdGhpcy5kYXRhWzRdICogdGhhdFs3XSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSAqIHRoYXRbNl0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzddICsgdGhpcy5kYXRhWzldICogdGhhdFs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdICogdGhhdFs2XSArIHRoaXMuZGF0YVs2XSAqIHRoYXRbN10gKyB0aGlzLmRhdGFbMTBdICogdGhhdFs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdICogdGhhdFs2XSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbN10gKyB0aGlzLmRhdGFbMTFdICogdGhhdFs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE1XVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHByb3ZkZWQgbWF0cml4IGFyZ3VtZW50IGJ5IHRoZSBtYXRyaXgsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQ0NHxBcnJheX0gLSBUaGUgbWF0cml4IHRvIGJlIG11bHRpcGxpZWQgYnkgdGhlIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSByZXN1bHRpbmcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUubXVsdE1hdDQ0ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyB0aGF0IDogdGhhdC5kYXRhO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0WzBdICsgdGhpcy5kYXRhWzRdICogdGhhdFsxXSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbMl0gKyB0aGlzLmRhdGFbMTJdICogdGhhdFszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFswXSArIHRoaXMuZGF0YVs1XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbOV0gKiB0aGF0WzJdICsgdGhpcy5kYXRhWzEzXSAqIHRoYXRbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbMF0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzFdICsgdGhpcy5kYXRhWzEwXSAqIHRoYXRbMl0gKyB0aGlzLmRhdGFbMTRdICogdGhhdFszXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdICogdGhhdFswXSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbMV0gKyB0aGlzLmRhdGFbMTFdICogdGhhdFsyXSArIHRoaXMuZGF0YVsxNV0gKiB0aGF0WzNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0WzRdICsgdGhpcy5kYXRhWzRdICogdGhhdFs1XSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbNl0gKyB0aGlzLmRhdGFbMTJdICogdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFs0XSArIHRoaXMuZGF0YVs1XSAqIHRoYXRbNV0gKyB0aGlzLmRhdGFbOV0gKiB0aGF0WzZdICsgdGhpcy5kYXRhWzEzXSAqIHRoYXRbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSAqIHRoYXRbNF0gKyB0aGlzLmRhdGFbNl0gKiB0aGF0WzVdICsgdGhpcy5kYXRhWzEwXSAqIHRoYXRbNl0gKyB0aGlzLmRhdGFbMTRdICogdGhhdFs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdICogdGhhdFs0XSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbNV0gKyB0aGlzLmRhdGFbMTFdICogdGhhdFs2XSArIHRoaXMuZGF0YVsxNV0gKiB0aGF0WzddLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0gKiB0aGF0WzhdICsgdGhpcy5kYXRhWzRdICogdGhhdFs5XSArIHRoaXMuZGF0YVs4XSAqIHRoYXRbMTBdICsgdGhpcy5kYXRhWzEyXSAqIHRoYXRbMTFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gKiB0aGF0WzhdICsgdGhpcy5kYXRhWzVdICogdGhhdFs5XSArIHRoaXMuZGF0YVs5XSAqIHRoYXRbMTBdICsgdGhpcy5kYXRhWzEzXSAqIHRoYXRbMTFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzhdICsgdGhpcy5kYXRhWzZdICogdGhhdFs5XSArIHRoaXMuZGF0YVsxMF0gKiB0aGF0WzEwXSArIHRoaXMuZGF0YVsxNF0gKiB0aGF0WzExXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdICogdGhhdFs4XSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbOV0gKyB0aGlzLmRhdGFbMTFdICogdGhhdFsxMF0gKyB0aGlzLmRhdGFbMTVdICogdGhhdFsxMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSAqIHRoYXRbMTJdICsgdGhpcy5kYXRhWzRdICogdGhhdFsxM10gKyB0aGlzLmRhdGFbOF0gKiB0aGF0WzE0XSArIHRoaXMuZGF0YVsxMl0gKiB0aGF0WzE1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdICogdGhhdFsxMl0gKyB0aGlzLmRhdGFbNV0gKiB0aGF0WzEzXSArIHRoaXMuZGF0YVs5XSAqIHRoYXRbMTRdICsgdGhpcy5kYXRhWzEzXSAqIHRoYXRbMTVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0gKiB0aGF0WzEyXSArIHRoaXMuZGF0YVs2XSAqIHRoYXRbMTNdICsgdGhpcy5kYXRhWzEwXSAqIHRoYXRbMTRdICsgdGhpcy5kYXRhWzE0XSAqIHRoYXRbMTVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKiB0aGF0WzEyXSArIHRoaXMuZGF0YVs3XSAqIHRoYXRbMTNdICsgdGhpcy5kYXRhWzExXSAqIHRoYXRbMTRdICsgdGhpcy5kYXRhWzE1XSAqIHRoYXRbMTVdXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGl2aWRlcyBhbGwgY29tcG9uZW50cyBvZiB0aGUgbWF0cml4IGJ5IHRoZSBwcm92ZGVkIHNjYWxhciBhcmd1bWVudCxcclxuICAgICAqIHJldHVybmluZyBhIG5ldyBNYXQ0NCBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIGRpdmlkZSB0aGUgbWF0cml4IGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHJlc3VsdGluZyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5kaXZTY2FsYXIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEwXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMV0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdIC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSAvIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxNF0gLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTVdIC8gdGhhdFxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYWxsIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCBtYXRyaXguXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0NDR8QXJyYXl9IHRoYXQgLSBUaGUgbWF0cml4IHRvIHRlc3QgZXF1YWxpdHkgd2l0aC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlcHNpbG9uIC0gVGhlIGVwc2lsb24gdmFsdWUuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgbWF0cml4IGNvbXBvbmVudHMgbWF0Y2guXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICBlcHNpbG9uID0gZXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMCA6IGVwc2lsb247XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyB0aGF0IDogdGhhdC5kYXRhO1xyXG4gICAgICAgIHJldHVybiAoKCB0aGlzLmRhdGFbMF0gPT09IHRoYXRbMF0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbMF0gLSB0aGF0WzBdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzFdID09PSB0aGF0WzFdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzFdIC0gdGhhdFsxXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVsyXSA9PT0gdGhhdFsyXSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVsyXSAtIHRoYXRbMl0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbM10gPT09IHRoYXRbM10gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbM10gLSB0aGF0WzNdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzRdID09PSB0aGF0WzRdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzRdIC0gdGhhdFs0XSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVs1XSA9PT0gdGhhdFs1XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVs1XSAtIHRoYXRbNV0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbNl0gPT09IHRoYXRbNl0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbNl0gLSB0aGF0WzZdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzddID09PSB0aGF0WzddICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzddIC0gdGhhdFs3XSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVs4XSA9PT0gdGhhdFs4XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVs4XSAtIHRoYXRbOF0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbOV0gPT09IHRoYXRbOV0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbOV0gLSB0aGF0WzldICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzEwXSA9PT0gdGhhdFsxMF0gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbMTBdIC0gdGhhdFsxMF0gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbMTFdID09PSB0aGF0WzExXSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVsxMV0gLSB0aGF0WzExXSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVsxMl0gPT09IHRoYXRbMTJdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzEyXSAtIHRoYXRbMTJdICkgPD0gZXBzaWxvbiApICkgJiZcclxuICAgICAgICAgICAgKCggdGhpcy5kYXRhWzEzXSA9PT0gdGhhdFsxM10gKSB8fCAoIE1hdGguYWJzKCB0aGlzLmRhdGFbMTNdIC0gdGhhdFsxM10gKSA8PSBlcHNpbG9uICkgKSAmJlxyXG4gICAgICAgICAgICAoKCB0aGlzLmRhdGFbMTRdID09PSB0aGF0WzE0XSApIHx8ICggTWF0aC5hYnMoIHRoaXMuZGF0YVsxNF0gLSB0aGF0WzE0XSApIDw9IGVwc2lsb24gKSApICYmXHJcbiAgICAgICAgICAgICgoIHRoaXMuZGF0YVsxNV0gPT09IHRoYXRbMTVdICkgfHwgKCBNYXRoLmFicyggdGhpcy5kYXRhWzE1XSAtIHRoYXRbMTVdICkgPD0gZXBzaWxvbiApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBvcnRob2dyYXBoaWMgcHJvamVjdGlvbiBtYXRyaXguXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgLSBUaGUgbWluaW11bSB4IGV4dGVudCBvZiB0aGUgcHJvamVjdGlvbi5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCAtIFRoZSBtYXhpbXVtIHggZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSAtIFRoZSBtaW5pbXVtIHkgZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCAtIFRoZSBtYXhpbXVtIHkgZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgLSBUaGUgbWluaW11bSB6IGV4dGVudCBvZiB0aGUgcHJvamVjdGlvbi5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgLSBUaGUgbWF4aW11bSB6IGV4dGVudCBvZiB0aGUgcHJvamVjdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBvcnRob2dyYXBoaWMgcHJvamVjdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0Lm9ydGhvID0gZnVuY3Rpb24oIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBNYXQ0NC5pZGVudGl0eSgpO1xyXG4gICAgICAgIG1hdC5kYXRhWzBdID0gMiAvICggcmlnaHQgLSBsZWZ0ICk7XHJcbiAgICAgICAgbWF0LmRhdGFbNV0gPSAyIC8gKCB0b3AgLSBib3R0b20gKTtcclxuICAgICAgICBtYXQuZGF0YVsxMF0gPSAtMiAvICggZmFyIC0gbmVhciApO1xyXG4gICAgICAgIG1hdC5kYXRhWzEyXSA9IC0oICggcmlnaHQgKyBsZWZ0ICkgLyAoIHJpZ2h0IC0gbGVmdCApICk7XHJcbiAgICAgICAgbWF0LmRhdGFbMTNdID0gLSggKCB0b3AgKyBib3R0b20gKSAvICggdG9wIC0gYm90dG9tICkgKTtcclxuICAgICAgICBtYXQuZGF0YVsxNF0gPSAtKCAoIGZhciArIG5lYXIgKSAvICggZmFyIC0gbmVhciApICk7XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXguXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgLSBUaGUgdmVydGljYWwgZmllbGQgb2YgdmlldywgaW4gcmFkaWFucy5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgLSBUaGUgYXNwZWN0IHJhdGlvLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgLSBUaGUgbmVhciBjbGlwcGluZyBwbGFuZSBvZiB0aGUgZnJ1c3R1bS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgLSBUaGUgZmFyIGNsaXBwaW5nIHBsYW5lIG9mIHRoZSBmcnVzdHVtLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uKCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhciApIHtcclxuICAgICAgICB2YXIgZiA9IDEuMCAvIE1hdGgudGFuKCBmb3Z5IC8gMi4wICk7XHJcbiAgICAgICAgdmFyIG5mID0gMS4wIC8gKCBuZWFyIC0gZmFyICk7XHJcbiAgICAgICAgdmFyIG1hdCA9IE1hdDQ0LmlkZW50aXR5KCk7XHJcbiAgICAgICAgbWF0LmRhdGFbMF0gPSBmIC8gYXNwZWN0O1xyXG4gICAgICAgIG1hdC5kYXRhWzVdID0gZjtcclxuICAgICAgICBtYXQuZGF0YVsxMF0gPSAoIGZhciArIG5lYXIgKSAqIG5mO1xyXG4gICAgICAgIG1hdC5kYXRhWzExXSA9IC0xO1xyXG4gICAgICAgIG1hdC5kYXRhWzE0XSA9ICggMi4wICogZmFyICogbmVhciApICogbmY7XHJcbiAgICAgICAgbWF0LmRhdGFbMTVdID0gMDtcclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGEgdmlldyBtYXRyaXggZm9yIHRoZSBhZmZpbmUtdHJhbnNmb3JtYXRpb24gb2YgdGhlIGN1cnJlbnQgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHZpZXcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUudmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVswXSwgdGhpcy5kYXRhWzFdLCB0aGlzLmRhdGFbMl0gKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB2YXIgeSA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbNF0sIHRoaXMuZGF0YVs1XSwgdGhpcy5kYXRhWzZdICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdmFyIHogPSBuZXcgVmVjMyggdGhpcy5kYXRhWzhdLCB0aGlzLmRhdGFbOV0sIHRoaXMuZGF0YVsxMF0gKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB2YXIgdCA9IG5ldyBWZWMzKCAtdGhpcy5kYXRhWzEyXSwgLXRoaXMuZGF0YVsxM10sIC10aGlzLmRhdGFbMTRdICk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHgueCwgeS54LCB6LngsIDAsXHJcbiAgICAgICAgICAgIHgueSwgeS55LCB6LnksIDAsXHJcbiAgICAgICAgICAgIHgueiwgeS56LCB6LnosIDAsXHJcbiAgICAgICAgICAgIHQuZG90KCB4ICksIHQuZG90KCB5ICksIHQuZG90KCB6ICksIDFcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc3Bvc2Ugb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHRyYW5zcG9zZWQgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUudHJhbnNwb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs3XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzExXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzE1XVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGludmVydGVkIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaW52ID0gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgLy8gY29sIDBcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsxMF0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs5XSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTNdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICAtdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVsxMF0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs5XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxNF0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTNdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzddIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxM10qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs2XSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxMF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEwXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs3XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs2XSxcclxuICAgICAgICAgICAgLy8gY29sIDFcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMTBdKnRoaXMuZGF0YVsxNV0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxMV0qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxMV0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEwXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVsxMF0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs3XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbNl0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxMF0gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs3XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs2XSxcclxuICAgICAgICAgICAgLy8gY29sIDJcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVs5XSp0aGlzLmRhdGFbMTVdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMTFdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEzXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVs5XSxcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEzXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbN10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzVdLFxyXG4gICAgICAgICAgICAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzldICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs5XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgLy8gY29sIDNcclxuICAgICAgICAgICAgLXRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzEwXSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbOV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzEwXSp0aGlzLmRhdGFbMTNdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxM10gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzEwXSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbOV0sXHJcbiAgICAgICAgICAgIC10aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzZdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTBdIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzldIC1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs5XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs2XSAtXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVs1XVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkZXRlcm1pbmFudFxyXG4gICAgICAgIHZhciBkZXQgPSB0aGlzLmRhdGFbMF0qaW52LmRhdGFbMF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qaW52LmRhdGFbNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMl0qaW52LmRhdGFbOF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10qaW52LmRhdGFbMTJdO1xyXG4gICAgICAgIHJldHVybiBpbnYubXVsdFNjYWxhciggMSAvIGRldCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJvdGF0aW9uIG1hdHJpeCBmcm9tIHRoZSBhZmZpbmUtdHJhbnNmb3JtYXRpb24uXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSByb3RhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5yb3RhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVswXSwgdGhpcy5kYXRhWzFdLCB0aGlzLmRhdGFbMl0gKS5ub3JtYWxpemUoKTtcclxuICAgICAgICB2YXIgeSA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbNF0sIHRoaXMuZGF0YVs1XSwgdGhpcy5kYXRhWzZdICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdmFyIHogPSBuZXcgVmVjMyggdGhpcy5kYXRhWzhdLCB0aGlzLmRhdGFbOV0sIHRoaXMuZGF0YVsxMF0gKS5ub3JtYWxpemUoKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgeC54LCB4LnksIHgueiwgMCxcclxuICAgICAgICAgICAgeS54LCB5LnksIHkueiwgMCxcclxuICAgICAgICAgICAgei54LCB6LnksIHoueiwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRyYW5zbGF0aW9uIG1hdHJpeCBmcm9tIHRoZSBhZmZpbmUtdHJhbnNmb3JtYXRpb24uXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSB0cmFuc2xhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS50cmFuc2xhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC50cmFuc2xhdGlvbihbIHRoaXMuZGF0YVsxMl0sIHRoaXMuZGF0YVsxM10sIHRoaXMuZGF0YVsxNF0gXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc2NhbGUgbWF0cml4IGZyb20gdGhlIGFmZmluZS10cmFuc2Zvcm1hdGlvbi5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHNjYWxlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSBuZXcgVmVjMyggdGhpcy5kYXRhWzBdLCB0aGlzLmRhdGFbMV0sIHRoaXMuZGF0YVsyXSApO1xyXG4gICAgICAgIHZhciB5ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVs0XSwgdGhpcy5kYXRhWzVdLCB0aGlzLmRhdGFbNl0gKTtcclxuICAgICAgICB2YXIgeiA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbOF0sIHRoaXMuZGF0YVs5XSwgdGhpcy5kYXRhWzEwXSApO1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC5zY2FsZShbIHgubGVuZ3RoKCksIHkubGVuZ3RoKCksIHoubGVuZ3RoKCkgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgdHJhbnNmb3JtJ3Mgcm90YXRpb24gbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgaW52ZXJzZSByb3RhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5pbnZlcnNlUm90YXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbMF0sIHRoaXMuZGF0YVsxXSwgdGhpcy5kYXRhWzJdICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdmFyIHkgPSBuZXcgVmVjMyggdGhpcy5kYXRhWzRdLCB0aGlzLmRhdGFbNV0sIHRoaXMuZGF0YVs2XSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciB6ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVs4XSwgdGhpcy5kYXRhWzldLCB0aGlzLmRhdGFbMTBdICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHgueCwgeS54LCB6LngsIDAsXHJcbiAgICAgICAgICAgIHgueSwgeS55LCB6LnksIDAsXHJcbiAgICAgICAgICAgIHgueiwgeS56LCB6LnosIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc2Zvcm0ncyB0cmFuc2xhdGlvbiBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBpbnZlcnNlIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmludmVyc2VUcmFuc2xhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC50cmFuc2xhdGlvbihbIC10aGlzLmRhdGFbMTJdLCAtdGhpcy5kYXRhWzEzXSwgLXRoaXMuZGF0YVsxNF0gXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgdHJhbnNmb3JtJ3Mgc2NhbGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgaW52ZXJzZSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5pbnZlcnNlU2NhbGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbMF0sIHRoaXMuZGF0YVsxXSwgdGhpcy5kYXRhWzJdICk7XHJcbiAgICAgICAgdmFyIHkgPSBuZXcgVmVjMyggdGhpcy5kYXRhWzRdLCB0aGlzLmRhdGFbNV0sIHRoaXMuZGF0YVs2XSApO1xyXG4gICAgICAgIHZhciB6ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVs4XSwgdGhpcy5kYXRhWzldLCB0aGlzLmRhdGFbMTBdICk7XHJcbiAgICAgICAgdmFyIHNjYWxlID0gbmV3IFZlYzMoIHgubGVuZ3RoKCksIHkubGVuZ3RoKCksIHoubGVuZ3RoKCkgKTtcclxuICAgICAgICByZXR1cm4gTWF0NDQuc2NhbGUoW1xyXG4gICAgICAgICAgICAxIC8gc2NhbGUueCxcclxuICAgICAgICAgICAgMSAvIHNjYWxlLnksXHJcbiAgICAgICAgICAgIDEgLyBzY2FsZS56XHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSB0cmFuc2Zvcm0gbWF0cml4IGNvbXBvc2VkIG9mIGEgcm90YXRpb24gYW5kIHNjYWxlLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBBIHJhbmRvbSB0cmFuc2Zvcm0gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgciA9IE1hdDQ0LnJvdGF0aW9uKCBNYXRoLnJhbmRvbSgpICogMzYwLCBWZWMzLnJhbmRvbSgpICk7XHJcbiAgICAgICAgdmFyIHMgPSBNYXQ0NC5zY2FsZSggTWF0aC5yYW5kb20oKSAqIDEwICk7XHJcbiAgICAgICAgdmFyIHQgPSBNYXQ0NC50cmFuc2xhdGlvbiggVmVjMy5yYW5kb20oKSApO1xyXG4gICAgICAgIHJldHVybiB0Lm11bHRNYXQ0NCggci5tdWx0TWF0NDQoIHMgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSArJywgJysgdGhpcy5kYXRhWzRdICsnLCAnKyB0aGlzLmRhdGFbOF0gKycsICcrIHRoaXMuZGF0YVsxMl0gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArJywgJysgdGhpcy5kYXRhWzVdICsnLCAnKyB0aGlzLmRhdGFbOV0gKycsICcrIHRoaXMuZGF0YVsxM10gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArJywgJysgdGhpcy5kYXRhWzZdICsnLCAnKyB0aGlzLmRhdGFbMTBdICsnLCAnKyB0aGlzLmRhdGFbMTRdICsnLFxcbicgK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKycsICcrIHRoaXMuZGF0YVs3XSArJywgJysgdGhpcy5kYXRhWzExXSArJywgJysgdGhpcy5kYXRhWzE1XTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBtYXRyaXggYXMgYW4gYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbN10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTFdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTVdXHJcbiAgICAgICAgXTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIHRoZSBtYXRyaXggcmVwcmVzZW50YXRpb24gYXMgYSAzeDMgTWF0MzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgbWF0cml4IGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUudG9NYXQzMyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs1XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzZdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs5XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEwXVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG1hdHJpeCBhcyBhbiBhcnJheS5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLnRvTWF0NDQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSxcclxuICAgICAgICAgICAgMC4wLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdLFxyXG4gICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzddLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0sXHJcbiAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgMC4wLFxyXG4gICAgICAgICAgICAwLjAsXHJcbiAgICAgICAgICAgIDAuMCxcclxuICAgICAgICAgICAgMS4wXHJcbiAgICAgICAgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gTWF0NDQ7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBWZWMzID0gcmVxdWlyZSgnLi9WZWMzJyk7XHJcbiAgICB2YXIgTWF0MzMgPSByZXF1aXJlKCcuL01hdDMzJyk7XHJcbiAgICB2YXIgTWF0NDQgPSByZXF1aXJlKCcuL01hdDQ0Jyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBRdWF0ZXJuaW9uIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBRdWF0ZXJuaW9uXHJcbiAgICAgKiBAY2xhc3NkZXNjIEEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgYW4gb3JpZW50YXRpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFF1YXRlcm5pb24oKSB7XHJcbiAgICAgICAgc3dpdGNoICggYXJndW1lbnRzLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgLy8gYXJyYXkgb3IgUXVhdGVybmlvbiBhcmd1bWVudFxyXG4gICAgICAgICAgICAgICAgdmFyIGFyZ3VtZW50ID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCBhcmd1bWVudC53ICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ID0gYXJndW1lbnQudztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGFyZ3VtZW50WzBdICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ID0gYXJndW1lbnRbMF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudyA9IDEuMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50LnggfHwgYXJndW1lbnRbMV0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gYXJndW1lbnQueSB8fCBhcmd1bWVudFsyXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSBhcmd1bWVudC56IHx8IGFyZ3VtZW50WzNdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpbmRpdmlkdWFsIGNvbXBvbmVudCBhcmd1bWVudHNcclxuICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50c1sxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50c1syXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IGFyZ3VtZW50c1szXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy53ID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHRoYXQgcmVwcmVzZW50cyBhbiBvcmVpbnRhdGlvbiBtYXRjaGluZ1xyXG4gICAgICogdGhlIGlkZW50aXR5IG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1F1YXRlcm5pb259IFRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLmlkZW50aXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCAxLCAwLCAwLCAwICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBRdWF0ZXJuaW9uIHdpdGggZWFjaCBjb21wb25lbnQgbmVnYXRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1F1YXRlcm5pb259IFRoZSBuZWdhdGVkIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIC10aGlzLncsIC10aGlzLngsIC10aGlzLnksIC10aGlzLnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25jYXRlbmF0ZXMgdGhlIHJvdGF0aW9ucyBvZiB0aGUgdHdvIHF1YXRlcm5pb25zLCByZXR1cm5pbmdcclxuICAgICAqIGEgbmV3IFF1YXRlcm5pb24gb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1F1YXRlcm5pb258QXJyYXl9IHRoYXQgLSBUaGUgcXVhdGVyaW9uIHRvIGNvbmNhdGVuYXRlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgcmVzdWx0aW5nIGNvbmNhdGVuYXRlZCBxdWF0ZXJuaW9uLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5tdWx0UXVhdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gbmV3IFF1YXRlcm5pb24oIHRoYXQgKSA6IHRoYXQ7XHJcbiAgICAgICAgdmFyIHcgPSAodGhhdC53ICogdGhpcy53KSAtICh0aGF0LnggKiB0aGlzLngpIC0gKHRoYXQueSAqIHRoaXMueSkgLSAodGhhdC56ICogdGhpcy56KSxcclxuICAgICAgICAgICAgeCA9IHRoaXMueSp0aGF0LnogLSB0aGlzLnoqdGhhdC55ICsgdGhpcy53KnRoYXQueCArIHRoaXMueCp0aGF0LncsXHJcbiAgICAgICAgICAgIHkgPSB0aGlzLnoqdGhhdC54IC0gdGhpcy54KnRoYXQueiArIHRoaXMudyp0aGF0LnkgKyB0aGlzLnkqdGhhdC53LFxyXG4gICAgICAgICAgICB6ID0gdGhpcy54KnRoYXQueSAtIHRoaXMueSp0aGF0LnggKyB0aGlzLncqdGhhdC56ICsgdGhpcy56KnRoYXQudztcclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHcsIHgsIHksIHogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcHBsaWVzIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgcXVhdGVybmlvbiBhcyBhIHJvdGF0aW9uXHJcbiAgICAgKiBtYXRyaXggdG8gdGhlIHByb3ZpZGVkIHZlY3RvciwgcmV0dXJuaW5nIGEgbmV3IFZlYzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gcm90YXRlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgcmVzdWx0aW5nIHJvdGF0ZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IG5ldyBWZWMzKCB0aGF0ICkgOiB0aGF0O1xyXG4gICAgICAgIHZhciB2cSA9IG5ldyBRdWF0ZXJuaW9uKCAwLCB0aGF0LngsIHRoYXQueSwgdGhhdC56ICksXHJcbiAgICAgICAgICAgIHIgPSB0aGlzLm11bHRRdWF0KCB2cSApLm11bHRRdWF0KCB0aGlzLmludmVyc2UoKSApO1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggci54LCByLnksIHIueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHgtYXhpcyBvZiB0aGUgcm90YXRpb24gbWF0cml4IHRoYXQgdGhlIHF1YXRlcm5pb24gcmVwcmVzZW50cy5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSB4LWF4aXMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeCByZXByZXNlbnRlZCBieSB0aGUgcXVhdGVybmlvbi5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUueEF4aXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeXkgPSB0aGlzLnkqdGhpcy55LFxyXG4gICAgICAgICAgICB6eiA9IHRoaXMueip0aGlzLnosXHJcbiAgICAgICAgICAgIHh5ID0gdGhpcy54KnRoaXMueSxcclxuICAgICAgICAgICAgeHogPSB0aGlzLngqdGhpcy56LFxyXG4gICAgICAgICAgICB5dyA9IHRoaXMueSp0aGlzLncsXHJcbiAgICAgICAgICAgIHp3ID0gdGhpcy56KnRoaXMudztcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIDEgLSAyKnl5IC0gMip6eixcclxuICAgICAgICAgICAgMip4eSArIDIqencsXHJcbiAgICAgICAgICAgIDIqeHogLSAyKnl3ICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgeS1heGlzIG9mIHRoZSByb3RhdGlvbiBtYXRyaXggdGhhdCB0aGUgcXVhdGVybmlvbiByZXByZXNlbnRzLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHktYXhpcyBvZiB0aGUgcm90YXRpb24gbWF0cml4IHJlcHJlc2VudGVkIGJ5IHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS55QXhpcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4eCA9IHRoaXMueCp0aGlzLngsXHJcbiAgICAgICAgICAgIHp6ID0gdGhpcy56KnRoaXMueixcclxuICAgICAgICAgICAgeHkgPSB0aGlzLngqdGhpcy55LFxyXG4gICAgICAgICAgICB4dyA9IHRoaXMueCp0aGlzLncsXHJcbiAgICAgICAgICAgIHl6ID0gdGhpcy55KnRoaXMueixcclxuICAgICAgICAgICAgencgPSB0aGlzLnoqdGhpcy53O1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgMip4eSAtIDIqencsXHJcbiAgICAgICAgICAgIDEgLSAyKnh4IC0gMip6eixcclxuICAgICAgICAgICAgMip5eiArIDIqeHcgKS5ub3JtYWxpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB6LWF4aXMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeCB0aGF0IHRoZSBxdWF0ZXJuaW9uIHJlcHJlc2VudHMuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgei1heGlzIG9mIHRoZSByb3RhdGlvbiBtYXRyaXggcmVwcmVzZW50ZWQgYnkgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLnpBeGlzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHh4ID0gdGhpcy54KnRoaXMueCxcclxuICAgICAgICAgICAgeXkgPSB0aGlzLnkqdGhpcy55LFxyXG4gICAgICAgICAgICB4eiA9IHRoaXMueCp0aGlzLnosXHJcbiAgICAgICAgICAgIHh3ID0gdGhpcy54KnRoaXMudyxcclxuICAgICAgICAgICAgeXogPSB0aGlzLnkqdGhpcy56LFxyXG4gICAgICAgICAgICB5dyA9IHRoaXMueSp0aGlzLnc7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKFxyXG4gICAgICAgICAgICAyKnh6ICsgMip5dyxcclxuICAgICAgICAgICAgMip5eiAtIDIqeHcsXHJcbiAgICAgICAgICAgIDEgLSAyKnh4IC0gMip5eSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGF4ZXMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeCB0aGF0IHRoZSBxdWF0ZXJuaW9uIHJlcHJlc2VudHMuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBheGVzIG9mIHRoZSBtYXRyaXggcmVwcmVzZW50ZWQgYnkgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLmF4ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeHggPSB0aGlzLngqdGhpcy54LFxyXG4gICAgICAgICAgICB5eSA9IHRoaXMueSp0aGlzLnksXHJcbiAgICAgICAgICAgIHp6ID0gdGhpcy56KnRoaXMueixcclxuICAgICAgICAgICAgeHkgPSB0aGlzLngqdGhpcy55LFxyXG4gICAgICAgICAgICB4eiA9IHRoaXMueCp0aGlzLnosXHJcbiAgICAgICAgICAgIHh3ID0gdGhpcy54KnRoaXMudyxcclxuICAgICAgICAgICAgeXogPSB0aGlzLnkqdGhpcy56LFxyXG4gICAgICAgICAgICB5dyA9IHRoaXMueSp0aGlzLncsXHJcbiAgICAgICAgICAgIHp3ID0gdGhpcy56KnRoaXMudztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiBuZXcgVmVjMyggMSAtIDIqeXkgLSAyKnp6LCAyKnh5ICsgMip6dywgMip4eiAtIDIqeXcgKSxcclxuICAgICAgICAgICAgeTogbmV3IFZlYzMoIDIqeHkgLSAyKnp3LCAxIC0gMip4eCAtIDIqenosIDIqeXogKyAyKnh3ICksXHJcbiAgICAgICAgICAgIHo6IG5ldyBWZWMzKCAyKnh6ICsgMip5dywgMip5eiAtIDIqeHcsIDEgLSAyKnh4IC0gMip5eSApXHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSByb3RhdGlvbiBtYXRyaXggdGhhdCB0aGUgcXVhdGVybmlvbiByZXByZXNlbnRzLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByb3RhdGlvbiBtYXRyaXggcmVwcmVzZW50ZWQgYnkgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLm1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4eCA9IHRoaXMueCp0aGlzLngsXHJcbiAgICAgICAgICAgIHl5ID0gdGhpcy55KnRoaXMueSxcclxuICAgICAgICAgICAgenogPSB0aGlzLnoqdGhpcy56LFxyXG4gICAgICAgICAgICB4eSA9IHRoaXMueCp0aGlzLnksXHJcbiAgICAgICAgICAgIHh6ID0gdGhpcy54KnRoaXMueixcclxuICAgICAgICAgICAgeHcgPSB0aGlzLngqdGhpcy53LFxyXG4gICAgICAgICAgICB5eiA9IHRoaXMueSp0aGlzLnosXHJcbiAgICAgICAgICAgIHl3ID0gdGhpcy55KnRoaXMudyxcclxuICAgICAgICAgICAgencgPSB0aGlzLnoqdGhpcy53O1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICAxIC0gMip5eSAtIDIqenosIDIqeHkgKyAyKnp3LCAyKnh6IC0gMip5dyxcclxuICAgICAgICAgICAgMip4eSAtIDIqencsIDEgLSAyKnh4IC0gMip6eiwgMip5eiArIDIqeHcsXHJcbiAgICAgICAgICAgIDIqeHogKyAyKnl3LCAyKnl6IC0gMip4dywgMSAtIDIqeHggLSAyKnl5IF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24gZGVmaW5lZCBieSBhbiBheGlzXHJcbiAgICAgKiBhbmQgYW4gYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIHJhZGlhbnMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1F1YXRlcm5pb259IFRoZSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucm90YXRpb24gPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgaWYgKCBheGlzIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGF4aXMgPSBuZXcgVmVjMyggYXhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3JtYWxpemUgYXJndW1lbnRzXHJcbiAgICAgICAgYXhpcyA9IGF4aXMubm9ybWFsaXplKCk7XHJcbiAgICAgICAgLy8gc2V0IHF1YXRlcm5pb24gZm9yIHRoZSBlcXVpdm9sZW50IHJvdGF0aW9uXHJcbiAgICAgICAgdmFyIG1vZEFuZ2xlID0gKCBhbmdsZSA+IDAgKSA/IGFuZ2xlICUgKDIqTWF0aC5QSSkgOiBhbmdsZSAlICgtMipNYXRoLlBJKSxcclxuICAgICAgICAgICAgc2luYSA9IE1hdGguc2luKCBtb2RBbmdsZS8yICksXHJcbiAgICAgICAgICAgIGNvc2EgPSBNYXRoLmNvcyggbW9kQW5nbGUvMiApO1xyXG4gICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbihcclxuICAgICAgICAgICAgY29zYSxcclxuICAgICAgICAgICAgYXhpcy54ICogc2luYSxcclxuICAgICAgICAgICAgYXhpcy55ICogc2luYSxcclxuICAgICAgICAgICAgYXhpcy56ICogc2luYSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByb3RhdGlvbiBtYXRyaXggdG8gcm90YXRlIGEgdmVjdG9yIGZyb20gb25lIGRpcmVjdGlvbiB0b1xyXG4gICAgICogYW5vdGhlci5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBmcm9tIC0gVGhlIHN0YXJ0aW5nIGRpcmVjdGlvbi5cclxuICAgICAqIEBwYXJhbSB7VmVjM30gdG8gLSBUaGUgZW5kaW5nIGRpcmVjdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbi5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5yb3RhdGlvbkZyb21UbyA9IGZ1bmN0aW9uKCBmcm9tVmVjLCB0b1ZlYyApIHtcclxuICAgICAgICBmcm9tVmVjID0gbmV3IFZlYzMoIGZyb21WZWMgKTtcclxuICAgICAgICB0b1ZlYyA9IG5ldyBWZWMzKCB0b1ZlYyApO1xyXG4gICAgICAgIHZhciBjcm9zcyA9IGZyb21WZWMuY3Jvc3MoIHRvVmVjICk7XHJcbiAgICAgICAgdmFyIGRvdCA9IGZyb21WZWMuZG90KCB0b1ZlYyApO1xyXG4gICAgICAgIHZhciBmTGVuID0gZnJvbVZlYy5sZW5ndGgoKTtcclxuICAgICAgICB2YXIgdExlbiA9IHRvVmVjLmxlbmd0aCgpO1xyXG4gICAgICAgIHZhciB3ID0gTWF0aC5zcXJ0KCAoIGZMZW4gKiBmTGVuICkgKiAoIHRMZW4gKiB0TGVuICkgKSArIGRvdDtcclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHcsIGNyb3NzLngsIGNyb3NzLnksIGNyb3NzLnogKS5ub3JtYWxpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcXVhdGVybmlvbiB0aGF0IGhhcyBiZWVuIHNwaGVyaWNhbGx5IGludGVycG9sYXRlZCBiZXR3ZWVuXHJcbiAgICAgKiB0d28gcHJvdmlkZWQgcXVhdGVybmlvbnMgZm9yIGEgZ2l2ZW4gdCB2YWx1ZS5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtRdWF0ZXJuaW9ufSBmcm9tUm90IC0gVGhlIHJvdGF0aW9uIGF0IHQgPSAwLlxyXG4gICAgICogQHBhcmFtIHtRdWF0ZXJuaW9ufSB0b1JvdCAtIFRoZSByb3RhdGlvbiBhdCB0ID0gMS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0IC0gVGhlIHQgdmFsdWUsIGZyb20gMCB0byAxLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIGludGVycG9sYXRlZCByb3RhdGlvbi5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5zbGVycCA9IGZ1bmN0aW9uKCBmcm9tUm90LCB0b1JvdCwgdCApIHtcclxuICAgICAgICBpZiAoIGZyb21Sb3QgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgZnJvbVJvdCA9IG5ldyBRdWF0ZXJuaW9uKCBmcm9tUm90ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggdG9Sb3QgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgdG9Sb3QgPSBuZXcgUXVhdGVybmlvbiggdG9Sb3QgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGFuZ2xlIGJldHdlZW5cclxuICAgICAgICB2YXIgY29zSGFsZlRoZXRhID0gKCBmcm9tUm90LncgKiB0b1JvdC53ICkgK1xyXG4gICAgICAgICAgICAoIGZyb21Sb3QueCAqIHRvUm90LnggKSArXHJcbiAgICAgICAgICAgICggZnJvbVJvdC55ICogdG9Sb3QueSApICtcclxuICAgICAgICAgICAgKCBmcm9tUm90LnogKiB0b1JvdC56ICk7XHJcbiAgICAgICAgLy8gaWYgZnJvbVJvdD10b1JvdCBvciBmcm9tUm90PS10b1JvdCB0aGVuIHRoZXRhID0gMCBhbmQgd2UgY2FuIHJldHVybiBmcm9tXHJcbiAgICAgICAgaWYgKCBNYXRoLmFicyggY29zSGFsZlRoZXRhICkgPj0gMSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICAgICAgZnJvbVJvdC53LFxyXG4gICAgICAgICAgICAgICAgZnJvbVJvdC54LFxyXG4gICAgICAgICAgICAgICAgZnJvbVJvdC55LFxyXG4gICAgICAgICAgICAgICAgZnJvbVJvdC56ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvc0hhbGZUaGV0YSBtdXN0IGJlIHBvc2l0aXZlIHRvIHJldHVybiB0aGUgc2hvcnRlc3QgYW5nbGVcclxuICAgICAgICBpZiAoIGNvc0hhbGZUaGV0YSA8IDAgKSB7XHJcbiAgICAgICAgICAgIGZyb21Sb3QgPSBmcm9tUm90Lm5lZ2F0ZSgpO1xyXG4gICAgICAgICAgICBjb3NIYWxmVGhldGEgPSAtY29zSGFsZlRoZXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaGFsZlRoZXRhID0gTWF0aC5hY29zKCBjb3NIYWxmVGhldGEgKTtcclxuICAgICAgICB2YXIgc2luSGFsZlRoZXRhID0gTWF0aC5zcXJ0KCAxIC0gY29zSGFsZlRoZXRhICogY29zSGFsZlRoZXRhICk7XHJcbiAgICAgICAgdmFyIHNjYWxlRnJvbSA9IE1hdGguc2luKCAoIDEuMCAtIHQgKSAqIGhhbGZUaGV0YSApIC8gc2luSGFsZlRoZXRhO1xyXG4gICAgICAgIHZhciBzY2FsZVRvID0gTWF0aC5zaW4oIHQgKiBoYWxmVGhldGEgKSAvIHNpbkhhbGZUaGV0YTtcclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oXHJcbiAgICAgICAgICAgIGZyb21Sb3QudyAqIHNjYWxlRnJvbSArIHRvUm90LncgKiBzY2FsZVRvLFxyXG4gICAgICAgICAgICBmcm9tUm90LnggKiBzY2FsZUZyb20gKyB0b1JvdC54ICogc2NhbGVUbyxcclxuICAgICAgICAgICAgZnJvbVJvdC55ICogc2NhbGVGcm9tICsgdG9Sb3QueSAqIHNjYWxlVG8sXHJcbiAgICAgICAgICAgIGZyb21Sb3QueiAqIHNjYWxlRnJvbSArIHRvUm90LnogKiBzY2FsZVRvICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaCB0aG9zZSBvZiBhIHByb3ZpZGVkIHZlY3Rvci5cclxuICAgICAqIEFuIG9wdGlvbmFsIGVwc2lsb24gdmFsdWUgbWF5IGJlIHByb3ZpZGVkLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1F1YXRlcm5pb258QXJyYXl9IC0gVGhlIHZlY3RvciB0byBjYWxjdWxhdGUgdGhlIGRvdCBwcm9kdWN0IHdpdGguXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgdmFyIHcgPSB0aGF0LncgIT09IHVuZGVmaW5lZCA/IHRoYXQudyA6IHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHggPSB0aGF0LnggIT09IHVuZGVmaW5lZCA/IHRoYXQueCA6IHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHkgPSB0aGF0LnkgIT09IHVuZGVmaW5lZCA/IHRoYXQueSA6IHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHogPSB0aGF0LnogIT09IHVuZGVmaW5lZCA/IHRoYXQueiA6IHRoYXRbM107XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHJldHVybiAoIHRoaXMudyA9PT0gdyB8fCBNYXRoLmFicyggdGhpcy53IC0gdyApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueCA9PT0geCB8fCBNYXRoLmFicyggdGhpcy54IC0geCApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueSA9PT0geSB8fCBNYXRoLmFicyggdGhpcy55IC0geSApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueiA9PT0geiB8fCBNYXRoLmFicyggdGhpcy56IC0geiApIDw9IGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IFF1YXRlcm5pb24gb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgcXVhdGVybmlvbiBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1hZyA9IE1hdGguc3FydChcclxuICAgICAgICAgICAgICAgIHRoaXMueCp0aGlzLnggK1xyXG4gICAgICAgICAgICAgICAgdGhpcy55KnRoaXMueSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLnoqdGhpcy56ICtcclxuICAgICAgICAgICAgICAgIHRoaXMudyp0aGlzLncgKTtcclxuICAgICAgICBpZiAoIG1hZyAhPT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICAgICAgdGhpcy53IC8gbWFnLFxyXG4gICAgICAgICAgICAgICAgdGhpcy54IC8gbWFnLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55IC8gbWFnLFxyXG4gICAgICAgICAgICAgICAgdGhpcy56IC8gbWFnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGNvbmp1Z2F0ZSBvZiB0aGUgcXVhdGVybmlvbi5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1F1YXRlcm5pb259IFRoZSBjb25qdWdhdGUgb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLmNvbmp1Z2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHRoaXMudywgLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgaW52ZXJzZSBvZiB0aGUgcXVhdGVybmlvbi5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUuaW52ZXJzZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmp1Z2F0ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gUXVhdGVybmlvbiBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1F1YXRlcm5pb259IEEgcmFuZG9tIHZlY3RvciBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXhpcyA9IFZlYzMucmFuZG9tKCkubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIGFuZ2xlID0gTWF0aC5yYW5kb20oKTtcclxuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5yb3RhdGlvbiggYW5nbGUsIGF4aXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKyAnLCAnICsgdGhpcy55ICsgJywgJyArIHRoaXMueiArICcsICcgKyB0aGlzLnc7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgcXVhdGVybmlvbi5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgcXVhdGVybmlvbiBhcyBhbiBhcnJheS5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBbICB0aGlzLncsIHRoaXMueCwgdGhpcy55LCB0aGlzLnogXTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWNvbXBvc2VzIHRoZSBtYXRyaXggaW50byB0aGUgY29ycmVzcG9uZGluZyByb3RhdGlvbiwgYW5kIHNjYWxlIGNvbXBvbmVudHMuXHJcbiAgICAgKiBhIHNjYWxlLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIGRlY29tcG9zZWQgY29tcG9uZW50cyBvZiB0aGUgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuZGVjb21wb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gYXhpcyB2ZWN0b3JzXHJcbiAgICAgICAgdmFyIHggPSBuZXcgVmVjMyggdGhpcy5kYXRhWzBdLCB0aGlzLmRhdGFbMV0sIHRoaXMuZGF0YVsyXSApO1xyXG4gICAgICAgIHZhciB5ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVszXSwgdGhpcy5kYXRhWzRdLCB0aGlzLmRhdGFbNV0gKTtcclxuICAgICAgICB2YXIgeiA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbNl0sIHRoaXMuZGF0YVs3XSwgdGhpcy5kYXRhWzhdICk7XHJcbiAgICAgICAgLy8gc2NhbGUgbmVlZHMgdW5ub3JtYWxpemVkIHZlY3RvcnNcclxuICAgICAgICB2YXIgc2NhbGUgPSBuZXcgVmVjMyggeC5sZW5ndGgoKSwgeS5sZW5ndGgoKSwgei5sZW5ndGgoKSApO1xyXG4gICAgICAgIC8vIHJvdGF0aW9uIG5lZWRzIG5vcm1hbGl6ZWQgdmVjdG9yc1xyXG4gICAgICAgIHggPSB4Lm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHkgPSB5Lm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHogPSB6Lm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciB0cmFjZSA9IHgueCArIHkueSArIHouejtcclxuICAgICAgICB2YXIgcztcclxuICAgICAgICB2YXIgcm90YXRpb247XHJcbiAgICAgICAgaWYgKCB0cmFjZSA+IDAgKSB7XHJcbiAgICAgICAgICAgIHMgPSAwLjUgLyBNYXRoLnNxcnQoIHRyYWNlICsgMS4wICk7XHJcbiAgICAgICAgICAgIHJvdGF0aW9uID0gbmV3IFF1YXRlcm5pb24oXHJcbiAgICAgICAgICAgICAgICAwLjI1IC8gcyxcclxuICAgICAgICAgICAgICAgICggeS56IC0gei55ICkgKiBzLFxyXG4gICAgICAgICAgICAgICAgKCB6LnggLSB4LnogKSAqIHMsXHJcbiAgICAgICAgICAgICAgICAoIHgueSAtIHkueCApICogcyApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIHgueCA+IHkueSAmJiB4LnggPiB6LnogKSB7XHJcbiAgICAgICAgICAgIHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIHgueCAtIHkueSAtIHoueiApO1xyXG4gICAgICAgICAgICByb3RhdGlvbiA9IG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICAgICAgKCB5LnogLSB6LnkgKSAvIHMsXHJcbiAgICAgICAgICAgICAgICAwLjI1ICogcyxcclxuICAgICAgICAgICAgICAgICggeS54ICsgeC55ICkgLyBzLFxyXG4gICAgICAgICAgICAgICAgKCB6LnggKyB4LnogKSAvIHMgKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCB5LnkgPiB6LnogKSB7XHJcbiAgICAgICAgICAgIHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIHkueSAtIHgueCAtIHoueiApO1xyXG4gICAgICAgICAgICByb3RhdGlvbiA9IG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICAgICAgKCB6LnggLSB4LnogKSAvIHMsXHJcbiAgICAgICAgICAgICAgICAoIHkueCArIHgueSApIC8gcyxcclxuICAgICAgICAgICAgICAgIDAuMjUgKiBzLFxyXG4gICAgICAgICAgICAgICAgKCB6LnkgKyB5LnogKSAvIHMgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyB6LnogLSB4LnggLSB5LnkgKTtcclxuICAgICAgICAgICAgcm90YXRpb24gPSBuZXcgUXVhdGVybmlvbihcclxuICAgICAgICAgICAgICAgICggeC55IC0geS54ICkgLyBzLFxyXG4gICAgICAgICAgICAgICAgKCB6LnggKyB4LnogKSAvIHMsXHJcbiAgICAgICAgICAgICAgICAoIHoueSArIHkueiApIC8gcyxcclxuICAgICAgICAgICAgICAgIDAuMjUgKiBzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJvdGF0aW9uOiByb3RhdGlvbixcclxuICAgICAgICAgICAgc2NhbGU6IHNjYWxlXHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWNvbXBvc2VzIHRoZSBtYXRyaXggaW50byB0aGUgY29ycmVzcG9uZGluZyByb3RhdGlvbiwgdHJhbnNsYXRpb24sIGFuZCBzY2FsZSBjb21wb25lbnRzLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIGRlY29tcG9zZWQgY29tcG9uZW50cyBvZiB0aGUgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuZGVjb21wb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gdHJhbnNsYXRpb25cclxuICAgICAgICB2YXIgdHJhbnNsYXRpb24gPSBuZXcgVmVjMyggdGhpcy5kYXRhWzEyXSwgdGhpcy5kYXRhWzEzXSwgdGhpcy5kYXRhWzE0XSApO1xyXG4gICAgICAgIC8vIGF4aXMgdmVjdG9yc1xyXG4gICAgICAgIHZhciB4ID0gbmV3IFZlYzMoIHRoaXMuZGF0YVswXSwgdGhpcy5kYXRhWzFdLCB0aGlzLmRhdGFbMl0gKTtcclxuICAgICAgICB2YXIgeSA9IG5ldyBWZWMzKCB0aGlzLmRhdGFbNF0sIHRoaXMuZGF0YVs1XSwgdGhpcy5kYXRhWzZdICk7XHJcbiAgICAgICAgdmFyIHogPSBuZXcgVmVjMyggdGhpcy5kYXRhWzhdLCB0aGlzLmRhdGFbOV0sIHRoaXMuZGF0YVsxMF0gKTtcclxuICAgICAgICAvLyBzY2FsZSBuZWVkcyB1bm5vcm1hbGl6ZWQgdmVjdG9yc1xyXG4gICAgICAgIHZhciBzY2FsZSA9IG5ldyBWZWMzKCB4Lmxlbmd0aCgpLCB5Lmxlbmd0aCgpLCB6Lmxlbmd0aCgpICk7XHJcbiAgICAgICAgLy8gcm90YXRpb24gbmVlZHMgbm9ybWFsaXplZCB2ZWN0b3JzXHJcbiAgICAgICAgeCA9IHgubm9ybWFsaXplKCk7XHJcbiAgICAgICAgeSA9IHkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgeiA9IHoubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdmFyIHRyYWNlID0geC54ICsgeS55ICsgei56O1xyXG4gICAgICAgIHZhciBzO1xyXG4gICAgICAgIHZhciByb3RhdGlvbjtcclxuICAgICAgICBpZiAoIHRyYWNlID4gMCApIHtcclxuICAgICAgICAgICAgcyA9IDAuNSAvIE1hdGguc3FydCggdHJhY2UgKyAxLjAgKTtcclxuICAgICAgICAgICAgcm90YXRpb24gPSBuZXcgUXVhdGVybmlvbihcclxuICAgICAgICAgICAgICAgIDAuMjUgLyBzLFxyXG4gICAgICAgICAgICAgICAgKCB5LnogLSB6LnkgKSAqIHMsXHJcbiAgICAgICAgICAgICAgICAoIHoueCAtIHgueiApICogcyxcclxuICAgICAgICAgICAgICAgICggeC55IC0geS54ICkgKiBzICk7XHJcbiAgICAgICAgfSBlbHNlIGlmICggeC54ID4geS55ICYmIHgueCA+IHoueiApIHtcclxuICAgICAgICAgICAgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgeC54IC0geS55IC0gei56ICk7XHJcbiAgICAgICAgICAgIHJvdGF0aW9uID0gbmV3IFF1YXRlcm5pb24oXHJcbiAgICAgICAgICAgICAgICAoIHkueiAtIHoueSApIC8gcyxcclxuICAgICAgICAgICAgICAgIDAuMjUgKiBzLFxyXG4gICAgICAgICAgICAgICAgKCB5LnggKyB4LnkgKSAvIHMsXHJcbiAgICAgICAgICAgICAgICAoIHoueCArIHgueiApIC8gcyApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIHkueSA+IHoueiApIHtcclxuICAgICAgICAgICAgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgeS55IC0geC54IC0gei56ICk7XHJcbiAgICAgICAgICAgIHJvdGF0aW9uID0gbmV3IFF1YXRlcm5pb24oXHJcbiAgICAgICAgICAgICAgICAoIHoueCAtIHgueiApIC8gcyxcclxuICAgICAgICAgICAgICAgICggeS54ICsgeC55ICkgLyBzLFxyXG4gICAgICAgICAgICAgICAgMC4yNSAqIHMsXHJcbiAgICAgICAgICAgICAgICAoIHoueSArIHkueiApIC8gcyApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIHoueiAtIHgueCAtIHkueSApO1xyXG4gICAgICAgICAgICByb3RhdGlvbiA9IG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICAgICAgKCB4LnkgLSB5LnggKSAvIHMsXHJcbiAgICAgICAgICAgICAgICAoIHoueCArIHgueiApIC8gcyxcclxuICAgICAgICAgICAgICAgICggei55ICsgeS56ICkgLyBzLFxyXG4gICAgICAgICAgICAgICAgMC4yNSAqIHMgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcm90YXRpb246IHJvdGF0aW9uLFxyXG4gICAgICAgICAgICBzY2FsZTogc2NhbGUsXHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uOiB0cmFuc2xhdGlvblxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gUXVhdGVybmlvbjtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFZlYzMgPSByZXF1aXJlKCcuL1ZlYzMnKTtcclxuICAgIHZhciBNYXQ0NCA9IHJlcXVpcmUoJy4vTWF0NDQnKTtcclxuICAgIHZhciBRdWF0ZXJuaW9uID0gcmVxdWlyZSgnLi9RdWF0ZXJuaW9uJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBUcmFuc2Zvcm0gb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIFRyYW5zZm9ybVxyXG4gICAgICogQGNsYXNzZGVzYyBBIHRyYW5zZm9ybSByZXByZXNlbnRpbmcgYW4gb3JpZW50YXRpb24sIHBvc2l0aW9uLCBhbmQgc2NhbGUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRyYW5zZm9ybSggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gdGhhdCB8fCB7fTtcclxuICAgICAgICBpZiAoIHRoYXQuZGF0YSBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICAvLyBNYXQzMyBvciBNYXQ0NCwgZXh0cmFjdCB0cmFuc2Zvcm0gY29tcG9uZW50c1xyXG4gICAgICAgICAgICB0aGF0ID0gdGhhdC5kZWNvbXBvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoYXQucm90YXRpb247XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNsYXRpb24gPSB0aGF0LnRyYW5zbGF0aW9uIHx8IG5ldyBWZWMzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUgPSB0aGF0LnNjYWxlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIHNldCBpbmRpdmlkdWFsIGNvbXBvbmVudHMsIGJ5IHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSB0aGF0LnJvdGF0aW9uID8gbmV3IFF1YXRlcm5pb24oIHRoYXQucm90YXRpb24gKSA6IG5ldyBRdWF0ZXJuaW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNsYXRpb24gPSB0aGF0LnRyYW5zbGF0aW9uID8gbmV3IFZlYzMoIHRoYXQudHJhbnNsYXRpb24gKSA6IG5ldyBWZWMzKCk7XHJcbiAgICAgICAgICAgIGlmICggdHlwZW9mIHRoYXQuc2NhbGUgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZSA9IG5ldyBWZWMzKCB0aGF0LnNjYWxlLCB0aGF0LnNjYWxlLCB0aGF0LnNjYWxlICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjYWxlID0gdGhhdC5zY2FsZSA/IG5ldyBWZWMzKCB0aGF0LnNjYWxlICkgOiBuZXcgVmVjMyggMSwgMSwgMSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBpZGVudGl0eSB0cmFuc2Zvcm0uXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gQW4gaWRlbnRpdHkgdHJhbnNmb3JtLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0uaWRlbnRpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYW5zZm9ybSh7XHJcbiAgICAgICAgICAgIHJvdGF0aW9uOiBuZXcgUXVhdGVybmlvbigpLFxyXG4gICAgICAgICAgICB0cmFuc2xhdGlvbjogbmV3IFZlYzMoKSxcclxuICAgICAgICAgICAgc2NhbGU6IG5ldyBWZWMzKCAxLCAxLCAxIClcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSb3RhdGVzIHRoZSB0cmFuc2Zvcm0gc3VjaCB0aGF0IHgtYXhpcyBtYXRjaGVzIHRoZSBwcm92aWRlZCB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSB4IC0gVGhlIHgtYXhpcyB0byByb3RhdGUgdG8uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBvYmplY3QsIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5yb3RhdGVYVG8gPSBmdW5jdGlvbiggeCApIHtcclxuICAgICAgICB2YXIgcm90ID0gUXVhdGVybmlvbi5yb3RhdGlvbkZyb21UbyggdGhpcy54QXhpcygpLCB4ICk7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHJvdC5tdWx0UXVhdCggdGhpcy5yb3RhdGlvbiApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJvdGF0ZXMgdGhlIHRyYW5zZm9ybSBzdWNoIHRoYXQgeS1heGlzIG1hdGNoZXMgdGhlIHByb3ZpZGVkIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IHkgLSBUaGUgeS1heGlzIHRvIHJvdGF0ZSB0by5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VHJhbnNmb3JtfSBUaGUgdHJhbnNmb3JtIG9iamVjdCwgZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZVlUbyA9IGZ1bmN0aW9uKCB5ICkge1xyXG4gICAgICAgIHZhciByb3QgPSBRdWF0ZXJuaW9uLnJvdGF0aW9uRnJvbVRvKCB0aGlzLnlBeGlzKCksIHkgKTtcclxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gcm90Lm11bHRRdWF0KCB0aGlzLnJvdGF0aW9uICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUm90YXRlcyB0aGUgdHJhbnNmb3JtIHN1Y2ggdGhhdCB6LWF4aXMgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0geiAtIFRoZSB6LWF4aXMgdG8gcm90YXRlIHRvLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRlWlRvID0gZnVuY3Rpb24oIHogKSB7XHJcbiAgICAgICAgdmFyIHJvdCA9IFF1YXRlcm5pb24ucm90YXRpb25Gcm9tVG8oIHRoaXMuekF4aXMoKSwgeiApO1xyXG4gICAgICAgIHRoaXMucm90YXRpb24gPSByb3QubXVsdFF1YXQoIHRoaXMucm90YXRpb24gKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB4LWF4aXMgb2YgdGhlIHRyYW5zZm9ybS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHgtYXhpcyBvZiB0aGUgdHJhbnNmb3JtLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnhBeGlzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRpb24ueEF4aXMoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB5LWF4aXMgb2YgdGhlIHRyYW5zZm9ybS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHktYXhpcyBvZiB0aGUgdHJhbnNmb3JtLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnlBeGlzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRpb24ueUF4aXMoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB6LWF4aXMgb2YgdGhlIHRyYW5zZm9ybS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHotYXhpcyBvZiB0aGUgdHJhbnNmb3JtLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnpBeGlzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRpb24uekF4aXMoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBheGVzIG9mIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIGF4ZXMgb2YgdGhlIHRyYW5zZm9ybS5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5heGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRpb24uYXhlcygpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRyYW5zZm9ybSdzIHNjYWxlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUuc2NhbGVNYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gTWF0NDQuc2NhbGUoIHRoaXMuc2NhbGUgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc2Zvcm0ncyByb3RhdGlvbiBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgcm90YXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0aW9uTWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRpb24ubWF0cml4KCkudG9NYXQ0NCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRyYW5zZm9ybSdzIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSB0cmFuc2xhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNsYXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gTWF0NDQudHJhbnNsYXRpb24oIHRoaXMudHJhbnNsYXRpb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc2Zvcm0ncyBhZmZpbmUtdHJhbnNmb3JtYXRpb24gbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGFmZmluZS10cmFuc2Zvcm1hdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUubWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVCAqIFIgKiBTXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRpb25NYXRyaXgoKVxyXG4gICAgICAgICAgICAubXVsdE1hdDQ0KCB0aGlzLnJvdGF0aW9uTWF0cml4KCkgKVxyXG4gICAgICAgICAgICAubXVsdE1hdDQ0KCB0aGlzLnNjYWxlTWF0cml4KCkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc2Zvcm0ncyBzY2FsZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgaW52ZXJzZSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUuaW52ZXJzZVNjYWxlTWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdDQ0LnNjYWxlKFtcclxuICAgICAgICAgICAgMSAvIHRoaXMuc2NhbGUueCxcclxuICAgICAgICAgICAgMSAvIHRoaXMuc2NhbGUueSxcclxuICAgICAgICAgICAgMSAvIHRoaXMuc2NhbGUuelxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zZm9ybSdzIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBpbnZlcnNlIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5pbnZlcnNlUm90YXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3RhdGlvbi5tYXRyaXgoKS5pbnZlcnNlKCkudG9NYXQ0NCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zZm9ybSdzIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBpbnZlcnNlIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5pbnZlcnNlVHJhbnNsYXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gTWF0NDQudHJhbnNsYXRpb24oIHRoaXMudHJhbnNsYXRpb24ubmVnYXRlKCkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc2Zvcm0ncyBhZmZpbmUtdHJhbnNmb3JtYXRpb24gbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGludmVyc2UgYWZmaW5lLXRyYW5zZm9ybWF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5pbnZlcnNlTWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gU14tMSAqIFJeLTEgKiBUXi0xXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52ZXJzZVNjYWxlTWF0cml4KClcclxuICAgICAgICAgICAgLm11bHRNYXQ0NCggdGhpcy5pbnZlcnNlUm90YXRpb25NYXRyaXgoKSApXHJcbiAgICAgICAgICAgIC5tdWx0TWF0NDQoIHRoaXMuaW52ZXJzZVRyYW5zbGF0aW9uTWF0cml4KCkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc2Zvcm0ncyB2aWV3IG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSB2aWV3IG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS52aWV3TWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0cml4KCkudmlldygpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zbGF0ZXMgdGhlIHRyYW5zZm9ybSBpbiB3b3JsZCBzcGFjZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IHRyYW5zbGF0aW9uIC0gVGhlIHRyYW5zbGF0aW9uIHZlY3Rvci5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VHJhbnNmb3JtfSBUaGUgdHJhbnNmb3JtIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS50cmFuc2xhdGVXb3JsZCA9IGZ1bmN0aW9uKCB0cmFuc2xhdGlvbiApIHtcclxuICAgICAgICB0aGlzLnRyYW5zbGF0aW9uID0gdGhpcy50cmFuc2xhdGlvbi5hZGQoIHRyYW5zbGF0aW9uICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNsYXRlcyB0aGUgdHJhbnNmb3JtIGluIGxvY2FsIHNwYWNlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM30gdHJhbnNsYXRpb24gLSBUaGUgdHJhbnNsYXRpb24gdmVjdG9yLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnRyYW5zbGF0ZUxvY2FsID0gZnVuY3Rpb24oIHRyYW5zbGF0aW9uICkge1xyXG4gICAgICAgIGlmICggdHJhbnNsYXRpb24gaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICB0cmFuc2xhdGlvbiA9IG5ldyBWZWMzKCB0cmFuc2xhdGlvbiApO1xyXG4gICAgICAgfVxyXG4gICAgICAgIHZhciBheGVzID0gdGhpcy5heGVzKCk7XHJcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IHRoaXMudHJhbnNsYXRpb25cclxuICAgICAgICAgICAgLmFkZCggYXhlcy54Lm11bHRTY2FsYXIoIHRyYW5zbGF0aW9uLnggKSApXHJcbiAgICAgICAgICAgIC5hZGQoIGF4ZXMueS5tdWx0U2NhbGFyKCB0cmFuc2xhdGlvbi55ICkgKVxyXG4gICAgICAgICAgICAuYWRkKCBheGVzLnoubXVsdFNjYWxhciggdHJhbnNsYXRpb24ueiApICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUm90YXRlcyB0aGUgdHJhbnNmb3JtIGJ5IGFuIGFuZ2xlIGFyb3VuZCBhbiBheGlzIGluIHdvcmxkIHNwYWNlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIHJhZGlhbnMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRlV29ybGQgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgdmFyIHJvdCA9IFF1YXRlcm5pb24ucm90YXRpb24oIGFuZ2xlLCBheGlzICk7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHJvdC5tdWx0UXVhdCggdGhpcy5yb3RhdGlvbiApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJvdGF0ZXMgdGhlIHRyYW5zZm9ybSBieSBhbiBhbmdsZSBhcm91bmQgYW4gYXhpcyBpbiBsb2NhbCBzcGFjZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZUxvY2FsID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvdGF0ZVdvcmxkKCBhbmdsZSwgdGhpcy5yb3RhdGlvbk1hdHJpeCgpLm11bHRWZWMzKCBheGlzICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2Zvcm1zIHRoZSB2ZWN0b3Igb3IgbWF0cml4IGFyZ3VtZW50IGZyb20gdGhlIHRyYW5zZm9ybXMgbG9jYWwgc3BhY2VcclxuICAgICAqIHRvIHRoZSB3b3JsZCBzcGFjZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNH0gdmVjIC0gVGhlIHZlY3RvciBhcmd1bWVudCB0byB0cmFuc2Zvcm0uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUubG9jYWxUb1dvcmxkID0gZnVuY3Rpb24oIHZlYyApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaXgoKS5tdWx0VmVjMyggdmVjICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmb3JtcyB0aGUgdmVjdG9yIG9yIG1hdHJpeCBhcmd1bWVudCBmcm9tIHdvcmxkIHNwYWNlIHRvIHRoZVxyXG4gICAgICogdHJhbnNmb3JtcyBsb2NhbCBzcGFjZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNH0gdmVjIC0gVGhlIHZlY3RvciBhcmd1bWVudCB0byB0cmFuc2Zvcm0uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUud29ybGRUb0xvY2FsID0gZnVuY3Rpb24oIHZlYyApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnZlcnNlTWF0cml4KCkubXVsdFZlYzMoIHZlYyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYWxsIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB0cmFuc2Zvcm0uXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1RyYW5zZm9ybX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB0cmFuc2Zvcm0gY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaXgoKS5lcXVhbHMoIHRoYXQubWF0cml4KCksIGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgdHJhbnNmb3JtIHdpdGggYSByYW5kb20gdHJhbnNsYXRpb24sIG9yaWVudGF0aW9uLCBhbmQgc2NhbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHJhbmRvbSB0cmFuc2Zvcm0uXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYW5zZm9ybSh7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uOiBWZWMzLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBzY2FsZTogVmVjMy5yYW5kb20oKSxcclxuICAgICAgICB9KS5yb3RhdGVYVG8oIFZlYzMucmFuZG9tKCkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHJhbnNmb3JtLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0cml4KCkudG9TdHJpbmcoKTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm07XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgVmVjMyA9IHJlcXVpcmUoJy4vVmVjMycpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNsb3Nlc3RQb2ludE9uRWRnZSggYSwgYiwgcG9pbnQgKSB7XHJcbiAgICAgICAgdmFyIGFiID0gYi5zdWIoIGEgKTtcclxuICAgICAgICAvLyBwcm9qZWN0IGMgb250byBhYiwgY29tcHV0aW5nIHBhcmFtZXRlcml6ZWQgcG9zaXRpb24gZCh0KSA9IGEgKyB0KihiICogYSlcclxuICAgICAgICB2YXIgdCA9IG5ldyBWZWMzKCBwb2ludCApLnN1YiggYSApLmRvdCggYWIgKSAvIGFiLmRvdCggYWIgKTtcclxuICAgICAgICAvLyBJZiBvdXRzaWRlIHNlZ21lbnQsIGNsYW1wIHQgKGFuZCB0aGVyZWZvcmUgZCkgdG8gdGhlIGNsb3Nlc3QgZW5kcG9pbnRcclxuICAgICAgICBpZiAoIHQgPCAwICkge1xyXG4gICAgICAgICAgICB0ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCB0ID4gMSApIHtcclxuICAgICAgICAgICAgdCA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbXB1dGUgcHJvamVjdGVkIHBvc2l0aW9uIGZyb20gdGhlIGNsYW1wZWQgdFxyXG4gICAgICAgIHJldHVybiBhLmFkZCggYWIubXVsdFNjYWxhciggdCApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBUcmlhbmdsZSBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgVHJpYW5nbGVcclxuICAgICAqIEBjbGFzc2Rlc2MgQSBDQ1ctd2luZGVkIHRyaWFuZ2xlIG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVHJpYW5nbGUoKSB7XHJcbiAgICAgICAgc3dpdGNoICggYXJndW1lbnRzLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgLy8gYXJyYXkgb3Igb2JqZWN0IGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hID0gbmV3IFZlYzMoIGFyZ1swXSB8fCBhcmcuYSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iID0gbmV3IFZlYzMoIGFyZ1sxXSB8fCBhcmcuYiApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jID0gbmV3IFZlYzMoIGFyZ1syXSB8fCBhcmcuYyApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIC8vIGluZGl2aWR1YWwgdmVjdG9yIGFyZ3VtZW50c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hID0gbmV3IFZlYzMoIGFyZ3VtZW50c1swXSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iID0gbmV3IFZlYzMoIGFyZ3VtZW50c1sxXSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jID0gbmV3IFZlYzMoIGFyZ3VtZW50c1syXSApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmEgPSBuZXcgVmVjMyggMCwgMCwgMCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iID0gbmV3IFZlYzMoIDEsIDAsIDAgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYyA9IG5ldyBWZWMzKCAxLCAxLCAwICk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSByYWRpdXMgb2YgdGhlIGJvdW5kaW5nIHNwaGVyZSBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgcmFkaXVzIG9mIHRoZSBib3VuZGluZyBzcGhlcmUuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5yYWRpdXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY2VudHJvaWQgPSB0aGlzLmNlbnRyb2lkKCksXHJcbiAgICAgICAgICAgIGFEaXN0ID0gdGhpcy5hLnN1YiggY2VudHJvaWQgKS5sZW5ndGgoKSxcclxuICAgICAgICAgICAgYkRpc3QgPSB0aGlzLmIuc3ViKCBjZW50cm9pZCApLmxlbmd0aCgpLFxyXG4gICAgICAgICAgICBjRGlzdCA9IHRoaXMuYy5zdWIoIGNlbnRyb2lkICkubGVuZ3RoKCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCBhRGlzdCwgTWF0aC5tYXgoIGJEaXN0LCBjRGlzdCApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY2VudHJvaWQgb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGNlbnRyb2lkIG9mIHRoZSB0cmlhbmdsZS5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLmNlbnRyb2lkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYVxyXG4gICAgICAgICAgICAuYWRkKCB0aGlzLmIgKVxyXG4gICAgICAgICAgICAuYWRkKCB0aGlzLmMgKVxyXG4gICAgICAgICAgICAuZGl2U2NhbGFyKCAzICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbm9ybWFsIG9mIHRoZSB0cmlhbmdsZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBub3JtYWwgb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5wcm90b3R5cGUubm9ybWFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGFiID0gdGhpcy5iLnN1YiggdGhpcy5hICksXHJcbiAgICAgICAgICAgIGFjID0gdGhpcy5jLnN1YiggdGhpcy5hICk7XHJcbiAgICAgICAgcmV0dXJuIGFiLmNyb3NzKCBhYyApLm5vcm1hbGl6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGFyZWEgb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGFyZWEgb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5wcm90b3R5cGUuYXJlYSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhYiA9IHRoaXMuYi5zdWIoIHRoaXMuYSApLFxyXG4gICAgICAgICAgICBhYyA9IHRoaXMuYy5zdWIoIHRoaXMuYSApO1xyXG4gICAgICAgIHJldHVybiBhYi5jcm9zcyggYWMgKS5sZW5ndGgoKSAvIDIuMDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgdHJpYW5nbGUuIFRoZSBwb2ludCBtdXN0IGJlXHJcbiAgICAgKiBjb3BsYW5hci5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gcG9pbnQgLSBUaGUgcG9pbnQgdG8gdGVzdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5pc0luc2lkZSA9IGZ1bmN0aW9uKCBwb2ludCApIHtcclxuICAgICAgICB2YXIgcCA9IG5ldyBWZWMzKCBwb2ludCApO1xyXG4gICAgICAgIC8vIFRyYW5zbGF0ZSBwb2ludCBhbmQgdHJpYW5nbGUgc28gdGhhdCBwb2ludCBsaWVzIGF0IG9yaWdpblxyXG4gICAgICAgIHZhciBhID0gdGhpcy5hLnN1YiggcCApO1xyXG4gICAgICAgIHZhciBiID0gdGhpcy5iLnN1YiggcCApO1xyXG4gICAgICAgIHZhciBjID0gdGhpcy5jLnN1YiggcCApO1xyXG4gICAgICAgIC8vIENvbXB1dGUgbm9ybWFsIHZlY3RvcnMgZm9yIHRyaWFuZ2xlcyBwYWIgYW5kIHBiY1xyXG4gICAgICAgIHZhciB1ID0gYi5jcm9zcyggYyApO1xyXG4gICAgICAgIHZhciB2ID0gYy5jcm9zcyggYSApO1xyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGV5IGFyZSBib3RoIHBvaW50aW5nIGluIHRoZSBzYW1lIGRpcmVjdGlvblxyXG4gICAgICAgIGlmICggdS5kb3QoIHYgKSA8IDAuMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDb21wdXRlIG5vcm1hbCB2ZWN0b3IgZm9yIHRyaWFuZ2xlIHBjYVxyXG4gICAgICAgIHZhciB3ID0gYS5jcm9zcyggYiApO1xyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBpdCBwb2ludHMgaW4gdGhlIHNhbWUgZGlyZWN0aW9uIGFzIHRoZSBmaXJzdCB0d29cclxuICAgICAgICBpZiAoIHUuZG90KCB3ICkgPCAwLjAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT3RoZXJ3aXNlIFAgbXVzdCBiZSBpbiAob3Igb24pIHRoZSB0cmlhbmdsZVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVyc2VjdCB0aGUgdHJpYW5nbGUgYW5kIHJldHVybiBpbnRlcnNlY3Rpb24gaW5mb3JtYXRpb24uXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IG9yaWdpbiAtIFRoZSBvcmlnaW4gb2YgdGhlIGludGVyc2VjdGlvbiByYXlcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gZGlyZWN0aW9uIC0gVGhlIGRpcmVjdGlvbiBvZiB0aGUgaW50ZXJzZWN0aW9uIHJheS5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlQmVoaW5kIC0gV2hldGhlciBvciBub3QgdG8gaWdub3JlIGludGVyc2VjdGlvbnMgYmVoaW5kIHRoZSBvcmlnaW4gb2YgdGhlIHJheS5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlQmFja2ZhY2UgLSBXaGV0aGVyIG9yIG5vdCB0byBpZ25vcmUgdGhlIGJhY2tmYWNlIG9mIHRoZSB0cmlhbmdsZS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fGJvb2xlYW59IFRoZSBpbnRlcnNlY3Rpb24gaW5mb3JtYXRpb24sIG9yIGZhbHNlIGlmIHRoZXJlIGlzIG5vIGludGVyc2VjdGlvbi5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLmludGVyc2VjdCA9IGZ1bmN0aW9uKCBvcmlnaW4sIGRpcmVjdGlvbiwgaWdub3JlQmVoaW5kLCBpZ25vcmVCYWNrZmFjZSApIHtcclxuICAgICAgICAvLyBDb21wdXRlIHJheS9wbGFuZSBpbnRlcnNlY3Rpb25cclxuICAgICAgICB2YXIgbyA9IG5ldyBWZWMzKCBvcmlnaW4gKTtcclxuICAgICAgICB2YXIgZCA9IG5ldyBWZWMzKCBkaXJlY3Rpb24gKTtcclxuICAgICAgICB2YXIgbm9ybWFsID0gdGhpcy5ub3JtYWwoKTtcclxuICAgICAgICB2YXIgZG4gPSBkLmRvdCggbm9ybWFsICk7XHJcbiAgICAgICAgaWYgKCBkbiA9PT0gMCApIHtcclxuICAgICAgICAgICAgLy8gcmF5IGlzIHBhcmFsbGVsIHRvIHBsYW5lXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHJheSBpcyBjby1saW5lYXIgYW5kIGludGVyc2VjdHM/XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLmEuc3ViKCBvICkuZG90KCBub3JtYWwgKSAvIGRuO1xyXG4gICAgICAgIGlmICggaWdub3JlQmVoaW5kICYmICggdCA8IDAgKSApIHtcclxuICAgICAgICAgICAgLy8gcGxhbmUgaXMgYmVoaW5kIHJheVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggaWdub3JlQmFja2ZhY2UgKSB7XHJcbiAgICAgICAgICAgIC8vICBpZ25vcmUgdHJpYW5nbGVzIGZhY2luZyBhd2F5IGZyb20gcmF5XHJcbiAgICAgICAgICAgIGlmICggKCB0ID4gMCAmJiBkbiA+IDAgKSB8fCAoIHQgPCAwICYmIGRuIDwgMCApICkge1xyXG4gICAgICAgICAgICAgICAgLy8gdHJpYW5nbGUgaXMgZmFjaW5nIG9wcG9zaXRlIHRoZSBkaXJlY3Rpb24gb2YgaW50ZXJzZWN0aW9uXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gby5hZGQoIGQubXVsdFNjYWxhciggdCApICk7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgcG9pbnQgaXMgaW5zaWRlIHRoZSB0cmlhbmdsZVxyXG4gICAgICAgIGlmICggIXRoaXMuaXNJbnNpZGUoIHBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxyXG4gICAgICAgICAgICBub3JtYWw6IG5vcm1hbCxcclxuICAgICAgICAgICAgdDogdFxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY2xvc2VzdCBwb2ludCBvbiB0aGUgdHJpYW5nbGUgdG8gdGhlIHNwZWNpZmllZCBwb2ludC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gcG9pbnQgLSBUaGUgcG9pbnQgdG8gdGVzdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIGNsb3Nlc3QgcG9pbnQgb24gdGhlIGVkZ2UuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5jbG9zZXN0UG9pbnQgPSBmdW5jdGlvbiggcG9pbnQgKSB7XHJcbiAgICAgICAgdmFyIGUwID0gY2xvc2VzdFBvaW50T25FZGdlKCB0aGlzLmEsIHRoaXMuYiwgcG9pbnQgKTtcclxuICAgICAgICB2YXIgZTEgPSBjbG9zZXN0UG9pbnRPbkVkZ2UoIHRoaXMuYiwgdGhpcy5jLCBwb2ludCApO1xyXG4gICAgICAgIHZhciBlMiA9IGNsb3Nlc3RQb2ludE9uRWRnZSggdGhpcy5jLCB0aGlzLmEsIHBvaW50ICk7XHJcbiAgICAgICAgdmFyIGQwID0gKCBlMC5zdWIoIHBvaW50ICkgKS5sZW5ndGhTcXVhcmVkKCk7XHJcbiAgICAgICAgdmFyIGQxID0gKCBlMS5zdWIoIHBvaW50ICkgKS5sZW5ndGhTcXVhcmVkKCk7XHJcbiAgICAgICAgdmFyIGQyID0gKCBlMi5zdWIoIHBvaW50ICkgKS5sZW5ndGhTcXVhcmVkKCk7XHJcbiAgICAgICAgaWYgKCBkMCA8IGQxICkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCBkMCA8IGQyICkgPyBlMCA6IGUyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIGQxIDwgZDIgKSA/IGUxIDogZTI7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gVHJpYW5nbGUgb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VHJpYW5nbGV9IEEgcmFuZG9tIHRyaWFuZ2xlIG9mIHVuaXQgcmFkaXVzLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYSA9IFZlYzMucmFuZG9tKCksXHJcbiAgICAgICAgICAgIGIgPSBWZWMzLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBjID0gVmVjMy5yYW5kb20oKSxcclxuICAgICAgICAgICAgY2VudHJvaWQgPSBhLmFkZCggYiApLmFkZCggYyApLmRpdlNjYWxhciggMyApLFxyXG4gICAgICAgICAgICBhQ2VudCA9IGEuc3ViKCBjZW50cm9pZCApLFxyXG4gICAgICAgICAgICBiQ2VudCA9IGIuc3ViKCBjZW50cm9pZCApLFxyXG4gICAgICAgICAgICBjQ2VudCA9IGMuc3ViKCBjZW50cm9pZCApLFxyXG4gICAgICAgICAgICBhRGlzdCA9IGFDZW50Lmxlbmd0aCgpLFxyXG4gICAgICAgICAgICBiRGlzdCA9IGJDZW50Lmxlbmd0aCgpLFxyXG4gICAgICAgICAgICBjRGlzdCA9IGNDZW50Lmxlbmd0aCgpLFxyXG4gICAgICAgICAgICBtYXhEaXN0ID0gTWF0aC5tYXgoIE1hdGgubWF4KCBhRGlzdCwgYkRpc3QgKSwgY0Rpc3QgKSxcclxuICAgICAgICAgICAgc2NhbGUgPSAxIC8gbWF4RGlzdDtcclxuICAgICAgICByZXR1cm4gbmV3IFRyaWFuZ2xlKFxyXG4gICAgICAgICAgICBhQ2VudC5tdWx0U2NhbGFyKCBzY2FsZSApLFxyXG4gICAgICAgICAgICBiQ2VudC5tdWx0U2NhbGFyKCBzY2FsZSApLFxyXG4gICAgICAgICAgICBjQ2VudC5tdWx0U2NhbGFyKCBzY2FsZSApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaCB0aG9zZSBvZiBhIHByb3ZpZGVkIHRyaWFuZ2xlLlxyXG4gICAgICogQW4gb3B0aW9uYWwgZXBzaWxvbiB2YWx1ZSBtYXkgYmUgcHJvdmlkZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1RyaWFuZ2xlfSB0aGF0IC0gVGhlIHZlY3RvciB0byB0ZXN0IGVxdWFsaXR5IHdpdGguXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvbiAtIFRoZSBlcHNpbG9uIHZhbHVlLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZlY3RvciBjb21wb25lbnRzIG1hdGNoLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmEuZXF1YWxzKCB0aGF0LmEsIGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICB0aGlzLmIuZXF1YWxzKCB0aGF0LmIsIGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICB0aGlzLmMuZXF1YWxzKCB0aGF0LmMsIGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmEudG9TdHJpbmcoKSArICcsICcgK1xyXG4gICAgICAgICAgICB0aGlzLmIudG9TdHJpbmcoKSArICcsICcgK1xyXG4gICAgICAgICAgICB0aGlzLmMudG9TdHJpbmcoKTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUcmlhbmdsZTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIEVQU0lMT04gPSByZXF1aXJlKCcuL0Vwc2lsb24nKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIFZlYzIgb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIFZlYzJcclxuICAgICAqIEBjbGFzc2Rlc2MgQSB0d28gY29tcG9uZW50IHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVmVjMigpIHtcclxuICAgICAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBvciBWZWNOIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJndW1lbnQgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudC54IHx8IGFyZ3VtZW50WzBdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50LnkgfHwgYXJndW1lbnRbMV0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIC8vIGluZGl2aWR1YWwgY29tcG9uZW50IGFyZ3VtZW50c1xyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gYXJndW1lbnRzWzFdO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgVmVjMiB3aXRoIGVhY2ggY29tcG9uZW50IG5lZ2F0ZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgbmVnYXRlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMiggLXRoaXMueCwgLXRoaXMueSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCB2ZWN0b3IgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWMyXHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzdW0uXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjMn0gVGhlIHN1bSBvZiB0aGUgdHdvIHZlY3RvcnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCArIHRoYXRbMF0sIHRoaXMueSArIHRoYXRbMV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggKyB0aGF0LngsIHRoaXMueSArIHRoYXQueSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0aGUgcHJvdmlkZWQgdmVjdG9yIGFyZ3VtZW50IGZyb20gdGhlIHZlY3RvciwgcmV0dXJuaW5nIGEgbmV3IFZlYzJcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGRpZmZlcmVuY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIHZlY3RvciB0byBzdWJ0cmFjdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjMn0gVGhlIGRpZmZlcmVuY2Ugb2YgdGhlIHR3byB2ZWN0b3JzLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggLSB0aGF0WzBdLCB0aGlzLnkgLSB0aGF0WzFdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMiggdGhpcy54IC0gdGhhdC54LCB0aGlzLnkgLSB0aGF0LnkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSB2ZWN0b3Igd2l0aCB0aGUgcHJvdmlkZWQgc2NhbGFyIGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgVmVjMlxyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBtdWx0aXBseSB0aGUgdmVjdG9yIGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUubXVsdFNjYWxhciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMiggdGhpcy54ICogdGhhdCwgdGhpcy55ICogdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERpdmlkZXMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCBzY2FsYXIgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWMyXHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIGRpdmlkZSB0aGUgdmVjdG9yIGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuZGl2U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggLyB0aGF0LCB0aGlzLnkgLyB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgZG90IHByb2R1Y3Qgb2YgdGhlIHZlY3RvciBhbmQgdGhlIHByb3ZpZGVkXHJcbiAgICAgKiB2ZWN0b3IgYXJndW1lbnQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIG90aGVyIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgZG90IHByb2R1Y3QuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0WzBdICkgKyAoIHRoaXMueSAqIHRoYXRbMV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdC54ICkgKyAoIHRoaXMueSAqIHRoYXQueSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYW5kIHJldHVybnMgMkQgY3Jvc3MgcHJvZHVjdCBvZiB0aGUgdmVjdG9yIGFuZCB0aGUgcHJvdmlkZWRcclxuICAgICAqIHZlY3RvciBhcmd1bWVudC4gVGhpcyB2YWx1ZSByZXByZXNlbnRzIHRoZSBtYWduaXR1ZGUgb2YgdGhlIHZlY3RvciB0aGF0XHJcbiAgICAgKiB3b3VsZCByZXN1bHQgZnJvbSBhIHJlZ3VsYXIgM0QgY3Jvc3MgcHJvZHVjdCBvZiB0aGUgaW5wdXQgdmVjdG9ycyxcclxuICAgICAqIHRha2luZyB0aGVpciBaIHZhbHVlcyBhcyAwLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzJ8VmVjM3xWZWM0fEFycmF5fSAtIFRoZSBvdGhlciB2ZWN0b3IgYXJndW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIDJEIGNyb3NzIHByb2R1Y3QuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLmNyb3NzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXRbMV0gKSAtICggdGhpcy55ICogdGhhdFswXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0LnkgKSAtICggdGhpcy55ICogdGhhdC54ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgbm8gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgc2NhbGFyIGxlbmd0aCBvZlxyXG4gICAgICogdGhlIHZlY3Rvci4gSWYgYW4gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIGEgbmV3XHJcbiAgICAgKiBWZWMyIHNjYWxlZCB0byB0aGUgcHJvdmlkZWQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgbGVuZ3RoIHRvIHNjYWxlIHRoZSB2ZWN0b3IgdG8uIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ8VmVjMn0gRWl0aGVyIHRoZSBsZW5ndGgsIG9yIG5ldyBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiggbGVuZ3RoICkge1xyXG4gICAgICAgIGlmICggbGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW4gPSB0aGlzLmRvdCggdGhpcyApO1xyXG4gICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBsZW4gLSAxLjAgKSA8IEVQU0lMT04gKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVuO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCggbGVuICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKCkubXVsdFNjYWxhciggbGVuZ3RoICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHNxdWFyZWQgbGVuZ3RoIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLmxlbmd0aFNxdWFyZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kb3QoIHRoaXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHZlY3RvciBjb21wb25lbnRzIG1hdGNoIHRob3NlIG9mIGEgcHJvdmlkZWQgdmVjdG9yLlxyXG4gICAgICogQW4gb3B0aW9uYWwgZXBzaWxvbiB2YWx1ZSBtYXkgYmUgcHJvdmlkZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIHRlc3QgZXF1YWxpdHkgd2l0aC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlcHNpbG9uIC0gVGhlIGVwc2lsb24gdmFsdWUuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2guXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIHZhciB4ID0gdGhhdC54ICE9PSB1bmRlZmluZWQgPyB0aGF0LnggOiB0aGF0WzBdLFxyXG4gICAgICAgICAgICB5ID0gdGhhdC55ICE9PSB1bmRlZmluZWQgPyB0aGF0LnkgOiB0aGF0WzFdO1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggPT09IHggfHwgTWF0aC5hYnMoIHRoaXMueCAtIHggKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnkgPT09IHkgfHwgTWF0aC5hYnMoIHRoaXMueSAtIHkgKSA8PSBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBWZWMyIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjMn0gVGhlIHZlY3RvciBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1hZyA9IHRoaXMubGVuZ3RoKCk7XHJcbiAgICAgICAgaWYgKCBtYWcgPT09IDAgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdDYW5ub3Qgbm9ybWFsaXplIGEgdmVjdG9yIG9mIHplcm8gbGVuZ3RoJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKFxyXG4gICAgICAgICAgICB0aGlzLnggLyBtYWcsXHJcbiAgICAgICAgICAgIHRoaXMueSAvIG1hZyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHVuc2lnbmVkIGFuZ2xlIGJldHdlZW4gdGhpcyBhbmdsZSBhbmQgdGhlIGFyZ3VtZW50IGluIHJhZGlhbnMuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIG1lYXN1cmUgdGhlIGFuZ2xlIGZyb20uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHVuc2lnbmVkIGFuZ2xlIGluIHJhZGlhbnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLnVuc2lnbmVkQW5nbGUgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB2YXIgeCA9IHRoYXQueCAhPT0gdW5kZWZpbmVkID8gdGhhdC54IDogdGhhdFswXTtcclxuICAgICAgICB2YXIgeSA9IHRoYXQueSAhPT0gdW5kZWZpbmVkID8gdGhhdC55IDogdGhhdFsxXTtcclxuICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKCB5LCB4ICkgLSBNYXRoLmF0YW4yKCB0aGlzLnksIHRoaXMueCApO1xyXG4gICAgICAgIGlmIChhbmdsZSA8IDApIHtcclxuICAgICAgICAgICAgYW5nbGUgKz0gMiAqIE1hdGguUEk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhbmdsZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIFZlYzIgb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBBIHJhbmRvbSB2ZWN0b3Igb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFZlYzIucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMueCArICcsICcgKyB0aGlzLnk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSB2ZWN0b3IgYXMgYW4gYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gWyB0aGlzLngsIHRoaXMueSBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlYzI7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBFUFNJTE9OID0gcmVxdWlyZSgnLi9FcHNpbG9uJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBWZWMzIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBWZWMzXHJcbiAgICAgKiBAY2xhc3NkZXNjIEEgdGhyZWUgY29tcG9uZW50IHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVmVjMygpIHtcclxuICAgICAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBvciBWZWNOIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJndW1lbnQgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudC54IHx8IGFyZ3VtZW50WzBdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50LnkgfHwgYXJndW1lbnRbMV0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gYXJndW1lbnQueiB8fCBhcmd1bWVudFsyXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCBjb21wb25lbnQgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSBhcmd1bWVudHNbMl07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgVmVjMyB3aXRoIGVhY2ggY29tcG9uZW50IG5lZ2F0ZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgbmVnYXRlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCB2ZWN0b3IgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWMzXHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzdW0uXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSB0aGF0IC0gVGhlIHZlY3RvciB0byBhZGQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSBzdW0gb2YgdGhlIHR3byB2ZWN0b3JzLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggKyB0aGF0WzBdLCB0aGlzLnkgKyB0aGF0WzFdLCB0aGlzLnogKyB0aGF0WzJdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54ICsgdGhhdC54LCB0aGlzLnkgKyB0aGF0LnksIHRoaXMueiArIHRoYXQueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0aGUgcHJvdmlkZWQgdmVjdG9yIGFyZ3VtZW50IGZyb20gdGhlIHZlY3RvciwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBWZWMzIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGRpZmZlcmVuY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSAtIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSBkaWZmZXJlbmNlIG9mIHRoZSB0d28gdmVjdG9ycy5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54IC0gdGhhdFswXSwgdGhpcy55IC0gdGhhdFsxXSwgdGhpcy56IC0gdGhhdFsyXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMueCAtIHRoYXQueCwgdGhpcy55IC0gdGhhdC55LCB0aGlzLnogLSB0aGF0LnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSB2ZWN0b3Igd2l0aCB0aGUgcHJvdmlkZWQgc2NhbGFyIGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgVmVjM1xyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBtdWx0aXBseSB0aGUgdmVjdG9yIGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUubXVsdFNjYWxhciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54ICogdGhhdCwgdGhpcy55ICogdGhhdCwgdGhpcy56ICogdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERpdmlkZXMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCBzY2FsYXIgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWMzXHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIGRpdmlkZSB0aGUgdmVjdG9yIGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUuZGl2U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggLyB0aGF0LCB0aGlzLnkgLyB0aGF0LCB0aGlzLnogLyB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgZG90IHByb2R1Y3Qgb2YgdGhlIHZlY3RvciBhbmQgdGhlIHByb3ZpZGVkXHJcbiAgICAgKiB2ZWN0b3IgYXJndW1lbnQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSAtIFRoZSBvdGhlciB2ZWN0b3IgYXJndW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGRvdCBwcm9kdWN0LlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdFswXSApICsgKCB0aGlzLnkgKiB0aGF0WzFdICkgKyAoIHRoaXMueiAqIHRoYXRbMl0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdC54ICkgKyAoIHRoaXMueSAqIHRoYXQueSApICsgKCB0aGlzLnogKiB0aGF0LnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHRoZSB2ZWN0b3IgYW5kIHRoZSBwcm92aWRlZFxyXG4gICAgICogdmVjdG9yIGFyZ3VtZW50LlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gLSBUaGUgb3RoZXIgdmVjdG9yIGFyZ3VtZW50LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSAyRCBjcm9zcyBwcm9kdWN0LlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5jcm9zcyA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgICAgICAoIHRoaXMueSAqIHRoYXRbMl0gKSAtICggdGhhdFsxXSAqIHRoaXMueiApLFxyXG4gICAgICAgICAgICAgICAgKC10aGlzLnggKiB0aGF0WzJdICkgKyAoIHRoYXRbMF0gKiB0aGlzLnogKSxcclxuICAgICAgICAgICAgICAgICggdGhpcy54ICogdGhhdFsxXSApIC0gKCB0aGF0WzBdICogdGhpcy55ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKFxyXG4gICAgICAgICAgICAoIHRoaXMueSAqIHRoYXQueiApIC0gKCB0aGF0LnkgKiB0aGlzLnogKSxcclxuICAgICAgICAgICAgKC10aGlzLnggKiB0aGF0LnogKSArICggdGhhdC54ICogdGhpcy56ICksXHJcbiAgICAgICAgICAgICggdGhpcy54ICogdGhhdC55ICkgLSAoIHRoYXQueCAqIHRoaXMueSApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgbm8gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgc2NhbGFyIGxlbmd0aCBvZlxyXG4gICAgICogdGhlIHZlY3Rvci4gSWYgYW4gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIGEgbmV3XHJcbiAgICAgKiBWZWMzIHNjYWxlZCB0byB0aGUgcHJvdmlkZWQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgbGVuZ3RoIHRvIHNjYWxlIHRoZSB2ZWN0b3IgdG8uIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ8VmVjM30gRWl0aGVyIHRoZSBsZW5ndGgsIG9yIG5ldyBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiggbGVuZ3RoICkge1xyXG4gICAgICAgIGlmICggbGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW4gPSB0aGlzLmRvdCggdGhpcyApO1xyXG4gICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBsZW4gLSAxLjAgKSA8IEVQU0lMT04gKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVuO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCggbGVuICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKCkubXVsdFNjYWxhciggbGVuZ3RoICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHNxdWFyZWQgbGVuZ3RoIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLmxlbmd0aFNxdWFyZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kb3QoIHRoaXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHZlY3RvciBjb21wb25lbnRzIG1hdGNoIHRob3NlIG9mIGEgcHJvdmlkZWQgdmVjdG9yLlxyXG4gICAgICogQW4gb3B0aW9uYWwgZXBzaWxvbiB2YWx1ZSBtYXkgYmUgcHJvdmlkZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSB0aGF0IC0gVGhlIHZlY3RvciB0byB0ZXN0IGVxdWFsaXR5IHdpdGguXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvbiAtIFRoZSBlcHNpbG9uIHZhbHVlLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZlY3RvciBjb21wb25lbnRzIG1hdGNoLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICB2YXIgeCA9IHRoYXQueCAhPT0gdW5kZWZpbmVkID8gdGhhdC54IDogdGhhdFswXSxcclxuICAgICAgICAgICAgeSA9IHRoYXQueSAhPT0gdW5kZWZpbmVkID8gdGhhdC55IDogdGhhdFsxXSxcclxuICAgICAgICAgICAgeiA9IHRoYXQueiAhPT0gdW5kZWZpbmVkID8gdGhhdC56IDogdGhhdFsyXTtcclxuICAgICAgICBlcHNpbG9uID0gZXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMCA6IGVwc2lsb247XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy54ID09PSB4IHx8IE1hdGguYWJzKCB0aGlzLnggLSB4ICkgPD0gZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgICggdGhpcy55ID09PSB5IHx8IE1hdGguYWJzKCB0aGlzLnkgLSB5ICkgPD0gZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgICggdGhpcy56ID09PSB6IHx8IE1hdGguYWJzKCB0aGlzLnogLSB6ICkgPD0gZXBzaWxvbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgVmVjMyBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSB2ZWN0b3Igb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtYWcgPSB0aGlzLmxlbmd0aCgpO1xyXG4gICAgICAgIGlmICggbWFnID09PSAwICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnQ2Fubm90IG5vcm1hbGl6ZSBhIHZlY3RvciBvZiB6ZXJvIGxlbmd0aCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgdGhpcy54IC8gbWFnLFxyXG4gICAgICAgICAgICB0aGlzLnkgLyBtYWcsXHJcbiAgICAgICAgICAgIHRoaXMueiAvIG1hZyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIGEgcGxhbmUgbm9ybWFsLCByZXR1cm5zIHRoZSBwcm9qZWN0aW9uIG9mIHRoZSB2ZWN0b3Igb250byB0aGUgcGxhbmUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSBub3JtYWwgLSBUaGUgcGxhbmUgbm9ybWFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSB1bnNpZ25lZCBhbmdsZSBpbiByYWRpYW5zLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5wcm9qZWN0T250b1BsYW5lID0gIGZ1bmN0aW9uKCBuICkge1xyXG4gICAgICAgIHZhciBkaXN0ID0gdGhpcy5kb3QoIG4gKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdWIoIG4ubXVsdFNjYWxhciggZGlzdCApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdW5zaWduZWQgYW5nbGUgYmV0d2VlbiB0aGlzIGFuZ2xlIGFuZCB0aGUgYXJndW1lbnQsIHByb2plY3RlZFxyXG4gICAgICogb250byBhIHBsYW5lLCBpbiByYWRpYW5zLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gbWVhc3VyZSB0aGUgYW5nbGUgZnJvbS5cclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSBub3JtYWwgLSBUaGUgcmVmZXJlbmNlIHZlY3RvciB0byBtZWFzdXJlIHRoZVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gb2YgdGhlIGFuZ2xlLiBJZiBub3QgcHJvdmlkZWQgd2lsbFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2UgYS5jcm9zcyggYiApLiAoT3B0aW9uYWwpXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHVuc2lnbmVkIGFuZ2xlIGluIHJhZGlhbnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLnVuc2lnbmVkQW5nbGUgPSBmdW5jdGlvbiggdGhhdCwgbm9ybWFsICkge1xyXG4gICAgICAgIHZhciBhID0gdGhpcztcclxuICAgICAgICB2YXIgYiA9IG5ldyBWZWMzKCB0aGF0ICk7XHJcbiAgICAgICAgdmFyIGNyb3NzID0gYS5jcm9zcyggYiApO1xyXG4gICAgICAgIHZhciBuID0gbmV3IFZlYzMoIG5vcm1hbCB8fCBjcm9zcyApO1xyXG4gICAgICAgIHZhciBwYSA9IGEucHJvamVjdE9udG9QbGFuZSggbiApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciBwYiA9IGIucHJvamVjdE9udG9QbGFuZSggbiApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHZhciBkb3QgPSBwYS5kb3QoIHBiICk7XHJcblxyXG4gICAgICAgIC8vIGZhc3RlciwgbGVzcyByb2J1ZXN0XHJcbiAgICAgICAgLy92YXIgbmRvdCA9IE1hdGgubWF4KCAtMSwgTWF0aC5taW4oIDEsIGRvdCApICk7XHJcbiAgICAgICAgLy92YXIgYW5nbGUgPSBNYXRoLmFjb3MoIG5kb3QgKTtcclxuXHJcbiAgICAgICAgLy8gc2xvd2VyLCBidXQgbW9yZSByb2J1c3RcclxuICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKCBwYS5jcm9zcyggcGIgKS5sZW5ndGgoKSwgZG90ICk7XHJcblxyXG4gICAgICAgIGlmICggbi5kb3QoIGNyb3NzICkgPCAwICkge1xyXG4gICAgICAgICAgICBpZiAoIGFuZ2xlID49IE1hdGguUEkgKiAwLjUgKSB7XHJcbiAgICAgICAgICAgICAgICBhbmdsZSA9IE1hdGguUEkgKyBNYXRoLlBJIC0gYW5nbGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhbmdsZSA9IDIgKiBNYXRoLlBJIC0gYW5nbGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFuZ2xlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gVmVjMyBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IEEgcmFuZG9tIHZlY3RvciBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqL1xyXG4gICAgVmVjMy5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKS5ub3JtYWxpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy54ICsgJywgJyArIHRoaXMueSArICcsICcgKyB0aGlzLno7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSB2ZWN0b3IgYXMgYW4gYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gWyB0aGlzLngsIHRoaXMueSwgdGhpcy56IF07XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gVmVjMztcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIEVQU0lMT04gPSByZXF1aXJlKCcuL0Vwc2lsb24nKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIFZlYzQgb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIFZlYzRcclxuICAgICAqIEBjbGFzc2Rlc2MgQSBmb3VyIGNvbXBvbmVudCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFZlYzQoKSB7XHJcbiAgICAgICAgc3dpdGNoICggYXJndW1lbnRzLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgLy8gYXJyYXkgb3IgVmVjTiBhcmd1bWVudFxyXG4gICAgICAgICAgICAgICAgdmFyIGFyZ3VtZW50ID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gYXJndW1lbnQueCB8fCBhcmd1bWVudFswXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudC55IHx8IGFyZ3VtZW50WzFdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IGFyZ3VtZW50LnogfHwgYXJndW1lbnRbMl0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ID0gYXJndW1lbnQudyB8fCBhcmd1bWVudFszXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCBjb21wb25lbnQgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSBhcmd1bWVudHNbMl07XHJcbiAgICAgICAgICAgICAgICB0aGlzLncgPSBhcmd1bWVudHNbM10gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLncgPSAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IFZlYzQgd2l0aCBlYWNoIGNvbXBvbmVudCBuZWdhdGVkLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIG5lZ2F0ZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoIC10aGlzLngsIC10aGlzLnksIC10aGlzLnosIC10aGlzLncgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSB2ZWN0b3Igd2l0aCB0aGUgcHJvdmlkZWQgdmVjdG9yIGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgVmVjNFxyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc3VtLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIHN1bSBvZiB0aGUgdHdvIHZlY3RvcnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggKyB0aGF0WzBdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55ICsgdGhhdFsxXSxcclxuICAgICAgICAgICAgICAgIHRoaXMueiArIHRoYXRbMl0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLncgKyB0aGF0WzNdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy54ICsgdGhhdC54LFxyXG4gICAgICAgICAgICB0aGlzLnkgKyB0aGF0LnksXHJcbiAgICAgICAgICAgIHRoaXMueiArIHRoYXQueixcclxuICAgICAgICAgICAgdGhpcy53ICsgdGhhdC53ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBwcm92aWRlZCB2ZWN0b3IgYXJndW1lbnQgZnJvbSB0aGUgdmVjdG9yLCByZXR1cm5pbmcgYSBuZXcgVmVjNFxyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZS5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWM0fEFycmF5fSAtIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSBkaWZmZXJlbmNlIG9mIHRoZSB0d28gdmVjdG9ycy5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgICAgIHRoaXMueCAtIHRoYXRbMF0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgLSB0aGF0WzFdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy56IC0gdGhhdFsyXSxcclxuICAgICAgICAgICAgICAgIHRoaXMudyAtIHRoYXRbM10gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICB0aGlzLnggLSB0aGF0LngsXHJcbiAgICAgICAgICAgIHRoaXMueSAtIHRoYXQueSxcclxuICAgICAgICAgICAgdGhpcy56IC0gdGhhdC56LFxyXG4gICAgICAgICAgICB0aGlzLncgLSB0aGF0LncgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSB2ZWN0b3Igd2l0aCB0aGUgcHJvdmlkZWQgc2NhbGFyIGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgVmVjNFxyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBtdWx0aXBseSB0aGUgdmVjdG9yIGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBUaGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUubXVsdFNjYWxhciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy54ICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy55ICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy56ICogdGhhdCxcclxuICAgICAgICAgICAgdGhpcy53ICogdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERpdmlkZXMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCBzY2FsYXIgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWM0XHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIGRpdmlkZSB0aGUgdmVjdG9yIGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBUaGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUuZGl2U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICB0aGlzLnggLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLnkgLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLnogLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLncgLyB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgZG90IHByb2R1Y3Qgb2YgdGhlIHZlY3RvciBhbmQgdGhlIHByb3ZpZGVkXHJcbiAgICAgKiB2ZWN0b3IgYXJndW1lbnQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjNHxBcnJheX0gLSBUaGUgb3RoZXIgdmVjdG9yIGFyZ3VtZW50LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBkb3QgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXRbMF0gKSArXHJcbiAgICAgICAgICAgICAgICAoIHRoaXMueSAqIHRoYXRbMV0gKSArXHJcbiAgICAgICAgICAgICAgICAoIHRoaXMueiAqIHRoYXRbMl0gKSArXHJcbiAgICAgICAgICAgICAgICAoIHRoaXMudyAqIHRoYXRbM10gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdC54ICkgK1xyXG4gICAgICAgICAgICAoIHRoaXMueSAqIHRoYXQueSApICtcclxuICAgICAgICAgICAgKCB0aGlzLnogKiB0aGF0LnogKSArXHJcbiAgICAgICAgICAgICggdGhpcy53ICogdGhhdC53ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgbm8gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgc2NhbGFyIGxlbmd0aCBvZlxyXG4gICAgICogdGhlIHZlY3Rvci4gSWYgYW4gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIGEgbmV3XHJcbiAgICAgKiBWZWM0IHNjYWxlZCB0byB0aGUgcHJvdmlkZWQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgbGVuZ3RoIHRvIHNjYWxlIHRoZSB2ZWN0b3IgdG8uIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ8VmVjNH0gRWl0aGVyIHRoZSBsZW5ndGgsIG9yIG5ldyBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiggbGVuZ3RoICkge1xyXG4gICAgICAgIGlmICggbGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW4gPSB0aGlzLmRvdCggdGhpcyApO1xyXG4gICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBsZW4gLSAxLjAgKSA8IEVQU0lMT04gKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVuO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCggbGVuICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKCkubXVsdFNjYWxhciggbGVuZ3RoICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHNxdWFyZWQgbGVuZ3RoIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLmxlbmd0aFNxdWFyZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kb3QoIHRoaXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHZlY3RvciBjb21wb25lbnRzIG1hdGNoIHRob3NlIG9mIGEgcHJvdmlkZWQgdmVjdG9yLlxyXG4gICAgICogQW4gb3B0aW9uYWwgZXBzaWxvbiB2YWx1ZSBtYXkgYmUgcHJvdmlkZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGF0LnggIT09IHVuZGVmaW5lZCA/IHRoYXQueCA6IHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHkgPSB0aGF0LnkgIT09IHVuZGVmaW5lZCA/IHRoYXQueSA6IHRoYXRbMV0sXHJcbiAgICAgICAgICAgIHogPSB0aGF0LnogIT09IHVuZGVmaW5lZCA/IHRoYXQueiA6IHRoYXRbMl0sXHJcbiAgICAgICAgICAgIHcgPSB0aGF0LncgIT09IHVuZGVmaW5lZCA/IHRoYXQudyA6IHRoYXRbM107XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCA9PT0geCB8fCBNYXRoLmFicyggdGhpcy54IC0geCApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueSA9PT0geSB8fCBNYXRoLmFicyggdGhpcy55IC0geSApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueiA9PT0geiB8fCBNYXRoLmFicyggdGhpcy56IC0geiApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMudyA9PT0gdyB8fCBNYXRoLmFicyggdGhpcy53IC0gdyApIDw9IGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IFZlYzQgb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBUaGUgdmVjdG9yIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWFnID0gdGhpcy5sZW5ndGgoKTtcclxuICAgICAgICBpZiAoIG1hZyA9PT0gMCApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCBub3JtYWxpemUgYSB2ZWN0b3Igb2YgemVybyBsZW5ndGgnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMueCAvIG1hZyxcclxuICAgICAgICAgICAgdGhpcy55IC8gbWFnLFxyXG4gICAgICAgICAgICB0aGlzLnogLyBtYWcsXHJcbiAgICAgICAgICAgIHRoaXMudyAvIG1hZyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gVmVjNCBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IEEgcmFuZG9tIHZlY3RvciBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqL1xyXG4gICAgVmVjNC5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKS5ub3JtYWxpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy54ICsgJywgJyArIHRoaXMueSArICcsICcgKyB0aGlzLnogKyAnLCAnICsgdGhpcy53O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgdmVjdG9yIGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFsgdGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53IF07XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gVmVjNDtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgTWF0MzM6IHJlcXVpcmUoJy4vTWF0MzMnKSxcbiAgICAgICAgTWF0NDQ6IHJlcXVpcmUoJy4vTWF0NDQnKSxcbiAgICAgICAgVmVjMjogcmVxdWlyZSgnLi9WZWMyJyksXG4gICAgICAgIFZlYzM6IHJlcXVpcmUoJy4vVmVjMycpLFxuICAgICAgICBWZWM0OiByZXF1aXJlKCcuL1ZlYzQnKSxcbiAgICAgICAgUXVhdGVybmlvbjogcmVxdWlyZSgnLi9RdWF0ZXJuaW9uJyksXG4gICAgICAgIFRyYW5zZm9ybTogcmVxdWlyZSgnLi9UcmFuc2Zvcm0nKSxcbiAgICAgICAgVHJpYW5nbGU6IHJlcXVpcmUoJy4vVHJpYW5nbGUnKVxuICAgIH07XG5cbn0oKSk7XG4iXX0=
