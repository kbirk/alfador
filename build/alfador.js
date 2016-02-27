(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.alfador = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {

    'use strict';

    var Vec3 = require( './Vec3' );

    /**
     * Instantiates a Mat33 object.
     * @class Mat33
     * @classdesc A 3x3 column-major matrix.
     */
    function Mat33( that ) {
        if ( that ) {
            if ( that.data instanceof Array ) {
                if ( that.data.length === 9 ) {
                    // copy Mat33 data by value
                    this.data = that.data.slice( 0 );
                } else {
                    // copy Mat44 data by value, account for index differences
                    this.data = [
                        that.data[0], that.data[1], that.data[2],
                        that.data[4], that.data[5], that.data[6],
                        that.data[8], that.data[9], that.data[10]
                    ];
                }
            } else if ( that.length === 9 ) {
                // copy array by value, use prototype to cast array buffers
                this.data = Array.prototype.slice.call( that );
            } else {
                return Mat33.identity();
            }
        } else {
            return Mat33.identity();
        }
    }

    /**
     * Returns a column of the matrix as a Vec3 object.
     * @memberof Mat33
     *
     * @param {number} index - The 0-based column index.
     *
     * @returns {Vec3} The column vector.
     */
    Mat33.prototype.row = function( index ) {
        return new Vec3(
            this.data[0+index],
            this.data[3+index],
            this.data[6+index] );
    };

    /**
     * Returns a row of the matrix as a Vec3 object.
     * @memberof Mat33
     *
     * @param {number} index - The 0-based row index.
     *
     * @returns {Vec3} The column vector.
     */
    Mat33.prototype.col = function( index ) {
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
        return new Mat33([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
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
        /*Builds the rotation matrix that rotates one vector into another.

        The generated rotation matrix will rotate the vector from into
        the Vector3<var> to. from and to must be unit Vector3<var>s!

        This method is based on the code from:

        Tomas Mller, John Hughes
        Efficiently Building a Matrix to Rotate One Vector to Another
        Journal of Graphics Tools, 4(4):1-4, 1999
        */
        var EPSILON = 0.000001,
            from = new Vec3( fromVec ).normalize(),
            to = new Vec3( toVec ).normalize(),
            e = from.dot( to ),
            f = Math.abs( e ),
            that = new Mat33(),
            x, u, v,
            fx, fy, fz,
            ux, uz,
            c1, c2, c3;
        if ( f > ( 1.0-EPSILON ) ) {
            // 'from' and 'to' almost parallel
            // nearly orthogonal
            fx = Math.abs( from.x );
            fy = Math.abs( from.y );
            fz = Math.abs( from.z );
            if (fx < fy) {
                if (fx<fz) {
                    x = new Vec3( 1, 0, 0 );
                } else {
                    x = new Vec3( 0, 0, 1 );
                }
            } else {
                if (fy < fz) {
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
            that.data[0] = - c1*u.x*u.x - c2*v.x*v.x + c3*v.x*u.x;
            that.data[3] = - c1*u.x*u.y - c2*v.x*v.y + c3*v.x*u.y;
            that.data[6] = - c1*u.x*u.z - c2*v.x*v.z + c3*v.x*u.z;
            that.data[1] = - c1*u.y*u.x - c2*v.y*v.x + c3*v.y*u.x;
            that.data[4] = - c1*u.y*u.y - c2*v.y*v.y + c3*v.y*u.y;
            that.data[7] = - c1*u.y*u.z - c2*v.y*v.z + c3*v.y*u.z;
            that.data[2] = - c1*u.z*u.x - c2*v.z*v.x + c3*v.z*u.x;
            that.data[5] = - c1*u.z*u.y - c2*v.z*v.y + c3*v.z*u.y;
            that.data[8] = - c1*u.z*u.z - c2*v.z*v.z + c3*v.z*u.z;
            that.data[0] += 1.0;
            that.data[4] += 1.0;
            that.data[8] += 1.0;
        } else {
            // the most common case, unless 'from'='to', or 'to'=-'from'
            v = from.cross( to );
            u = 1.0 / ( 1.0 + e );    // optimization by Gottfried Chen
            ux = u * v.x;
            uz = u * v.z;
            c1 = ux * v.y;
            c2 = ux * v.z;
            c3 = uz * v.y;
            that.data[0] = e + ux * v.x;
            that.data[3] = c1 - v.z;
            that.data[6] = c2 + v.y;
            that.data[1] = c1 + v.z;
            that.data[4] = e + u * v.y * v.y;
            that.data[7] = c3 - v.x;
            that.data[2] = c2 - v.y;
            that.data[5] = c3 + v.x;
            that.data[8] = e + uz * v.z;
        }
        return that;
    };

    /**
     * Adds the matrix with the provided matrix argument, returning a new Ma33
     * object.
     * @memberof Mat33
     *
     * @param {Mat33|Mat44|Array} that - The matrix to add.
     *
     * @returns {Mat33} The sum of the two matrices.
     */
    Mat33.prototype.add = function( that ) {
        var mat = new Mat33( that ),
            i;
        for ( i=0; i<9; i++ ) {
            mat.data[i] += this.data[i];
        }
        return mat;
    };

    /**
     * Subtracts the provided matrix argument from the matrix, returning a new
     * Mat33 object.
     * @memberof Mat33
     *
     * @param {Mat33|Mat44|Array} that - The matrix to add.
     *
     * @returns {Mat33} The difference of the two matrices.
     */
    Mat33.prototype.sub = function( that ) {
        var mat = new Mat33( that ),
            i;
        for ( i=0; i<9; i++ ) {
            mat.data[i] = this.data[i] - mat.data[i];
        }
        return mat;
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
    Mat33.prototype.multVector = function( that ) {
        // ensure 'that' is a Vec3
        // it is safe to only cast if Array since the .w of a Vec4 is not used
        that = ( that instanceof Array ) ? new Vec3( that ) : that;
        return new Vec3({
            x: this.data[0] * that.x + this.data[3] * that.y + this.data[6] * that.z,
            y: this.data[1] * that.x + this.data[4] * that.y + this.data[7] * that.z,
            z: this.data[2] * that.x + this.data[5] * that.y + this.data[8] * that.z
        });
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
        var mat = new Mat33(),
            i;
        for ( i=0; i<9; i++ ) {
            mat.data[i] = this.data[i] * that;
        }
        return mat;
    };

    /**
     * Multiplies the provded matrix argument by the matrix, returning a new
     * Mat33 object.
     * @memberof Mat33
     *
     * @param {Mat33|Mat44} - The matrix to be multiplied by the matrix.
     *
     * @returns {Mat33} The resulting matrix.
     */
    Mat33.prototype.multMatrix = function( that ) {
        var mat = new Mat33(),
            i;
        // ensure 'that' is a Mat33
        // must check if Array or Mat33
        if ( ( that.data && that.data.length === 16 ) ||
            that instanceof Array ) {
            that = new Mat33( that );
        }
        for ( i=0; i<3; i++ ) {
            mat.data[i] = this.data[i] * that.data[0] + this.data[i+3] * that.data[1] + this.data[i+6] * that.data[2];
            mat.data[i+3] = this.data[i] * that.data[3] + this.data[i+3] * that.data[4] + this.data[i+6] * that.data[5];
            mat.data[i+6] = this.data[i] * that.data[6] + this.data[i+3] * that.data[7] + this.data[i+6] * that.data[8];
        }
        return mat;
    };

    /**
     * Multiplies the provded argument by the matrix.
     * @memberof Mat33
     *
     * @param {Vec3|Vec4|Mat33|Mat44|Array|number} - The argument to be multiplied by the matrix.
     *
     * @returns {Mat33|Vec3} The resulting product.
     */
    Mat33.prototype.mult = function( that ) {
        if ( typeof that === 'number' ) {
            // scalar
            return this.multScalar( that );
        } else if ( that instanceof Array ) {
            // array
            if ( that.length === 3 || that.length === 4 ) {
                return this.multVector( that );
            } else {
                return this.multMatrix( that );
            }
        }
        // vector
        if ( that.x !== undefined &&
            that.y !== undefined &&
            that.z !== undefined ) {
            return this.multVector( that );
        }
        // matrix
        return this.multMatrix( that );
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
    Mat33.prototype.div = function( that ) {
        var mat = new Mat33(),
            i;
        for ( i=0; i<9; i++ ) {
            mat.data[i] = this.data[i] / that;
        }
        return mat;
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
        var i;
        epsilon = epsilon === undefined ? 0 : epsilon;
        for ( i=0; i<9; i++ ) {
            // awkward comparison logic is required to ensure equality passes if
            // corresponding are both undefined, NaN, or Infinity
            if ( !(
                ( this.data[i] === that.data[i] ) ||
                ( Math.abs( this.data[i] - that.data[i] ) <= epsilon )
               ) ) {
                return false;
            }
        }
        return true;
    };

    /**
     * Returns the transpose of the matrix.
     * @memberof Mat33
     *
     * @returns {Mat33} The transposed matrix.
     */
    Mat33.prototype.transpose = function() {
        var trans = new Mat33(), i;
        for ( i = 0; i < 3; i++ ) {
            trans.data[i*3]     = this.data[i];
            trans.data[(i*3)+1] = this.data[i+3];
            trans.data[(i*3)+2] = this.data[i+6];
        }
        return trans;
    };

    /**
     * Returns the inverse of the matrix.
     * @memberof Mat33
     *
     * @returns {Mat33} The inverted matrix.
     */
    Mat33.prototype.inverse = function() {
        var inv = new Mat33(), det;
        // compute inverse
        // row 1
        inv.data[0] = this.data[4]*this.data[8] - this.data[7]*this.data[5];
        inv.data[3] = -this.data[3]*this.data[8] + this.data[6]*this.data[5];
        inv.data[6] = this.data[3]*this.data[7] - this.data[6]*this.data[4];
        // row 2
        inv.data[1] = -this.data[1]*this.data[8] + this.data[7]*this.data[2];
        inv.data[4] = this.data[0]*this.data[8] - this.data[6]*this.data[2];
        inv.data[7] = -this.data[0]*this.data[7] + this.data[6]*this.data[1];
        // row 3
        inv.data[2] = this.data[1]*this.data[5] - this.data[4]*this.data[2];
        inv.data[5] = -this.data[0]*this.data[5] + this.data[3]*this.data[2];
        inv.data[8] = this.data[0]*this.data[4] - this.data[3]*this.data[1];
        // calculate determinant
        det = this.data[0]*inv.data[0] + this.data[1]*inv.data[3] + this.data[2]*inv.data[6];
        // return
        return inv.mult( 1 / det );
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
        var rot = Mat33.rotationRadians( Math.random() * 360, Vec3.random() ),
            scale = Mat33.scale( Math.random() * 10 );
        return rot.mult( scale );
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

},{"./Vec3":7}],2:[function(require,module,exports){
(function() {

    'use strict';

    var Vec3 = require( './Vec3' ),
        Vec4 = require( './Vec4' ),
        Mat33 = require( './Mat33' );

    /**
     * Instantiates a Mat44 object.
     * @class Mat44
     * @classdesc A 4x4 column-major matrix.
     */
    function Mat44( that ) {
        if ( that ) {
            if ( that.data instanceof Array ) {
                if ( that.data.length === 16 ) {
                    // copy Mat44 data by value
                    this.data = that.data.slice( 0 );
                } else {
                    // copy Mat33 data by value, account for index differences
                    this.data = [
                        that.data[0], that.data[1], that.data[2], 0,
                        that.data[3], that.data[4], that.data[5], 0,
                        that.data[6], that.data[7], that.data[8], 0,
                        0, 0, 0, 1 ];
                }
            } else if ( that.length === 16 ) {
                 // copy array by value, use prototype to cast array buffers
                this.data = Array.prototype.slice.call( that );
            } else {
                return Mat44.identity();
            }
        } else {
            return Mat44.identity();
        }
    }

    /**
     * Returns a column of the matrix as a Vec4 object.
     * @memberof Mat44
     *
     * @param {number} index - The 0-based column index.
     *
     * @returns {Vec4} The column vector.
     */
    Mat44.prototype.row = function( index ) {
        return new Vec4(
            this.data[0+index],
            this.data[4+index],
            this.data[8+index],
            this.data[12+index] );
    };

    /**
     * Returns a row of the matrix as a Vec4 object.
     * @memberof Mat44
     *
     * @param {number} index - The 0-based row index.
     *
     * @returns {Vec4} The column vector.
     */
    Mat44.prototype.col = function( index ) {
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
        return new Mat44([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1 ]);
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
                0, 0, 0, 1 ]);
        } else if ( scale instanceof Array ) {
            return new Mat44([
                scale[0], 0, 0, 0,
                0, scale[1], 0, 0,
                0, 0, scale[2], 0,
                0, 0, 0, 1 ]);
        }
        return new Mat44([
            scale.x, 0, 0, 0,
            0, scale.y, 0, 0,
            0, 0, scale.z, 0,
            0, 0, 0, 1 ]);
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
                translation[0], translation[1], translation[2], 1 ]);
        }
        return new Mat44([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            translation.x, translation.y, translation.z, 1 ]);
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
        return new Mat44( Mat33.rotationDegrees( angle, axis ) );
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
        return new Mat44( Mat33.rotationRadians( angle, axis ) );
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
        return new Mat44( Mat33.rotationFromTo( fromVec, toVec ) );
    };

    /**
     * Adds the matrix with the provided matrix argument, returning a new Ma33
     * object.
     * @memberof Mat44
     *
     * @param {Mat33|Mat44|Array} that - The matrix to add.
     *
     * @returns {Mat44} The sum of the two matrices.
     */
    Mat44.prototype.add = function( that ) {
        var mat = new Mat44( that ),
            i;
        for ( i=0; i<16; i++ ) {
            mat.data[i] += this.data[i];
        }
        return mat;
    };

    /**
     * Subtracts the provided matrix argument from the matrix, returning a new
     * Mat44 object.
     * @memberof Mat44
     *
     * @param {Mat33|Mat44|Array} that - The matrix to add.
     *
     * @returns {Mat44} The difference of the two matrices.
     */
    Mat44.prototype.sub = function( that ) {
        var mat = new Mat44( that ),
            i;
        for ( i=0; i<16; i++ ) {
            mat.data[i] = this.data[i] - mat.data[i];
        }
        return mat;
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
    Mat44.prototype.multVector3 = function( that ) {
        // ensure 'that' is a Vec3
        // it is safe to only cast if Array since Vec4 has own method
        that = ( that instanceof Array ) ? new Vec3( that ) : that;
        return new Vec3({
            x: this.data[0] * that.x +
                this.data[4] * that.y +
                this.data[8] * that.z + this.data[12],
            y: this.data[1] * that.x +
                this.data[5] * that.y +
                this.data[9] * that.z + this.data[13],
            z: this.data[2] * that.x +
                this.data[6] * that.y +
                this.data[10] * that.z + this.data[14]
        });
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
    Mat44.prototype.multVector4 = function( that ) {
        // ensure 'that' is a Vec4
        // it is safe to only cast if Array since Vec3 has own method
        that = ( that instanceof Array ) ? new Vec4( that ) : that;
        return new Vec4({
            x: this.data[0] * that.x +
                this.data[4] * that.y +
                this.data[8] * that.z +
                this.data[12] * that.w,
            y: this.data[1] * that.x +
                this.data[5] * that.y +
                this.data[9] * that.z +
                this.data[13] * that.w,
            z: this.data[2] * that.x +
                this.data[6] * that.y +
                this.data[10] * that.z +
                this.data[14] * that.w,
            w: this.data[3] * that.x +
                this.data[7] * that.y +
                this.data[11] * that.z +
                this.data[15] * that.w
        });
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
        var mat = new Mat44(),
            i;
        for ( i=0; i<16; i++ ) {
            mat.data[i] = this.data[i] * that;
        }
        return mat;
    };

    /**
     * Multiplies the provded matrix argument by the matrix, returning a new
     * Mat44 object.
     * @memberof Mat44
     *
     * @param {Mat33|Mat44|Array} - The matrix to be multiplied by the matrix.
     *
     * @returns {Mat44} The resulting matrix.
     */
    Mat44.prototype.multMatrix = function( that ) {
        var mat = new Mat44(),
            i;
        // ensure 'that' is a Mat44
        // must check if Array or Mat44
        if ( ( that.data && that.data.length === 9 ) ||
            that instanceof Array ) {
            that = new Mat44( that );
        }
        for ( i=0; i<4; i++ ) {
            mat.data[i] = this.data[i] * that.data[0] +
                this.data[i+4] * that.data[1] +
                this.data[i+8] * that.data[2] +
                this.data[i+12] * that.data[3];
            mat.data[i+4] = this.data[i] * that.data[4] +
                this.data[i+4] * that.data[5] +
                this.data[i+8] * that.data[6] +
                this.data[i+12] * that.data[7];
            mat.data[i+8] = this.data[i] * that.data[8] +
                this.data[i+4] * that.data[9] +
                this.data[i+8] * that.data[10] +
                this.data[i+12] * that.data[11];
            mat.data[i+12] = this.data[i] * that.data[12] +
                this.data[i+4] * that.data[13] +
                this.data[i+8] * that.data[14] +
                this.data[i+12] * that.data[15];
        }
        return mat;
    };

    /**
     * Multiplies the provded argument by the matrix.
     * @memberof Mat44
     *
     * @param {Vec3|Vec4|Mat33|Mat44|Array|number} - The argument to be multiplied by the matrix.
     *
     * @returns {Mat44|Vec4} The resulting product.
     */
    Mat44.prototype.mult = function( that ) {
        if ( typeof that === 'number' ) {
            // scalar
            return this.multScalar( that );
        } else if ( that instanceof Array ) {
            // array
            if ( that.length === 3 ) {
                return this.multVector3( that );
            } else if ( that.length === 4 ) {
                return this.multVector4( that );
            } else {
                return this.multMatrix( that );
            }
        }
        // vector
        if ( that.x !== undefined &&
            that.y !== undefined &&
            that.z !== undefined ) {
            if ( that.w !== undefined ) {
                // vec4
                return this.multVector4( that );
            }
            //vec3
            return this.multVector3( that );
        }
        // matrix
        return this.multMatrix( that );
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
    Mat44.prototype.div = function( that ) {
        var mat = new Mat44(), i;
        for ( i=0; i<16; i++ ) {
            mat.data[i] = this.data[i] / that;
        }
        return mat;
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
        var i;
        epsilon = epsilon === undefined ? 0 : epsilon;
        for ( i=0; i<16; i++ ) {
            // awkward comparison logic is required to ensure equality passes if
            // corresponding are both undefined, NaN, or Infinity
            if ( !(
                ( this.data[i] === that.data[i] ) ||
                ( Math.abs( this.data[i] - that.data[i] ) <= epsilon )
               ) ) {
                return false;
            }
        }
        return true;
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
        var trans = new Mat44(), i;
        for ( i = 0; i < 4; i++ ) {
            trans.data[i*4] = this.data[i];
            trans.data[(i*4)+1] = this.data[i+4];
            trans.data[(i*4)+2] = this.data[i+8];
            trans.data[(i*4)+3] = this.data[i+12];
        }
        return trans;
    };

    /**
     * Returns the inverse of the matrix.
     * @memberof Mat44
     *
     * @returns {Mat44} The inverted matrix.
     */
    Mat44.prototype.inverse = function() {
        var inv = new Mat44(), det;
        // compute inverse
        // row 1
        inv.data[0] = this.data[5]*this.data[10]*this.data[15] -
            this.data[5]*this.data[11]*this.data[14] -
            this.data[9]*this.data[6]*this.data[15] +
            this.data[9]*this.data[7]*this.data[14] +
            this.data[13]*this.data[6]*this.data[11] -
            this.data[13]*this.data[7]*this.data[10];
        inv.data[4] = -this.data[4]*this.data[10]*this.data[15] +
            this.data[4]*this.data[11]*this.data[14] +
            this.data[8]*this.data[6]*this.data[15] -
            this.data[8]*this.data[7]*this.data[14] -
            this.data[12]*this.data[6]*this.data[11] +
            this.data[12]*this.data[7]*this.data[10];
        inv.data[8] = this.data[4]*this.data[9]*this.data[15] -
            this.data[4]*this.data[11]*this.data[13] -
            this.data[8]*this.data[5]*this.data[15] +
            this.data[8]*this.data[7]*this.data[13] +
            this.data[12]*this.data[5]*this.data[11] -
            this.data[12]*this.data[7]*this.data[9];
        inv.data[12] = -this.data[4]*this.data[9]*this.data[14] +
            this.data[4]*this.data[10]*this.data[13] +
            this.data[8]*this.data[5]*this.data[14] -
            this.data[8]*this.data[6]*this.data[13] -
            this.data[12]*this.data[5]*this.data[10] +
            this.data[12]*this.data[6]*this.data[9];
        // row 2
        inv.data[1] = -this.data[1]*this.data[10]*this.data[15] +
            this.data[1]*this.data[11]*this.data[14] +
            this.data[9]*this.data[2]*this.data[15] -
            this.data[9]*this.data[3]*this.data[14] -
            this.data[13]*this.data[2]*this.data[11] +
            this.data[13]*this.data[3]*this.data[10];
        inv.data[5] = this.data[0]*this.data[10]*this.data[15] -
            this.data[0]*this.data[11]*this.data[14] -
            this.data[8]*this.data[2]*this.data[15] +
            this.data[8]*this.data[3]*this.data[14] +
            this.data[12]*this.data[2]*this.data[11] -
            this.data[12]*this.data[3]*this.data[10];
        inv.data[9] = -this.data[0]*this.data[9]*this.data[15] +
            this.data[0]*this.data[11]*this.data[13] +
            this.data[8]*this.data[1]*this.data[15] -
            this.data[8]*this.data[3]*this.data[13] -
            this.data[12]*this.data[1]*this.data[11] +
            this.data[12]*this.data[3]*this.data[9];
        inv.data[13] = this.data[0]*this.data[9]*this.data[14] -
            this.data[0]*this.data[10]*this.data[13] -
            this.data[8]*this.data[1]*this.data[14] +
            this.data[8]*this.data[2]*this.data[13] +
            this.data[12]*this.data[1]*this.data[10] -
            this.data[12]*this.data[2]*this.data[9];
        // row 3
        inv.data[2] = this.data[1]*this.data[6]*this.data[15] -
            this.data[1]*this.data[7]*this.data[14] -
            this.data[5]*this.data[2]*this.data[15] +
            this.data[5]*this.data[3]*this.data[14] +
            this.data[13]*this.data[2]*this.data[7] -
            this.data[13]*this.data[3]*this.data[6];
        inv.data[6] = -this.data[0]*this.data[6]*this.data[15] +
            this.data[0]*this.data[7]*this.data[14] +
            this.data[4]*this.data[2]*this.data[15] -
            this.data[4]*this.data[3]*this.data[14] -
            this.data[12]*this.data[2]*this.data[7] +
            this.data[12]*this.data[3]*this.data[6];
        inv.data[10] = this.data[0]*this.data[5]*this.data[15] -
            this.data[0]*this.data[7]*this.data[13] -
            this.data[4]*this.data[1]*this.data[15] +
            this.data[4]*this.data[3]*this.data[13] +
            this.data[12]*this.data[1]*this.data[7] -
            this.data[12]*this.data[3]*this.data[5];
        inv.data[14] = -this.data[0]*this.data[5]*this.data[14] +
            this.data[0]*this.data[6]*this.data[13] +
            this.data[4]*this.data[1]*this.data[14] -
            this.data[4]*this.data[2]*this.data[13] -
            this.data[12]*this.data[1]*this.data[6] +
            this.data[12]*this.data[2]*this.data[5];
        // row 4
        inv.data[3] = -this.data[1]*this.data[6]*this.data[11] +
            this.data[1]*this.data[7]*this.data[10] +
            this.data[5]*this.data[2]*this.data[11] -
            this.data[5]*this.data[3]*this.data[10] -
            this.data[9]*this.data[2]*this.data[7] +
            this.data[9]*this.data[3]*this.data[6];
        inv.data[7] = this.data[0]*this.data[6]*this.data[11] -
            this.data[0]*this.data[7]*this.data[10] -
            this.data[4]*this.data[2]*this.data[11] +
            this.data[4]*this.data[3]*this.data[10] +
            this.data[8]*this.data[2]*this.data[7] -
            this.data[8]*this.data[3]*this.data[6];
        inv.data[11] = -this.data[0]*this.data[5]*this.data[11] +
            this.data[0]*this.data[7]*this.data[9] +
            this.data[4]*this.data[1]*this.data[11] -
            this.data[4]*this.data[3]*this.data[9] -
            this.data[8]*this.data[1]*this.data[7] +
            this.data[8]*this.data[3]*this.data[5];
        inv.data[15] = this.data[0]*this.data[5]*this.data[10] -
            this.data[0]*this.data[6]*this.data[9] -
            this.data[4]*this.data[1]*this.data[10] +
            this.data[4]*this.data[2]*this.data[9] +
            this.data[8]*this.data[1]*this.data[6] -
            this.data[8]*this.data[2]*this.data[5];
        // calculate determinant
        det = this.data[0]*inv.data[0] +
            this.data[1]*inv.data[4] +
            this.data[2]*inv.data[8] +
            this.data[3]*inv.data[12];
        return inv.mult( 1 / det );
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
        var rot = Mat44.rotationRadians( Math.random() * 360, Vec3.random() ),
            scale = Mat44.scale( Math.random() * 10 ),
            translation = Mat44.translation( Vec3.random() );
        return translation.mult( rot.mult( scale ) );
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

},{"./Mat33":1,"./Vec3":7,"./Vec4":8}],3:[function(require,module,exports){
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
        return this;
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
    Quaternion.prototype.mult = function( that ) {
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
            r = this.mult( vq ).mult( this.inverse() );
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

},{"./Mat33":1,"./Vec3":7}],4:[function(require,module,exports){
(function() {

    'use strict';

    var Vec3 = require( './Vec3' ),
        Mat33 = require( './Mat33' ),
        Mat44 = require( './Mat44' );

    /**
     * Instantiates a Transform object.
     * @class Transform
     * @classdesc A transform representing an orientation, position, and scale.
     */
    function Transform( that ) {
        that = that || {};
        if ( that._up &&
            that._forward &&
            that._left &&
            that._origin &&
            that._scale ) {
            // copy Transform by value
            this._up = that.up();
            this._forward = that.forward();
            this._left = that.left();
            this._origin = that.origin();
            this._scale = that.scale();
        } else if ( that.data && that.data instanceof Array ) {
            // Mat33 or Mat44, extract transform components from Mat44
            that = that.decompose();
            this._up = that.up;
            this._forward = that.forward;
            this._left = that.left;
            this._scale = that.scale;
            this._origin = that.origin || new Vec3( 0, 0, 0 );
        } else {
            // default to identity
            this._up = that.up ? new Vec3( that.up ).normalize() : new Vec3( 0, 1, 0 );
            this._forward = that.forward ? new Vec3( that.forward ).normalize() : new Vec3( 0, 0, 1 );
            this._left = that.left ? new Vec3( that.left ).normalize() : this._up.cross( this._forward ).normalize();
            this.origin( that.origin || new Vec3( 0, 0, 0 ) );
            this.scale( that.scale || new Vec3( 1, 1, 1 ) );
        }
        return this;
    }

    /**
     * Returns an identity transform.
     * @memberof Transform
     *
     * @returns {Transform} An identity transform.
     */
    Transform.identity = function() {
        return new Transform({
            up: new Vec3( 0, 1, 0 ),
            forward: new Vec3( 0, 0, 1 ),
            left: new Vec3( 1, 0, 0 ),
            origin: new Vec3( 0, 0, 0 ),
            scale: new Vec3( 1, 1, 1 )
        });
    };

    /**
     * If an argument is provided, sets the origin, otherwise returns the
     * origin by value.
     * @memberof Transform
     *
     * @param {Vec3|Array} origin - The origin. Optional.
     *
     * @returns {Vec3|Transform} The origin, or the transform for chaining.
     */
    Transform.prototype.origin = function( origin ) {
        if ( origin ) {
            this._origin = new Vec3( origin );
            return this;
        }
        return new Vec3( this._origin );
    };

    /**
     * If an argument is provided, sets the forward vector, otherwise returns
     * the forward vector by value. While setting, a rotation matrix from the
     * orignal forward vector to the new is used to rotate all other axes.
     * @memberof Transform
     *
     * @param {Vec3|Array} origin - The forward vector. Optional.
     *
     * @returns {Vec3|Transform} The forward vector, or the transform for chaining.
     */
    Transform.prototype.forward = function( forward ) {
        if ( forward ) {
            if ( forward instanceof Array ) {
                forward = new Vec3( forward ).normalize();
            } else {
                forward = forward.normalize();
            }
            var rot = Mat33.rotationFromTo( this._forward, forward );
            this._forward = forward;
            this._up = rot.mult( this._up ).normalize();
            this._left = rot.mult( this._left ).normalize();
            return this;
        }
        return new Vec3( this._forward );
    };

    /**
     * If an argument is provided, sets the up vector, otherwise returns
     * the up vector by value. While setting, a rotation matrix from the
     * orignal up vector to the new is used to rotate all other axes.
     * @memberof Transform
     *
     * @param {Vec3|Array} origin - The up vector. Optional.
     *
     * @returns {Vec3|Transform} The up vector, or the transform for chaining.
     */
    Transform.prototype.up = function( up ) {
        if ( up ) {
            if ( up instanceof Array ) {
                up = new Vec3( up ).normalize();
            } else {
                up = up.normalize();
            }
            var rot = Mat33.rotationFromTo( this._up, up );
            this._forward = rot.mult( this._forward ).normalize();
            this._up = up;
            this._left = rot.mult( this._left ).normalize();
            return this;
        }
        return new Vec3( this._up );
    };

    /**
     * If an argument is provided, sets the left vector, otherwise returns
     * the left vector by value. While setting, a rotation matrix from the
     * orignal left vector to the new is used to rotate all other axes.
     * @memberof Transform
     *
     * @param {Vec3|Array} origin - The left vector. Optional.
     *
     * @returns {Vec3|Transform} The left vector, or the transform for chaining.
     */
    Transform.prototype.left = function( left ) {
        if ( left ) {
            if ( left instanceof Array ) {
                left = new Vec3( left ).normalize();
            } else {
                left = left.normalize();
            }
            var rot = Mat33.rotationFromTo( this._left, left );
            this._forward = rot.mult( this._forward ).normalize();
            this._up = rot.mult( this._up ).normalize();
            this._left = left;
            return this;
        }
        return new Vec3( this._left );
    };

    /**
     * If an argument is provided, sets the sacle, otherwise returns the
     * scale by value.
     * @memberof Transform
     *
     * @param {Vec3|Array|number} scale - The scale. Optional.
     *
     * @returns {Vec3|Transform} The scale, or the transform for chaining.
     */
    Transform.prototype.scale = function( scale ) {
        if ( scale ) {
            if ( typeof scale === 'number' ) {
                this._scale = new Vec3( scale, scale, scale );
            } else {
                this._scale = new Vec3( scale );
            }
            return this;
        }
        return this._scale;
    };

    /**
     * Multiplies the transform by another transform or matrix.
     * @memberof Transform
     *
     * @param {Mat33|Mat44|Transform|Array} that - The transform to multiply with.
     *
     * @returns {Transform} The resulting transform.
     */
    Transform.prototype.mult = function( that ) {
        if ( that instanceof Array ||
            that.data instanceof Array ) {
            // matrix or array
            return new Transform( this.matrix().mult( that ) );
        }
        // transform
        return new Transform( this.matrix().mult( that.matrix() ) );
    };

    /**
     * Returns the transform's scale matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The scale matrix.
     */
    Transform.prototype.scaleMatrix = function() {
        return Mat44.scale( this._scale );
    };

    /**
     * Returns the transform's rotation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The rotation matrix.
     */
    Transform.prototype.rotationMatrix = function() {
        return new Mat44([
            this._left.x, this._left.y, this._left.z, 0,
            this._up.x, this._up.y, this._up.z, 0,
            this._forward.x, this._forward.y, this._forward.z, 0,
            0, 0, 0, 1 ]);
    };

    /**
     * Returns the transform's translation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The translation matrix.
     */
    Transform.prototype.translationMatrix = function() {
        return Mat44.translation( this._origin );
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
            .mult( this.rotationMatrix() )
            .mult( this.scaleMatrix() );
    };

    /**
     * Returns the inverse of the transform's scale matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse scale matrix.
     */
    Transform.prototype.inverseScaleMatrix = function() {
        return Mat44.scale( new Vec3(
            1/this._scale.x,
            1/this._scale.y,
            1/this._scale.z ) );
    };

    /**
     * Returns the inverse of the transform's rotation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse rotation matrix.
     */
    Transform.prototype.inverseRotationMatrix = function() {
        return new Mat44([
            this._left.x, this._up.x, this._forward.x, 0,
            this._left.y, this._up.y, this._forward.y, 0,
            this._left.z, this._up.z, this._forward.z, 0,
            0, 0, 0, 1 ]);
    };

    /**
     * Returns the inverse of the transform's translation matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The inverse translation matrix.
     */
    Transform.prototype.inverseTranslationMatrix = function() {
        return Mat44.translation( this._origin.negate() );
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
            .mult( this.inverseRotationMatrix() )
            .mult( this.inverseTranslationMatrix() );
    };

    /**
     * Returns the transform's view matrix.
     * @memberof Transform
     *
     * @returns {Mat44} The view matrix.
     */
    Transform.prototype.viewMatrix = function() {
        var nOrigin = this._origin.negate(),
            right = this._left.negate(),
            backward = this._forward.negate();
        return new Mat44([
            right.x, this._up.x, backward.x, 0,
            right.y, this._up.y, backward.y, 0,
            right.z, this._up.z, backward.z, 0,
            nOrigin.dot( right ), nOrigin.dot( this._up ), nOrigin.dot( backward ), 1 ]);
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
        this._origin = this._origin.add( translation );
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
        this._origin = this._origin.add( this._left.mult( translation.x ) )
            .add( this._up.mult( translation.y ) )
            .add( this._forward.mult( translation.z ) );
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
        this._up = rot.mult( this._up );
        this._forward = rot.mult( this._forward );
        this._left = rot.mult( this._left );
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
        return this.rotateWorldDegrees( angle, this.rotationMatrix().mult( axis ) );
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
        return this.rotateWorldRadians( angle, this.rotationMatrix().mult( axis ) );
    };

    /**
     * Transforms the vector or matrix argument from the transforms local space
     * to the world space.
     * @memberof Transform
     *
     * @param {Vec3|Vec4|Mat33|Mat44} that - The argument to transform.
     * @param {boolean} ignoreScale - Whether or not to include the scale in the transform.
     * @param {boolean} ignoreRotation - Whether or not to include the rotation in the transform.
     * @param {boolean} ignoreTranslation - Whether or not to include the translation in the transform.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.localToWorld = function( that, ignoreScale, ignoreRotation, ignoreTranslation ) {
        var mat = new Mat44();
        if ( !ignoreScale ) {
            mat = this.scaleMatrix().mult( mat );
        }
        if ( !ignoreRotation ) {
            mat = this.rotationMatrix().mult( mat );
        }
        if ( !ignoreTranslation ) {
            mat = this.translationMatrix().mult( mat );
        }
        return mat.mult( that );
    };

    /**
     * Transforms the vector or matrix argument from world space to the
     * transforms local space.
     * @memberof Transform
     *
     * @param {Vec3|Vec4|Mat33|Mat44} that - The argument to transform.
     * @param {boolean} ignoreScale - Whether or not to include the scale in the transform.
     * @param {boolean} ignoreRotation - Whether or not to include the rotation in the transform.
     * @param {boolean} ignoreTranslation - Whether or not to include the translation in the transform.
     *
     * @returns {Transform} The transform for chaining.
     */
    Transform.prototype.worldToLocal = function( that, ignoreScale, ignoreRotation, ignoreTranslation ) {
        var mat = new Mat44();
        if ( !ignoreTranslation ) {
            mat = this.inverseTranslationMatrix().mult( mat );
        }
        if ( !ignoreRotation ) {
            mat = this.inverseRotationMatrix().mult( mat );
        }
        if ( !ignoreScale ) {
            mat = this.inverseScaleMatrix().mult( mat );
        }
        return mat.mult( that );
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
        return this._origin.equals( that.origin(), epsilon ) &&
            this._forward.equals( that.forward(), epsilon ) &&
            this._up.equals( that.up(), epsilon ) &&
            this._left.equals( that.left(), epsilon ) &&
            this._scale.equals( that.scale(), epsilon );
    };

    /**
     * Returns a transform with a random origin, orientation, and scale.
     * @memberof Transform
     *
     * @returns {Transform} The random transform.
     */
    Transform.random = function() {
        return new Transform()
            .origin( Vec3.random() )
            .forward( Vec3.random() )
            .scale( Vec3.random() );
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

},{"./Mat33":1,"./Mat44":2,"./Vec3":7}],5:[function(require,module,exports){
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
        return a.add( ab.mult( t ) );
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
            .div( 3 );
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
        if (u.dot( v ) < 0.0 ) {
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
        var position = o.add( d.mult( t ) );
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
            centroid = a.add( b ).add( c ).div( 3 ),
            aCent = a.sub( centroid ),
            bCent = b.sub( centroid ),
            cCent = c.sub( centroid ),
            aDist = aCent.length(),
            bDist = bCent.length(),
            cDist = cCent.length(),
            maxDist = Math.max( Math.max( aDist, bDist ), cDist ),
            scale = 1 / maxDist;
        return new Triangle(
            aCent.mult( scale ),
            bCent.mult( scale ),
            cCent.mult( scale ) );
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

},{"./Vec3":7}],6:[function(require,module,exports){
(function() {

    'use strict';

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
        return this;
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
    Vec2.prototype.mult = function( that ) {
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
    Vec2.prototype.div = function( that ) {
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
            return Math.sqrt( this.dot( this ) );
        }
        return this.normalize().mult( length );
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

},{}],7:[function(require,module,exports){
(function() {

    'use strict';

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
        return this;
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
    Vec3.prototype.mult = function( that ) {
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
    Vec3.prototype.div = function( that ) {
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
            return Math.sqrt( this.dot( this ) );
        }
        return this.normalize().mult( length );
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
        return this.sub( n.mult( dist ) );
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
        var ndot = Math.max( -1, Math.min( 1, dot ) );

        // faster, less robuest
        var angle = Math.acos( ndot );

        // slower, but more robust
        //var angle = Math.atan2( pa.cross( pb ).length(), dot );

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

},{}],8:[function(require,module,exports){
(function() {

    'use strict';

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
                this.w = arguments[3];
                break;
            default:
                this.x = 0.0;
                this.y = 0.0;
                this.z = 0.0;
                this.w = 0.0;
                break;
        }
        return this;
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
    Vec4.prototype.mult = function( that ) {
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
    Vec4.prototype.div = function( that ) {
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
            return Math.sqrt( this.dot( this ) );
        }
        return this.normalize().mult( length );
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

},{}],9:[function(require,module,exports){
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

},{"./Mat33":1,"./Mat44":2,"./Quaternion":3,"./Transform":4,"./Triangle":5,"./Vec2":6,"./Vec3":7,"./Vec4":8}]},{},[9])(9)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTWF0MzMuanMiLCJzcmMvTWF0NDQuanMiLCJzcmMvUXVhdGVybmlvbi5qcyIsInNyYy9UcmFuc2Zvcm0uanMiLCJzcmMvVHJpYW5nbGUuanMiLCJzcmMvVmVjMi5qcyIsInNyYy9WZWMzLmpzIiwic3JjL1ZlYzQuanMiLCJzcmMvZXhwb3J0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3b0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBWZWMzID0gcmVxdWlyZSggJy4vVmVjMycgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBNYXQzM1xyXG4gICAgICogQGNsYXNzZGVzYyBBIDN4MyBjb2x1bW4tbWFqb3IgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBNYXQzMyggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgKSB7XHJcbiAgICAgICAgICAgIGlmICggdGhhdC5kYXRhIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHRoYXQuZGF0YS5sZW5ndGggPT09IDkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29weSBNYXQzMyBkYXRhIGJ5IHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhhdC5kYXRhLnNsaWNlKCAwICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvcHkgTWF0NDQgZGF0YSBieSB2YWx1ZSwgYWNjb3VudCBmb3IgaW5kZXggZGlmZmVyZW5jZXNcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZGF0YVswXSwgdGhhdC5kYXRhWzFdLCB0aGF0LmRhdGFbMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZGF0YVs0XSwgdGhhdC5kYXRhWzVdLCB0aGF0LmRhdGFbNl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZGF0YVs4XSwgdGhhdC5kYXRhWzldLCB0aGF0LmRhdGFbMTBdXHJcbiAgICAgICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmICggdGhhdC5sZW5ndGggPT09IDkgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb3B5IGFycmF5IGJ5IHZhbHVlLCB1c2UgcHJvdG90eXBlIHRvIGNhc3QgYXJyYXkgYnVmZmVyc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIHRoYXQgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBNYXQzMy5pZGVudGl0eSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdDMzLmlkZW50aXR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGNvbHVtbiBvZiB0aGUgbWF0cml4IGFzIGEgVmVjMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgMC1iYXNlZCBjb2x1bW4gaW5kZXguXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSBjb2x1bW4gdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUucm93ID0gZnVuY3Rpb24oIGluZGV4ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMytpbmRleF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2K2luZGV4XSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByb3cgb2YgdGhlIG1hdHJpeCBhcyBhIFZlYzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIDAtYmFzZWQgcm93IGluZGV4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgY29sdW1uIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLmNvbCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4KjNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMStpbmRleCozXSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzIraW5kZXgqM10gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpZGVudGl0eSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSBpZGVudGl5IG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMuaWRlbnRpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl8bnVtYmVyfSBzY2FsZSAtIFRoZSBzY2FsYXIgb3IgdmVjdG9yIHNjYWxpbmcgZmFjdG9yLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHNjYWxlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMuc2NhbGUgPSBmdW5jdGlvbiggc2NhbGUgKSB7XHJcbiAgICAgICAgaWYgKCB0eXBlb2Ygc2NhbGUgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgICAgIHNjYWxlLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgc2NhbGUsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCBzY2FsZVxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCBzY2FsZSBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgICAgIHNjYWxlWzBdLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgc2NhbGVbMV0sIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCBzY2FsZVsyXVxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgIHNjYWxlLngsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIHNjYWxlLnksIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIHNjYWxlLnpcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IGRlZmluZWQgYnkgYW4gYXhpcyBhbmQgYW4gYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiBkZWdyZWVzLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucm90YXRpb25EZWdyZWVzID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvdGF0aW9uUmFkaWFucyggYW5nbGUqTWF0aC5QSS8xODAsIGF4aXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IGRlZmluZWQgYnkgYW4gYXhpcyBhbmQgYW4gYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucm90YXRpb25SYWRpYW5zID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIGlmICggYXhpcyBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICBheGlzID0gbmV3IFZlYzMoIGF4aXMgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gemVybyB2ZWN0b3IsIHJldHVybiBpZGVudGl0eVxyXG4gICAgICAgIGlmICggYXhpcy5sZW5ndGhTcXVhcmVkKCkgPT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkZW50aXR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBub3JtQXhpcyA9IGF4aXMubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIHggPSBub3JtQXhpcy54LFxyXG4gICAgICAgICAgICB5ID0gbm9ybUF4aXMueSxcclxuICAgICAgICAgICAgeiA9IG5vcm1BeGlzLnosXHJcbiAgICAgICAgICAgIG1vZEFuZ2xlID0gKCBhbmdsZSA+IDAgKSA/IGFuZ2xlICUgKDIqTWF0aC5QSSkgOiBhbmdsZSAlICgtMipNYXRoLlBJKSxcclxuICAgICAgICAgICAgcyA9IE1hdGguc2luKCBtb2RBbmdsZSApLFxyXG4gICAgICAgICAgICBjID0gTWF0aC5jb3MoIG1vZEFuZ2xlICksXHJcbiAgICAgICAgICAgIHh4ID0geCAqIHgsXHJcbiAgICAgICAgICAgIHl5ID0geSAqIHksXHJcbiAgICAgICAgICAgIHp6ID0geiAqIHosXHJcbiAgICAgICAgICAgIHh5ID0geCAqIHksXHJcbiAgICAgICAgICAgIHl6ID0geSAqIHosXHJcbiAgICAgICAgICAgIHp4ID0geiAqIHgsXHJcbiAgICAgICAgICAgIHhzID0geCAqIHMsXHJcbiAgICAgICAgICAgIHlzID0geSAqIHMsXHJcbiAgICAgICAgICAgIHpzID0geiAqIHMsXHJcbiAgICAgICAgICAgIG9uZV9jID0gMS4wIC0gYztcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFtcclxuICAgICAgICAgICAgKG9uZV9jICogeHgpICsgYywgKG9uZV9jICogeHkpICsgenMsIChvbmVfYyAqIHp4KSAtIHlzLFxyXG4gICAgICAgICAgICAob25lX2MgKiB4eSkgLSB6cywgKG9uZV9jICogeXkpICsgYywgKG9uZV9jICogeXopICsgeHMsXHJcbiAgICAgICAgICAgIChvbmVfYyAqIHp4KSArIHlzLCAob25lX2MgKiB5eikgLSB4cywgKG9uZV9jICogenopICsgY1xyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByb3RhdGlvbiBtYXRyaXggdG8gcm90YXRlIGEgdmVjdG9yIGZyb20gb25lIGRpcmVjdGlvbiB0b1xyXG4gICAgICogYW5vdGhlci5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM30gZnJvbSAtIFRoZSBzdGFydGluZyBkaXJlY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IHRvIC0gVGhlIGVuZGluZyBkaXJlY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgbWF0cml4IHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnJvdGF0aW9uRnJvbVRvID0gZnVuY3Rpb24oIGZyb21WZWMsIHRvVmVjICkge1xyXG4gICAgICAgIC8qQnVpbGRzIHRoZSByb3RhdGlvbiBtYXRyaXggdGhhdCByb3RhdGVzIG9uZSB2ZWN0b3IgaW50byBhbm90aGVyLlxyXG5cclxuICAgICAgICBUaGUgZ2VuZXJhdGVkIHJvdGF0aW9uIG1hdHJpeCB3aWxsIHJvdGF0ZSB0aGUgdmVjdG9yIGZyb20gaW50b1xyXG4gICAgICAgIHRoZSBWZWN0b3IzPHZhcj4gdG8uIGZyb20gYW5kIHRvIG11c3QgYmUgdW5pdCBWZWN0b3IzPHZhcj5zIVxyXG5cclxuICAgICAgICBUaGlzIG1ldGhvZCBpcyBiYXNlZCBvbiB0aGUgY29kZSBmcm9tOlxyXG5cclxuICAgICAgICBUb21hcyBNbGxlciwgSm9obiBIdWdoZXNcclxuICAgICAgICBFZmZpY2llbnRseSBCdWlsZGluZyBhIE1hdHJpeCB0byBSb3RhdGUgT25lIFZlY3RvciB0byBBbm90aGVyXHJcbiAgICAgICAgSm91cm5hbCBvZiBHcmFwaGljcyBUb29scywgNCg0KToxLTQsIDE5OTlcclxuICAgICAgICAqL1xyXG4gICAgICAgIHZhciBFUFNJTE9OID0gMC4wMDAwMDEsXHJcbiAgICAgICAgICAgIGZyb20gPSBuZXcgVmVjMyggZnJvbVZlYyApLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICB0byA9IG5ldyBWZWMzKCB0b1ZlYyApLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBlID0gZnJvbS5kb3QoIHRvICksXHJcbiAgICAgICAgICAgIGYgPSBNYXRoLmFicyggZSApLFxyXG4gICAgICAgICAgICB0aGF0ID0gbmV3IE1hdDMzKCksXHJcbiAgICAgICAgICAgIHgsIHUsIHYsXHJcbiAgICAgICAgICAgIGZ4LCBmeSwgZnosXHJcbiAgICAgICAgICAgIHV4LCB1eixcclxuICAgICAgICAgICAgYzEsIGMyLCBjMztcclxuICAgICAgICBpZiAoIGYgPiAoIDEuMC1FUFNJTE9OICkgKSB7XHJcbiAgICAgICAgICAgIC8vICdmcm9tJyBhbmQgJ3RvJyBhbG1vc3QgcGFyYWxsZWxcclxuICAgICAgICAgICAgLy8gbmVhcmx5IG9ydGhvZ29uYWxcclxuICAgICAgICAgICAgZnggPSBNYXRoLmFicyggZnJvbS54ICk7XHJcbiAgICAgICAgICAgIGZ5ID0gTWF0aC5hYnMoIGZyb20ueSApO1xyXG4gICAgICAgICAgICBmeiA9IE1hdGguYWJzKCBmcm9tLnogKTtcclxuICAgICAgICAgICAgaWYgKGZ4IDwgZnkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmeDxmeikge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMSwgMCwgMCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbmV3IFZlYzMoIDAsIDAsIDEgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChmeSA8IGZ6KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBWZWMzKCAwLCAxLCAwICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMCwgMSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHUgPSB4LnN1YiggZnJvbSApO1xyXG4gICAgICAgICAgICB2ID0geC5zdWIoIHRvICk7XHJcbiAgICAgICAgICAgIGMxID0gMi4wIC8gdS5kb3QoIHUgKTtcclxuICAgICAgICAgICAgYzIgPSAyLjAgLyB2LmRvdCggdiApO1xyXG4gICAgICAgICAgICBjMyA9IGMxKmMyICogdS5kb3QoIHYgKTtcclxuICAgICAgICAgICAgLy8gc2V0IG1hdHJpeCBlbnRyaWVzXHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVswXSA9IC0gYzEqdS54KnUueCAtIGMyKnYueCp2LnggKyBjMyp2LngqdS54O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbM10gPSAtIGMxKnUueCp1LnkgLSBjMip2Lngqdi55ICsgYzMqdi54KnUueTtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzZdID0gLSBjMSp1LngqdS56IC0gYzIqdi54KnYueiArIGMzKnYueCp1Lno7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVsxXSA9IC0gYzEqdS55KnUueCAtIGMyKnYueSp2LnggKyBjMyp2LnkqdS54O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbNF0gPSAtIGMxKnUueSp1LnkgLSBjMip2Lnkqdi55ICsgYzMqdi55KnUueTtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzddID0gLSBjMSp1LnkqdS56IC0gYzIqdi55KnYueiArIGMzKnYueSp1Lno7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVsyXSA9IC0gYzEqdS56KnUueCAtIGMyKnYueip2LnggKyBjMyp2LnoqdS54O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbNV0gPSAtIGMxKnUueip1LnkgLSBjMip2Lnoqdi55ICsgYzMqdi56KnUueTtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzhdID0gLSBjMSp1LnoqdS56IC0gYzIqdi56KnYueiArIGMzKnYueip1Lno7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVswXSArPSAxLjA7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVs0XSArPSAxLjA7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVs4XSArPSAxLjA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGhlIG1vc3QgY29tbW9uIGNhc2UsIHVubGVzcyAnZnJvbSc9J3RvJywgb3IgJ3RvJz0tJ2Zyb20nXHJcbiAgICAgICAgICAgIHYgPSBmcm9tLmNyb3NzKCB0byApO1xyXG4gICAgICAgICAgICB1ID0gMS4wIC8gKCAxLjAgKyBlICk7ICAgIC8vIG9wdGltaXphdGlvbiBieSBHb3R0ZnJpZWQgQ2hlblxyXG4gICAgICAgICAgICB1eCA9IHUgKiB2Lng7XHJcbiAgICAgICAgICAgIHV6ID0gdSAqIHYuejtcclxuICAgICAgICAgICAgYzEgPSB1eCAqIHYueTtcclxuICAgICAgICAgICAgYzIgPSB1eCAqIHYuejtcclxuICAgICAgICAgICAgYzMgPSB1eiAqIHYueTtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzBdID0gZSArIHV4ICogdi54O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbM10gPSBjMSAtIHYuejtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzZdID0gYzIgKyB2Lnk7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVsxXSA9IGMxICsgdi56O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbNF0gPSBlICsgdSAqIHYueSAqIHYueTtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzddID0gYzMgLSB2Lng7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVsyXSA9IGMyIC0gdi55O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbNV0gPSBjMyArIHYueDtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzhdID0gZSArIHV6ICogdi56O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhhdDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBtYXRyaXggd2l0aCB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgTWEzM1xyXG4gICAgICogb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQzM3xNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIHN1bSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQzMyggdGhhdCApLFxyXG4gICAgICAgICAgICBpO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTw5OyBpKysgKSB7XHJcbiAgICAgICAgICAgIG1hdC5kYXRhW2ldICs9IHRoaXMuZGF0YVtpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJ0cmFjdHMgdGhlIHByb3ZpZGVkIG1hdHJpeCBhcmd1bWVudCBmcm9tIHRoZSBtYXRyaXgsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogTWF0MzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQzM3xNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQzM30gVGhlIGRpZmZlcmVuY2Ugb2YgdGhlIHR3byBtYXRyaWNlcy5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBuZXcgTWF0MzMoIHRoYXQgKSxcclxuICAgICAgICAgICAgaTtcclxuICAgICAgICBmb3IgKCBpPTA7IGk8OTsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAtIG1hdC5kYXRhW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHByb3ZkZWQgdmVjdG9yIGFyZ3VtZW50IGJ5IHRoZSBtYXRyaXgsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogVmVjMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gLSBUaGUgdmVjdG9yIHRvIGJlIG11bHRpcGxpZWQgYnkgdGhlIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHJlc3VsdGluZyB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS5tdWx0VmVjdG9yID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlICd0aGF0JyBpcyBhIFZlYzNcclxuICAgICAgICAvLyBpdCBpcyBzYWZlIHRvIG9ubHkgY2FzdCBpZiBBcnJheSBzaW5jZSB0aGUgLncgb2YgYSBWZWM0IGlzIG5vdCB1c2VkXHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyBuZXcgVmVjMyggdGhhdCApIDogdGhhdDtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoe1xyXG4gICAgICAgICAgICB4OiB0aGlzLmRhdGFbMF0gKiB0aGF0LnggKyB0aGlzLmRhdGFbM10gKiB0aGF0LnkgKyB0aGlzLmRhdGFbNl0gKiB0aGF0LnosXHJcbiAgICAgICAgICAgIHk6IHRoaXMuZGF0YVsxXSAqIHRoYXQueCArIHRoaXMuZGF0YVs0XSAqIHRoYXQueSArIHRoaXMuZGF0YVs3XSAqIHRoYXQueixcclxuICAgICAgICAgICAgejogdGhpcy5kYXRhWzJdICogdGhhdC54ICsgdGhpcy5kYXRhWzVdICogdGhhdC55ICsgdGhpcy5kYXRhWzhdICogdGhhdC56XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyBhbGwgY29tcG9uZW50cyBvZiB0aGUgbWF0cml4IGJ5IHRoZSBwcm92ZGVkIHNjYWxhciBhcmd1bWVudCxcclxuICAgICAqIHJldHVybmluZyBhIG5ldyBNYXQzMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSBtYXRyaXggYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgcmVzdWx0aW5nIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLm11bHRTY2FsYXIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB2YXIgbWF0ID0gbmV3IE1hdDMzKCksXHJcbiAgICAgICAgICAgIGk7XHJcbiAgICAgICAgZm9yICggaT0wOyBpPDk7IGkrKyApIHtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaV0gPSB0aGlzLmRhdGFbaV0gKiB0aGF0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHByb3ZkZWQgbWF0cml4IGFyZ3VtZW50IGJ5IHRoZSBtYXRyaXgsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogTWF0MzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQzM3xNYXQ0NH0gLSBUaGUgbWF0cml4IHRvIGJlIG11bHRpcGxpZWQgYnkgdGhlIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByZXN1bHRpbmcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUubXVsdE1hdHJpeCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBuZXcgTWF0MzMoKSxcclxuICAgICAgICAgICAgaTtcclxuICAgICAgICAvLyBlbnN1cmUgJ3RoYXQnIGlzIGEgTWF0MzNcclxuICAgICAgICAvLyBtdXN0IGNoZWNrIGlmIEFycmF5IG9yIE1hdDMzXHJcbiAgICAgICAgaWYgKCAoIHRoYXQuZGF0YSAmJiB0aGF0LmRhdGEubGVuZ3RoID09PSAxNiApIHx8XHJcbiAgICAgICAgICAgIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgdGhhdCA9IG5ldyBNYXQzMyggdGhhdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKCBpPTA7IGk8MzsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAqIHRoYXQuZGF0YVswXSArIHRoaXMuZGF0YVtpKzNdICogdGhhdC5kYXRhWzFdICsgdGhpcy5kYXRhW2krNl0gKiB0aGF0LmRhdGFbMl07XHJcbiAgICAgICAgICAgIG1hdC5kYXRhW2krM10gPSB0aGlzLmRhdGFbaV0gKiB0aGF0LmRhdGFbM10gKyB0aGlzLmRhdGFbaSszXSAqIHRoYXQuZGF0YVs0XSArIHRoaXMuZGF0YVtpKzZdICogdGhhdC5kYXRhWzVdO1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpKzZdID0gdGhpcy5kYXRhW2ldICogdGhhdC5kYXRhWzZdICsgdGhpcy5kYXRhW2krM10gKiB0aGF0LmRhdGFbN10gKyB0aGlzLmRhdGFbaSs2XSAqIHRoYXQuZGF0YVs4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92ZGVkIGFyZ3VtZW50IGJ5IHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxNYXQzM3xNYXQ0NHxBcnJheXxudW1iZXJ9IC0gVGhlIGFyZ3VtZW50IHRvIGJlIG11bHRpcGxpZWQgYnkgdGhlIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN8VmVjM30gVGhlIHJlc3VsdGluZyBwcm9kdWN0LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUubXVsdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdHlwZW9mIHRoYXQgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICAvLyBzY2FsYXJcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdFNjYWxhciggdGhhdCApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgLy8gYXJyYXlcclxuICAgICAgICAgICAgaWYgKCB0aGF0Lmxlbmd0aCA9PT0gMyB8fCB0aGF0Lmxlbmd0aCA9PT0gNCApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRWZWN0b3IoIHRoYXQgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRNYXRyaXgoIHRoYXQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB2ZWN0b3JcclxuICAgICAgICBpZiAoIHRoYXQueCAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgICAgIHRoYXQueSAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgICAgIHRoYXQueiAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0VmVjdG9yKCB0aGF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1hdHJpeFxyXG4gICAgICAgIHJldHVybiB0aGlzLm11bHRNYXRyaXgoIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXZpZGVzIGFsbCBjb21wb25lbnRzIG9mIHRoZSBtYXRyaXggYnkgdGhlIHByb3ZkZWQgc2NhbGFyIGFyZ3VtZW50LFxyXG4gICAgICogcmV0dXJuaW5nIGEgbmV3IE1hdDMzIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gZGl2aWRlIHRoZSBtYXRyaXggYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgcmVzdWx0aW5nIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLmRpdiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBuZXcgTWF0MzMoKSxcclxuICAgICAgICAgICAgaTtcclxuICAgICAgICBmb3IgKCBpPTA7IGk8OTsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAvIHRoYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBhbGwgY29tcG9uZW50cyBtYXRjaCB0aG9zZSBvZiBhIHByb3ZpZGVkIG1hdHJpeC5cclxuICAgICAqIEFuIG9wdGlvbmFsIGVwc2lsb24gdmFsdWUgbWF5IGJlIHByb3ZpZGVkLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQzM3xBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaXggY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICBmb3IgKCBpPTA7IGk8OTsgaSsrICkge1xyXG4gICAgICAgICAgICAvLyBhd2t3YXJkIGNvbXBhcmlzb24gbG9naWMgaXMgcmVxdWlyZWQgdG8gZW5zdXJlIGVxdWFsaXR5IHBhc3NlcyBpZlxyXG4gICAgICAgICAgICAvLyBjb3JyZXNwb25kaW5nIGFyZSBib3RoIHVuZGVmaW5lZCwgTmFOLCBvciBJbmZpbml0eVxyXG4gICAgICAgICAgICBpZiAoICEoXHJcbiAgICAgICAgICAgICAgICAoIHRoaXMuZGF0YVtpXSA9PT0gdGhhdC5kYXRhW2ldICkgfHxcclxuICAgICAgICAgICAgICAgICggTWF0aC5hYnMoIHRoaXMuZGF0YVtpXSAtIHRoYXQuZGF0YVtpXSApIDw9IGVwc2lsb24gKVxyXG4gICAgICAgICAgICAgICApICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRyYW5zcG9zZSBvZiB0aGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDMzfSBUaGUgdHJhbnNwb3NlZCBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS50cmFuc3Bvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdHJhbnMgPSBuZXcgTWF0MzMoKSwgaTtcclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IDM7IGkrKyApIHtcclxuICAgICAgICAgICAgdHJhbnMuZGF0YVtpKjNdICAgICA9IHRoaXMuZGF0YVtpXTtcclxuICAgICAgICAgICAgdHJhbnMuZGF0YVsoaSozKSsxXSA9IHRoaXMuZGF0YVtpKzNdO1xyXG4gICAgICAgICAgICB0cmFucy5kYXRhWyhpKjMpKzJdID0gdGhpcy5kYXRhW2krNl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cmFucztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSBpbnZlcnRlZCBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnByb3RvdHlwZS5pbnZlcnNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGludiA9IG5ldyBNYXQzMygpLCBkZXQ7XHJcbiAgICAgICAgLy8gY29tcHV0ZSBpbnZlcnNlXHJcbiAgICAgICAgLy8gcm93IDFcclxuICAgICAgICBpbnYuZGF0YVswXSA9IHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbOF0gLSB0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzVdO1xyXG4gICAgICAgIGludi5kYXRhWzNdID0gLXRoaXMuZGF0YVszXSp0aGlzLmRhdGFbOF0gKyB0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzVdO1xyXG4gICAgICAgIGludi5kYXRhWzZdID0gdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs3XSAtIHRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbNF07XHJcbiAgICAgICAgLy8gcm93IDJcclxuICAgICAgICBpbnYuZGF0YVsxXSA9IC10aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzhdICsgdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsyXTtcclxuICAgICAgICBpbnYuZGF0YVs0XSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOF0gLSB0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzJdO1xyXG4gICAgICAgIGludi5kYXRhWzddID0gLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10gKyB0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzFdO1xyXG4gICAgICAgIC8vIHJvdyAzXHJcbiAgICAgICAgaW52LmRhdGFbMl0gPSB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzVdIC0gdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXTtcclxuICAgICAgICBpbnYuZGF0YVs1XSA9IC10aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzVdICsgdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsyXTtcclxuICAgICAgICBpbnYuZGF0YVs4XSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNF0gLSB0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzFdO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkZXRlcm1pbmFudFxyXG4gICAgICAgIGRldCA9IHRoaXMuZGF0YVswXSppbnYuZGF0YVswXSArIHRoaXMuZGF0YVsxXSppbnYuZGF0YVszXSArIHRoaXMuZGF0YVsyXSppbnYuZGF0YVs2XTtcclxuICAgICAgICAvLyByZXR1cm5cclxuICAgICAgICByZXR1cm4gaW52Lm11bHQoIDEgLyBkZXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWNvbXBvc2VzIHRoZSBtYXRyaXggaW50byB0aGUgY29ycmVzcG9uZGluZyB4LCB5LCBhbmQgeiBheGVzLCBhbG9uZyB3aXRoXHJcbiAgICAgKiBhIHNjYWxlLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIGRlY29tcG9zZWQgY29tcG9uZW50cyBvZiB0aGUgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuZGVjb21wb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbDAgPSB0aGlzLmNvbCggMCApLFxyXG4gICAgICAgICAgICBjb2wxID0gdGhpcy5jb2woIDEgKSxcclxuICAgICAgICAgICAgY29sMiA9IHRoaXMuY29sKCAyICk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbGVmdDogY29sMC5ub3JtYWxpemUoKSxcclxuICAgICAgICAgICAgdXA6IGNvbDEubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIGZvcndhcmQ6IGNvbDIubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIHNjYWxlOiBuZXcgVmVjMyggY29sMC5sZW5ndGgoKSwgY29sMS5sZW5ndGgoKSwgY29sMi5sZW5ndGgoKSApXHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIHRyYW5zZm9ybSBtYXRyaXggY29tcG9zZWQgb2YgYSByb3RhdGlvbiBhbmQgc2NhbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0MzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IEEgcmFuZG9tIHRyYW5zZm9ybSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDMzLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciByb3QgPSBNYXQzMy5yb3RhdGlvblJhZGlhbnMoIE1hdGgucmFuZG9tKCkgKiAzNjAsIFZlYzMucmFuZG9tKCkgKSxcclxuICAgICAgICAgICAgc2NhbGUgPSBNYXQzMy5zY2FsZSggTWF0aC5yYW5kb20oKSAqIDEwICk7XHJcbiAgICAgICAgcmV0dXJuIHJvdC5tdWx0KCBzY2FsZSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQzM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0MzMucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSArJywgJysgdGhpcy5kYXRhWzNdICsnLCAnKyB0aGlzLmRhdGFbNl0gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArJywgJysgdGhpcy5kYXRhWzRdICsnLCAnKyB0aGlzLmRhdGFbN10gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArJywgJysgdGhpcy5kYXRhWzVdICsnLCAnKyB0aGlzLmRhdGFbOF07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgbWF0cml4IGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBNYXQzMy5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuc2xpY2UoIDAgKTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNYXQzMztcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFZlYzMgPSByZXF1aXJlKCAnLi9WZWMzJyApLFxyXG4gICAgICAgIFZlYzQgPSByZXF1aXJlKCAnLi9WZWM0JyApLFxyXG4gICAgICAgIE1hdDMzID0gcmVxdWlyZSggJy4vTWF0MzMnICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBNYXQ0NCBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgTWF0NDRcclxuICAgICAqIEBjbGFzc2Rlc2MgQSA0eDQgY29sdW1uLW1ham9yIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gTWF0NDQoIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0ICkge1xyXG4gICAgICAgICAgICBpZiAoIHRoYXQuZGF0YSBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCB0aGF0LmRhdGEubGVuZ3RoID09PSAxNiApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb3B5IE1hdDQ0IGRhdGEgYnkgdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGF0LmRhdGEuc2xpY2UoIDAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29weSBNYXQzMyBkYXRhIGJ5IHZhbHVlLCBhY2NvdW50IGZvciBpbmRleCBkaWZmZXJlbmNlc1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5kYXRhWzBdLCB0aGF0LmRhdGFbMV0sIHRoYXQuZGF0YVsyXSwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5kYXRhWzNdLCB0aGF0LmRhdGFbNF0sIHRoYXQuZGF0YVs1XSwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5kYXRhWzZdLCB0aGF0LmRhdGFbN10sIHRoYXQuZGF0YVs4XSwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgMCwgMCwgMCwgMSBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGF0Lmxlbmd0aCA9PT0gMTYgKSB7XHJcbiAgICAgICAgICAgICAgICAgLy8gY29weSBhcnJheSBieSB2YWx1ZSwgdXNlIHByb3RvdHlwZSB0byBjYXN0IGFycmF5IGJ1ZmZlcnNcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCB0aGF0ICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0NDQuaWRlbnRpdHkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXQ0NC5pZGVudGl0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBjb2x1bW4gb2YgdGhlIG1hdHJpeCBhcyBhIFZlYzQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIDAtYmFzZWQgY29sdW1uIGluZGV4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBUaGUgY29sdW1uIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLnJvdyA9IGZ1bmN0aW9uKCBpbmRleCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswK2luZGV4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzQraW5kZXhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOCtpbmRleF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMitpbmRleF0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm93IG9mIHRoZSBtYXRyaXggYXMgYSBWZWM0IG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSAwLWJhc2VkIHJvdyBpbmRleC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIGNvbHVtbiB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5jb2wgPSBmdW5jdGlvbiggaW5kZXggKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMCtpbmRleCo0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEraW5kZXgqNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyK2luZGV4KjRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMytpbmRleCo0XSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGlkZW50aXR5IG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGlkZW50aXkgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5pZGVudGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAxIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl8bnVtYmVyfSBzY2FsZSAtIFRoZSBzY2FsYXIgb3IgdmVjdG9yIHNjYWxpbmcgZmFjdG9yLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHNjYWxlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQuc2NhbGUgPSBmdW5jdGlvbiggc2NhbGUgKSB7XHJcbiAgICAgICAgaWYgKCB0eXBlb2Ygc2NhbGUgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgICAgIHNjYWxlLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgc2NhbGUsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCBzY2FsZSwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIDAsIDEgXSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICggc2NhbGUgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgICAgICBzY2FsZVswXSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIHNjYWxlWzFdLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgc2NhbGVbMl0sIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAwLCAxIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgc2NhbGUueCwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgc2NhbGUueSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgc2NhbGUueiwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMSBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgdHJhbnNsYXRpb24gbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSB0cmFuc2xhdGlvbiAtIFRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgdHJhbnNsYXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC50cmFuc2xhdGlvbiA9IGZ1bmN0aW9uKCB0cmFuc2xhdGlvbiApIHtcclxuICAgICAgICBpZiAoIHRyYW5zbGF0aW9uIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb25bMF0sIHRyYW5zbGF0aW9uWzFdLCB0cmFuc2xhdGlvblsyXSwgMSBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uLngsIHRyYW5zbGF0aW9uLnksIHRyYW5zbGF0aW9uLnosIDEgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCBkZWZpbmVkIGJ5IGFuIGF4aXMgYW5kIGFuIGFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gVGhlIGFuZ2xlIG9mIHRoZSByb3RhdGlvbiwgaW4gZGVncmVlcy5cclxuICAgICAqIEBwYXJhbSB7VmVjM30gYXhpcyAtIFRoZSBheGlzIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSByb3RhdGlvbiBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnJvdGF0aW9uRGVncmVlcyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KCBNYXQzMy5yb3RhdGlvbkRlZ3JlZXMoIGFuZ2xlLCBheGlzICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IGRlZmluZWQgYnkgYW4gYXhpcyBhbmQgYW4gYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHJvdGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucm90YXRpb25SYWRpYW5zID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoIE1hdDMzLnJvdGF0aW9uUmFkaWFucyggYW5nbGUsIGF4aXMgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByb3RhdGlvbiBtYXRyaXggdG8gcm90YXRlIGEgdmVjdG9yIGZyb20gb25lIGRpcmVjdGlvbiB0b1xyXG4gICAgICogYW5vdGhlci5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM30gZnJvbSAtIFRoZSBzdGFydGluZyBkaXJlY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IHRvIC0gVGhlIGVuZGluZyBkaXJlY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgbWF0cml4IHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnJvdGF0aW9uRnJvbVRvID0gZnVuY3Rpb24oIGZyb21WZWMsIHRvVmVjICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoIE1hdDMzLnJvdGF0aW9uRnJvbVRvKCBmcm9tVmVjLCB0b1ZlYyApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgbWF0cml4IHdpdGggdGhlIHByb3ZpZGVkIG1hdHJpeCBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IE1hMzNcclxuICAgICAqIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TWF0MzN8TWF0NDR8QXJyYXl9IHRoYXQgLSBUaGUgbWF0cml4IHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBzdW0gb2YgdGhlIHR3byBtYXRyaWNlcy5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBuZXcgTWF0NDQoIHRoYXQgKSxcclxuICAgICAgICAgICAgaTtcclxuICAgICAgICBmb3IgKCBpPTA7IGk8MTY7IGkrKyApIHtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaV0gKz0gdGhpcy5kYXRhW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0aGUgcHJvdmlkZWQgbWF0cml4IGFyZ3VtZW50IGZyb20gdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBNYXQ0NCBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfE1hdDQ0fEFycmF5fSB0aGF0IC0gVGhlIG1hdHJpeCB0byBhZGQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgZGlmZmVyZW5jZSBvZiB0aGUgdHdvIG1hdHJpY2VzLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCggdGhhdCApLFxyXG4gICAgICAgICAgICBpO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTwxNjsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAtIG1hdC5kYXRhW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHByb3ZkZWQgdmVjdG9yIGFyZ3VtZW50IGJ5IHRoZSBtYXRyaXgsIHJldHVybmluZyBhIG5ld1xyXG4gICAgICogVmVjMyBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gLSBUaGUgdmVjdG9yIHRvIGJlIG11bHRpcGxpZWQgYnkgdGhlIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHJlc3VsdGluZyB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5tdWx0VmVjdG9yMyA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIC8vIGVuc3VyZSAndGhhdCcgaXMgYSBWZWMzXHJcbiAgICAgICAgLy8gaXQgaXMgc2FmZSB0byBvbmx5IGNhc3QgaWYgQXJyYXkgc2luY2UgVmVjNCBoYXMgb3duIG1ldGhvZFxyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gbmV3IFZlYzMoIHRoYXQgKSA6IHRoYXQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKHtcclxuICAgICAgICAgICAgeDogdGhpcy5kYXRhWzBdICogdGhhdC54ICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs0XSAqIHRoYXQueSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbOF0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTJdLFxyXG4gICAgICAgICAgICB5OiB0aGlzLmRhdGFbMV0gKiB0aGF0LnggK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzVdICogdGhhdC55ICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVs5XSAqIHRoYXQueiArIHRoaXMuZGF0YVsxM10sXHJcbiAgICAgICAgICAgIHo6IHRoaXMuZGF0YVsyXSAqIHRoYXQueCArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNl0gKiB0aGF0LnkgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEwXSAqIHRoYXQueiArIHRoaXMuZGF0YVsxNF1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92ZGVkIHZlY3RvciBhcmd1bWVudCBieSB0aGUgbWF0cml4LCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIFZlYzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIHZlY3RvciB0byBiZSBtdWx0aXBsaWVkIGJ5IHRoZSBtYXRyaXguXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSByZXN1bHRpbmcgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUubXVsdFZlY3RvcjQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICAvLyBlbnN1cmUgJ3RoYXQnIGlzIGEgVmVjNFxyXG4gICAgICAgIC8vIGl0IGlzIHNhZmUgdG8gb25seSBjYXN0IGlmIEFycmF5IHNpbmNlIFZlYzMgaGFzIG93biBtZXRob2RcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IG5ldyBWZWM0KCB0aGF0ICkgOiB0aGF0O1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNCh7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuZGF0YVswXSAqIHRoYXQueCArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNF0gKiB0aGF0LnkgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzhdICogdGhhdC56ICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0gKiB0aGF0LncsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuZGF0YVsxXSAqIHRoYXQueCArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNV0gKiB0aGF0LnkgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzldICogdGhhdC56ICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxM10gKiB0aGF0LncsXHJcbiAgICAgICAgICAgIHo6IHRoaXMuZGF0YVsyXSAqIHRoYXQueCArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbNl0gKiB0aGF0LnkgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzEwXSAqIHRoYXQueiArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMTRdICogdGhhdC53LFxyXG4gICAgICAgICAgICB3OiB0aGlzLmRhdGFbM10gKiB0aGF0LnggK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzddICogdGhhdC55ICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVsxMV0gKiB0aGF0LnogK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzE1XSAqIHRoYXQud1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgYWxsIGNvbXBvbmVudHMgb2YgdGhlIG1hdHJpeCBieSB0aGUgcHJvdmRlZCBzY2FsYXIgYXJndW1lbnQsXHJcbiAgICAgKiByZXR1cm5pbmcgYSBuZXcgTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBtdWx0aXBseSB0aGUgbWF0cml4IGJ5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHJlc3VsdGluZyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5tdWx0U2NhbGFyID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCgpLFxyXG4gICAgICAgICAgICBpO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTwxNjsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAqIHRoYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgcHJvdmRlZCBtYXRyaXggYXJndW1lbnQgYnkgdGhlIG1hdHJpeCwgcmV0dXJuaW5nIGEgbmV3XHJcbiAgICAgKiBNYXQ0NCBvYmplY3QuXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfE1hdDQ0fEFycmF5fSAtIFRoZSBtYXRyaXggdG8gYmUgbXVsdGlwbGllZCBieSB0aGUgbWF0cml4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHJlc3VsdGluZyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5tdWx0TWF0cml4ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCgpLFxyXG4gICAgICAgICAgICBpO1xyXG4gICAgICAgIC8vIGVuc3VyZSAndGhhdCcgaXMgYSBNYXQ0NFxyXG4gICAgICAgIC8vIG11c3QgY2hlY2sgaWYgQXJyYXkgb3IgTWF0NDRcclxuICAgICAgICBpZiAoICggdGhhdC5kYXRhICYmIHRoYXQuZGF0YS5sZW5ndGggPT09IDkgKSB8fFxyXG4gICAgICAgICAgICB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHRoYXQgPSBuZXcgTWF0NDQoIHRoYXQgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICggaT0wOyBpPDQ7IGkrKyApIHtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaV0gPSB0aGlzLmRhdGFbaV0gKiB0aGF0LmRhdGFbMF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2krNF0gKiB0aGF0LmRhdGFbMV0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2krOF0gKiB0aGF0LmRhdGFbMl0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2krMTJdICogdGhhdC5kYXRhWzNdO1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpKzRdID0gdGhpcy5kYXRhW2ldICogdGhhdC5kYXRhWzRdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtpKzRdICogdGhhdC5kYXRhWzVdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtpKzhdICogdGhhdC5kYXRhWzZdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtpKzEyXSAqIHRoYXQuZGF0YVs3XTtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaSs4XSA9IHRoaXMuZGF0YVtpXSAqIHRoYXQuZGF0YVs4XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaSs0XSAqIHRoYXQuZGF0YVs5XSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaSs4XSAqIHRoYXQuZGF0YVsxMF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2krMTJdICogdGhhdC5kYXRhWzExXTtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaSsxMl0gPSB0aGlzLmRhdGFbaV0gKiB0aGF0LmRhdGFbMTJdICtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtpKzRdICogdGhhdC5kYXRhWzEzXSArXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaSs4XSAqIHRoYXQuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2krMTJdICogdGhhdC5kYXRhWzE1XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92ZGVkIGFyZ3VtZW50IGJ5IHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxNYXQzM3xNYXQ0NHxBcnJheXxudW1iZXJ9IC0gVGhlIGFyZ3VtZW50IHRvIGJlIG11bHRpcGxpZWQgYnkgdGhlIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR8VmVjNH0gVGhlIHJlc3VsdGluZyBwcm9kdWN0LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUubXVsdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdHlwZW9mIHRoYXQgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICAvLyBzY2FsYXJcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdFNjYWxhciggdGhhdCApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgLy8gYXJyYXlcclxuICAgICAgICAgICAgaWYgKCB0aGF0Lmxlbmd0aCA9PT0gMyApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRWZWN0b3IzKCB0aGF0ICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHRoYXQubGVuZ3RoID09PSA0ICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdFZlY3RvcjQoIHRoYXQgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRNYXRyaXgoIHRoYXQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB2ZWN0b3JcclxuICAgICAgICBpZiAoIHRoYXQueCAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgICAgIHRoYXQueSAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgICAgIHRoYXQueiAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICBpZiAoIHRoYXQudyAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgLy8gdmVjNFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdFZlY3RvcjQoIHRoYXQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL3ZlYzNcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdFZlY3RvcjMoIHRoYXQgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbWF0cml4XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubXVsdE1hdHJpeCggdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERpdmlkZXMgYWxsIGNvbXBvbmVudHMgb2YgdGhlIG1hdHJpeCBieSB0aGUgcHJvdmRlZCBzY2FsYXIgYXJndW1lbnQsXHJcbiAgICAgKiByZXR1cm5pbmcgYSBuZXcgTWF0NDQgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBkaXZpZGUgdGhlIG1hdHJpeCBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSByZXN1bHRpbmcgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuZGl2ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCgpLCBpO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTwxNjsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAvIHRoYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBhbGwgY29tcG9uZW50cyBtYXRjaCB0aG9zZSBvZiBhIHByb3ZpZGVkIG1hdHJpeC5cclxuICAgICAqIEFuIG9wdGlvbmFsIGVwc2lsb24gdmFsdWUgbWF5IGJlIHByb3ZpZGVkLlxyXG4gICAgICogQG1lbWJlcm9mIE1hdDQ0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtNYXQ0NHxBcnJheX0gdGhhdCAtIFRoZSBtYXRyaXggdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaXggY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICBmb3IgKCBpPTA7IGk8MTY7IGkrKyApIHtcclxuICAgICAgICAgICAgLy8gYXdrd2FyZCBjb21wYXJpc29uIGxvZ2ljIGlzIHJlcXVpcmVkIHRvIGVuc3VyZSBlcXVhbGl0eSBwYXNzZXMgaWZcclxuICAgICAgICAgICAgLy8gY29ycmVzcG9uZGluZyBhcmUgYm90aCB1bmRlZmluZWQsIE5hTiwgb3IgSW5maW5pdHlcclxuICAgICAgICAgICAgaWYgKCAhKFxyXG4gICAgICAgICAgICAgICAgKCB0aGlzLmRhdGFbaV0gPT09IHRoYXQuZGF0YVtpXSApIHx8XHJcbiAgICAgICAgICAgICAgICAoIE1hdGguYWJzKCB0aGlzLmRhdGFbaV0gLSB0aGF0LmRhdGFbaV0gKSA8PSBlcHNpbG9uIClcclxuICAgICAgICAgICAgICAgKSApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVmdCAtIFRoZSBtaW5pbXVtIHggZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IC0gVGhlIG1heGltdW0geCBleHRlbnQgb2YgdGhlIHByb2plY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIC0gVGhlIG1pbmltdW0geSBleHRlbnQgb2YgdGhlIHByb2plY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIC0gVGhlIG1heGltdW0geSBleHRlbnQgb2YgdGhlIHByb2plY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbmVhciAtIFRoZSBtaW5pbXVtIHogZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZhciAtIFRoZSBtYXhpbXVtIHogZXh0ZW50IG9mIHRoZSBwcm9qZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQub3J0aG8gPSBmdW5jdGlvbiggbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IE1hdDQ0LmlkZW50aXR5KCk7XHJcbiAgICAgICAgbWF0LmRhdGFbMF0gPSAyIC8gKCByaWdodCAtIGxlZnQgKTtcclxuICAgICAgICBtYXQuZGF0YVs1XSA9IDIgLyAoIHRvcCAtIGJvdHRvbSApO1xyXG4gICAgICAgIG1hdC5kYXRhWzEwXSA9IC0yIC8gKCBmYXIgLSBuZWFyICk7XHJcbiAgICAgICAgbWF0LmRhdGFbMTJdID0gLSggKCByaWdodCArIGxlZnQgKSAvICggcmlnaHQgLSBsZWZ0ICkgKTtcclxuICAgICAgICBtYXQuZGF0YVsxM10gPSAtKCAoIHRvcCArIGJvdHRvbSApIC8gKCB0b3AgLSBib3R0b20gKSApO1xyXG4gICAgICAgIG1hdC5kYXRhWzE0XSA9IC0oICggZmFyICsgbmVhciApIC8gKCBmYXIgLSBuZWFyICkgKTtcclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZm92IC0gVGhlIGZpZWxkIG9mIHZpZXcuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IC0gVGhlIGFzcGVjdCByYXRpby5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6TWluIC0gVGhlIG1pbmltdW0geSBleHRlbnQgb2YgdGhlIGZydXN0dW0uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gek1heCAtIFRoZSBtYXhpbXVtIHkgZXh0ZW50IG9mIHRoZSBmcnVzdHVtLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uKCBmb3YsIGFzcGVjdCwgek1pbiwgek1heCApIHtcclxuICAgICAgICB2YXIgeU1heCA9IHpNaW4gKiBNYXRoLnRhbiggZm92ICogKCBNYXRoLlBJIC8gMzYwLjAgKSApLFxyXG4gICAgICAgICAgICB5TWluID0gLXlNYXgsXHJcbiAgICAgICAgICAgIHhNaW4gPSB5TWluICogYXNwZWN0LFxyXG4gICAgICAgICAgICB4TWF4ID0gLXhNaW4sXHJcbiAgICAgICAgICAgIG1hdCA9IE1hdDQ0LmlkZW50aXR5KCk7XHJcbiAgICAgICAgbWF0LmRhdGFbMF0gPSAoMiAqIHpNaW4pIC8gKHhNYXggLSB4TWluKTtcclxuICAgICAgICBtYXQuZGF0YVs1XSA9ICgyICogek1pbikgLyAoeU1heCAtIHlNaW4pO1xyXG4gICAgICAgIG1hdC5kYXRhWzhdID0gKHhNYXggKyB4TWluKSAvICh4TWF4IC0geE1pbik7XHJcbiAgICAgICAgbWF0LmRhdGFbOV0gPSAoeU1heCArIHlNaW4pIC8gKHlNYXggLSB5TWluKTtcclxuICAgICAgICBtYXQuZGF0YVsxMF0gPSAtKCh6TWF4ICsgek1pbikgLyAoek1heCAtIHpNaW4pKTtcclxuICAgICAgICBtYXQuZGF0YVsxMV0gPSAtMTtcclxuICAgICAgICBtYXQuZGF0YVsxNF0gPSAtKCAoIDIgKiAoek1heCp6TWluKSApLyh6TWF4IC0gek1pbikpO1xyXG4gICAgICAgIG1hdC5kYXRhWzE1XSA9IDA7XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc3Bvc2Ugb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHRyYW5zcG9zZWQgbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUudHJhbnNwb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHRyYW5zID0gbmV3IE1hdDQ0KCksIGk7XHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCA0OyBpKysgKSB7XHJcbiAgICAgICAgICAgIHRyYW5zLmRhdGFbaSo0XSA9IHRoaXMuZGF0YVtpXTtcclxuICAgICAgICAgICAgdHJhbnMuZGF0YVsoaSo0KSsxXSA9IHRoaXMuZGF0YVtpKzRdO1xyXG4gICAgICAgICAgICB0cmFucy5kYXRhWyhpKjQpKzJdID0gdGhpcy5kYXRhW2krOF07XHJcbiAgICAgICAgICAgIHRyYW5zLmRhdGFbKGkqNCkrM10gPSB0aGlzLmRhdGFbaSsxMl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cmFucztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBpbnZlcnRlZCBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5pbnZlcnNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGludiA9IG5ldyBNYXQ0NCgpLCBkZXQ7XHJcbiAgICAgICAgLy8gY29tcHV0ZSBpbnZlcnNlXHJcbiAgICAgICAgLy8gcm93IDFcclxuICAgICAgICBpbnYuZGF0YVswXSA9IHRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTBdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxMF07XHJcbiAgICAgICAgaW52LmRhdGFbNF0gPSAtdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxMF0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMTFdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxNF0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEwXTtcclxuICAgICAgICBpbnYuZGF0YVs4XSA9IHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMTFdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsxNV0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxM10gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzldO1xyXG4gICAgICAgIGludi5kYXRhWzEyXSA9IC10aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzldKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzEwXSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTNdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVs5XTtcclxuICAgICAgICAvLyByb3cgMlxyXG4gICAgICAgIGludi5kYXRhWzFdID0gLXRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTBdKnRoaXMuZGF0YVsxNV0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTVdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxMF07XHJcbiAgICAgICAgaW52LmRhdGFbNV0gPSB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzEwXSp0aGlzLmRhdGFbMTVdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVsxMV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxMV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTBdO1xyXG4gICAgICAgIGludi5kYXRhWzldID0gLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbMTFdKnRoaXMuZGF0YVsxM10gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzldO1xyXG4gICAgICAgIGludi5kYXRhWzEzXSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbMTBdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxM10gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTBdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzldO1xyXG4gICAgICAgIC8vIHJvdyAzXHJcbiAgICAgICAgaW52LmRhdGFbMl0gPSB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxNF0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxNV0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbN10gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbNl07XHJcbiAgICAgICAgaW52LmRhdGFbNl0gPSAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTVdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzddICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzZdO1xyXG4gICAgICAgIGludi5kYXRhWzEwXSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEzXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEzXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs1XTtcclxuICAgICAgICBpbnYuZGF0YVsxNF0gPSAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTNdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzZdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzVdO1xyXG4gICAgICAgIC8vIHJvdyA0XHJcbiAgICAgICAgaW52LmRhdGFbM10gPSAtdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTBdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTBdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbN10gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs2XTtcclxuICAgICAgICBpbnYuZGF0YVs3XSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEwXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzddIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbNl07XHJcbiAgICAgICAgaW52LmRhdGFbMTFdID0gLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzldICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbOV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzVdO1xyXG4gICAgICAgIGludi5kYXRhWzE1XSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzEwXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzldIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTBdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbOV0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs2XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzVdO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkZXRlcm1pbmFudFxyXG4gICAgICAgIGRldCA9IHRoaXMuZGF0YVswXSppbnYuZGF0YVswXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSppbnYuZGF0YVs0XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSppbnYuZGF0YVs4XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSppbnYuZGF0YVsxMl07XHJcbiAgICAgICAgcmV0dXJuIGludi5tdWx0KCAxIC8gZGV0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVjb21wb3NlcyB0aGUgbWF0cml4IGludG8gdGhlIGNvcnJlc3BvbmRpbmcgeCwgeSwgYW5kIHogYXhlcywgYWxvbmcgd2l0aFxyXG4gICAgICogYSBzY2FsZS5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBkZWNvbXBvc2VkIGNvbXBvbmVudHMgb2YgdGhlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLmRlY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGV4dHJhY3QgdHJhbnNmb3JtIGNvbXBvbmVudHNcclxuICAgICAgICB2YXIgY29sMCA9IG5ldyBWZWMzKCB0aGlzLmNvbCggMCApICksXHJcbiAgICAgICAgICAgIGNvbDEgPSBuZXcgVmVjMyggdGhpcy5jb2woIDEgKSApLFxyXG4gICAgICAgICAgICBjb2wyID0gbmV3IFZlYzMoIHRoaXMuY29sKCAyICkgKSxcclxuICAgICAgICAgICAgY29sMyA9IG5ldyBWZWMzKCB0aGlzLmNvbCggMyApICk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbGVmdDogY29sMC5ub3JtYWxpemUoKSxcclxuICAgICAgICAgICAgdXA6IGNvbDEubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIGZvcndhcmQ6IGNvbDIubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIG9yaWdpbjogY29sMyxcclxuICAgICAgICAgICAgc2NhbGU6IG5ldyBWZWMzKCBjb2wwLmxlbmd0aCgpLCBjb2wxLmxlbmd0aCgpLCBjb2wyLmxlbmd0aCgpIClcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gdHJhbnNmb3JtIG1hdHJpeCBjb21wb3NlZCBvZiBhIHJvdGF0aW9uIGFuZCBzY2FsZS5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gQSByYW5kb20gdHJhbnNmb3JtIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHJvdCA9IE1hdDQ0LnJvdGF0aW9uUmFkaWFucyggTWF0aC5yYW5kb20oKSAqIDM2MCwgVmVjMy5yYW5kb20oKSApLFxyXG4gICAgICAgICAgICBzY2FsZSA9IE1hdDQ0LnNjYWxlKCBNYXRoLnJhbmRvbSgpICogMTAgKSxcclxuICAgICAgICAgICAgdHJhbnNsYXRpb24gPSBNYXQ0NC50cmFuc2xhdGlvbiggVmVjMy5yYW5kb20oKSApO1xyXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGlvbi5tdWx0KCByb3QubXVsdCggc2NhbGUgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBNYXQ0NFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgTWF0NDQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSArJywgJysgdGhpcy5kYXRhWzRdICsnLCAnKyB0aGlzLmRhdGFbOF0gKycsICcrIHRoaXMuZGF0YVsxMl0gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSArJywgJysgdGhpcy5kYXRhWzVdICsnLCAnKyB0aGlzLmRhdGFbOV0gKycsICcrIHRoaXMuZGF0YVsxM10gKycsXFxuJyArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArJywgJysgdGhpcy5kYXRhWzZdICsnLCAnKyB0aGlzLmRhdGFbMTBdICsnLCAnKyB0aGlzLmRhdGFbMTRdICsnLFxcbicgK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbM10gKycsICcrIHRoaXMuZGF0YVs3XSArJywgJysgdGhpcy5kYXRhWzExXSArJywgJysgdGhpcy5kYXRhWzE1XTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgTWF0NDRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBtYXRyaXggYXMgYW4gYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIE1hdDQ0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5zbGljZSggMCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1hdDQ0O1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgVmVjMyA9IHJlcXVpcmUoJy4vVmVjMycpLFxyXG4gICAgICAgIE1hdDMzID0gcmVxdWlyZSgnLi9NYXQzMycpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgUXVhdGVybmlvbiBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgUXVhdGVybmlvblxyXG4gICAgICogQGNsYXNzZGVzYyBBIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIGFuIG9yaWVudGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBRdWF0ZXJuaW9uKCkge1xyXG4gICAgICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIC8vIGFycmF5IG9yIFF1YXRlcm5pb24gYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIHZhciBhcmd1bWVudCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIGlmICggYXJndW1lbnQudyAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50Lnc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBhcmd1bWVudFswXSAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50WzBdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLncgPSAxLjA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudC54IHx8IGFyZ3VtZW50WzFdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50LnkgfHwgYXJndW1lbnRbMl0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gYXJndW1lbnQueiB8fCBhcmd1bWVudFszXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCBjb21wb25lbnQgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLncgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMl07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSBhcmd1bWVudHNbM107XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMudyA9IDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcXVhdGVybmlvbiB0aGF0IHJlcHJlc2VudHMgYW4gb3JlaW50YXRpb24gbWF0Y2hpbmdcclxuICAgICAqIHRoZSBpZGVudGl0eSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgaWRlbnRpdHkgcXVhdGVybmlvbi5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5pZGVudGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggMSwgMCwgMCwgMCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgUXVhdGVybmlvbiB3aXRoIGVhY2ggY29tcG9uZW50IG5lZ2F0ZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgbmVnYXRlZCBxdWF0ZXJuaW9uLlxyXG4gICAgICovXHJcbiAgICAgUXVhdGVybmlvbi5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCAtdGhpcy53LCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uY2F0ZW5hdGVzIHRoZSByb3RhdGlvbnMgb2YgdGhlIHR3byBxdWF0ZXJuaW9ucywgcmV0dXJuaW5nXHJcbiAgICAgKiBhIG5ldyBRdWF0ZXJuaW9uIG9iamVjdC5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtRdWF0ZXJuaW9ufEFycmF5fSB0aGF0IC0gVGhlIHF1YXRlcmlvbiB0byBjb25jYXRlbmF0ZS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIHJlc3VsdGluZyBjb25jYXRlbmF0ZWQgcXVhdGVybmlvbi5cclxuICAgICAqL1xyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUubXVsdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID8gbmV3IFF1YXRlcm5pb24oIHRoYXQgKSA6IHRoYXQ7XHJcbiAgICAgICAgdmFyIHcgPSAodGhhdC53ICogdGhpcy53KSAtICh0aGF0LnggKiB0aGlzLngpIC0gKHRoYXQueSAqIHRoaXMueSkgLSAodGhhdC56ICogdGhpcy56KSxcclxuICAgICAgICAgICAgeCA9IHRoaXMueSp0aGF0LnogLSB0aGlzLnoqdGhhdC55ICsgdGhpcy53KnRoYXQueCArIHRoaXMueCp0aGF0LncsXHJcbiAgICAgICAgICAgIHkgPSB0aGlzLnoqdGhhdC54IC0gdGhpcy54KnRoYXQueiArIHRoaXMudyp0aGF0LnkgKyB0aGlzLnkqdGhhdC53LFxyXG4gICAgICAgICAgICB6ID0gdGhpcy54KnRoYXQueSAtIHRoaXMueSp0aGF0LnggKyB0aGlzLncqdGhhdC56ICsgdGhpcy56KnRoYXQudztcclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHcsIHgsIHksIHogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcHBsaWVzIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgcXVhdGVybmlvbiBhcyBhIHJvdGF0aW9uXHJcbiAgICAgKiBtYXRyaXggdG8gdGhlIHByb3ZpZGVkIHZlY3RvciwgcmV0dXJuaW5nIGEgbmV3IFZlYzMgb2JqZWN0LlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gcm90YXRlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBUaGUgcmVzdWx0aW5nIHJvdGF0ZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSA/IG5ldyBWZWMzKCB0aGF0ICkgOiB0aGF0O1xyXG4gICAgICAgIHZhciB2cSA9IG5ldyBRdWF0ZXJuaW9uKCAwLCB0aGF0LngsIHRoYXQueSwgdGhhdC56ICksXHJcbiAgICAgICAgICAgIHIgPSB0aGlzLm11bHQoIHZxICkubXVsdCggdGhpcy5pbnZlcnNlKCkgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHIueCwgci55LCByLnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSByb3RhdGlvbiBtYXRyaXggdGhhdCB0aGUgcXVhdGVybmlvbiByZXByZXNlbnRzLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0MzN9IFRoZSByb3RhdGlvbiBtYXRyaXggcmVwcmVzZW50ZWQgYnkgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLm1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4eCA9IHRoaXMueCp0aGlzLngsXHJcbiAgICAgICAgICAgIHl5ID0gdGhpcy55KnRoaXMueSxcclxuICAgICAgICAgICAgenogPSB0aGlzLnoqdGhpcy56LFxyXG4gICAgICAgICAgICB4eSA9IHRoaXMueCp0aGlzLnksXHJcbiAgICAgICAgICAgIHh6ID0gdGhpcy54KnRoaXMueixcclxuICAgICAgICAgICAgeHcgPSB0aGlzLngqdGhpcy53LFxyXG4gICAgICAgICAgICB5eiA9IHRoaXMueSp0aGlzLnosXHJcbiAgICAgICAgICAgIHl3ID0gdGhpcy55KnRoaXMudyxcclxuICAgICAgICAgICAgencgPSB0aGlzLnoqdGhpcy53O1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICAxIC0gMip5eSAtIDIqenosIDIqeHkgKyAyKnp3LCAyKnh6IC0gMip5dyxcclxuICAgICAgICAgICAgMip4eSAtIDIqencsIDEgLSAyKnh4IC0gMip6eiwgMip5eiArIDIqeHcsXHJcbiAgICAgICAgICAgIDIqeHogKyAyKnl3LCAyKnl6IC0gMip4dywgMSAtIDIqeHggLSAyKnl5IF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24gZGVmaW5lZCBieSBhbiBheGlzXHJcbiAgICAgKiBhbmQgYW4gYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIGRlZ3JlZXMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1F1YXRlcm5pb259IFRoZSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucm90YXRpb25EZWdyZWVzID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHJldHVybiBRdWF0ZXJuaW9uLnJvdGF0aW9uUmFkaWFucyggYW5nbGUgKiAoIE1hdGguUEkvMTgwICksIGF4aXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uIGRlZmluZWQgYnkgYW4gYXhpc1xyXG4gICAgICogYW5kIGFuIGFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnJvdGF0aW9uUmFkaWFucyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICBpZiAoIGF4aXMgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgYXhpcyA9IG5ldyBWZWMzKCBheGlzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vcm1hbGl6ZSBhcmd1bWVudHNcclxuICAgICAgICBheGlzID0gYXhpcy5ub3JtYWxpemUoKTtcclxuICAgICAgICAvLyBzZXQgcXVhdGVybmlvbiBmb3IgdGhlIGVxdWl2b2xlbnQgcm90YXRpb25cclxuICAgICAgICB2YXIgbW9kQW5nbGUgPSAoIGFuZ2xlID4gMCApID8gYW5nbGUgJSAoMipNYXRoLlBJKSA6IGFuZ2xlICUgKC0yKk1hdGguUEkpLFxyXG4gICAgICAgICAgICBzaW5hID0gTWF0aC5zaW4oIG1vZEFuZ2xlLzIgKSxcclxuICAgICAgICAgICAgY29zYSA9IE1hdGguY29zKCBtb2RBbmdsZS8yICk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICBjb3NhLFxyXG4gICAgICAgICAgICBheGlzLnggKiBzaW5hLFxyXG4gICAgICAgICAgICBheGlzLnkgKiBzaW5hLFxyXG4gICAgICAgICAgICBheGlzLnogKiBzaW5hICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHF1YXRlcm5pb24gdGhhdCBoYXMgYmVlbiBzcGhlcmljYWxseSBpbnRlcnBvbGF0ZWQgYmV0d2VlblxyXG4gICAgICogdHdvIHByb3ZpZGVkIHF1YXRlcm5pb25zIGZvciBhIGdpdmVuIHQgdmFsdWUuXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7UXVhdGVybmlvbn0gZnJvbVJvdCAtIFRoZSByb3RhdGlvbiBhdCB0ID0gMC5cclxuICAgICAqIEBwYXJhbSB7UXVhdGVybmlvbn0gdG9Sb3QgLSBUaGUgcm90YXRpb24gYXQgdCA9IDEuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdCAtIFRoZSB0IHZhbHVlLCBmcm9tIDAgdG8gMS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSBpbnRlcnBvbGF0ZWQgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24uc2xlcnAgPSBmdW5jdGlvbiggZnJvbVJvdCwgdG9Sb3QsIHQgKSB7XHJcbiAgICAgICAgaWYgKCBmcm9tUm90IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGZyb21Sb3QgPSBuZXcgUXVhdGVybmlvbiggZnJvbVJvdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHRvUm90IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHRvUm90ID0gbmV3IFF1YXRlcm5pb24oIHRvUm90ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBhbmdsZSBiZXR3ZWVuXHJcbiAgICAgICAgdmFyIGNvc0hhbGZUaGV0YSA9ICggZnJvbVJvdC53ICogdG9Sb3QudyApICtcclxuICAgICAgICAgICAgKCBmcm9tUm90LnggKiB0b1JvdC54ICkgK1xyXG4gICAgICAgICAgICAoIGZyb21Sb3QueSAqIHRvUm90LnkgKSArXHJcbiAgICAgICAgICAgICggZnJvbVJvdC56ICogdG9Sb3QueiApO1xyXG4gICAgICAgIC8vIGlmIGZyb21Sb3Q9dG9Sb3Qgb3IgZnJvbVJvdD0tdG9Sb3QgdGhlbiB0aGV0YSA9IDAgYW5kIHdlIGNhbiByZXR1cm4gZnJvbVxyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIGNvc0hhbGZUaGV0YSApID49IDEgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbihcclxuICAgICAgICAgICAgICAgIGZyb21Sb3QudyxcclxuICAgICAgICAgICAgICAgIGZyb21Sb3QueCxcclxuICAgICAgICAgICAgICAgIGZyb21Sb3QueSxcclxuICAgICAgICAgICAgICAgIGZyb21Sb3QueiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb3NIYWxmVGhldGEgbXVzdCBiZSBwb3NpdGl2ZSB0byByZXR1cm4gdGhlIHNob3J0ZXN0IGFuZ2xlXHJcbiAgICAgICAgaWYgKCBjb3NIYWxmVGhldGEgPCAwICkge1xyXG4gICAgICAgICAgICBmcm9tUm90ID0gZnJvbVJvdC5uZWdhdGUoKTtcclxuICAgICAgICAgICAgY29zSGFsZlRoZXRhID0gLWNvc0hhbGZUaGV0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGhhbGZUaGV0YSA9IE1hdGguYWNvcyggY29zSGFsZlRoZXRhICk7XHJcbiAgICAgICAgdmFyIHNpbkhhbGZUaGV0YSA9IE1hdGguc3FydCggMSAtIGNvc0hhbGZUaGV0YSAqIGNvc0hhbGZUaGV0YSApO1xyXG4gICAgICAgIHZhciBzY2FsZUZyb20gPSBNYXRoLnNpbiggKCAxLjAgLSB0ICkgKiBoYWxmVGhldGEgKSAvIHNpbkhhbGZUaGV0YTtcclxuICAgICAgICB2YXIgc2NhbGVUbyA9IE1hdGguc2luKCB0ICogaGFsZlRoZXRhICkgLyBzaW5IYWxmVGhldGE7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxyXG4gICAgICAgICAgICBmcm9tUm90LncgKiBzY2FsZUZyb20gKyB0b1JvdC53ICogc2NhbGVUbyxcclxuICAgICAgICAgICAgZnJvbVJvdC54ICogc2NhbGVGcm9tICsgdG9Sb3QueCAqIHNjYWxlVG8sXHJcbiAgICAgICAgICAgIGZyb21Sb3QueSAqIHNjYWxlRnJvbSArIHRvUm90LnkgKiBzY2FsZVRvLFxyXG4gICAgICAgICAgICBmcm9tUm90LnogKiBzY2FsZUZyb20gKyB0b1JvdC56ICogc2NhbGVUbyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB2ZWN0b3IuXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBRdWF0ZXJuaW9uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtRdWF0ZXJuaW9ufEFycmF5fSAtIFRoZSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHRoZSBkb3QgcHJvZHVjdCB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIGVwc2lsb24gdmFsdWUuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2guXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIHZhciB3ID0gdGhhdC53ICE9PSB1bmRlZmluZWQgPyB0aGF0LncgOiB0aGF0WzBdLFxyXG4gICAgICAgICAgICB4ID0gdGhhdC54ICE9PSB1bmRlZmluZWQgPyB0aGF0LnggOiB0aGF0WzFdLFxyXG4gICAgICAgICAgICB5ID0gdGhhdC55ICE9PSB1bmRlZmluZWQgPyB0aGF0LnkgOiB0aGF0WzJdLFxyXG4gICAgICAgICAgICB6ID0gdGhhdC56ICE9PSB1bmRlZmluZWQgPyB0aGF0LnogOiB0aGF0WzNdO1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICByZXR1cm4gKCB0aGlzLncgPT09IHcgfHwgTWF0aC5hYnMoIHRoaXMudyAtIHcgKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnggPT09IHggfHwgTWF0aC5hYnMoIHRoaXMueCAtIHggKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnkgPT09IHkgfHwgTWF0aC5hYnMoIHRoaXMueSAtIHkgKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnogPT09IHogfHwgTWF0aC5hYnMoIHRoaXMueiAtIHogKSA8PSBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBRdWF0ZXJuaW9uIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIHF1YXRlcm5pb24gb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtYWcgPSBNYXRoLnNxcnQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLngqdGhpcy54ICtcclxuICAgICAgICAgICAgICAgIHRoaXMueSp0aGlzLnkgK1xyXG4gICAgICAgICAgICAgICAgdGhpcy56KnRoaXMueiArXHJcbiAgICAgICAgICAgICAgICB0aGlzLncqdGhpcy53ICk7XHJcbiAgICAgICAgaWYgKCBtYWcgIT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbihcclxuICAgICAgICAgICAgICAgIHRoaXMudyAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueCAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueSAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueiAvIG1hZyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjb25qdWdhdGUgb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBUaGUgY29uanVnYXRlIG9mIHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5jb25qdWdhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCB0aGlzLncsIC10aGlzLngsIC10aGlzLnksIC10aGlzLnogKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn0gVGhlIGludmVyc2Ugb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25qdWdhdGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIFF1YXRlcm5pb24gb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufSBBIHJhbmRvbSB2ZWN0b3Igb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF4aXMgPSBWZWMzLnJhbmRvbSgpLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBhbmdsZSA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgcmV0dXJuIFF1YXRlcm5pb24ucm90YXRpb25SYWRpYW5zKCBhbmdsZSwgYXhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVhdGVybmlvblxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHF1YXRlcm5pb24uXHJcbiAgICAgKi9cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMueCArICcsICcgKyB0aGlzLnkgKyAnLCAnICsgdGhpcy56ICsgJywgJyArIHRoaXMudztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBxdWF0ZXJuaW9uLlxyXG4gICAgICogQG1lbWJlcm9mIFF1YXRlcm5pb25cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBxdWF0ZXJuaW9uIGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFsgIHRoaXMudywgdGhpcy54LCB0aGlzLnksIHRoaXMueiBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFF1YXRlcm5pb247XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBWZWMzID0gcmVxdWlyZSggJy4vVmVjMycgKSxcclxuICAgICAgICBNYXQzMyA9IHJlcXVpcmUoICcuL01hdDMzJyApLFxyXG4gICAgICAgIE1hdDQ0ID0gcmVxdWlyZSggJy4vTWF0NDQnICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBUcmFuc2Zvcm0gb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIFRyYW5zZm9ybVxyXG4gICAgICogQGNsYXNzZGVzYyBBIHRyYW5zZm9ybSByZXByZXNlbnRpbmcgYW4gb3JpZW50YXRpb24sIHBvc2l0aW9uLCBhbmQgc2NhbGUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRyYW5zZm9ybSggdGhhdCApIHtcclxuICAgICAgICB0aGF0ID0gdGhhdCB8fCB7fTtcclxuICAgICAgICBpZiAoIHRoYXQuX3VwICYmXHJcbiAgICAgICAgICAgIHRoYXQuX2ZvcndhcmQgJiZcclxuICAgICAgICAgICAgdGhhdC5fbGVmdCAmJlxyXG4gICAgICAgICAgICB0aGF0Ll9vcmlnaW4gJiZcclxuICAgICAgICAgICAgdGhhdC5fc2NhbGUgKSB7XHJcbiAgICAgICAgICAgIC8vIGNvcHkgVHJhbnNmb3JtIGJ5IHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMuX3VwID0gdGhhdC51cCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mb3J3YXJkID0gdGhhdC5mb3J3YXJkKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQgPSB0aGF0LmxlZnQoKTtcclxuICAgICAgICAgICAgdGhpcy5fb3JpZ2luID0gdGhhdC5vcmlnaW4oKTtcclxuICAgICAgICAgICAgdGhpcy5fc2NhbGUgPSB0aGF0LnNjYWxlKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICggdGhhdC5kYXRhICYmIHRoYXQuZGF0YSBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICAvLyBNYXQzMyBvciBNYXQ0NCwgZXh0cmFjdCB0cmFuc2Zvcm0gY29tcG9uZW50cyBmcm9tIE1hdDQ0XHJcbiAgICAgICAgICAgIHRoYXQgPSB0aGF0LmRlY29tcG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl91cCA9IHRoYXQudXA7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcndhcmQgPSB0aGF0LmZvcndhcmQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQgPSB0aGF0LmxlZnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjYWxlID0gdGhhdC5zY2FsZTtcclxuICAgICAgICAgICAgdGhpcy5fb3JpZ2luID0gdGhhdC5vcmlnaW4gfHwgbmV3IFZlYzMoIDAsIDAsIDAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBkZWZhdWx0IHRvIGlkZW50aXR5XHJcbiAgICAgICAgICAgIHRoaXMuX3VwID0gdGhhdC51cCA/IG5ldyBWZWMzKCB0aGF0LnVwICkubm9ybWFsaXplKCkgOiBuZXcgVmVjMyggMCwgMSwgMCApO1xyXG4gICAgICAgICAgICB0aGlzLl9mb3J3YXJkID0gdGhhdC5mb3J3YXJkID8gbmV3IFZlYzMoIHRoYXQuZm9yd2FyZCApLm5vcm1hbGl6ZSgpIDogbmV3IFZlYzMoIDAsIDAsIDEgKTtcclxuICAgICAgICAgICAgdGhpcy5fbGVmdCA9IHRoYXQubGVmdCA/IG5ldyBWZWMzKCB0aGF0LmxlZnQgKS5ub3JtYWxpemUoKSA6IHRoaXMuX3VwLmNyb3NzKCB0aGlzLl9mb3J3YXJkICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luKCB0aGF0Lm9yaWdpbiB8fCBuZXcgVmVjMyggMCwgMCwgMCApICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUoIHRoYXQuc2NhbGUgfHwgbmV3IFZlYzMoIDEsIDEsIDEgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gaWRlbnRpdHkgdHJhbnNmb3JtLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IEFuIGlkZW50aXR5IHRyYW5zZm9ybS5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLmlkZW50aXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oe1xyXG4gICAgICAgICAgICB1cDogbmV3IFZlYzMoIDAsIDEsIDAgKSxcclxuICAgICAgICAgICAgZm9yd2FyZDogbmV3IFZlYzMoIDAsIDAsIDEgKSxcclxuICAgICAgICAgICAgbGVmdDogbmV3IFZlYzMoIDEsIDAsIDAgKSxcclxuICAgICAgICAgICAgb3JpZ2luOiBuZXcgVmVjMyggMCwgMCwgMCApLFxyXG4gICAgICAgICAgICBzY2FsZTogbmV3IFZlYzMoIDEsIDEsIDEgKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIGFuIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCBzZXRzIHRoZSBvcmlnaW4sIG90aGVyd2lzZSByZXR1cm5zIHRoZVxyXG4gICAgICogb3JpZ2luIGJ5IHZhbHVlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gb3JpZ2luIC0gVGhlIG9yaWdpbi4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN8VHJhbnNmb3JtfSBUaGUgb3JpZ2luLCBvciB0aGUgdHJhbnNmb3JtIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5vcmlnaW4gPSBmdW5jdGlvbiggb3JpZ2luICkge1xyXG4gICAgICAgIGlmICggb3JpZ2luICkge1xyXG4gICAgICAgICAgICB0aGlzLl9vcmlnaW4gPSBuZXcgVmVjMyggb3JpZ2luICk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMuX29yaWdpbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIGFuIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCBzZXRzIHRoZSBmb3J3YXJkIHZlY3Rvciwgb3RoZXJ3aXNlIHJldHVybnNcclxuICAgICAqIHRoZSBmb3J3YXJkIHZlY3RvciBieSB2YWx1ZS4gV2hpbGUgc2V0dGluZywgYSByb3RhdGlvbiBtYXRyaXggZnJvbSB0aGVcclxuICAgICAqIG9yaWduYWwgZm9yd2FyZCB2ZWN0b3IgdG8gdGhlIG5ldyBpcyB1c2VkIHRvIHJvdGF0ZSBhbGwgb3RoZXIgYXhlcy5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IG9yaWdpbiAtIFRoZSBmb3J3YXJkIHZlY3Rvci4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN8VHJhbnNmb3JtfSBUaGUgZm9yd2FyZCB2ZWN0b3IsIG9yIHRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiggZm9yd2FyZCApIHtcclxuICAgICAgICBpZiAoIGZvcndhcmQgKSB7XHJcbiAgICAgICAgICAgIGlmICggZm9yd2FyZCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICAgICAgZm9yd2FyZCA9IG5ldyBWZWMzKCBmb3J3YXJkICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3J3YXJkID0gZm9yd2FyZC5ub3JtYWxpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcm90ID0gTWF0MzMucm90YXRpb25Gcm9tVG8oIHRoaXMuX2ZvcndhcmQsIGZvcndhcmQgKTtcclxuICAgICAgICAgICAgdGhpcy5fZm9yd2FyZCA9IGZvcndhcmQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwID0gcm90Lm11bHQoIHRoaXMuX3VwICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQgPSByb3QubXVsdCggdGhpcy5fbGVmdCApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLl9mb3J3YXJkICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgYW4gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHNldHMgdGhlIHVwIHZlY3Rvciwgb3RoZXJ3aXNlIHJldHVybnNcclxuICAgICAqIHRoZSB1cCB2ZWN0b3IgYnkgdmFsdWUuIFdoaWxlIHNldHRpbmcsIGEgcm90YXRpb24gbWF0cml4IGZyb20gdGhlXHJcbiAgICAgKiBvcmlnbmFsIHVwIHZlY3RvciB0byB0aGUgbmV3IGlzIHVzZWQgdG8gcm90YXRlIGFsbCBvdGhlciBheGVzLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gb3JpZ2luIC0gVGhlIHVwIHZlY3Rvci4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN8VHJhbnNmb3JtfSBUaGUgdXAgdmVjdG9yLCBvciB0aGUgdHJhbnNmb3JtIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS51cCA9IGZ1bmN0aW9uKCB1cCApIHtcclxuICAgICAgICBpZiAoIHVwICkge1xyXG4gICAgICAgICAgICBpZiAoIHVwIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgICAgICB1cCA9IG5ldyBWZWMzKCB1cCApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXAgPSB1cC5ub3JtYWxpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcm90ID0gTWF0MzMucm90YXRpb25Gcm9tVG8oIHRoaXMuX3VwLCB1cCApO1xyXG4gICAgICAgICAgICB0aGlzLl9mb3J3YXJkID0gcm90Lm11bHQoIHRoaXMuX2ZvcndhcmQgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXAgPSB1cDtcclxuICAgICAgICAgICAgdGhpcy5fbGVmdCA9IHJvdC5tdWx0KCB0aGlzLl9sZWZ0ICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMuX3VwICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgYW4gYXJndW1lbnQgaXMgcHJvdmlkZWQsIHNldHMgdGhlIGxlZnQgdmVjdG9yLCBvdGhlcndpc2UgcmV0dXJuc1xyXG4gICAgICogdGhlIGxlZnQgdmVjdG9yIGJ5IHZhbHVlLiBXaGlsZSBzZXR0aW5nLCBhIHJvdGF0aW9uIG1hdHJpeCBmcm9tIHRoZVxyXG4gICAgICogb3JpZ25hbCBsZWZ0IHZlY3RvciB0byB0aGUgbmV3IGlzIHVzZWQgdG8gcm90YXRlIGFsbCBvdGhlciBheGVzLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xBcnJheX0gb3JpZ2luIC0gVGhlIGxlZnQgdmVjdG9yLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM3xUcmFuc2Zvcm19IFRoZSBsZWZ0IHZlY3Rvciwgb3IgdGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUubGVmdCA9IGZ1bmN0aW9uKCBsZWZ0ICkge1xyXG4gICAgICAgIGlmICggbGVmdCApIHtcclxuICAgICAgICAgICAgaWYgKCBsZWZ0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbmV3IFZlYzMoIGxlZnQgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0Lm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciByb3QgPSBNYXQzMy5yb3RhdGlvbkZyb21UbyggdGhpcy5fbGVmdCwgbGVmdCApO1xyXG4gICAgICAgICAgICB0aGlzLl9mb3J3YXJkID0gcm90Lm11bHQoIHRoaXMuX2ZvcndhcmQgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXAgPSByb3QubXVsdCggdGhpcy5fdXAgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICAgICAgdGhpcy5fbGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMuX2xlZnQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBhbiBhcmd1bWVudCBpcyBwcm92aWRlZCwgc2V0cyB0aGUgc2FjbGUsIG90aGVyd2lzZSByZXR1cm5zIHRoZVxyXG4gICAgICogc2NhbGUgYnkgdmFsdWUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fG51bWJlcn0gc2NhbGUgLSBUaGUgc2NhbGUuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfFRyYW5zZm9ybX0gVGhlIHNjYWxlLCBvciB0aGUgdHJhbnNmb3JtIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uKCBzY2FsZSApIHtcclxuICAgICAgICBpZiAoIHNjYWxlICkge1xyXG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBzY2FsZSA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zY2FsZSA9IG5ldyBWZWMzKCBzY2FsZSwgc2NhbGUsIHNjYWxlICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zY2FsZSA9IG5ldyBWZWMzKCBzY2FsZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NhbGU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgdHJhbnNmb3JtIGJ5IGFub3RoZXIgdHJhbnNmb3JtIG9yIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge01hdDMzfE1hdDQ0fFRyYW5zZm9ybXxBcnJheX0gdGhhdCAtIFRoZSB0cmFuc2Zvcm0gdG8gbXVsdGlwbHkgd2l0aC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VHJhbnNmb3JtfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybS5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5tdWx0ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgfHxcclxuICAgICAgICAgICAgdGhhdC5kYXRhIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIC8vIG1hdHJpeCBvciBhcnJheVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFRyYW5zZm9ybSggdGhpcy5tYXRyaXgoKS5tdWx0KCB0aGF0ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdHJhbnNmb3JtXHJcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oIHRoaXMubWF0cml4KCkubXVsdCggdGhhdC5tYXRyaXgoKSApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtJ3Mgc2NhbGUgbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHNjYWxlIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5zY2FsZU1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC5zY2FsZSggdGhpcy5fc2NhbGUgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0cmFuc2Zvcm0ncyByb3RhdGlvbiBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgcm90YXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0aW9uTWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQueCwgdGhpcy5fbGVmdC55LCB0aGlzLl9sZWZ0LnosIDAsXHJcbiAgICAgICAgICAgIHRoaXMuX3VwLngsIHRoaXMuX3VwLnksIHRoaXMuX3VwLnosIDAsXHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcndhcmQueCwgdGhpcy5fZm9yd2FyZC55LCB0aGlzLl9mb3J3YXJkLnosIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDEgXSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtJ3MgdHJhbnNsYXRpb24gbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS50cmFuc2xhdGlvbk1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC50cmFuc2xhdGlvbiggdGhpcy5fb3JpZ2luICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtJ3MgYWZmaW5lLXRyYW5zZm9ybWF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBhZmZpbmUtdHJhbnNmb3JtYXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLm1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIFQgKiBSICogU1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0aW9uTWF0cml4KClcclxuICAgICAgICAgICAgLm11bHQoIHRoaXMucm90YXRpb25NYXRyaXgoKSApXHJcbiAgICAgICAgICAgIC5tdWx0KCB0aGlzLnNjYWxlTWF0cml4KCkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc2Zvcm0ncyBzY2FsZSBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgaW52ZXJzZSBzY2FsZSBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUuaW52ZXJzZVNjYWxlTWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdDQ0LnNjYWxlKCBuZXcgVmVjMyhcclxuICAgICAgICAgICAgMS90aGlzLl9zY2FsZS54LFxyXG4gICAgICAgICAgICAxL3RoaXMuX3NjYWxlLnksXHJcbiAgICAgICAgICAgIDEvdGhpcy5fc2NhbGUueiApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgdHJhbnNmb3JtJ3Mgcm90YXRpb24gbWF0cml4LlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtNYXQ0NH0gVGhlIGludmVyc2Ugcm90YXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VSb3RhdGlvbk1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICB0aGlzLl9sZWZ0LngsIHRoaXMuX3VwLngsIHRoaXMuX2ZvcndhcmQueCwgMCxcclxuICAgICAgICAgICAgdGhpcy5fbGVmdC55LCB0aGlzLl91cC55LCB0aGlzLl9mb3J3YXJkLnksIDAsXHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQueiwgdGhpcy5fdXAueiwgdGhpcy5fZm9yd2FyZC56LCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAxIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zZm9ybSdzIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7TWF0NDR9IFRoZSBpbnZlcnNlIHRyYW5zbGF0aW9uIG1hdHJpeC5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5pbnZlcnNlVHJhbnNsYXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gTWF0NDQudHJhbnNsYXRpb24oIHRoaXMuX29yaWdpbi5uZWdhdGUoKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zZm9ybSdzIGFmZmluZS10cmFuc2Zvcm1hdGlvbiBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgaW52ZXJzZSBhZmZpbmUtdHJhbnNmb3JtYXRpb24gbWF0cml4LlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VNYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBTXi0xICogUl4tMSAqIFReLTFcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnZlcnNlU2NhbGVNYXRyaXgoKVxyXG4gICAgICAgICAgICAubXVsdCggdGhpcy5pbnZlcnNlUm90YXRpb25NYXRyaXgoKSApXHJcbiAgICAgICAgICAgIC5tdWx0KCB0aGlzLmludmVyc2VUcmFuc2xhdGlvbk1hdHJpeCgpICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdHJhbnNmb3JtJ3MgdmlldyBtYXRyaXguXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge01hdDQ0fSBUaGUgdmlldyBtYXRyaXguXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudmlld01hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuT3JpZ2luID0gdGhpcy5fb3JpZ2luLm5lZ2F0ZSgpLFxyXG4gICAgICAgICAgICByaWdodCA9IHRoaXMuX2xlZnQubmVnYXRlKCksXHJcbiAgICAgICAgICAgIGJhY2t3YXJkID0gdGhpcy5fZm9yd2FyZC5uZWdhdGUoKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgcmlnaHQueCwgdGhpcy5fdXAueCwgYmFja3dhcmQueCwgMCxcclxuICAgICAgICAgICAgcmlnaHQueSwgdGhpcy5fdXAueSwgYmFja3dhcmQueSwgMCxcclxuICAgICAgICAgICAgcmlnaHQueiwgdGhpcy5fdXAueiwgYmFja3dhcmQueiwgMCxcclxuICAgICAgICAgICAgbk9yaWdpbi5kb3QoIHJpZ2h0ICksIG5PcmlnaW4uZG90KCB0aGlzLl91cCApLCBuT3JpZ2luLmRvdCggYmFja3dhcmQgKSwgMSBdKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2xhdGVzIHRoZSB0cmFuc2Zvcm0gaW4gd29ybGQgc3BhY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSB0cmFuc2xhdGlvbiAtIFRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNsYXRlV29ybGQgPSBmdW5jdGlvbiggdHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgdGhpcy5fb3JpZ2luID0gdGhpcy5fb3JpZ2luLmFkZCggdHJhbnNsYXRpb24gKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2xhdGVzIHRoZSB0cmFuc2Zvcm0gaW4gbG9jYWwgc3BhY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSB0cmFuc2xhdGlvbiAtIFRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNsYXRlTG9jYWwgPSBmdW5jdGlvbiggdHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgaWYgKCB0cmFuc2xhdGlvbiBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICB0cmFuc2xhdGlvbiA9IG5ldyBWZWMzKCB0cmFuc2xhdGlvbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vcmlnaW4gPSB0aGlzLl9vcmlnaW4uYWRkKCB0aGlzLl9sZWZ0Lm11bHQoIHRyYW5zbGF0aW9uLnggKSApXHJcbiAgICAgICAgICAgIC5hZGQoIHRoaXMuX3VwLm11bHQoIHRyYW5zbGF0aW9uLnkgKSApXHJcbiAgICAgICAgICAgIC5hZGQoIHRoaXMuX2ZvcndhcmQubXVsdCggdHJhbnNsYXRpb24ueiApICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUm90YXRlcyB0aGUgdHJhbnNmb3JtIGJ5IGFuIGFuZ2xlIGFyb3VuZCBhbiBheGlzIGluIHdvcmxkIHNwYWNlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIGRlZ3JlZXMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRlV29ybGREZWdyZWVzID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvdGF0ZVdvcmxkUmFkaWFucyggYW5nbGUgKiBNYXRoLlBJIC8gMTgwLCBheGlzICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUm90YXRlcyB0aGUgdHJhbnNmb3JtIGJ5IGFuIGFuZ2xlIGFyb3VuZCBhbiBheGlzIGluIHdvcmxkIHNwYWNlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFRoZSBhbmdsZSBvZiB0aGUgcm90YXRpb24sIGluIHJhZGlhbnMuXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgLSBUaGUgYXhpcyBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHRyYW5zZm9ybSBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRlV29ybGRSYWRpYW5zID0gZnVuY3Rpb24oIGFuZ2xlLCBheGlzICkge1xyXG4gICAgICAgIHZhciByb3QgPSBNYXQzMy5yb3RhdGlvblJhZGlhbnMoIGFuZ2xlLCBheGlzICk7XHJcbiAgICAgICAgdGhpcy5fdXAgPSByb3QubXVsdCggdGhpcy5fdXAgKTtcclxuICAgICAgICB0aGlzLl9mb3J3YXJkID0gcm90Lm11bHQoIHRoaXMuX2ZvcndhcmQgKTtcclxuICAgICAgICB0aGlzLl9sZWZ0ID0gcm90Lm11bHQoIHRoaXMuX2xlZnQgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSb3RhdGVzIHRoZSB0cmFuc2Zvcm0gYnkgYW4gYW5nbGUgYXJvdW5kIGFuIGF4aXMgaW4gbG9jYWwgc3BhY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gVGhlIGFuZ2xlIG9mIHRoZSByb3RhdGlvbiwgaW4gZGVncmVlcy5cclxuICAgICAqIEBwYXJhbSB7VmVjM30gYXhpcyAtIFRoZSBheGlzIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VHJhbnNmb3JtfSBUaGUgdHJhbnNmb3JtIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5yb3RhdGVMb2NhbERlZ3JlZXMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRlV29ybGREZWdyZWVzKCBhbmdsZSwgdGhpcy5yb3RhdGlvbk1hdHJpeCgpLm11bHQoIGF4aXMgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJvdGF0ZXMgdGhlIHRyYW5zZm9ybSBieSBhbiBhbmdsZSBhcm91bmQgYW4gYXhpcyBpbiBsb2NhbCBzcGFjZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgb2YgdGhlIHJvdGF0aW9uLCBpbiByYWRpYW5zLlxyXG4gICAgICogQHBhcmFtIHtWZWMzfSBheGlzIC0gVGhlIGF4aXMgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZUxvY2FsUmFkaWFucyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3RhdGVXb3JsZFJhZGlhbnMoIGFuZ2xlLCB0aGlzLnJvdGF0aW9uTWF0cml4KCkubXVsdCggYXhpcyApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmb3JtcyB0aGUgdmVjdG9yIG9yIG1hdHJpeCBhcmd1bWVudCBmcm9tIHRoZSB0cmFuc2Zvcm1zIGxvY2FsIHNwYWNlXHJcbiAgICAgKiB0byB0aGUgd29ybGQgc3BhY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8TWF0MzN8TWF0NDR9IHRoYXQgLSBUaGUgYXJndW1lbnQgdG8gdHJhbnNmb3JtLlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVTY2FsZSAtIFdoZXRoZXIgb3Igbm90IHRvIGluY2x1ZGUgdGhlIHNjYWxlIGluIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZVJvdGF0aW9uIC0gV2hldGhlciBvciBub3QgdG8gaW5jbHVkZSB0aGUgcm90YXRpb24gaW4gdGhlIHRyYW5zZm9ybS5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlVHJhbnNsYXRpb24gLSBXaGV0aGVyIG9yIG5vdCB0byBpbmNsdWRlIHRoZSB0cmFuc2xhdGlvbiBpbiB0aGUgdHJhbnNmb3JtLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUcmFuc2Zvcm19IFRoZSB0cmFuc2Zvcm0gZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmxvY2FsVG9Xb3JsZCA9IGZ1bmN0aW9uKCB0aGF0LCBpZ25vcmVTY2FsZSwgaWdub3JlUm90YXRpb24sIGlnbm9yZVRyYW5zbGF0aW9uICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBuZXcgTWF0NDQoKTtcclxuICAgICAgICBpZiAoICFpZ25vcmVTY2FsZSApIHtcclxuICAgICAgICAgICAgbWF0ID0gdGhpcy5zY2FsZU1hdHJpeCgpLm11bHQoIG1hdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoICFpZ25vcmVSb3RhdGlvbiApIHtcclxuICAgICAgICAgICAgbWF0ID0gdGhpcy5yb3RhdGlvbk1hdHJpeCgpLm11bHQoIG1hdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoICFpZ25vcmVUcmFuc2xhdGlvbiApIHtcclxuICAgICAgICAgICAgbWF0ID0gdGhpcy50cmFuc2xhdGlvbk1hdHJpeCgpLm11bHQoIG1hdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0Lm11bHQoIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2Zvcm1zIHRoZSB2ZWN0b3Igb3IgbWF0cml4IGFyZ3VtZW50IGZyb20gd29ybGQgc3BhY2UgdG8gdGhlXHJcbiAgICAgKiB0cmFuc2Zvcm1zIGxvY2FsIHNwYWNlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fE1hdDMzfE1hdDQ0fSB0aGF0IC0gVGhlIGFyZ3VtZW50IHRvIHRyYW5zZm9ybS5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlU2NhbGUgLSBXaGV0aGVyIG9yIG5vdCB0byBpbmNsdWRlIHRoZSBzY2FsZSBpbiB0aGUgdHJhbnNmb3JtLlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVSb3RhdGlvbiAtIFdoZXRoZXIgb3Igbm90IHRvIGluY2x1ZGUgdGhlIHJvdGF0aW9uIGluIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZVRyYW5zbGF0aW9uIC0gV2hldGhlciBvciBub3QgdG8gaW5jbHVkZSB0aGUgdHJhbnNsYXRpb24gaW4gdGhlIHRyYW5zZm9ybS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VHJhbnNmb3JtfSBUaGUgdHJhbnNmb3JtIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS53b3JsZFRvTG9jYWwgPSBmdW5jdGlvbiggdGhhdCwgaWdub3JlU2NhbGUsIGlnbm9yZVJvdGF0aW9uLCBpZ25vcmVUcmFuc2xhdGlvbiApIHtcclxuICAgICAgICB2YXIgbWF0ID0gbmV3IE1hdDQ0KCk7XHJcbiAgICAgICAgaWYgKCAhaWdub3JlVHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgICAgIG1hdCA9IHRoaXMuaW52ZXJzZVRyYW5zbGF0aW9uTWF0cml4KCkubXVsdCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIWlnbm9yZVJvdGF0aW9uICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLmludmVyc2VSb3RhdGlvbk1hdHJpeCgpLm11bHQoIG1hdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoICFpZ25vcmVTY2FsZSApIHtcclxuICAgICAgICAgICAgbWF0ID0gdGhpcy5pbnZlcnNlU2NhbGVNYXRyaXgoKS5tdWx0KCBtYXQgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdC5tdWx0KCB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBhbGwgY29tcG9uZW50cyBtYXRjaCB0aG9zZSBvZiBhIHByb3ZpZGVkIHRyYW5zZm9ybS5cclxuICAgICAqIEFuIG9wdGlvbmFsIGVwc2lsb24gdmFsdWUgbWF5IGJlIHByb3ZpZGVkLlxyXG4gICAgICogQG1lbWJlcm9mIFRyYW5zZm9ybVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VHJhbnNmb3JtfSB0aGF0IC0gVGhlIG1hdHJpeCB0byB0ZXN0IGVxdWFsaXR5IHdpdGguXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvbiAtIFRoZSBlcHNpbG9uIHZhbHVlLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHRyYW5zZm9ybSBjb21wb25lbnRzIG1hdGNoLlxyXG4gICAgICovXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcmlnaW4uZXF1YWxzKCB0aGF0Lm9yaWdpbigpLCBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgdGhpcy5fZm9yd2FyZC5lcXVhbHMoIHRoYXQuZm9yd2FyZCgpLCBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgdGhpcy5fdXAuZXF1YWxzKCB0aGF0LnVwKCksIGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICB0aGlzLl9sZWZ0LmVxdWFscyggdGhhdC5sZWZ0KCksIGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICB0aGlzLl9zY2FsZS5lcXVhbHMoIHRoYXQuc2NhbGUoKSwgZXBzaWxvbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSB0cmFuc2Zvcm0gd2l0aCBhIHJhbmRvbSBvcmlnaW4sIG9yaWVudGF0aW9uLCBhbmQgc2NhbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJhbnNmb3JtXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyYW5zZm9ybX0gVGhlIHJhbmRvbSB0cmFuc2Zvcm0uXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYW5zZm9ybSgpXHJcbiAgICAgICAgICAgIC5vcmlnaW4oIFZlYzMucmFuZG9tKCkgKVxyXG4gICAgICAgICAgICAuZm9yd2FyZCggVmVjMy5yYW5kb20oKSApXHJcbiAgICAgICAgICAgIC5zY2FsZSggVmVjMy5yYW5kb20oKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zZm9ybS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmFuc2Zvcm1cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmFuc2Zvcm0uXHJcbiAgICAgKi9cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaXgoKS50b1N0cmluZygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBWZWMzID0gcmVxdWlyZSgnLi9WZWMzJyk7XHJcblxyXG4gICAgZnVuY3Rpb24gY2xvc2VzdFBvaW50T25FZGdlKCBhLCBiLCBwb2ludCApIHtcclxuICAgICAgICB2YXIgYWIgPSBiLnN1YiggYSApO1xyXG4gICAgICAgIC8vIHByb2plY3QgYyBvbnRvIGFiLCBjb21wdXRpbmcgcGFyYW1ldGVyaXplZCBwb3NpdGlvbiBkKHQpID0gYSArIHQqKGIgKiBhKVxyXG4gICAgICAgIHZhciB0ID0gbmV3IFZlYzMoIHBvaW50ICkuc3ViKCBhICkuZG90KCBhYiApIC8gYWIuZG90KCBhYiApO1xyXG4gICAgICAgIC8vIElmIG91dHNpZGUgc2VnbWVudCwgY2xhbXAgdCAoYW5kIHRoZXJlZm9yZSBkKSB0byB0aGUgY2xvc2VzdCBlbmRwb2ludFxyXG4gICAgICAgIGlmICggdCA8IDAgKSB7XHJcbiAgICAgICAgICAgIHQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHQgPiAxICkge1xyXG4gICAgICAgICAgICB0ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29tcHV0ZSBwcm9qZWN0ZWQgcG9zaXRpb24gZnJvbSB0aGUgY2xhbXBlZCB0XHJcbiAgICAgICAgcmV0dXJuIGEuYWRkKCBhYi5tdWx0KCB0ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIFRyaWFuZ2xlIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBUcmlhbmdsZVxyXG4gICAgICogQGNsYXNzZGVzYyBBIENDVy13aW5kZWQgdHJpYW5nbGUgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUcmlhbmdsZSgpIHtcclxuICAgICAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBvciBvYmplY3QgYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmEgPSBuZXcgVmVjMyggYXJnWzBdIHx8IGFyZy5hICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmIgPSBuZXcgVmVjMyggYXJnWzFdIHx8IGFyZy5iICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmMgPSBuZXcgVmVjMyggYXJnWzJdIHx8IGFyZy5jICk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCB2ZWN0b3IgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmEgPSBuZXcgVmVjMyggYXJndW1lbnRzWzBdICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmIgPSBuZXcgVmVjMyggYXJndW1lbnRzWzFdICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmMgPSBuZXcgVmVjMyggYXJndW1lbnRzWzJdICk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuYSA9IG5ldyBWZWMzKCAwLCAwLCAwICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmIgPSBuZXcgVmVjMyggMSwgMCwgMCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jID0gbmV3IFZlYzMoIDEsIDEsIDAgKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJhZGl1cyBvZiB0aGUgYm91bmRpbmcgc3BoZXJlIG9mIHRoZSB0cmlhbmdsZS5cclxuICAgICAqIEBtZW1iZXJvZiBUcmlhbmdsZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSByYWRpdXMgb2YgdGhlIGJvdW5kaW5nIHNwaGVyZS5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLnJhZGl1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjZW50cm9pZCA9IHRoaXMuY2VudHJvaWQoKSxcclxuICAgICAgICAgICAgYURpc3QgPSB0aGlzLmEuc3ViKCBjZW50cm9pZCApLmxlbmd0aCgpLFxyXG4gICAgICAgICAgICBiRGlzdCA9IHRoaXMuYi5zdWIoIGNlbnRyb2lkICkubGVuZ3RoKCksXHJcbiAgICAgICAgICAgIGNEaXN0ID0gdGhpcy5jLnN1YiggY2VudHJvaWQgKS5sZW5ndGgoKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoIGFEaXN0LCBNYXRoLm1heCggYkRpc3QsIGNEaXN0ICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjZW50cm9pZCBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgY2VudHJvaWQgb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5wcm90b3R5cGUuY2VudHJvaWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hXHJcbiAgICAgICAgICAgIC5hZGQoIHRoaXMuYiApXHJcbiAgICAgICAgICAgIC5hZGQoIHRoaXMuYyApXHJcbiAgICAgICAgICAgIC5kaXYoIDMgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBub3JtYWwgb2YgdGhlIHRyaWFuZ2xlLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIG5vcm1hbCBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5ub3JtYWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYWIgPSB0aGlzLmIuc3ViKCB0aGlzLmEgKSxcclxuICAgICAgICAgICAgYWMgPSB0aGlzLmMuc3ViKCB0aGlzLmEgKTtcclxuICAgICAgICByZXR1cm4gYWIuY3Jvc3MoIGFjICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgYXJlYSBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgYXJlYSBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5hcmVhID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGFiID0gdGhpcy5iLnN1YiggdGhpcy5hICksXHJcbiAgICAgICAgICAgIGFjID0gdGhpcy5jLnN1YiggdGhpcy5hICk7XHJcbiAgICAgICAgcmV0dXJuIGFiLmNyb3NzKCBhYyApLmxlbmd0aCgpIC8gMi4wO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSB0cmlhbmdsZS4gVGhlIHBvaW50IG11c3QgYmVcclxuICAgICAqIGNvcGxhbmFyLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSBwb2ludCAtIFRoZSBwb2ludCB0byB0ZXN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSB0cmlhbmdsZS5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLmlzSW5zaWRlID0gZnVuY3Rpb24oIHBvaW50ICkge1xyXG4gICAgICAgIHZhciBwID0gbmV3IFZlYzMoIHBvaW50ICk7XHJcbiAgICAgICAgLy8gVHJhbnNsYXRlIHBvaW50IGFuZCB0cmlhbmdsZSBzbyB0aGF0IHBvaW50IGxpZXMgYXQgb3JpZ2luXHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLmEuc3ViKCBwICk7XHJcbiAgICAgICAgdmFyIGIgPSB0aGlzLmIuc3ViKCBwICk7XHJcbiAgICAgICAgdmFyIGMgPSB0aGlzLmMuc3ViKCBwICk7XHJcbiAgICAgICAgLy8gQ29tcHV0ZSBub3JtYWwgdmVjdG9ycyBmb3IgdHJpYW5nbGVzIHBhYiBhbmQgcGJjXHJcbiAgICAgICAgdmFyIHUgPSBiLmNyb3NzKCBjICk7XHJcbiAgICAgICAgdmFyIHYgPSBjLmNyb3NzKCBhICk7XHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZXkgYXJlIGJvdGggcG9pbnRpbmcgaW4gdGhlIHNhbWUgZGlyZWN0aW9uXHJcbiAgICAgICAgaWYgKHUuZG90KCB2ICkgPCAwLjAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ29tcHV0ZSBub3JtYWwgdmVjdG9yIGZvciB0cmlhbmdsZSBwY2FcclxuICAgICAgICB2YXIgdyA9IGEuY3Jvc3MoIGIgKTtcclxuICAgICAgICAvLyBNYWtlIHN1cmUgaXQgcG9pbnRzIGluIHRoZSBzYW1lIGRpcmVjdGlvbiBhcyB0aGUgZmlyc3QgdHdvXHJcbiAgICAgICAgaWYgKCB1LmRvdCggdyApIDwgMC4wICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE90aGVyd2lzZSBQIG11c3QgYmUgaW4gKG9yIG9uKSB0aGUgdHJpYW5nbGVcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcnNlY3QgdGhlIHRyaWFuZ2xlIGFuZCByZXR1cm4gaW50ZXJzZWN0aW9uIGluZm9ybWF0aW9uLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfEFycmF5fSBvcmlnaW4gLSBUaGUgb3JpZ2luIG9mIHRoZSBpbnRlcnNlY3Rpb24gcmF5XHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IGRpcmVjdGlvbiAtIFRoZSBkaXJlY3Rpb24gb2YgdGhlIGludGVyc2VjdGlvbiByYXkuXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZUJlaGluZCAtIFdoZXRoZXIgb3Igbm90IHRvIGlnbm9yZSBpbnRlcnNlY3Rpb25zIGJlaGluZCB0aGUgb3JpZ2luIG9mIHRoZSByYXkuXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZUJhY2tmYWNlIC0gV2hldGhlciBvciBub3QgdG8gaWdub3JlIHRoZSBiYWNrZmFjZSBvZiB0aGUgdHJpYW5nbGUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge09iamVjdHxib29sZWFufSBUaGUgaW50ZXJzZWN0aW9uIGluZm9ybWF0aW9uLCBvciBmYWxzZSBpZiB0aGVyZSBpcyBubyBpbnRlcnNlY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIFRyaWFuZ2xlLnByb3RvdHlwZS5pbnRlcnNlY3QgPSBmdW5jdGlvbiggb3JpZ2luLCBkaXJlY3Rpb24sIGlnbm9yZUJlaGluZCwgaWdub3JlQmFja2ZhY2UgKSB7XHJcbiAgICAgICAgLy8gQ29tcHV0ZSByYXkvcGxhbmUgaW50ZXJzZWN0aW9uXHJcbiAgICAgICAgdmFyIG8gPSBuZXcgVmVjMyggb3JpZ2luICk7XHJcbiAgICAgICAgdmFyIGQgPSBuZXcgVmVjMyggZGlyZWN0aW9uICk7XHJcbiAgICAgICAgdmFyIG5vcm1hbCA9IHRoaXMubm9ybWFsKCk7XHJcbiAgICAgICAgdmFyIGRuID0gZC5kb3QoIG5vcm1hbCApO1xyXG4gICAgICAgIGlmICggZG4gPT09IDAgKSB7XHJcbiAgICAgICAgICAgIC8vIHJheSBpcyBwYXJhbGxlbCB0byBwbGFuZVxyXG4gICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiByYXkgaXMgY28tbGluZWFyIGFuZCBpbnRlcnNlY3RzP1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0ID0gdGhpcy5hLnN1YiggbyApLmRvdCggbm9ybWFsICkgLyBkbjtcclxuICAgICAgICBpZiAoIGlnbm9yZUJlaGluZCAmJiAoIHQgPCAwICkgKSB7XHJcbiAgICAgICAgICAgIC8vIHBsYW5lIGlzIGJlaGluZCByYXlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGlnbm9yZUJhY2tmYWNlICkge1xyXG4gICAgICAgICAgICAvLyAgaWdub3JlIHRyaWFuZ2xlcyBmYWNpbmcgYXdheSBmcm9tIHJheVxyXG4gICAgICAgICAgICBpZiAoICggdCA+IDAgJiYgZG4gPiAwICkgfHwgKCB0IDwgMCAmJiBkbiA8IDAgKSApIHtcclxuICAgICAgICAgICAgICAgIC8vIHRyaWFuZ2xlIGlzIGZhY2luZyBvcHBvc2l0ZSB0aGUgZGlyZWN0aW9uIG9mIGludGVyc2VjdGlvblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IG8uYWRkKCBkLm11bHQoIHQgKSApO1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHBvaW50IGlzIGluc2lkZSB0aGUgdHJpYW5nbGVcclxuICAgICAgICBpZiAoICF0aGlzLmlzSW5zaWRlKCBwb3NpdGlvbiApICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcclxuICAgICAgICAgICAgbm9ybWFsOiBub3JtYWwsXHJcbiAgICAgICAgICAgIHQ6IHRcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGNsb3Nlc3QgcG9pbnQgb24gdGhlIHRyaWFuZ2xlIHRvIHRoZSBzcGVjaWZpZWQgcG9pbnQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVHJpYW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8QXJyYXl9IHBvaW50IC0gVGhlIHBvaW50IHRvIHRlc3QuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSBjbG9zZXN0IHBvaW50IG9uIHRoZSBlZGdlLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5wcm90b3R5cGUuY2xvc2VzdFBvaW50ID0gZnVuY3Rpb24oIHBvaW50ICkge1xyXG4gICAgICAgIHZhciBlMCA9IGNsb3Nlc3RQb2ludE9uRWRnZSggdGhpcy5hLCB0aGlzLmIsIHBvaW50ICk7XHJcbiAgICAgICAgdmFyIGUxID0gY2xvc2VzdFBvaW50T25FZGdlKCB0aGlzLmIsIHRoaXMuYywgcG9pbnQgKTtcclxuICAgICAgICB2YXIgZTIgPSBjbG9zZXN0UG9pbnRPbkVkZ2UoIHRoaXMuYywgdGhpcy5hLCBwb2ludCApO1xyXG4gICAgICAgIHZhciBkMCA9ICggZTAuc3ViKCBwb2ludCApICkubGVuZ3RoU3F1YXJlZCgpO1xyXG4gICAgICAgIHZhciBkMSA9ICggZTEuc3ViKCBwb2ludCApICkubGVuZ3RoU3F1YXJlZCgpO1xyXG4gICAgICAgIHZhciBkMiA9ICggZTIuc3ViKCBwb2ludCApICkubGVuZ3RoU3F1YXJlZCgpO1xyXG4gICAgICAgIGlmICggZDAgPCBkMSApIHtcclxuICAgICAgICAgICAgcmV0dXJuICggZDAgPCBkMiApID8gZTAgOiBlMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gKCBkMSA8IGQyICkgPyBlMSA6IGUyO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIFRyaWFuZ2xlIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RyaWFuZ2xlfSBBIHJhbmRvbSB0cmlhbmdsZSBvZiB1bml0IHJhZGl1cy5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGEgPSBWZWMzLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBiID0gVmVjMy5yYW5kb20oKSxcclxuICAgICAgICAgICAgYyA9IFZlYzMucmFuZG9tKCksXHJcbiAgICAgICAgICAgIGNlbnRyb2lkID0gYS5hZGQoIGIgKS5hZGQoIGMgKS5kaXYoIDMgKSxcclxuICAgICAgICAgICAgYUNlbnQgPSBhLnN1YiggY2VudHJvaWQgKSxcclxuICAgICAgICAgICAgYkNlbnQgPSBiLnN1YiggY2VudHJvaWQgKSxcclxuICAgICAgICAgICAgY0NlbnQgPSBjLnN1YiggY2VudHJvaWQgKSxcclxuICAgICAgICAgICAgYURpc3QgPSBhQ2VudC5sZW5ndGgoKSxcclxuICAgICAgICAgICAgYkRpc3QgPSBiQ2VudC5sZW5ndGgoKSxcclxuICAgICAgICAgICAgY0Rpc3QgPSBjQ2VudC5sZW5ndGgoKSxcclxuICAgICAgICAgICAgbWF4RGlzdCA9IE1hdGgubWF4KCBNYXRoLm1heCggYURpc3QsIGJEaXN0ICksIGNEaXN0ICksXHJcbiAgICAgICAgICAgIHNjYWxlID0gMSAvIG1heERpc3Q7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUcmlhbmdsZShcclxuICAgICAgICAgICAgYUNlbnQubXVsdCggc2NhbGUgKSxcclxuICAgICAgICAgICAgYkNlbnQubXVsdCggc2NhbGUgKSxcclxuICAgICAgICAgICAgY0NlbnQubXVsdCggc2NhbGUgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB0cmlhbmdsZS5cclxuICAgICAqIEFuIG9wdGlvbmFsIGVwc2lsb24gdmFsdWUgbWF5IGJlIHByb3ZpZGVkLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtUcmlhbmdsZX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgVHJpYW5nbGUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICByZXR1cm4gdGhpcy5hLmVxdWFscyggdGhhdC5hLCBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgdGhpcy5iLmVxdWFscyggdGhhdC5iLCBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgdGhpcy5jLmVxdWFscyggdGhhdC5jLCBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFRyaWFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBUcmlhbmdsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hLnRvU3RyaW5nKCkgKyAnLCAnICtcclxuICAgICAgICAgICAgdGhpcy5iLnRvU3RyaW5nKCkgKyAnLCAnICtcclxuICAgICAgICAgICAgdGhpcy5jLnRvU3RyaW5nKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gVHJpYW5nbGU7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgVmVjMiBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgVmVjMlxyXG4gICAgICogQGNsYXNzZGVzYyBBIHR3byBjb21wb25lbnQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBWZWMyKCkge1xyXG4gICAgICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIC8vIGFycmF5IG9yIFZlY04gYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIHZhciBhcmd1bWVudCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50LnggfHwgYXJndW1lbnRbMF0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gYXJndW1lbnQueSB8fCBhcmd1bWVudFsxXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCBjb21wb25lbnQgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBWZWMyIHdpdGggZWFjaCBjb21wb25lbnQgbmVnYXRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzJ9IFRoZSBuZWdhdGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCAtdGhpcy54LCAtdGhpcy55ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHZlY3RvciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzJcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHN1bS5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gYWRkLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgc3VtIG9mIHRoZSB0d28gdmVjdG9ycy5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMiggdGhpcy54ICsgdGhhdFswXSwgdGhpcy55ICsgdGhhdFsxXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCArIHRoYXQueCwgdGhpcy55ICsgdGhhdC55ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBwcm92aWRlZCB2ZWN0b3IgYXJndW1lbnQgZnJvbSB0aGUgdmVjdG9yLCByZXR1cm5pbmcgYSBuZXcgVmVjMlxyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZS5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gLSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgZGlmZmVyZW5jZSBvZiB0aGUgdHdvIHZlY3RvcnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCAtIHRoYXRbMF0sIHRoaXMueSAtIHRoYXRbMV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggLSB0aGF0LngsIHRoaXMueSAtIHRoYXQueSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCBzY2FsYXIgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWMyXHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSB2ZWN0b3IgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzJ9IFRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS5tdWx0ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggKiB0aGF0LCB0aGlzLnkgKiB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGl2aWRlcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHNjYWxhciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzJcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gZGl2aWRlIHRoZSB2ZWN0b3IgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzJ9IFRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS5kaXYgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCAvIHRoYXQsIHRoaXMueSAvIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSBkb3QgcHJvZHVjdCBvZiB0aGUgdmVjdG9yIGFuZCB0aGUgcHJvdmlkZWRcclxuICAgICAqIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gLSBUaGUgb3RoZXIgdmVjdG9yIGFyZ3VtZW50LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBkb3QgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXRbMF0gKSArICggdGhpcy55ICogdGhhdFsxXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0LnggKSArICggdGhpcy55ICogdGhhdC55ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyAyRCBjcm9zcyBwcm9kdWN0IG9mIHRoZSB2ZWN0b3IgYW5kIHRoZSBwcm92aWRlZFxyXG4gICAgICogdmVjdG9yIGFyZ3VtZW50LiBUaGlzIHZhbHVlIHJlcHJlc2VudHMgdGhlIG1hZ25pdHVkZSBvZiB0aGUgdmVjdG9yIHRoYXRcclxuICAgICAqIHdvdWxkIHJlc3VsdCBmcm9tIGEgcmVndWxhciAzRCBjcm9zcyBwcm9kdWN0IG9mIHRoZSBpbnB1dCB2ZWN0b3JzLFxyXG4gICAgICogdGFraW5nIHRoZWlyIFogdmFsdWVzIGFzIDAuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIG90aGVyIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgMkQgY3Jvc3MgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuY3Jvc3MgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdFsxXSApIC0gKCB0aGlzLnkgKiB0aGF0WzBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXQueSApIC0gKCB0aGlzLnkgKiB0aGF0LnggKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBubyBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBzY2FsYXIgbGVuZ3RoIG9mXHJcbiAgICAgKiB0aGUgdmVjdG9yLiBJZiBhbiBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gYSBuZXdcclxuICAgICAqIFZlYzIgc2NhbGVkIHRvIHRoZSBwcm92aWRlZCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBsZW5ndGggdG8gc2NhbGUgdGhlIHZlY3RvciB0by4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcnxWZWMyfSBFaXRoZXIgdGhlIGxlbmd0aCwgb3IgbmV3IHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKCBsZW5ndGggKSB7XHJcbiAgICAgICAgaWYgKCBsZW5ndGggPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5kb3QoIHRoaXMgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoKS5tdWx0KCBsZW5ndGggKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc3F1YXJlZCBsZW5ndGggb2YgdGhlIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUubGVuZ3RoU3F1YXJlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRvdCggdGhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB2ZWN0b3IuXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gdGVzdCBlcXVhbGl0eSB3aXRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBUaGUgZXBzaWxvbiB2YWx1ZS4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaC5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGF0LnggIT09IHVuZGVmaW5lZCA/IHRoYXQueCA6IHRoYXRbMF0sXHJcbiAgICAgICAgICAgIHkgPSB0aGF0LnkgIT09IHVuZGVmaW5lZCA/IHRoYXQueSA6IHRoYXRbMV07XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCA9PT0geCB8fCBNYXRoLmFicyggdGhpcy54IC0geCApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueSA9PT0geSB8fCBNYXRoLmFicyggdGhpcy55IC0geSApIDw9IGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbmV3IFZlYzIgb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMyfSBUaGUgdmVjdG9yIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWFnID0gdGhpcy5sZW5ndGgoKTtcclxuICAgICAgICBpZiAoIG1hZyAhPT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMyKFxyXG4gICAgICAgICAgICAgICAgdGhpcy54IC8gbWFnLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55IC8gbWFnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMigpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHVuc2lnbmVkIGFuZ2xlIGJldHdlZW4gdGhpcyBhbmdsZSBhbmQgdGhlIGFyZ3VtZW50IGluIHJhZGlhbnMuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjMlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjMnxWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIG1lYXN1cmUgdGhlIGFuZ2xlIGZyb20uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHVuc2lnbmVkIGFuZ2xlIGluIHJhZGlhbnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzIucHJvdG90eXBlLnVuc2lnbmVkQW5nbGVSYWRpYW5zID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGF0LnggIT09IHVuZGVmaW5lZCA/IHRoYXQueCA6IHRoYXRbMF07XHJcbiAgICAgICAgdmFyIHkgPSB0aGF0LnkgIT09IHVuZGVmaW5lZCA/IHRoYXQueSA6IHRoYXRbMV07XHJcbiAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuMiggeSwgeCApIC0gTWF0aC5hdGFuMiggdGhpcy55LCB0aGlzLnggKTtcclxuICAgICAgICBpZiAoYW5nbGUgPCAwKSB7XHJcbiAgICAgICAgICAgIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYW5nbGU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdW5zaWduZWQgYW5nbGUgYmV0d2VlbiB0aGlzIGFuZ2xlIGFuZCB0aGUgYXJndW1lbnQgaW4gZGVncmVlcy5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMyfFZlYzN8VmVjNHxBcnJheX0gdGhhdCAtIFRoZSB2ZWN0b3IgdG8gbWVhc3VyZSB0aGUgYW5nbGUgZnJvbS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgdW5zaWduZWQgYW5nbGUgaW4gZGVncmVlcy5cclxuICAgICAqL1xyXG4gICAgVmVjMi5wcm90b3R5cGUudW5zaWduZWRBbmdsZURlZ3JlZXMgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bnNpZ25lZEFuZ2xlUmFkaWFucyggdGhhdCApICogKCAxODAgLyBNYXRoLlBJICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBWZWMyIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjMn0gQSByYW5kb20gdmVjdG9yIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMihcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKyAnLCAnICsgdGhpcy55O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMyXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgdmVjdG9yIGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBWZWMyLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFsgdGhpcy54LCB0aGlzLnkgXTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWZWMyO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIFZlYzMgb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIFZlYzNcclxuICAgICAqIEBjbGFzc2Rlc2MgQSB0aHJlZSBjb21wb25lbnQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBWZWMzKCkge1xyXG4gICAgICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIC8vIGFycmF5IG9yIFZlY04gYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIHZhciBhcmd1bWVudCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50LnggfHwgYXJndW1lbnRbMF0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gYXJndW1lbnQueSB8fCBhcmd1bWVudFsxXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSBhcmd1bWVudC56IHx8IGFyZ3VtZW50WzJdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAvLyBpbmRpdmlkdWFsIGNvbXBvbmVudCBhcmd1bWVudHNcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50c1sxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IGFyZ3VtZW50c1syXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBWZWMzIHdpdGggZWFjaCBjb21wb25lbnQgbmVnYXRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSBuZWdhdGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHZlY3RvciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzNcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHN1bS5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIGFkZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHN1bSBvZiB0aGUgdHdvIHZlY3RvcnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMueCArIHRoYXRbMF0sIHRoaXMueSArIHRoYXRbMV0sIHRoaXMueiArIHRoYXRbMl0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggKyB0aGF0LngsIHRoaXMueSArIHRoYXQueSwgdGhpcy56ICsgdGhhdC56ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBwcm92aWRlZCB2ZWN0b3IgYXJndW1lbnQgZnJvbSB0aGUgdmVjdG9yLCByZXR1cm5pbmcgYSBuZXdcclxuICAgICAqIFZlYzMgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZS5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIHZlY3RvciB0byBzdWJ0cmFjdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIGRpZmZlcmVuY2Ugb2YgdGhlIHR3byB2ZWN0b3JzLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggLSB0aGF0WzBdLCB0aGlzLnkgLSB0aGF0WzFdLCB0aGlzLnogLSB0aGF0WzJdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54IC0gdGhhdC54LCB0aGlzLnkgLSB0aGF0LnksIHRoaXMueiAtIHRoYXQueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGxpZXMgdGhlIHZlY3RvciB3aXRoIHRoZSBwcm92aWRlZCBzY2FsYXIgYXJndW1lbnQsIHJldHVybmluZyBhIG5ldyBWZWMzXHJcbiAgICAgKiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gLSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSB2ZWN0b3IgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5tdWx0ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggKiB0aGF0LCB0aGlzLnkgKiB0aGF0LCB0aGlzLnogKiB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGl2aWRlcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHNjYWxhciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzNcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gZGl2aWRlIHRoZSB2ZWN0b3IgYnkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSBzY2FsZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS5kaXYgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoIHRoaXMueCAvIHRoYXQsIHRoaXMueSAvIHRoYXQsIHRoaXMueiAvIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSBkb3QgcHJvZHVjdCBvZiB0aGUgdmVjdG9yIGFuZCB0aGUgcHJvdmlkZWRcclxuICAgICAqIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IC0gVGhlIG90aGVyIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgZG90IHByb2R1Y3QuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0WzBdICkgKyAoIHRoaXMueSAqIHRoYXRbMV0gKSArICggdGhpcy56ICogdGhhdFsyXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0LnggKSArICggdGhpcy55ICogdGhhdC55ICkgKyAoIHRoaXMueiAqIHRoYXQueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYW5kIHJldHVybnMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdGhlIHZlY3RvciBhbmQgdGhlIHByb3ZpZGVkXHJcbiAgICAgKiB2ZWN0b3IgYXJndW1lbnQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjM3xWZWM0fEFycmF5fSAtIFRoZSBvdGhlciB2ZWN0b3IgYXJndW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIDJEIGNyb3NzIHByb2R1Y3QuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLmNyb3NzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgICAgICggdGhpcy55ICogdGhhdFsyXSApIC0gKCB0aGF0WzFdICogdGhpcy56ICksXHJcbiAgICAgICAgICAgICAgICAoLXRoaXMueCAqIHRoYXRbMl0gKSArICggdGhhdFswXSAqIHRoaXMueiApLFxyXG4gICAgICAgICAgICAgICAgKCB0aGlzLnggKiB0aGF0WzFdICkgLSAoIHRoYXRbMF0gKiB0aGlzLnkgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgICggdGhpcy55ICogdGhhdC56ICkgLSAoIHRoYXQueSAqIHRoaXMueiApLFxyXG4gICAgICAgICAgICAoLXRoaXMueCAqIHRoYXQueiApICsgKCB0aGF0LnggKiB0aGlzLnogKSxcclxuICAgICAgICAgICAgKCB0aGlzLnggKiB0aGF0LnkgKSAtICggdGhhdC54ICogdGhpcy55ICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBubyBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBzY2FsYXIgbGVuZ3RoIG9mXHJcbiAgICAgKiB0aGUgdmVjdG9yLiBJZiBhbiBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gYSBuZXdcclxuICAgICAqIFZlYzMgc2NhbGVkIHRvIHRoZSBwcm92aWRlZCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBsZW5ndGggdG8gc2NhbGUgdGhlIHZlY3RvciB0by4gT3B0aW9uYWwuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcnxWZWMzfSBFaXRoZXIgdGhlIGxlbmd0aCwgb3IgbmV3IHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKCBsZW5ndGggKSB7XHJcbiAgICAgICAgaWYgKCBsZW5ndGggPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5kb3QoIHRoaXMgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoKS5tdWx0KCBsZW5ndGggKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc3F1YXJlZCBsZW5ndGggb2YgdGhlIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUubGVuZ3RoU3F1YXJlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRvdCggdGhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2ggdGhvc2Ugb2YgYSBwcm92aWRlZCB2ZWN0b3IuXHJcbiAgICAgKiBBbiBvcHRpb25hbCBlcHNpbG9uIHZhbHVlIG1heSBiZSBwcm92aWRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIHRlc3QgZXF1YWxpdHkgd2l0aC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlcHNpbG9uIC0gVGhlIGVwc2lsb24gdmFsdWUuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2guXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIHZhciB4ID0gdGhhdC54ICE9PSB1bmRlZmluZWQgPyB0aGF0LnggOiB0aGF0WzBdLFxyXG4gICAgICAgICAgICB5ID0gdGhhdC55ICE9PSB1bmRlZmluZWQgPyB0aGF0LnkgOiB0aGF0WzFdLFxyXG4gICAgICAgICAgICB6ID0gdGhhdC56ICE9PSB1bmRlZmluZWQgPyB0aGF0LnogOiB0aGF0WzJdO1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggPT09IHggfHwgTWF0aC5hYnMoIHRoaXMueCAtIHggKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnkgPT09IHkgfHwgTWF0aC5hYnMoIHRoaXMueSAtIHkgKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnogPT09IHogfHwgTWF0aC5hYnMoIHRoaXMueiAtIHogKSA8PSBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBWZWMzIG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjM30gVGhlIHZlY3RvciBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1hZyA9IHRoaXMubGVuZ3RoKCk7XHJcbiAgICAgICAgaWYgKCBtYWcgIT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgICAgIHRoaXMueCAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueSAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueiAvIG1hZyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHaXZlbiBhIHBsYW5lIG5vcm1hbCwgcmV0dXJucyB0aGUgcHJvamVjdGlvbiBvZiB0aGUgdmVjdG9yIG9udG8gdGhlIHBsYW5lLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gbm9ybWFsIC0gVGhlIHBsYW5lIG5vcm1hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgdW5zaWduZWQgYW5nbGUgaW4gcmFkaWFucy5cclxuICAgICAqL1xyXG4gICAgVmVjMy5wcm90b3R5cGUucHJvamVjdE9udG9QbGFuZSA9ICBmdW5jdGlvbiggbiApIHtcclxuICAgICAgICB2YXIgZGlzdCA9IHRoaXMuZG90KCBuICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViKCBuLm11bHQoIGRpc3QgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHVuc2lnbmVkIGFuZ2xlIGJldHdlZW4gdGhpcyBhbmdsZSBhbmQgdGhlIGFyZ3VtZW50LCBwcm9qZWN0ZWRcclxuICAgICAqIG9udG8gYSBwbGFuZSwgaW4gcmFkaWFucy5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIG1lYXN1cmUgdGhlIGFuZ2xlIGZyb20uXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzN8VmVjNHxBcnJheX0gbm9ybWFsIC0gVGhlIHJlZmVyZW5jZSB2ZWN0b3IgdG8gbWVhc3VyZSB0aGVcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uIG9mIHRoZSBhbmdsZS4gSWYgbm90IHByb3ZpZGVkIHdpbGxcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlIGEuY3Jvc3MoIGIgKS4gKE9wdGlvbmFsKVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSB1bnNpZ25lZCBhbmdsZSBpbiByYWRpYW5zLlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS51bnNpZ25lZEFuZ2xlUmFkaWFucyA9IGZ1bmN0aW9uKCB0aGF0LCBub3JtYWwgKSB7XHJcbiAgICAgICAgdmFyIGEgPSB0aGlzO1xyXG4gICAgICAgIHZhciBiID0gbmV3IFZlYzMoIHRoYXQgKTtcclxuICAgICAgICB2YXIgY3Jvc3MgPSBhLmNyb3NzKCBiICk7XHJcbiAgICAgICAgdmFyIG4gPSBuZXcgVmVjMyggbm9ybWFsIHx8IGNyb3NzICk7XHJcbiAgICAgICAgdmFyIHBhID0gYS5wcm9qZWN0T250b1BsYW5lKCBuICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdmFyIHBiID0gYi5wcm9qZWN0T250b1BsYW5lKCBuICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgdmFyIGRvdCA9IHBhLmRvdCggcGIgKTtcclxuICAgICAgICB2YXIgbmRvdCA9IE1hdGgubWF4KCAtMSwgTWF0aC5taW4oIDEsIGRvdCApICk7XHJcblxyXG4gICAgICAgIC8vIGZhc3RlciwgbGVzcyByb2J1ZXN0XHJcbiAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hY29zKCBuZG90ICk7XHJcblxyXG4gICAgICAgIC8vIHNsb3dlciwgYnV0IG1vcmUgcm9idXN0XHJcbiAgICAgICAgLy92YXIgYW5nbGUgPSBNYXRoLmF0YW4yKCBwYS5jcm9zcyggcGIgKS5sZW5ndGgoKSwgZG90ICk7XHJcblxyXG4gICAgICAgIGlmICggbi5kb3QoIGNyb3NzICkgPCAwICkge1xyXG4gICAgICAgICAgICBpZiAoIGFuZ2xlID49IE1hdGguUEkgKiAwLjUgKSB7XHJcbiAgICAgICAgICAgICAgICBhbmdsZSA9IE1hdGguUEkgKyBNYXRoLlBJIC0gYW5nbGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhbmdsZSA9IDIgKiBNYXRoLlBJIC0gYW5nbGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFuZ2xlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHVuc2lnbmVkIGFuZ2xlIGJldHdlZW4gdGhpcyBhbmdsZSBhbmQgdGhlIGFyZ3VtZW50LCBwcm9qZWN0ZWRcclxuICAgICAqIG9udG8gYSBwbGFuZSwgaW4gZGVncmVlcy5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWMzfFZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIG1lYXN1cmUgdGhlIGFuZ2xlIGZyb20uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHVuc2lnbmVkIGFuZ2xlIGluIGRlZ3JlZXMuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLnVuc2lnbmVkQW5nbGVEZWdyZWVzID0gZnVuY3Rpb24oIHRoYXQsIG5vcm1hbCApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bnNpZ25lZEFuZ2xlUmFkaWFucyggdGhhdCwgbm9ybWFsICkgKiAoIDE4MCAvIE1hdGguUEkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIFZlYzMgb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjM1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWMzfSBBIHJhbmRvbSB2ZWN0b3Igb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFZlYzMucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzMucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMueCArICcsICcgKyB0aGlzLnkgKyAnLCAnICsgdGhpcy56O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWMzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgdmVjdG9yIGFzIGFuIGFycmF5LlxyXG4gICAgICovXHJcbiAgICBWZWMzLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFsgdGhpcy54LCB0aGlzLnksIHRoaXMueiBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlYzM7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGEgVmVjNCBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgVmVjNFxyXG4gICAgICogQGNsYXNzZGVzYyBBIGZvdXIgY29tcG9uZW50IHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVmVjNCgpIHtcclxuICAgICAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBvciBWZWNOIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJndW1lbnQgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudC54IHx8IGFyZ3VtZW50WzBdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50LnkgfHwgYXJndW1lbnRbMV0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gYXJndW1lbnQueiB8fCBhcmd1bWVudFsyXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLncgPSBhcmd1bWVudC53IHx8IGFyZ3VtZW50WzNdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpbmRpdmlkdWFsIGNvbXBvbmVudCBhcmd1bWVudHNcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50c1sxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IGFyZ3VtZW50c1syXTtcclxuICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50c1szXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBWZWM0IHdpdGggZWFjaCBjb21wb25lbnQgbmVnYXRlZC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSBuZWdhdGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56LCAtdGhpcy53ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHZlY3RvciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzRcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHN1bS5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWZWM0fEFycmF5fSB0aGF0IC0gVGhlIHZlY3RvciB0byBhZGQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZlYzR9IFRoZSBzdW0gb2YgdGhlIHR3byB2ZWN0b3JzLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy54ICsgdGhhdFswXSxcclxuICAgICAgICAgICAgICAgIHRoaXMueSArIHRoYXRbMV0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLnogKyB0aGF0WzJdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy53ICsgdGhhdFszXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMueCArIHRoYXQueCxcclxuICAgICAgICAgICAgdGhpcy55ICsgdGhhdC55LFxyXG4gICAgICAgICAgICB0aGlzLnogKyB0aGF0LnosXHJcbiAgICAgICAgICAgIHRoaXMudyArIHRoYXQudyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0aGUgcHJvdmlkZWQgdmVjdG9yIGFyZ3VtZW50IGZyb20gdGhlIHZlY3RvciwgcmV0dXJuaW5nIGEgbmV3IFZlYzRcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGRpZmZlcmVuY2UuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVjNHxBcnJheX0gLSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBUaGUgZGlmZmVyZW5jZSBvZiB0aGUgdHdvIHZlY3RvcnMuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggLSB0aGF0WzBdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55IC0gdGhhdFsxXSxcclxuICAgICAgICAgICAgICAgIHRoaXMueiAtIHRoYXRbMl0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLncgLSB0aGF0WzNdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy54IC0gdGhhdC54LFxyXG4gICAgICAgICAgICB0aGlzLnkgLSB0aGF0LnksXHJcbiAgICAgICAgICAgIHRoaXMueiAtIHRoYXQueixcclxuICAgICAgICAgICAgdGhpcy53IC0gdGhhdC53ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbGllcyB0aGUgdmVjdG9yIHdpdGggdGhlIHByb3ZpZGVkIHNjYWxhciBhcmd1bWVudCwgcmV0dXJuaW5nIGEgbmV3IFZlYzRcclxuICAgICAqIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAtIFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgdGhlIHZlY3RvciBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLm11bHQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMueCAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMueSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMueiAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMudyAqIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXZpZGVzIHRoZSB2ZWN0b3Igd2l0aCB0aGUgcHJvdmlkZWQgc2NhbGFyIGFyZ3VtZW50LCByZXR1cm5pbmcgYSBuZXcgVmVjNFxyXG4gICAgICogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIHNjYWxhciB0byBkaXZpZGUgdGhlIHZlY3RvciBieS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIHNjYWxlZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLmRpdiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy54IC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy55IC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy56IC8gdGhhdCxcclxuICAgICAgICAgICAgdGhpcy53IC8gdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYW5kIHJldHVybnMgdGhlIGRvdCBwcm9kdWN0IG9mIHRoZSB2ZWN0b3IgYW5kIHRoZSBwcm92aWRlZFxyXG4gICAgICogdmVjdG9yIGFyZ3VtZW50LlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzR8QXJyYXl9IC0gVGhlIG90aGVyIHZlY3RvciBhcmd1bWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgZG90IHByb2R1Y3QuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0WzBdICkgK1xyXG4gICAgICAgICAgICAgICAgKCB0aGlzLnkgKiB0aGF0WzFdICkgK1xyXG4gICAgICAgICAgICAgICAgKCB0aGlzLnogKiB0aGF0WzJdICkgK1xyXG4gICAgICAgICAgICAgICAgKCB0aGlzLncgKiB0aGF0WzNdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXQueCApICtcclxuICAgICAgICAgICAgKCB0aGlzLnkgKiB0aGF0LnkgKSArXHJcbiAgICAgICAgICAgICggdGhpcy56ICogdGhhdC56ICkgK1xyXG4gICAgICAgICAgICAoIHRoaXMudyAqIHRoYXQudyApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIG5vIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHNjYWxhciBsZW5ndGggb2ZcclxuICAgICAqIHRoZSB2ZWN0b3IuIElmIGFuIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiBhIG5ld1xyXG4gICAgICogVmVjNCBzY2FsZWQgdG8gdGhlIHByb3ZpZGVkIGxlbmd0aC5cclxuICAgICAqIEBtZW1iZXJvZiBWZWM0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IC0gVGhlIGxlbmd0aCB0byBzY2FsZSB0aGUgdmVjdG9yIHRvLiBPcHRpb25hbC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfFZlYzR9IEVpdGhlciB0aGUgbGVuZ3RoLCBvciBuZXcgc2NhbGVkIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oIGxlbmd0aCApIHtcclxuICAgICAgICBpZiAoIGxlbmd0aCA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLmRvdCggdGhpcyApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpLm11bHQoIGxlbmd0aCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzcXVhcmVkIGxlbmd0aCBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBWZWM0LnByb3RvdHlwZS5sZW5ndGhTcXVhcmVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZG90KCB0aGlzICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB2ZWN0b3IgY29tcG9uZW50cyBtYXRjaCB0aG9zZSBvZiBhIHByb3ZpZGVkIHZlY3Rvci5cclxuICAgICAqIEFuIG9wdGlvbmFsIGVwc2lsb24gdmFsdWUgbWF5IGJlIHByb3ZpZGVkLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlYzR8QXJyYXl9IHRoYXQgLSBUaGUgdmVjdG9yIHRvIHRlc3QgZXF1YWxpdHkgd2l0aC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlcHNpbG9uIC0gVGhlIGVwc2lsb24gdmFsdWUuIE9wdGlvbmFsLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9yIGNvbXBvbmVudHMgbWF0Y2guXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIHZhciB4ID0gdGhhdC54ICE9PSB1bmRlZmluZWQgPyB0aGF0LnggOiB0aGF0WzBdLFxyXG4gICAgICAgICAgICB5ID0gdGhhdC55ICE9PSB1bmRlZmluZWQgPyB0aGF0LnkgOiB0aGF0WzFdLFxyXG4gICAgICAgICAgICB6ID0gdGhhdC56ICE9PSB1bmRlZmluZWQgPyB0aGF0LnogOiB0aGF0WzJdLFxyXG4gICAgICAgICAgICB3ID0gdGhhdC53ICE9PSB1bmRlZmluZWQgPyB0aGF0LncgOiB0aGF0WzNdO1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggPT09IHggfHwgTWF0aC5hYnMoIHRoaXMueCAtIHggKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnkgPT09IHkgfHwgTWF0aC5hYnMoIHRoaXMueSAtIHkgKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnogPT09IHogfHwgTWF0aC5hYnMoIHRoaXMueiAtIHogKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLncgPT09IHcgfHwgTWF0aC5hYnMoIHRoaXMudyAtIHcgKSA8PSBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG5ldyBWZWM0IG9mIHVuaXQgbGVuZ3RoLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVjNH0gVGhlIHZlY3RvciBvZiB1bml0IGxlbmd0aC5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1hZyA9IHRoaXMubGVuZ3RoKCk7XHJcbiAgICAgICAgaWYgKCBtYWcgIT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgICAgIHRoaXMueCAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueSAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueiAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMudyAvIG1hZyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIFZlYzQgb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWZWM0fSBBIHJhbmRvbSB2ZWN0b3Igb2YgdW5pdCBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIFZlYzQucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yLlxyXG4gICAgICogQG1lbWJlcm9mIFZlYzRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIFZlYzQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMueCArICcsICcgKyB0aGlzLnkgKyAnLCAnICsgdGhpcy56ICsgJywgJyArIHRoaXMudztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmVjNFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gVGhlIHZlY3RvciBhcyBhbiBhcnJheS5cclxuICAgICAqL1xyXG4gICAgVmVjNC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBbIHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlYzQ7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgICAgICBNYXQzMzogcmVxdWlyZSgnLi9NYXQzMycpLFxyXG4gICAgICAgIE1hdDQ0OiByZXF1aXJlKCcuL01hdDQ0JyksXHJcbiAgICAgICAgVmVjMjogcmVxdWlyZSgnLi9WZWMyJyksXHJcbiAgICAgICAgVmVjMzogcmVxdWlyZSgnLi9WZWMzJyksXHJcbiAgICAgICAgVmVjNDogcmVxdWlyZSgnLi9WZWM0JyksXHJcbiAgICAgICAgUXVhdGVybmlvbjogcmVxdWlyZSgnLi9RdWF0ZXJuaW9uJyksXHJcbiAgICAgICAgVHJhbnNmb3JtOiByZXF1aXJlKCcuL1RyYW5zZm9ybScpLFxyXG4gICAgICAgIFRyaWFuZ2xlOiByZXF1aXJlKCcuL1RyaWFuZ2xlJylcclxuICAgIH07XHJcblxyXG59KCkpO1xyXG4iXX0=
