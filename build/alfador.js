!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.alfador=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {

    "use strict";

    module.exports = {
        Mat33: require('./Mat33'),
        Mat44: require('./Mat44'),
        Vec2: require('./Vec2'),
        Vec3: require('./Vec3'),
        Vec4: require('./Vec3'),
        Quaternion: require('./Quaternion'),
        Transform: require('./Transform')
    };

}());

},{"./Mat33":2,"./Mat44":3,"./Quaternion":4,"./Transform":5,"./Vec2":6,"./Vec3":7}],2:[function(require,module,exports){
(function() {

    "use strict";

    var Vec3 = require( './Vec3' ),
        Vec4 = require( './Vec4' );

    function Mat33( that ) {
        if ( that ) {
            if ( that instanceof Mat33 ) {
                // copy data by value
                this.data = that.data.slice( 0 );
            } else if ( that.data && that.data.length === 16 ) {
                // copy Mat44 data by value, account for index differences
                this.data = [
                    that.data[0], that.data[1], that.data[2],
                    that.data[4], that.data[5], that.data[6],
                    that.data[8], that.data[9], that.data[10] ];
            } else if ( that.length === 9 ) {
                // copy array by value, use prototype to cast array buffers
                this.data = Array.prototype.slice.call( that );
            } else {
                return Mat33.identity();
            }
        } else {
            return Mat33.identity();
        }
        return this;
    }

    Mat33.prototype.row = function( index ) {
        return new Vec3(
            this.data[0+index],
            this.data[3+index],
            this.data[6+index] );
    };

    Mat33.prototype.col = function( index ) {
        return new Vec3(
            this.data[0+index*3],
            this.data[1+index*3],
            this.data[2+index*3] );
    };

    Mat33.identity = function() {
        return new Mat33([ 1, 0, 0,
            0, 1, 0,
            0, 0, 1 ]);
    };

    Mat33.scale = function( scale ) {
        if ( scale instanceof Array ) {
            return new Mat33([
                scale[0], 0, 0,
                0, scale[1], 0,
                0, 0, scale[2] ]);
        } else if ( scale instanceof Vec3 ) {
            return new Mat33([
                scale.x, 0, 0,
                0, scale.y, 0,
                0, 0, scale.z ]);
        }
        return new Mat33([
            scale, 0, 0,
            0, scale, 0,
            0, 0, scale ]);
    };

    Mat33.rotationDegrees = function( angle, axis ) {
        return this.rotationRadians( angle*Math.PI/180, axis );
    };

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
            modAngle = ( angle > 0 ) ?  angle % (2*Math.PI) : angle % (-2*Math.PI),
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
        return new Mat33([ (one_c * xx) + c, (one_c * xy) + zs, (one_c * zx) - ys,
                           (one_c * xy) - zs, (one_c * yy) + c, (one_c * yz) + xs,
                           (one_c * zx) + ys, (one_c * yz) - xs, (one_c * zz) + c ]);
    };

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
            to   = new Vec3( toVec ).normalize(),
            e = from.dot( to ),
            f = Math.abs( e ),
            that = new Mat33(),
            x, u, v,
            fx, fy, fz,
            ux, uz,
            c1, c2, c3;
        if ( f > ( 1.0-EPSILON ) ) {
            // "from" and "to" almost parallel
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
            // the most common case, unless "from"="to", or "to"=-"from"
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

    Mat33.prototype.add = function( that ) {
        var mat = new Mat33( that ),
            i;
        for ( i=0; i<9; i++ ) {
            mat.data[i] += this.data[i];
        }
        return mat;
    };

    Mat33.prototype.sub = function( that ) {
        var mat = new Mat33( that ),
            i;
        for ( i=0; i<9; i++ ) {
            mat.data[i] = this.data[i] - mat.data[i];
        }
        return mat;
    };

    Mat33.prototype.multVector = function( that ) {
        return new Vec3({
            x: this.data[0] * that.x + this.data[3] * that.y + this.data[6] * that.z,
            y: this.data[1] * that.x + this.data[4] * that.y + this.data[7] * that.z,
            z: this.data[2] * that.x + this.data[5] * that.y + this.data[8] * that.z
        });
    };

    Mat33.prototype.multScalar = function( that ) {
        var mat = new Mat33(),
            i;
        for ( i=0; i<9; i++ ) {
            mat.data[i] = this.data[i] * that;
        }
        return mat;
    };

    Mat33.prototype.multMatrix = function( that ) {
        var mat = new Mat33(),
            i;
        // ensure 'that' is a Mat33
        that = ( that instanceof Mat33 ) ? that : new Mat33( that );
        for ( i=0; i<3; i++ ) {
            mat.data[i] = this.data[i] * that.data[0] + this.data[i+3] * that.data[1] + this.data[i+6] * that.data[2];
            mat.data[i+3] = this.data[i] * that.data[3] + this.data[i+3] * that.data[4] + this.data[i+6] * that.data[5];
            mat.data[i+6] = this.data[i] * that.data[6] + this.data[i+3] * that.data[7] + this.data[i+6] * that.data[8];
        }
        return mat;
    };

    Mat33.prototype.mult = function( that ) {
        return ( typeof that === "number" ) ? this.multScalar( that )
            : ( that instanceof Array ) ? this.multVector( new Vec3( that ) )
                : ( that instanceof Vec3 || that instanceof Vec4 ) ? this.multVector( that )
                    : this.multMatrix( that );
    };

    Mat33.prototype.div = function( that ) {
        var mat = new Mat33(),
            i;
        for ( i=0; i<9; i++ ) {
            mat.data[i] = this.data[i] / that;
        }
        return mat;
    };

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

    Mat33.prototype.transpose = function() {
        var trans = new Mat33(), i;
        for ( i = 0; i < 3; i++ ) {
            trans.data[i*3]     = this.data[i];
            trans.data[(i*3)+1] = this.data[i+3];
            trans.data[(i*3)+2] = this.data[i+6];
        }
        return trans;
    };

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

    Mat33.prototype.decompose = function() {
        // extract transform components
        var col0 = this.col( 0 ),
            col1 = this.col( 1 ),
            col2 = this.col( 2 );
        return {
            up: col1.normalize(),
            forward: col2.normalize(),
            left: col0.normalize(),
            scale: new Vec3( col0.length(), col1.length(), col2.length() )
        };
    };

    Mat33.random = function() {
        var rot = Mat33.rotationRadians( Math.random() * 360, Vec3.random() ),
            scale = Mat33.scale( Math.random() * 10 );
        return rot.mult( scale );
    };

    Mat33.prototype.toString = function() {
        return this.data[0] +", "+ this.data[3] +", "+ this.data[6] +",\n" +
               this.data[1] +", "+ this.data[4] +", "+ this.data[7] +",\n" +
               this.data[2] +", "+ this.data[5] +", "+ this.data[8];
    };

    Mat33.prototype.toArray = function() {
        return this.data.slice( 0 );
    };

    module.exports = Mat33;

}());

},{"./Vec3":7,"./Vec4":8}],3:[function(require,module,exports){
(function() {

    "use strict";

    var Vec3 = require( './Vec3' ),
        Vec4 = require( './Vec4' ),
        Mat33 = require( './Mat33' );

    function Mat44( that ) {
        if ( that ) {
            if ( that instanceof Mat33 ) {
                // copy data by value, account for index differences
                this.data = [
                    that.data[0], that.data[1], that.data[2], 0,
                    that.data[3], that.data[4], that.data[5], 0,
                    that.data[6], that.data[7], that.data[8], 0,
                    0, 0, 0, 1 ];
            } else if ( that instanceof Mat44 ) {
                // copy data by value
                this.data = that.data.slice( 0 );
            } else if ( that.length === 16 ) {
                 // copy array by value, use prototype to cast array buffers
                this.data = Array.prototype.slice.call( that );
            } else {
                return Mat44.identity();
            }
        } else {
            return Mat44.identity();
        }
        return this;
    }

    Mat44.prototype.row = function( index ) {
        return new Vec4(
            this.data[0+index],
            this.data[4+index],
            this.data[8+index],
            this.data[12+index] );
    };

    Mat44.prototype.col = function( index ) {
        return new Vec4(
            this.data[0+index*4],
            this.data[1+index*4],
            this.data[2+index*4],
            this.data[3+index*4] );
    };

    Mat44.identity = function() {
        return new Mat44([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1 ]);
    };

    Mat44.scale = function( scale ) {
        if ( scale instanceof Array ) {
            return new Mat44(
                [ scale[0], 0, 0, 0,
                0, scale[1], 0, 0,
                0, 0, scale[2], 0,
                0, 0, 0, 1 ]);
        } else if ( scale instanceof Vec3 ) {
            return new Mat44([
                scale.x, 0, 0, 0,
                0, scale.y, 0, 0,
                0, 0, scale.z, 0,
                0, 0, 0, 1 ]);
        }
        return new Mat44([
            scale, 0, 0, 0,
            0, scale, 0, 0,
            0, 0, scale, 0,
            0, 0, 0, 1 ]);
    };

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

    Mat44.rotationDegrees = function( angle, axis ) {
        return new Mat44( Mat33.rotationDegrees( angle, axis ) );
    };

    Mat44.rotationRadians = function( angle, axis ) {
        return new Mat44( Mat33.rotationRadians( angle, axis ) );
    };

    Mat44.rotationFromTo = function( fromVec, toVec ) {
        return new Mat44( Mat33.rotationFromTo( fromVec, toVec ) );
    };

    Mat44.prototype.add = function( that ) {
        var mat = new Mat44( that ),
            i;
        for ( i=0; i<16; i++ ) {
            mat.data[i] += this.data[i];
        }
        return mat;
    };

    Mat44.prototype.sub = function( that ) {
        var mat = new Mat44( that ),
            i;
        for ( i=0; i<16; i++ ) {
            mat.data[i] = this.data[i] - mat.data[i];
        }
        return mat;
    };

    Mat44.prototype.multVector3 = function( that ) {
        return new Vec3({
            x: this.data[0] * that.x + this.data[4] * that.y + this.data[8] * that.z + this.data[12],
            y: this.data[1] * that.x + this.data[5] * that.y + this.data[9] * that.z + this.data[13],
            z: this.data[2] * that.x + this.data[6] * that.y + this.data[10] * that.z + this.data[14]
        });
    };

    Mat44.prototype.multVector4 = function( that ) {
        return new Vec4({
            x: this.data[0] * that.x + this.data[4] * that.y + this.data[8] * that.z + this.data[12] * that.w,
            y: this.data[1] * that.x + this.data[5] * that.y + this.data[9] * that.z + this.data[13] * that.w,
            z: this.data[2] * that.x + this.data[6] * that.y + this.data[10] * that.z + this.data[14] * that.w,
            w: this.data[3] * that.x + this.data[7] * that.y + this.data[11] * that.z + this.data[15] * that.w
        });
    };

    Mat44.prototype.multScalar = function( that ) {
        var mat = new Mat44(),
            i;
        for ( i=0; i<16; i++ ) {
            mat.data[i] = this.data[i] * that;
        }
        return mat;
    };

    Mat44.prototype.multMatrix = function( that ) {
        var mat = new Mat44(),
            i;
        // ensure 'that' is a Mat44
        that = ( that instanceof Mat44 ) ? that : new Mat44( that );
        for ( i=0; i<4; i++ ) {
            mat.data[i] = this.data[i] * that.data[0] + this.data[i+4] * that.data[1] + this.data[i+8] * that.data[2] + this.data[i+12] * that.data[3];
            mat.data[i+4] = this.data[i] * that.data[4] + this.data[i+4] * that.data[5] + this.data[i+8] * that.data[6] + this.data[i+12] * that.data[7];
            mat.data[i+8] = this.data[i] * that.data[8] + this.data[i+4] * that.data[9] + this.data[i+8] * that.data[10] + this.data[i+12] * that.data[11];
            mat.data[i+12] = this.data[i] * that.data[12] + this.data[i+4] * that.data[13] + this.data[i+8] * that.data[14] + this.data[i+12] * that.data[15];
        }
        return mat;
    };

    Mat44.prototype.mult = function( that ) {
        return ( typeof that === "number" ) ? this.multScalar( that )
            : ( that instanceof Array ) ?
                    ( ( that.length === 3 ) ? this.multVector3( new Vec3( that ) )
                        : this.multVector4( new Vec4( that ) ) )
                : ( that instanceof Vec3 ) ? this.multVector3( that )
                    : ( that instanceof Vec4 ) ? this.multVector4( new Mat44( that ) )
                        : this.multMatrix( that );
    };

    Mat44.prototype.div = function( that ) {
        var mat = new Mat44(), i;
        for ( i=0; i<16; i++ ) {
            mat.data[i] = this.data[i] / that;
        }
        return mat;
    };

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

    Mat44.ortho = function( xMin, xMax, yMin, yMax, zMin, zMax ) {
        var mat = Mat44.identity();
        mat.data[0] = 2 / (xMax - xMin);
        mat.data[5] = 2 / (yMax - yMin);
        mat.data[10] = -2 / (zMax - zMin);
        mat.data[12] = -((xMax + xMin)/(xMax - xMin));
        mat.data[13] = -((yMax + yMin)/(yMax - yMin));
        mat.data[14] = -((zMax + zMin)/(zMax - zMin));
        return mat;
    };

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

    Mat44.prototype.decompose = function() {
        // extract transform components
        var col0 = new Vec3( this.col( 0 ) ),
            col1 = new Vec3( this.col( 1 ) ),
            col2 = new Vec3( this.col( 2 ) ),
            col3 = new Vec3( this.col( 3 ) );
        return {
            up: col1.normalize(),
            forward: col2.normalize(),
            left: col0.normalize(),
            origin: col3,
            scale: new Vec3( col0.length(), col1.length(), col2.length() )
        };
    };

    Mat44.random = function() {
        var rot = Mat44.rotationRadians( Math.random() * 360, Vec3.random() ),
            scale = Mat44.scale( Math.random() * 10 ),
            translation = Mat44.translation( Vec3.random() );
        return translation.mult( rot.mult( scale ) );
    };

    Mat44.prototype.toString = function() {
        return this.data[0] +", "+ this.data[4] +", "+ this.data[8] +", "+ this.data[12] +",\n" +
            this.data[1] +", "+ this.data[5] +", "+ this.data[9] +", "+ this.data[13] +",\n" +
            this.data[2] +", "+ this.data[6] +", "+ this.data[10] +", "+ this.data[14] +",\n" +
            this.data[3] +", "+ this.data[7] +", "+ this.data[11] +", "+ this.data[15];
    };

    Mat44.prototype.toArray = function() {
        return this.data.slice( 0 );
    };

    module.exports = Mat44;

}());

},{"./Mat33":2,"./Vec3":7,"./Vec4":8}],4:[function(require,module,exports){
(function() {

    "use strict";

    var Vec3 = require('./Vec3'),
        Mat33 = require('./Mat33');

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

    Quaternion.identity = function() {
        return new Quaternion( 1, 0, 0, 0 );
    };

    Quaternion.prototype.multQuaternion = function( that ) {
        var w = (that.w * this.w) - (that.x * this.x) - (that.y * this.y) - (that.z * this.z),
            x = this.y*that.z - this.z*that.y + this.w*that.x + this.x*that.w,
            y = this.z*that.x - this.x*that.z + this.w*that.y + this.y*that.w,
            z = this.x*that.y - this.y*that.x + this.w*that.z + this.z*that.w;
        return new Quaternion( w, x, y, z );
    };

    Quaternion.prototype.multVector = function( that ) {
        var vq = new Quaternion( 0, that.x, that.y, that.z ),
            r = this.multQuaternion( vq ).multQuaternion( this.inverse() );
        return new Vec3( r.x, r.y, r.z );
    };

    Quaternion.prototype.mult = function( that ) {
        if ( that instanceof Vec3 ) {
            return this.multVector( that );
        } else {
            return this.multQuaternion( that );
        }
    };

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
        return new Mat33([ 1 - 2*yy - 2*zz, 2*xy + 2*zw, 2*xz - 2*yw,
                           2*xy - 2*zw, 1 - 2*xx - 2*zz, 2*yz + 2*xw,
                           2*xz + 2*yw, 2*yz - 2*xw, 1 - 2*xx - 2*yy ]);
    };

    Quaternion.rotationDegrees = function( angle, axis ) {
        return Quaternion.rotationRadians( angle*( Math.PI/180 ), axis );
    };

    Quaternion.rotationRadians = function( angle, axis ) {
        // normalize arguments
        angle = ( angle > 0 ) ?  angle % (2*Math.PI) : angle % (-2*Math.PI);
        axis = axis.normalize();
        // set quaternion for the equivolent rotation
        var sina = Math.sin( angle/2 ),
            cosa = Math.cos( angle/2 );
        return new Quaternion(
            cosa,
            axis.x * sina,
            axis.y * sina,
            axis.z * sina ).normalize();
    };

    Quaternion.prototype.length = function() {
        return Math.sqrt( this.lengthSquared() );
    };

    Quaternion.prototype.lengthSquared = function() {
        return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;
    };

    Quaternion.prototype.equals = function( that, epsilon ) {
        epsilon = epsilon === undefined ? 0 : epsilon;
        return ( this.x === that.x || Math.abs( this.x - that.x ) <= epsilon ) &&
            ( this.y === that.y || Math.abs( this.y - that.y ) <= epsilon ) &&
            ( this.z === that.z || Math.abs( this.z - that.z ) <= epsilon ) &&
            ( this.w === that.w || Math.abs( this.w - that.w ) <= epsilon );
    };

    Quaternion.prototype.normalize = function() {
        var mag = this.length();
        if ( mag !== 0 ) {
            return new Quaternion(
                this.w / mag,
                this.x / mag,
                this.y / mag,
                this.z / mag );
        }
        return new Quaternion();
    };

    Quaternion.prototype.conjugate = function() {
         return new Quaternion( this.w, -this.x, -this.y, -this.z );
    };

    Quaternion.prototype.inverse = function() {
        return this.conjugate();
    };

    Quaternion.random = function() {
        var axis = Vec3.random().normalize(),
            angle = Math.random();
        return Quaternion.rotationRadians( angle, axis );
    };

    Quaternion.prototype.toString = function() {
        return this.x + ", " + this.y + ", " + this.z + ", " + this.w;
    };

    Quaternion.prototype.toArray = function() {
        return [ this.x, this.y, this.z, this.w ];
    };

    module.exports = Quaternion;

}());

},{"./Mat33":2,"./Vec3":7}],5:[function(require,module,exports){
(function() {

    "use strict";

    var Vec3 = require( './Vec3' ),
        Mat33 = require( './Mat33' ),
        Mat44 = require( './Mat44' ),
        DEFAULT_UP = new Vec3( 0, 1, 0 ),
        DEFAULT_FORWARD = new Vec3( 0, 0, 1 ),
        DEFAULT_LEFT = new Vec3( 1, 0, 0 ),
        DEFAULT_ORIGIN = new Vec3( 0, 0, 0 ),
        DEFAULT_SCALE = new Vec3( 1, 1, 1 );

    function Transform( spec ) {
        spec = spec || {};
        if ( spec instanceof Transform ) {
            // copy transform by value
            this._up = spec.up();
            this._forward = spec.forward();
            this._left = spec.left();
            this._origin = spec.origin();
            this._scale = spec.scale();
        } else if ( spec instanceof Mat44 || spec instanceof Mat33 ) {
            // extract transform components from Mat44
            spec = spec.decompose();
            this._up = spec.up;
            this._forward = spec.forward;
            this._left = spec.left;
            this._scale = spec.scale;
            this._origin = spec.origin || DEFAULT_ORIGIN;
        } else {
            // default to identity
            this._up = spec.up ? new Vec3( spec.up ).normalize() : DEFAULT_UP;
            this._forward = spec.forward ? new Vec3( spec.forward ).normalize() : DEFAULT_FORWARD;
            this._left = spec.left ? new Vec3( spec.left ).normalize() : this._up.cross( this._forward ).normalize();
            this.origin( spec.origin || DEFAULT_ORIGIN );
            this.scale( spec.scale || DEFAULT_SCALE );
        }
        return this;
    }

    Transform.identity = function() {
        return new Transform({
            up: DEFAULT_UP,
            forward: DEFAULT_FORWARD,
            left: DEFAULT_LEFT,
            origin: DEFAULT_ORIGIN,
            scale: DEFAULT_SCALE
        });
    };

    Transform.prototype.origin = function( origin ) {
        if ( origin ) {
            this._origin = new Vec3( origin );
            return this;
        }
        return new Vec3( this._origin );
    };

    Transform.prototype.forward = function( forward ) {
        if ( forward ) {
            forward = ( forward instanceof Array ) ? new Vec3( forward ).normalize() : forward.normalize();
            var rot = Mat33.rotationFromTo( this._forward, forward );
            this._forward = forward;
            this._up = rot.mult( this._up ).normalize();
            this._left = rot.mult( this._left ).normalize();
            return this;
        }
        return new Vec3( this._forward );
    };

    Transform.prototype.up = function( up ) {
        if ( up ) {
            up = ( up instanceof Array ) ? new Vec3( up ).normalize() : up.normalize();
            var rot = Mat33.rotationFromTo( this._up, up );
            this._forward = rot.mult( this._forward ).normalize();
            this._up = up;
            this._left = rot.mult( this._left ).normalize();
            return this;
        }
        return new Vec3( this._up );
    };

    Transform.prototype.left = function( left ) {
        if ( left ) {
            left = ( left instanceof Array ) ? new Vec3( left ).normalize() : left.normalize();
            var rot = Mat33.rotationFromTo( this._left, left );
            this._forward = rot.mult( this._forward ).normalize();
            this._up = rot.mult( this._up ).normalize();
            this._left = left;
            return this;
        }
        return new Vec3( this._left );
    };

    Transform.prototype.scale = function( scale ) {
        if ( scale ) {
            if ( typeof scale === "number" ) {
                this._scale = new Vec3( scale, scale, scale );
            } else {
                this._scale = new Vec3( scale );
            }
            return this;
        }
        return this._scale;
    };

    Transform.prototype.mult = function( that ) {
        if ( that instanceof Transform ) {
            return new Transform( this.matrix().mult( that.matrix() ) );
        } else if ( that instanceof Mat33 || that instanceof Mat44 ) {
            return new Transform( this.matrix().mult( that ) );
        } else {
            return Transform.identity();
        }
    };

    Transform.prototype.scaleMatrix = function() {
        return Mat44.scale( this._scale );
    };

    Transform.prototype.rotationMatrix = function() {
        return new Mat44( [ this._left.x, this._left.y, this._left.z, 0,
            this._up.x, this._up.y, this._up.z, 0,
            this._forward.x, this._forward.y, this._forward.z, 0,
            0, 0, 0, 1 ] );
    };

    Transform.prototype.translationMatrix = function() {
        return Mat44.translation( this._origin );
    };

    Transform.prototype.inverseScaleMatrix = function() {
        return Mat44.scale( new Vec3( 1/this._scale.x, 1/this._scale.y, 1/this._scale.z ) );
    };

    Transform.prototype.inverseRotationMatrix = function() {
        return new Mat44( [ this._left.x, this._up.x, this._forward.x, 0,
            this._left.y, this._up.y, this._forward.y, 0,
            this._left.z, this._up.z, this._forward.z, 0,
            0, 0, 0, 1 ] );
    };

    Transform.prototype.inverseTranslationMatrix = function() {
        return Mat44.translation( new Vec3( -this._origin.x, -this._origin.y, -this._origin.z ) );
    };

    Transform.prototype.matrix = function() {
        // T * R * S
        return this.translationMatrix().mult( this.rotationMatrix() ).mult( this.scaleMatrix() );
    };

    Transform.prototype.inverseMatrix = function() {
        // S^-1 * R^-1 * T^-1
        return this.inverseScaleMatrix().mult( this.inverseRotationMatrix() ).mult( this.inverseTranslationMatrix() );
    };

    Transform.prototype.viewMatrix = function() {
        var nOrigin = new Vec3( -this._origin.x, -this._origin.y, -this._origin.z ),
            right = new Vec3( -this._left.x, -this._left.y, -this._left.z ),
            backward = new Vec3( -this._forward.x, -this._forward.y, -this._forward.z );
        return new Mat44( [ -this._left.x, this._up.x, -this._forward.x, 0,
            -this._left.y, this._up.y, -this._forward.y, 0,
            -this._left.z, this._up.z, -this._forward.z, 0,
            nOrigin.dot( right ), nOrigin.dot( this._up ), nOrigin.dot( backward ), 1 ] );
    };

    Transform.prototype.translateWorld = function( translation ) {
        this._origin = this._origin.add( translation );
        return this;
    };

    Transform.prototype.translateLocal = function( translation ) {
        translation = ( translation instanceof Array ) ? new Vec3( translation ) : translation;
        this._origin = this._origin.add( this._left.mult( translation.x ) );
        this._origin = this._origin.add( this._up.mult( translation.y ) );
        this._origin = this._origin.add( this._forward.mult( translation.z ) );
        return this;
    };

    Transform.prototype.rotateWorldDegrees = function( angle, axis ) {
        return this.rotateWorldRadians( angle * Math.PI / 180, axis );
    };

    Transform.prototype.rotateWorldRadians = function( angle, axis ) {
        var rot = Mat33.rotationRadians( angle, axis );
        this._up = rot.mult( this._up );
        this._forward = rot.mult( this._forward );
        this._left= rot.mult( this._left );
        return this;
    };

    Transform.prototype.rotateLocalDegrees = function( angle, axis ) {
        return this.rotateWorldDegrees( angle, this.rotationMatrix().mult( axis ) );
    };

    Transform.prototype.rotateLocalRadians = function( angle, axis ) {
        return this.rotateWorldRadians( angle, this.rotationMatrix().mult( axis ) );
    };

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

    Transform.prototype.equals = function( that, epsilon ) {
        return this._origin.equals( that.origin(), epsilon ) &&
            this._forward.equals( that.forward(), epsilon ) &&
            this._up.equals( that.up(), epsilon ) &&
            this._left.equals( that.left(), epsilon ) &&
            this._scale.equals( that.scale(), epsilon );
    };

    Transform.random = function() {
        return new Transform()
            .origin( Vec3.random() )
            .forward( Vec3.random() )
            .scale( Vec3.random() );
    };

    Transform.prototype.toString = function() {
        return this.matrix().toString();
    };

    module.exports = Transform;

}());

},{"./Mat33":2,"./Mat44":3,"./Vec3":7}],6:[function(require,module,exports){
(function() {

    "use strict";

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

    Vec2.prototype.add = function( that ) {
        if ( that instanceof Array ) {
            return new Vec2( this.x + that[0], this.y + that[1] );
        }
        return new Vec2( this.x + that.x, this.y + that.y );
    };

    Vec2.prototype.sub = function( that ) {
        if ( that instanceof Array ) {
            return new Vec2( this.x - that[0], this.y - that[1] );
        }
        return new Vec2( this.x - that.x, this.y - that.y );
    };

    Vec2.prototype.mult = function( that ) {
        return new Vec2( this.x * that, this.y * that );
    };

    Vec2.prototype.div = function( that ) {
        return new Vec2( this.x / that, this.y / that );
    };

    Vec2.prototype.dot = function( that ) {
        if ( that instanceof Array ) {
            return ( this.x * that[0] ) + ( this.y * that[1] );
        }
        return ( this.x * that.x ) + ( this.y * that.y );
    };

    Vec2.prototype.length = function( length ) {
        if ( length === undefined ) {
            return Math.sqrt( this.dot( this ) );
        }
        return this.normalize().mult( length );
    };

    Vec2.prototype.lengthSquared = function() {
        return this.dot( this );
    };

    Vec2.prototype.equals = function( that, epsilon ) {
        epsilon = epsilon === undefined ? 0 : epsilon;
        return ( this.x === that.x || Math.abs( this.x - that.x ) <= epsilon ) &&
            ( this.y === that.y || Math.abs( this.y - that.y ) <= epsilon );
    };

    Vec2.prototype.cross = function( that ) {
        if ( that instanceof Array ) {
            return ( this.x * that[1] ) - ( this.y * that[0] );
        }
         return ( this.x * that.y ) - ( this.y * that.x );
    };

    Vec2.prototype.normalize = function() {
        var mag = this.length();
        if ( mag !== 0 ) {
            return new Vec2(
                this.x / mag,
                this.y / mag );
        }
        return new Vec2();
    };

    Vec2.random = function() {
        return new Vec2(
            Math.random(),
            Math.random() ).normalize();
    };

    Vec2.prototype.toString = function() {
        return this.x + ", " + this.y;
    };

    Vec2.prototype.toArray = function() {
        return [ this.x, this.y ];
    };

    module.exports = Vec2;

}());

},{}],7:[function(require,module,exports){
(function() {

    "use strict";

    function Vec3() {
        switch ( arguments.length ) {
            case 1:
                // array or Quaternion argument
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

    Vec3.prototype.add = function( that ) {
        if ( that instanceof Array ) {
            return new Vec3( this.x + that[0], this.y + that[1], this.z + that[2] );
        }
        return new Vec3( this.x + that.x, this.y + that.y, this.z + that.z );
    };

    Vec3.prototype.sub = function( that ) {
        if ( that instanceof Array ) {
            return new Vec3( this.x - that[0], this.y - that[1], this.z - that[2] );
        }
        return new Vec3( this.x - that.x, this.y - that.y, this.z - that.z );
    };

    Vec3.prototype.mult = function( that ) {
        return new Vec3( this.x * that, this.y * that, this.z * that );
    };

    Vec3.prototype.div = function( that ) {
        return new Vec3( this.x / that, this.y / that, this.z / that );
    };

    Vec3.prototype.dot = function( that ) {
        if ( that instanceof Array ) {
            return ( this.x * that[0] ) + ( this.y * that[1] ) + ( this.z * that[2] );
        }
        return ( this.x * that.x ) + ( this.y * that.y ) + ( this.z * that.z );
    };

    Vec3.prototype.length = function( length ) {
        if ( length === undefined ) {
            return Math.sqrt( this.dot( this ) );
        }
        return this.normalize().mult( length );
    };

    Vec3.prototype.lengthSquared = function() {
        return this.dot( this );
    };

    Vec3.prototype.equals = function( that, epsilon ) {
        epsilon = epsilon === undefined ? 0 : epsilon;
        return ( this.x === that.x || Math.abs( this.x - that.x ) <= epsilon ) &&
            ( this.y === that.y || Math.abs( this.y - that.y ) <= epsilon ) &&
            ( this.z === that.z || Math.abs( this.z - that.z ) <= epsilon );
    };

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

    Vec3.random = function() {
        return new Vec3(
            Math.random(),
            Math.random(),
            Math.random() ).normalize();
    };

    Vec3.prototype.toString = function() {
        return this.x + ", " + this.y + ", " + this.z;
    };

    Vec3.prototype.toArray = function() {
        return [ this.x, this.y, this.z ];
    };

    module.exports = Vec3;

}());

},{}],8:[function(require,module,exports){
(function() {

    "use strict";

    function Vec4() {
        switch ( arguments.length ) {
            case 1:
                // array or Quaternion argument
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

    Vec4.prototype.mult = function( that ) {
        return new Vec4(
            this.x * that,
            this.y * that,
            this.z * that,
            this.w * that );
    };

    Vec4.prototype.div = function( that ) {
        return new Vec4(
            this.x / that,
            this.y / that,
            this.z / that,
            this.w / that );
    };

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

    Vec4.prototype.length = function( length ) {
        if ( length === undefined ) {
            return Math.sqrt( this.dot( this ) );
        }
        return this.normalize().mult( length );
    };

    Vec4.prototype.lengthSquared = function() {
        return this.dot( this );
    };

    Vec4.prototype.equals = function( that, epsilon ) {
        epsilon = epsilon === undefined ? 0 : epsilon;
        return ( this.x === that.x || Math.abs( this.x - that.x ) <= epsilon ) &&
               ( this.y === that.y || Math.abs( this.y - that.y ) <= epsilon ) &&
               ( this.z === that.z || Math.abs( this.z - that.z ) <= epsilon ) &&
               ( this.w === that.w || Math.abs( this.w - that.w ) <= epsilon );
    };

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

    Vec4.random = function() {
        return new Vec4(
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random() ).normalize();
    };

    Vec4.prototype.toString = function() {
        return this.x + ", " + this.y + ", " + this.z + ", " + this.w;
    };

    Vec4.prototype.toArray = function() {
        return [ this.x, this.y, this.z, this.w ];
    };

    module.exports = Vec4;

}());

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjXFxleHBvcnRzLmpzIiwic3JjXFxNYXQzMy5qcyIsInNyY1xcTWF0NDQuanMiLCJzcmNcXFF1YXRlcm5pb24uanMiLCJzcmNcXFRyYW5zZm9ybS5qcyIsInNyY1xcVmVjMi5qcyIsInNyY1xcVmVjMy5qcyIsInNyY1xcVmVjNC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgICAgIE1hdDMzOiByZXF1aXJlKCcuL01hdDMzJyksXHJcbiAgICAgICAgTWF0NDQ6IHJlcXVpcmUoJy4vTWF0NDQnKSxcclxuICAgICAgICBWZWMyOiByZXF1aXJlKCcuL1ZlYzInKSxcclxuICAgICAgICBWZWMzOiByZXF1aXJlKCcuL1ZlYzMnKSxcclxuICAgICAgICBWZWM0OiByZXF1aXJlKCcuL1ZlYzMnKSxcclxuICAgICAgICBRdWF0ZXJuaW9uOiByZXF1aXJlKCcuL1F1YXRlcm5pb24nKSxcclxuICAgICAgICBUcmFuc2Zvcm06IHJlcXVpcmUoJy4vVHJhbnNmb3JtJylcclxuICAgIH07XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgdmFyIFZlYzMgPSByZXF1aXJlKCAnLi9WZWMzJyApLFxyXG4gICAgICAgIFZlYzQgPSByZXF1aXJlKCAnLi9WZWM0JyApO1xyXG5cclxuICAgIGZ1bmN0aW9uIE1hdDMzKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCApIHtcclxuICAgICAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgTWF0MzMgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb3B5IGRhdGEgYnkgdmFsdWVcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoYXQuZGF0YS5zbGljZSggMCApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGF0LmRhdGEgJiYgdGhhdC5kYXRhLmxlbmd0aCA9PT0gMTYgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb3B5IE1hdDQ0IGRhdGEgYnkgdmFsdWUsIGFjY291bnQgZm9yIGluZGV4IGRpZmZlcmVuY2VzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kYXRhWzBdLCB0aGF0LmRhdGFbMV0sIHRoYXQuZGF0YVsyXSxcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmRhdGFbNF0sIHRoYXQuZGF0YVs1XSwgdGhhdC5kYXRhWzZdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGF0YVs4XSwgdGhhdC5kYXRhWzldLCB0aGF0LmRhdGFbMTBdIF07XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHRoYXQubGVuZ3RoID09PSA5ICkge1xyXG4gICAgICAgICAgICAgICAgLy8gY29weSBhcnJheSBieSB2YWx1ZSwgdXNlIHByb3RvdHlwZSB0byBjYXN0IGFycmF5IGJ1ZmZlcnNcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCB0aGF0ICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0MzMuaWRlbnRpdHkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXQzMy5pZGVudGl0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBNYXQzMy5wcm90b3R5cGUucm93ID0gZnVuY3Rpb24oIGluZGV4ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMytpbmRleF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs2K2luZGV4XSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuY29sID0gZnVuY3Rpb24oIGluZGV4ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXgqM10sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxK2luZGV4KjNdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMitpbmRleCozXSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5pZGVudGl0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoWyAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5zY2FsZSA9IGZ1bmN0aW9uKCBzY2FsZSApIHtcclxuICAgICAgICBpZiAoIHNjYWxlIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICAgICAgc2NhbGVbMF0sIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCBzY2FsZVsxXSwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIHNjYWxlWzJdIF0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIHNjYWxlIGluc3RhbmNlb2YgVmVjMyApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXQzMyhbXHJcbiAgICAgICAgICAgICAgICBzY2FsZS54LCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgc2NhbGUueSwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIHNjYWxlLnogXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgTWF0MzMoW1xyXG4gICAgICAgICAgICBzY2FsZSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgc2NhbGUsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIHNjYWxlIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5yb3RhdGlvbkRlZ3JlZXMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRpb25SYWRpYW5zKCBhbmdsZSpNYXRoLlBJLzE4MCwgYXhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5yb3RhdGlvblJhZGlhbnMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgaWYgKCBheGlzIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGF4aXMgPSBuZXcgVmVjMyggYXhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB6ZXJvIHZlY3RvciwgcmV0dXJuIGlkZW50aXR5XHJcbiAgICAgICAgaWYgKCBheGlzLmxlbmd0aFNxdWFyZWQoKSA9PT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5vcm1BeGlzID0gYXhpcy5ub3JtYWxpemUoKSxcclxuICAgICAgICAgICAgeCA9IG5vcm1BeGlzLngsXHJcbiAgICAgICAgICAgIHkgPSBub3JtQXhpcy55LFxyXG4gICAgICAgICAgICB6ID0gbm9ybUF4aXMueixcclxuICAgICAgICAgICAgbW9kQW5nbGUgPSAoIGFuZ2xlID4gMCApID8gIGFuZ2xlICUgKDIqTWF0aC5QSSkgOiBhbmdsZSAlICgtMipNYXRoLlBJKSxcclxuICAgICAgICAgICAgcyA9IE1hdGguc2luKCBtb2RBbmdsZSApLFxyXG4gICAgICAgICAgICBjID0gTWF0aC5jb3MoIG1vZEFuZ2xlICksXHJcbiAgICAgICAgICAgIHh4ID0geCAqIHgsXHJcbiAgICAgICAgICAgIHl5ID0geSAqIHksXHJcbiAgICAgICAgICAgIHp6ID0geiAqIHosXHJcbiAgICAgICAgICAgIHh5ID0geCAqIHksXHJcbiAgICAgICAgICAgIHl6ID0geSAqIHosXHJcbiAgICAgICAgICAgIHp4ID0geiAqIHgsXHJcbiAgICAgICAgICAgIHhzID0geCAqIHMsXHJcbiAgICAgICAgICAgIHlzID0geSAqIHMsXHJcbiAgICAgICAgICAgIHpzID0geiAqIHMsXHJcbiAgICAgICAgICAgIG9uZV9jID0gMS4wIC0gYztcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFsgKG9uZV9jICogeHgpICsgYywgKG9uZV9jICogeHkpICsgenMsIChvbmVfYyAqIHp4KSAtIHlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAob25lX2MgKiB4eSkgLSB6cywgKG9uZV9jICogeXkpICsgYywgKG9uZV9jICogeXopICsgeHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChvbmVfYyAqIHp4KSArIHlzLCAob25lX2MgKiB5eikgLSB4cywgKG9uZV9jICogenopICsgYyBdKTtcclxuICAgIH07XHJcblxyXG4gICAgTWF0MzMucm90YXRpb25Gcm9tVG8gPSBmdW5jdGlvbiggZnJvbVZlYywgdG9WZWMgKSB7XHJcbiAgICAgICAgLypCdWlsZHMgdGhlIHJvdGF0aW9uIG1hdHJpeCB0aGF0IHJvdGF0ZXMgb25lIHZlY3RvciBpbnRvIGFub3RoZXIuXHJcblxyXG4gICAgICAgIFRoZSBnZW5lcmF0ZWQgcm90YXRpb24gbWF0cml4IHdpbGwgcm90YXRlIHRoZSB2ZWN0b3IgZnJvbSBpbnRvXHJcbiAgICAgICAgdGhlIFZlY3RvcjM8dmFyPiB0by4gZnJvbSBhbmQgdG8gbXVzdCBiZSB1bml0IFZlY3RvcjM8dmFyPnMhXHJcblxyXG4gICAgICAgIFRoaXMgbWV0aG9kIGlzIGJhc2VkIG9uIHRoZSBjb2RlIGZyb206XHJcblxyXG4gICAgICAgIFRvbWFzIE1sbGVyLCBKb2huIEh1Z2hlc1xyXG4gICAgICAgIEVmZmljaWVudGx5IEJ1aWxkaW5nIGEgTWF0cml4IHRvIFJvdGF0ZSBPbmUgVmVjdG9yIHRvIEFub3RoZXJcclxuICAgICAgICBKb3VybmFsIG9mIEdyYXBoaWNzIFRvb2xzLCA0KDQpOjEtNCwgMTk5OVxyXG4gICAgICAgICovXHJcbiAgICAgICAgdmFyIEVQU0lMT04gPSAwLjAwMDAwMSxcclxuICAgICAgICAgICAgZnJvbSA9IG5ldyBWZWMzKCBmcm9tVmVjICkubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIHRvICAgPSBuZXcgVmVjMyggdG9WZWMgKS5ub3JtYWxpemUoKSxcclxuICAgICAgICAgICAgZSA9IGZyb20uZG90KCB0byApLFxyXG4gICAgICAgICAgICBmID0gTWF0aC5hYnMoIGUgKSxcclxuICAgICAgICAgICAgdGhhdCA9IG5ldyBNYXQzMygpLFxyXG4gICAgICAgICAgICB4LCB1LCB2LFxyXG4gICAgICAgICAgICBmeCwgZnksIGZ6LFxyXG4gICAgICAgICAgICB1eCwgdXosXHJcbiAgICAgICAgICAgIGMxLCBjMiwgYzM7XHJcbiAgICAgICAgaWYgKCBmID4gKCAxLjAtRVBTSUxPTiApICkge1xyXG4gICAgICAgICAgICAvLyBcImZyb21cIiBhbmQgXCJ0b1wiIGFsbW9zdCBwYXJhbGxlbFxyXG4gICAgICAgICAgICAvLyBuZWFybHkgb3J0aG9nb25hbFxyXG4gICAgICAgICAgICBmeCA9IE1hdGguYWJzKCBmcm9tLnggKTtcclxuICAgICAgICAgICAgZnkgPSBNYXRoLmFicyggZnJvbS55ICk7XHJcbiAgICAgICAgICAgIGZ6ID0gTWF0aC5hYnMoIGZyb20ueiApO1xyXG4gICAgICAgICAgICBpZiAoZnggPCBmeSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZ4PGZ6KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBWZWMzKCAxLCAwLCAwICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgVmVjMyggMCwgMCwgMSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZ5IDwgZnopIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbmV3IFZlYzMoIDAsIDEsIDAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBWZWMzKCAwLCAwLCAxICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdSA9IHguc3ViKCBmcm9tICk7XHJcbiAgICAgICAgICAgIHYgPSB4LnN1YiggdG8gKTtcclxuICAgICAgICAgICAgYzEgPSAyLjAgLyB1LmRvdCggdSApO1xyXG4gICAgICAgICAgICBjMiA9IDIuMCAvIHYuZG90KCB2ICk7XHJcbiAgICAgICAgICAgIGMzID0gYzEqYzIgKiB1LmRvdCggdiApO1xyXG4gICAgICAgICAgICAvLyBzZXQgbWF0cml4IGVudHJpZXNcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzBdID0gLSBjMSp1LngqdS54IC0gYzIqdi54KnYueCArIGMzKnYueCp1Lng7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVszXSA9IC0gYzEqdS54KnUueSAtIGMyKnYueCp2LnkgKyBjMyp2LngqdS55O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbNl0gPSAtIGMxKnUueCp1LnogLSBjMip2Lngqdi56ICsgYzMqdi54KnUuejtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzFdID0gLSBjMSp1LnkqdS54IC0gYzIqdi55KnYueCArIGMzKnYueSp1Lng7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVs0XSA9IC0gYzEqdS55KnUueSAtIGMyKnYueSp2LnkgKyBjMyp2LnkqdS55O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbN10gPSAtIGMxKnUueSp1LnogLSBjMip2Lnkqdi56ICsgYzMqdi55KnUuejtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzJdID0gLSBjMSp1LnoqdS54IC0gYzIqdi56KnYueCArIGMzKnYueip1Lng7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVs1XSA9IC0gYzEqdS56KnUueSAtIGMyKnYueip2LnkgKyBjMyp2LnoqdS55O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbOF0gPSAtIGMxKnUueip1LnogLSBjMip2Lnoqdi56ICsgYzMqdi56KnUuejtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzBdICs9IDEuMDtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzRdICs9IDEuMDtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzhdICs9IDEuMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0aGUgbW9zdCBjb21tb24gY2FzZSwgdW5sZXNzIFwiZnJvbVwiPVwidG9cIiwgb3IgXCJ0b1wiPS1cImZyb21cIlxyXG4gICAgICAgICAgICB2ID0gZnJvbS5jcm9zcyggdG8gKTtcclxuICAgICAgICAgICAgdSA9IDEuMCAvICggMS4wICsgZSApOyAgICAvLyBvcHRpbWl6YXRpb24gYnkgR290dGZyaWVkIENoZW5cclxuICAgICAgICAgICAgdXggPSB1ICogdi54O1xyXG4gICAgICAgICAgICB1eiA9IHUgKiB2Lno7XHJcbiAgICAgICAgICAgIGMxID0gdXggKiB2Lnk7XHJcbiAgICAgICAgICAgIGMyID0gdXggKiB2Lno7XHJcbiAgICAgICAgICAgIGMzID0gdXogKiB2Lnk7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVswXSA9IGUgKyB1eCAqIHYueDtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzNdID0gYzEgLSB2Lno7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVs2XSA9IGMyICsgdi55O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbMV0gPSBjMSArIHYuejtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzRdID0gZSArIHUgKiB2LnkgKiB2Lnk7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVs3XSA9IGMzIC0gdi54O1xyXG4gICAgICAgICAgICB0aGF0LmRhdGFbMl0gPSBjMiAtIHYueTtcclxuICAgICAgICAgICAgdGhhdC5kYXRhWzVdID0gYzMgKyB2Lng7XHJcbiAgICAgICAgICAgIHRoYXQuZGF0YVs4XSA9IGUgKyB1eiAqIHYuejtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoYXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDMzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB2YXIgbWF0ID0gbmV3IE1hdDMzKCB0aGF0ICksXHJcbiAgICAgICAgICAgIGk7XHJcbiAgICAgICAgZm9yICggaT0wOyBpPDk7IGkrKyApIHtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaV0gKz0gdGhpcy5kYXRhW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQzMyggdGhhdCApLFxyXG4gICAgICAgICAgICBpO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTw5OyBpKysgKSB7XHJcbiAgICAgICAgICAgIG1hdC5kYXRhW2ldID0gdGhpcy5kYXRhW2ldIC0gbWF0LmRhdGFbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDMzLnByb3RvdHlwZS5tdWx0VmVjdG9yID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKHtcclxuICAgICAgICAgICAgeDogdGhpcy5kYXRhWzBdICogdGhhdC54ICsgdGhpcy5kYXRhWzNdICogdGhhdC55ICsgdGhpcy5kYXRhWzZdICogdGhhdC56LFxyXG4gICAgICAgICAgICB5OiB0aGlzLmRhdGFbMV0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNF0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbN10gKiB0aGF0LnosXHJcbiAgICAgICAgICAgIHo6IHRoaXMuZGF0YVsyXSAqIHRoYXQueCArIHRoaXMuZGF0YVs1XSAqIHRoYXQueSArIHRoaXMuZGF0YVs4XSAqIHRoYXQuelxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5wcm90b3R5cGUubXVsdFNjYWxhciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBuZXcgTWF0MzMoKSxcclxuICAgICAgICAgICAgaTtcclxuICAgICAgICBmb3IgKCBpPTA7IGk8OTsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAqIHRoYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDMzLnByb3RvdHlwZS5tdWx0TWF0cml4ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQzMygpLFxyXG4gICAgICAgICAgICBpO1xyXG4gICAgICAgIC8vIGVuc3VyZSAndGhhdCcgaXMgYSBNYXQzM1xyXG4gICAgICAgIHRoYXQgPSAoIHRoYXQgaW5zdGFuY2VvZiBNYXQzMyApID8gdGhhdCA6IG5ldyBNYXQzMyggdGhhdCApO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTwzOyBpKysgKSB7XHJcbiAgICAgICAgICAgIG1hdC5kYXRhW2ldID0gdGhpcy5kYXRhW2ldICogdGhhdC5kYXRhWzBdICsgdGhpcy5kYXRhW2krM10gKiB0aGF0LmRhdGFbMV0gKyB0aGlzLmRhdGFbaSs2XSAqIHRoYXQuZGF0YVsyXTtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaSszXSA9IHRoaXMuZGF0YVtpXSAqIHRoYXQuZGF0YVszXSArIHRoaXMuZGF0YVtpKzNdICogdGhhdC5kYXRhWzRdICsgdGhpcy5kYXRhW2krNl0gKiB0aGF0LmRhdGFbNV07XHJcbiAgICAgICAgICAgIG1hdC5kYXRhW2krNl0gPSB0aGlzLmRhdGFbaV0gKiB0aGF0LmRhdGFbNl0gKyB0aGlzLmRhdGFbaSszXSAqIHRoYXQuZGF0YVs3XSArIHRoaXMuZGF0YVtpKzZdICogdGhhdC5kYXRhWzhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5wcm90b3R5cGUubXVsdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiAoIHR5cGVvZiB0aGF0ID09PSBcIm51bWJlclwiICkgPyB0aGlzLm11bHRTY2FsYXIoIHRoYXQgKVxyXG4gICAgICAgICAgICA6ICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkgPyB0aGlzLm11bHRWZWN0b3IoIG5ldyBWZWMzKCB0aGF0ICkgKVxyXG4gICAgICAgICAgICAgICAgOiAoIHRoYXQgaW5zdGFuY2VvZiBWZWMzIHx8IHRoYXQgaW5zdGFuY2VvZiBWZWM0ICkgPyB0aGlzLm11bHRWZWN0b3IoIHRoYXQgKVxyXG4gICAgICAgICAgICAgICAgICAgIDogdGhpcy5tdWx0TWF0cml4KCB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDMzLnByb3RvdHlwZS5kaXYgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB2YXIgbWF0ID0gbmV3IE1hdDMzKCksXHJcbiAgICAgICAgICAgIGk7XHJcbiAgICAgICAgZm9yICggaT0wOyBpPDk7IGkrKyApIHtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaV0gPSB0aGlzLmRhdGFbaV0gLyB0aGF0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTw5OyBpKysgKSB7XHJcbiAgICAgICAgICAgIC8vIGF3a3dhcmQgY29tcGFyaXNvbiBsb2dpYyBpcyByZXF1aXJlZCB0byBlbnN1cmUgZXF1YWxpdHkgcGFzc2VzIGlmXHJcbiAgICAgICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgYXJlIGJvdGggdW5kZWZpbmVkLCBOYU4sIG9yIEluZmluaXR5XHJcbiAgICAgICAgICAgIGlmICggIShcclxuICAgICAgICAgICAgICAgICggdGhpcy5kYXRhW2ldID09PSB0aGF0LmRhdGFbaV0gKSB8fFxyXG4gICAgICAgICAgICAgICAgKCBNYXRoLmFicyggdGhpcy5kYXRhW2ldIC0gdGhhdC5kYXRhW2ldICkgPD0gZXBzaWxvbiApXHJcbiAgICAgICAgICAgICAgICkgKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDMzLnByb3RvdHlwZS50cmFuc3Bvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdHJhbnMgPSBuZXcgTWF0MzMoKSwgaTtcclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IDM7IGkrKyApIHtcclxuICAgICAgICAgICAgdHJhbnMuZGF0YVtpKjNdICAgICA9IHRoaXMuZGF0YVtpXTtcclxuICAgICAgICAgICAgdHJhbnMuZGF0YVsoaSozKSsxXSA9IHRoaXMuZGF0YVtpKzNdO1xyXG4gICAgICAgICAgICB0cmFucy5kYXRhWyhpKjMpKzJdID0gdGhpcy5kYXRhW2krNl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cmFucztcclxuICAgIH07XHJcblxyXG4gICAgTWF0MzMucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaW52ID0gbmV3IE1hdDMzKCksIGRldDtcclxuICAgICAgICAvLyBjb21wdXRlIGludmVyc2VcclxuICAgICAgICAvLyByb3cgMVxyXG4gICAgICAgIGludi5kYXRhWzBdID0gdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVs4XSAtIHRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbNV07XHJcbiAgICAgICAgaW52LmRhdGFbM10gPSAtdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs4XSArIHRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbNV07XHJcbiAgICAgICAgaW52LmRhdGFbNl0gPSB0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzddIC0gdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVs0XTtcclxuICAgICAgICAvLyByb3cgMlxyXG4gICAgICAgIGludi5kYXRhWzFdID0gLXRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbOF0gKyB0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzJdO1xyXG4gICAgICAgIGludi5kYXRhWzRdID0gdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs4XSAtIHRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMl07XHJcbiAgICAgICAgaW52LmRhdGFbN10gPSAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs3XSArIHRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMV07XHJcbiAgICAgICAgLy8gcm93IDNcclxuICAgICAgICBpbnYuZGF0YVsyXSA9IHRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbNV0gLSB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzJdO1xyXG4gICAgICAgIGludi5kYXRhWzVdID0gLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0gKyB0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzJdO1xyXG4gICAgICAgIGludi5kYXRhWzhdID0gdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs0XSAtIHRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMV07XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGRldGVybWluYW50XHJcbiAgICAgICAgZGV0ID0gdGhpcy5kYXRhWzBdKmludi5kYXRhWzBdICsgdGhpcy5kYXRhWzFdKmludi5kYXRhWzNdICsgdGhpcy5kYXRhWzJdKmludi5kYXRhWzZdO1xyXG4gICAgICAgIC8vIHJldHVyblxyXG4gICAgICAgIHJldHVybiBpbnYubXVsdCggMSAvIGRldCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5wcm90b3R5cGUuZGVjb21wb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gZXh0cmFjdCB0cmFuc2Zvcm0gY29tcG9uZW50c1xyXG4gICAgICAgIHZhciBjb2wwID0gdGhpcy5jb2woIDAgKSxcclxuICAgICAgICAgICAgY29sMSA9IHRoaXMuY29sKCAxICksXHJcbiAgICAgICAgICAgIGNvbDIgPSB0aGlzLmNvbCggMiApO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHVwOiBjb2wxLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBmb3J3YXJkOiBjb2wyLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBsZWZ0OiBjb2wwLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBzY2FsZTogbmV3IFZlYzMoIGNvbDAubGVuZ3RoKCksIGNvbDEubGVuZ3RoKCksIGNvbDIubGVuZ3RoKCkgKVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDMzLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciByb3QgPSBNYXQzMy5yb3RhdGlvblJhZGlhbnMoIE1hdGgucmFuZG9tKCkgKiAzNjAsIFZlYzMucmFuZG9tKCkgKSxcclxuICAgICAgICAgICAgc2NhbGUgPSBNYXQzMy5zY2FsZSggTWF0aC5yYW5kb20oKSAqIDEwICk7XHJcbiAgICAgICAgcmV0dXJuIHJvdC5tdWx0KCBzY2FsZSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQzMy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhWzBdICtcIiwgXCIrIHRoaXMuZGF0YVszXSArXCIsIFwiKyB0aGlzLmRhdGFbNl0gK1wiLFxcblwiICtcclxuICAgICAgICAgICAgICAgdGhpcy5kYXRhWzFdICtcIiwgXCIrIHRoaXMuZGF0YVs0XSArXCIsIFwiKyB0aGlzLmRhdGFbN10gK1wiLFxcblwiICtcclxuICAgICAgICAgICAgICAgdGhpcy5kYXRhWzJdICtcIiwgXCIrIHRoaXMuZGF0YVs1XSArXCIsIFwiKyB0aGlzLmRhdGFbOF07XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDMzLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5zbGljZSggMCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1hdDMzO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIHZhciBWZWMzID0gcmVxdWlyZSggJy4vVmVjMycgKSxcclxuICAgICAgICBWZWM0ID0gcmVxdWlyZSggJy4vVmVjNCcgKSxcclxuICAgICAgICBNYXQzMyA9IHJlcXVpcmUoICcuL01hdDMzJyApO1xyXG5cclxuICAgIGZ1bmN0aW9uIE1hdDQ0KCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCApIHtcclxuICAgICAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgTWF0MzMgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb3B5IGRhdGEgYnkgdmFsdWUsIGFjY291bnQgZm9yIGluZGV4IGRpZmZlcmVuY2VzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kYXRhWzBdLCB0aGF0LmRhdGFbMV0sIHRoYXQuZGF0YVsyXSwgMCxcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmRhdGFbM10sIHRoYXQuZGF0YVs0XSwgdGhhdC5kYXRhWzVdLCAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGF0YVs2XSwgdGhhdC5kYXRhWzddLCB0aGF0LmRhdGFbOF0sIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgMCwgMCwgMCwgMSBdO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGF0IGluc3RhbmNlb2YgTWF0NDQgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb3B5IGRhdGEgYnkgdmFsdWVcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoYXQuZGF0YS5zbGljZSggMCApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGF0Lmxlbmd0aCA9PT0gMTYgKSB7XHJcbiAgICAgICAgICAgICAgICAgLy8gY29weSBhcnJheSBieSB2YWx1ZSwgdXNlIHByb3RvdHlwZSB0byBjYXN0IGFycmF5IGJ1ZmZlcnNcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCB0aGF0ICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0NDQuaWRlbnRpdHkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXQ0NC5pZGVudGl0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUucm93ID0gZnVuY3Rpb24oIGluZGV4ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXhdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNCtpbmRleF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4K2luZGV4XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyK2luZGV4XSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuY29sID0gZnVuY3Rpb24oIGluZGV4ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzAraW5kZXgqNF0sXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxK2luZGV4KjRdLFxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMitpbmRleCo0XSxcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzMraW5kZXgqNF0gKTtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQuaWRlbnRpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMSBdKTtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQuc2NhbGUgPSBmdW5jdGlvbiggc2NhbGUgKSB7XHJcbiAgICAgICAgaWYgKCBzY2FsZSBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFxyXG4gICAgICAgICAgICAgICAgWyBzY2FsZVswXSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIHNjYWxlWzFdLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgc2NhbGVbMl0sIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAwLCAxIF0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIHNjYWxlIGluc3RhbmNlb2YgVmVjMyApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NChbXHJcbiAgICAgICAgICAgICAgICBzY2FsZS54LCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgc2NhbGUueSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIHNjYWxlLnosIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAwLCAxIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgc2NhbGUsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIHNjYWxlLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCBzY2FsZSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMSBdKTtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQudHJhbnNsYXRpb24gPSBmdW5jdGlvbiggdHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgaWYgKCB0cmFuc2xhdGlvbiBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KFtcclxuICAgICAgICAgICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uWzBdLCB0cmFuc2xhdGlvblsxXSwgdHJhbnNsYXRpb25bMl0sIDEgXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoW1xyXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICB0cmFuc2xhdGlvbi54LCB0cmFuc2xhdGlvbi55LCB0cmFuc2xhdGlvbi56LCAxIF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5yb3RhdGlvbkRlZ3JlZXMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NCggTWF0MzMucm90YXRpb25EZWdyZWVzKCBhbmdsZSwgYXhpcyApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDQ0LnJvdGF0aW9uUmFkaWFucyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KCBNYXQzMy5yb3RhdGlvblJhZGlhbnMoIGFuZ2xlLCBheGlzICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQucm90YXRpb25Gcm9tVG8gPSBmdW5jdGlvbiggZnJvbVZlYywgdG9WZWMgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0NCggTWF0MzMucm90YXRpb25Gcm9tVG8oIGZyb21WZWMsIHRvVmVjICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBuZXcgTWF0NDQoIHRoYXQgKSxcclxuICAgICAgICAgICAgaTtcclxuICAgICAgICBmb3IgKCBpPTA7IGk8MTY7IGkrKyApIHtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaV0gKz0gdGhpcy5kYXRhW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCggdGhhdCApLFxyXG4gICAgICAgICAgICBpO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTwxNjsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAtIG1hdC5kYXRhW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUubXVsdFZlY3RvcjMgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoe1xyXG4gICAgICAgICAgICB4OiB0aGlzLmRhdGFbMF0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNF0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOF0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTJdLFxyXG4gICAgICAgICAgICB5OiB0aGlzLmRhdGFbMV0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNV0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOV0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTNdLFxyXG4gICAgICAgICAgICB6OiB0aGlzLmRhdGFbMl0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNl0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbMTBdICogdGhhdC56ICsgdGhpcy5kYXRhWzE0XVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUubXVsdFZlY3RvcjQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoe1xyXG4gICAgICAgICAgICB4OiB0aGlzLmRhdGFbMF0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNF0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOF0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTJdICogdGhhdC53LFxyXG4gICAgICAgICAgICB5OiB0aGlzLmRhdGFbMV0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNV0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbOV0gKiB0aGF0LnogKyB0aGlzLmRhdGFbMTNdICogdGhhdC53LFxyXG4gICAgICAgICAgICB6OiB0aGlzLmRhdGFbMl0gKiB0aGF0LnggKyB0aGlzLmRhdGFbNl0gKiB0aGF0LnkgKyB0aGlzLmRhdGFbMTBdICogdGhhdC56ICsgdGhpcy5kYXRhWzE0XSAqIHRoYXQudyxcclxuICAgICAgICAgICAgdzogdGhpcy5kYXRhWzNdICogdGhhdC54ICsgdGhpcy5kYXRhWzddICogdGhhdC55ICsgdGhpcy5kYXRhWzExXSAqIHRoYXQueiArIHRoaXMuZGF0YVsxNV0gKiB0aGF0LndcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQucHJvdG90eXBlLm11bHRTY2FsYXIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB2YXIgbWF0ID0gbmV3IE1hdDQ0KCksXHJcbiAgICAgICAgICAgIGk7XHJcbiAgICAgICAgZm9yICggaT0wOyBpPDE2OyBpKysgKSB7XHJcbiAgICAgICAgICAgIG1hdC5kYXRhW2ldID0gdGhpcy5kYXRhW2ldICogdGhhdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQucHJvdG90eXBlLm11bHRNYXRyaXggPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICB2YXIgbWF0ID0gbmV3IE1hdDQ0KCksXHJcbiAgICAgICAgICAgIGk7XHJcbiAgICAgICAgLy8gZW5zdXJlICd0aGF0JyBpcyBhIE1hdDQ0XHJcbiAgICAgICAgdGhhdCA9ICggdGhhdCBpbnN0YW5jZW9mIE1hdDQ0ICkgPyB0aGF0IDogbmV3IE1hdDQ0KCB0aGF0ICk7XHJcbiAgICAgICAgZm9yICggaT0wOyBpPDQ7IGkrKyApIHtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaV0gPSB0aGlzLmRhdGFbaV0gKiB0aGF0LmRhdGFbMF0gKyB0aGlzLmRhdGFbaSs0XSAqIHRoYXQuZGF0YVsxXSArIHRoaXMuZGF0YVtpKzhdICogdGhhdC5kYXRhWzJdICsgdGhpcy5kYXRhW2krMTJdICogdGhhdC5kYXRhWzNdO1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpKzRdID0gdGhpcy5kYXRhW2ldICogdGhhdC5kYXRhWzRdICsgdGhpcy5kYXRhW2krNF0gKiB0aGF0LmRhdGFbNV0gKyB0aGlzLmRhdGFbaSs4XSAqIHRoYXQuZGF0YVs2XSArIHRoaXMuZGF0YVtpKzEyXSAqIHRoYXQuZGF0YVs3XTtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaSs4XSA9IHRoaXMuZGF0YVtpXSAqIHRoYXQuZGF0YVs4XSArIHRoaXMuZGF0YVtpKzRdICogdGhhdC5kYXRhWzldICsgdGhpcy5kYXRhW2krOF0gKiB0aGF0LmRhdGFbMTBdICsgdGhpcy5kYXRhW2krMTJdICogdGhhdC5kYXRhWzExXTtcclxuICAgICAgICAgICAgbWF0LmRhdGFbaSsxMl0gPSB0aGlzLmRhdGFbaV0gKiB0aGF0LmRhdGFbMTJdICsgdGhpcy5kYXRhW2krNF0gKiB0aGF0LmRhdGFbMTNdICsgdGhpcy5kYXRhW2krOF0gKiB0aGF0LmRhdGFbMTRdICsgdGhpcy5kYXRhW2krMTJdICogdGhhdC5kYXRhWzE1XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQucHJvdG90eXBlLm11bHQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gKCB0eXBlb2YgdGhhdCA9PT0gXCJudW1iZXJcIiApID8gdGhpcy5tdWx0U2NhbGFyKCB0aGF0IClcclxuICAgICAgICAgICAgOiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApID9cclxuICAgICAgICAgICAgICAgICAgICAoICggdGhhdC5sZW5ndGggPT09IDMgKSA/IHRoaXMubXVsdFZlY3RvcjMoIG5ldyBWZWMzKCB0aGF0ICkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMubXVsdFZlY3RvcjQoIG5ldyBWZWM0KCB0aGF0ICkgKSApXHJcbiAgICAgICAgICAgICAgICA6ICggdGhhdCBpbnN0YW5jZW9mIFZlYzMgKSA/IHRoaXMubXVsdFZlY3RvcjMoIHRoYXQgKVxyXG4gICAgICAgICAgICAgICAgICAgIDogKCB0aGF0IGluc3RhbmNlb2YgVmVjNCApID8gdGhpcy5tdWx0VmVjdG9yNCggbmV3IE1hdDQ0KCB0aGF0ICkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMubXVsdE1hdHJpeCggdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUuZGl2ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCgpLCBpO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTwxNjsgaSsrICkge1xyXG4gICAgICAgICAgICBtYXQuZGF0YVtpXSA9IHRoaXMuZGF0YVtpXSAvIHRoYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICB2YXIgaTtcclxuICAgICAgICBlcHNpbG9uID0gZXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMCA6IGVwc2lsb247XHJcbiAgICAgICAgZm9yICggaT0wOyBpPDE2OyBpKysgKSB7XHJcbiAgICAgICAgICAgIC8vIGF3a3dhcmQgY29tcGFyaXNvbiBsb2dpYyBpcyByZXF1aXJlZCB0byBlbnN1cmUgZXF1YWxpdHkgcGFzc2VzIGlmXHJcbiAgICAgICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgYXJlIGJvdGggdW5kZWZpbmVkLCBOYU4sIG9yIEluZmluaXR5XHJcbiAgICAgICAgICAgIGlmICggIShcclxuICAgICAgICAgICAgICAgICggdGhpcy5kYXRhW2ldID09PSB0aGF0LmRhdGFbaV0gKSB8fFxyXG4gICAgICAgICAgICAgICAgKCBNYXRoLmFicyggdGhpcy5kYXRhW2ldIC0gdGhhdC5kYXRhW2ldICkgPD0gZXBzaWxvbiApXHJcbiAgICAgICAgICAgICAgICkgKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDQ0Lm9ydGhvID0gZnVuY3Rpb24oIHhNaW4sIHhNYXgsIHlNaW4sIHlNYXgsIHpNaW4sIHpNYXggKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IE1hdDQ0LmlkZW50aXR5KCk7XHJcbiAgICAgICAgbWF0LmRhdGFbMF0gPSAyIC8gKHhNYXggLSB4TWluKTtcclxuICAgICAgICBtYXQuZGF0YVs1XSA9IDIgLyAoeU1heCAtIHlNaW4pO1xyXG4gICAgICAgIG1hdC5kYXRhWzEwXSA9IC0yIC8gKHpNYXggLSB6TWluKTtcclxuICAgICAgICBtYXQuZGF0YVsxMl0gPSAtKCh4TWF4ICsgeE1pbikvKHhNYXggLSB4TWluKSk7XHJcbiAgICAgICAgbWF0LmRhdGFbMTNdID0gLSgoeU1heCArIHlNaW4pLyh5TWF4IC0geU1pbikpO1xyXG4gICAgICAgIG1hdC5kYXRhWzE0XSA9IC0oKHpNYXggKyB6TWluKS8oek1heCAtIHpNaW4pKTtcclxuICAgICAgICByZXR1cm4gbWF0O1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uKCBmb3YsIGFzcGVjdCwgek1pbiwgek1heCApIHtcclxuICAgICAgICB2YXIgeU1heCA9IHpNaW4gKiBNYXRoLnRhbiggZm92ICogKCBNYXRoLlBJIC8gMzYwLjAgKSApLFxyXG4gICAgICAgICAgICB5TWluID0gLXlNYXgsXHJcbiAgICAgICAgICAgIHhNaW4gPSB5TWluICogYXNwZWN0LFxyXG4gICAgICAgICAgICB4TWF4ID0gLXhNaW4sXHJcbiAgICAgICAgICAgIG1hdCA9IE1hdDQ0LmlkZW50aXR5KCk7XHJcbiAgICAgICAgbWF0LmRhdGFbMF0gPSAoMiAqIHpNaW4pIC8gKHhNYXggLSB4TWluKTtcclxuICAgICAgICBtYXQuZGF0YVs1XSA9ICgyICogek1pbikgLyAoeU1heCAtIHlNaW4pO1xyXG4gICAgICAgIG1hdC5kYXRhWzhdID0gKHhNYXggKyB4TWluKSAvICh4TWF4IC0geE1pbik7XHJcbiAgICAgICAgbWF0LmRhdGFbOV0gPSAoeU1heCArIHlNaW4pIC8gKHlNYXggLSB5TWluKTtcclxuICAgICAgICBtYXQuZGF0YVsxMF0gPSAtKCh6TWF4ICsgek1pbikgLyAoek1heCAtIHpNaW4pKTtcclxuICAgICAgICBtYXQuZGF0YVsxMV0gPSAtMTtcclxuICAgICAgICBtYXQuZGF0YVsxNF0gPSAtKCAoIDIgKiAoek1heCp6TWluKSApLyh6TWF4IC0gek1pbikpO1xyXG4gICAgICAgIG1hdC5kYXRhWzE1XSA9IDA7XHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQucHJvdG90eXBlLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB0cmFucyA9IG5ldyBNYXQ0NCgpLCBpO1xyXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgNDsgaSsrICkge1xyXG4gICAgICAgICAgICB0cmFucy5kYXRhW2kqNF0gPSB0aGlzLmRhdGFbaV07XHJcbiAgICAgICAgICAgIHRyYW5zLmRhdGFbKGkqNCkrMV0gPSB0aGlzLmRhdGFbaSs0XTtcclxuICAgICAgICAgICAgdHJhbnMuZGF0YVsoaSo0KSsyXSA9IHRoaXMuZGF0YVtpKzhdO1xyXG4gICAgICAgICAgICB0cmFucy5kYXRhWyhpKjQpKzNdID0gdGhpcy5kYXRhW2krMTJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJhbnM7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5pbnZlcnNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGludiA9IG5ldyBNYXQ0NCgpLCBkZXQ7XHJcbiAgICAgICAgLy8gY29tcHV0ZSBpbnZlcnNlXHJcbiAgICAgICAgLy8gcm93IDFcclxuICAgICAgICBpbnYuZGF0YVswXSA9IHRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTBdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxMF07XHJcbiAgICAgICAgaW52LmRhdGFbNF0gPSAtdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxMF0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMTFdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxNF0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEwXTtcclxuICAgICAgICBpbnYuZGF0YVs4XSA9IHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMTFdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsxNV0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxM10gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzldO1xyXG4gICAgICAgIGludi5kYXRhWzEyXSA9IC10aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzldKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNF0qdGhpcy5kYXRhWzEwXSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTNdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVs5XTtcclxuICAgICAgICAvLyByb3cgMlxyXG4gICAgICAgIGludi5kYXRhWzFdID0gLXRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTBdKnRoaXMuZGF0YVsxNV0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzExXSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTVdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEzXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxM10qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxMF07XHJcbiAgICAgICAgaW52LmRhdGFbNV0gPSB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzEwXSp0aGlzLmRhdGFbMTVdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVsxMV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzE0XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxMV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTBdO1xyXG4gICAgICAgIGludi5kYXRhWzldID0gLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbMTFdKnRoaXMuZGF0YVsxM10gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzldO1xyXG4gICAgICAgIGludi5kYXRhWzEzXSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzE0XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbMTBdKnRoaXMuZGF0YVsxM10gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxM10gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTJdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTBdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzldO1xyXG4gICAgICAgIC8vIHJvdyAzXHJcbiAgICAgICAgaW52LmRhdGFbMl0gPSB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzZdKnRoaXMuZGF0YVsxNV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzddKnRoaXMuZGF0YVsxNF0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzJdKnRoaXMuZGF0YVsxNV0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVsxNF0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbN10gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMTNdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbNl07XHJcbiAgICAgICAgaW52LmRhdGFbNl0gPSAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTVdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTVdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzddICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzZdO1xyXG4gICAgICAgIGludi5kYXRhWzEwXSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzE1XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEzXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzE1XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEzXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxMl0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs1XTtcclxuICAgICAgICBpbnYuZGF0YVsxNF0gPSAtdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs1XSp0aGlzLmRhdGFbMTRdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTNdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTRdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTNdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzZdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzEyXSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzVdO1xyXG4gICAgICAgIC8vIHJvdyA0XHJcbiAgICAgICAgaW52LmRhdGFbM10gPSAtdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs2XSp0aGlzLmRhdGFbMTFdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSp0aGlzLmRhdGFbMTBdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzVdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbMTBdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzldKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbN10gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOV0qdGhpcy5kYXRhWzNdKnRoaXMuZGF0YVs2XTtcclxuICAgICAgICBpbnYuZGF0YVs3XSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzExXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzEwXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs0XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzEwXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzddIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzhdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbNl07XHJcbiAgICAgICAgaW52LmRhdGFbMTFdID0gLXRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzExXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbN10qdGhpcy5kYXRhWzldICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTFdIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVszXSp0aGlzLmRhdGFbOV0gLVxyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs3XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbM10qdGhpcy5kYXRhWzVdO1xyXG4gICAgICAgIGludi5kYXRhWzE1XSA9IHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNV0qdGhpcy5kYXRhWzEwXSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbNl0qdGhpcy5kYXRhWzldIC1cclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMTBdICtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzRdKnRoaXMuZGF0YVsyXSp0aGlzLmRhdGFbOV0gK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbOF0qdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVs2XSAtXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVs4XSp0aGlzLmRhdGFbMl0qdGhpcy5kYXRhWzVdO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkZXRlcm1pbmFudFxyXG4gICAgICAgIGRldCA9IHRoaXMuZGF0YVswXSppbnYuZGF0YVswXSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSppbnYuZGF0YVs0XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSppbnYuZGF0YVs4XSArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSppbnYuZGF0YVsxMl07XHJcbiAgICAgICAgcmV0dXJuIGludi5tdWx0KCAxIC8gZGV0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIE1hdDQ0LnByb3RvdHlwZS5kZWNvbXBvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBleHRyYWN0IHRyYW5zZm9ybSBjb21wb25lbnRzXHJcbiAgICAgICAgdmFyIGNvbDAgPSBuZXcgVmVjMyggdGhpcy5jb2woIDAgKSApLFxyXG4gICAgICAgICAgICBjb2wxID0gbmV3IFZlYzMoIHRoaXMuY29sKCAxICkgKSxcclxuICAgICAgICAgICAgY29sMiA9IG5ldyBWZWMzKCB0aGlzLmNvbCggMiApICksXHJcbiAgICAgICAgICAgIGNvbDMgPSBuZXcgVmVjMyggdGhpcy5jb2woIDMgKSApO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHVwOiBjb2wxLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBmb3J3YXJkOiBjb2wyLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBsZWZ0OiBjb2wwLm5vcm1hbGl6ZSgpLFxyXG4gICAgICAgICAgICBvcmlnaW46IGNvbDMsXHJcbiAgICAgICAgICAgIHNjYWxlOiBuZXcgVmVjMyggY29sMC5sZW5ndGgoKSwgY29sMS5sZW5ndGgoKSwgY29sMi5sZW5ndGgoKSApXHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgTWF0NDQucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHJvdCA9IE1hdDQ0LnJvdGF0aW9uUmFkaWFucyggTWF0aC5yYW5kb20oKSAqIDM2MCwgVmVjMy5yYW5kb20oKSApLFxyXG4gICAgICAgICAgICBzY2FsZSA9IE1hdDQ0LnNjYWxlKCBNYXRoLnJhbmRvbSgpICogMTAgKSxcclxuICAgICAgICAgICAgdHJhbnNsYXRpb24gPSBNYXQ0NC50cmFuc2xhdGlvbiggVmVjMy5yYW5kb20oKSApO1xyXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGlvbi5tdWx0KCByb3QubXVsdCggc2NhbGUgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhWzBdICtcIiwgXCIrIHRoaXMuZGF0YVs0XSArXCIsIFwiKyB0aGlzLmRhdGFbOF0gK1wiLCBcIisgdGhpcy5kYXRhWzEyXSArXCIsXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbMV0gK1wiLCBcIisgdGhpcy5kYXRhWzVdICtcIiwgXCIrIHRoaXMuZGF0YVs5XSArXCIsIFwiKyB0aGlzLmRhdGFbMTNdICtcIixcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSArXCIsIFwiKyB0aGlzLmRhdGFbNl0gK1wiLCBcIisgdGhpcy5kYXRhWzEwXSArXCIsIFwiKyB0aGlzLmRhdGFbMTRdICtcIixcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVszXSArXCIsIFwiKyB0aGlzLmRhdGFbN10gK1wiLCBcIisgdGhpcy5kYXRhWzExXSArXCIsIFwiKyB0aGlzLmRhdGFbMTVdO1xyXG4gICAgfTtcclxuXHJcbiAgICBNYXQ0NC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuc2xpY2UoIDAgKTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNYXQ0NDtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICB2YXIgVmVjMyA9IHJlcXVpcmUoJy4vVmVjMycpLFxyXG4gICAgICAgIE1hdDMzID0gcmVxdWlyZSgnLi9NYXQzMycpO1xyXG5cclxuICAgIGZ1bmN0aW9uIFF1YXRlcm5pb24oKSB7XHJcbiAgICAgICAgc3dpdGNoICggYXJndW1lbnRzLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgLy8gYXJyYXkgb3IgUXVhdGVybmlvbiBhcmd1bWVudFxyXG4gICAgICAgICAgICAgICAgdmFyIGFyZ3VtZW50ID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCBhcmd1bWVudC53ICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ID0gYXJndW1lbnQudztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGFyZ3VtZW50WzBdICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ID0gYXJndW1lbnRbMF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudyA9IDEuMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50LnggfHwgYXJndW1lbnRbMV0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gYXJndW1lbnQueSB8fCBhcmd1bWVudFsyXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSBhcmd1bWVudC56IHx8IGFyZ3VtZW50WzNdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpbmRpdmlkdWFsIGNvbXBvbmVudCBhcmd1bWVudHNcclxuICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50c1sxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50c1syXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IGFyZ3VtZW50c1szXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy53ID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBRdWF0ZXJuaW9uLmlkZW50aXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCAxLCAwLCAwLCAwICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLm11bHRRdWF0ZXJuaW9uID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgdmFyIHcgPSAodGhhdC53ICogdGhpcy53KSAtICh0aGF0LnggKiB0aGlzLngpIC0gKHRoYXQueSAqIHRoaXMueSkgLSAodGhhdC56ICogdGhpcy56KSxcclxuICAgICAgICAgICAgeCA9IHRoaXMueSp0aGF0LnogLSB0aGlzLnoqdGhhdC55ICsgdGhpcy53KnRoYXQueCArIHRoaXMueCp0aGF0LncsXHJcbiAgICAgICAgICAgIHkgPSB0aGlzLnoqdGhhdC54IC0gdGhpcy54KnRoYXQueiArIHRoaXMudyp0aGF0LnkgKyB0aGlzLnkqdGhhdC53LFxyXG4gICAgICAgICAgICB6ID0gdGhpcy54KnRoYXQueSAtIHRoaXMueSp0aGF0LnggKyB0aGlzLncqdGhhdC56ICsgdGhpcy56KnRoYXQudztcclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHcsIHgsIHksIHogKTtcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUubXVsdFZlY3RvciA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHZhciB2cSA9IG5ldyBRdWF0ZXJuaW9uKCAwLCB0aGF0LngsIHRoYXQueSwgdGhhdC56ICksXHJcbiAgICAgICAgICAgIHIgPSB0aGlzLm11bHRRdWF0ZXJuaW9uKCB2cSApLm11bHRRdWF0ZXJuaW9uKCB0aGlzLmludmVyc2UoKSApO1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggci54LCByLnksIHIueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5tdWx0ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgVmVjMyApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdFZlY3RvciggdGhhdCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRRdWF0ZXJuaW9uKCB0aGF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5tYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeHggPSB0aGlzLngqdGhpcy54LFxyXG4gICAgICAgICAgICB5eSA9IHRoaXMueSp0aGlzLnksXHJcbiAgICAgICAgICAgIHp6ID0gdGhpcy56KnRoaXMueixcclxuICAgICAgICAgICAgeHkgPSB0aGlzLngqdGhpcy55LFxyXG4gICAgICAgICAgICB4eiA9IHRoaXMueCp0aGlzLnosXHJcbiAgICAgICAgICAgIHh3ID0gdGhpcy54KnRoaXMudyxcclxuICAgICAgICAgICAgeXogPSB0aGlzLnkqdGhpcy56LFxyXG4gICAgICAgICAgICB5dyA9IHRoaXMueSp0aGlzLncsXHJcbiAgICAgICAgICAgIHp3ID0gdGhpcy56KnRoaXMudztcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDMzKFsgMSAtIDIqeXkgLSAyKnp6LCAyKnh5ICsgMip6dywgMip4eiAtIDIqeXcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIDIqeHkgLSAyKnp3LCAxIC0gMip4eCAtIDIqenosIDIqeXogKyAyKnh3LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAyKnh6ICsgMip5dywgMip5eiAtIDIqeHcsIDEgLSAyKnh4IC0gMip5eSBdKTtcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5yb3RhdGlvbkRlZ3JlZXMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgcmV0dXJuIFF1YXRlcm5pb24ucm90YXRpb25SYWRpYW5zKCBhbmdsZSooIE1hdGguUEkvMTgwICksIGF4aXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5yb3RhdGlvblJhZGlhbnMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgLy8gbm9ybWFsaXplIGFyZ3VtZW50c1xyXG4gICAgICAgIGFuZ2xlID0gKCBhbmdsZSA+IDAgKSA/ICBhbmdsZSAlICgyKk1hdGguUEkpIDogYW5nbGUgJSAoLTIqTWF0aC5QSSk7XHJcbiAgICAgICAgYXhpcyA9IGF4aXMubm9ybWFsaXplKCk7XHJcbiAgICAgICAgLy8gc2V0IHF1YXRlcm5pb24gZm9yIHRoZSBlcXVpdm9sZW50IHJvdGF0aW9uXHJcbiAgICAgICAgdmFyIHNpbmEgPSBNYXRoLnNpbiggYW5nbGUvMiApLFxyXG4gICAgICAgICAgICBjb3NhID0gTWF0aC5jb3MoIGFuZ2xlLzIgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oXHJcbiAgICAgICAgICAgIGNvc2EsXHJcbiAgICAgICAgICAgIGF4aXMueCAqIHNpbmEsXHJcbiAgICAgICAgICAgIGF4aXMueSAqIHNpbmEsXHJcbiAgICAgICAgICAgIGF4aXMueiAqIHNpbmEgKS5ub3JtYWxpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5sZW5ndGhTcXVhcmVkKCkgKTtcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUubGVuZ3RoU3F1YXJlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLngqdGhpcy54ICsgdGhpcy55KnRoaXMueSArIHRoaXMueip0aGlzLnogKyB0aGlzLncqdGhpcy53O1xyXG4gICAgfTtcclxuXHJcbiAgICBRdWF0ZXJuaW9uLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICBlcHNpbG9uID0gZXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMCA6IGVwc2lsb247XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy54ID09PSB0aGF0LnggfHwgTWF0aC5hYnMoIHRoaXMueCAtIHRoYXQueCApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueSA9PT0gdGhhdC55IHx8IE1hdGguYWJzKCB0aGlzLnkgLSB0aGF0LnkgKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgKCB0aGlzLnogPT09IHRoYXQueiB8fCBNYXRoLmFicyggdGhpcy56IC0gdGhhdC56ICkgPD0gZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgICggdGhpcy53ID09PSB0aGF0LncgfHwgTWF0aC5hYnMoIHRoaXMudyAtIHRoYXQudyApIDw9IGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1hZyA9IHRoaXMubGVuZ3RoKCk7XHJcbiAgICAgICAgaWYgKCBtYWcgIT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbihcclxuICAgICAgICAgICAgICAgIHRoaXMudyAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueCAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueSAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueiAvIG1hZyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oKTtcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUuY29uanVnYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggdGhpcy53LCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25qdWdhdGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXhpcyA9IFZlYzMucmFuZG9tKCkubm9ybWFsaXplKCksXHJcbiAgICAgICAgICAgIGFuZ2xlID0gTWF0aC5yYW5kb20oKTtcclxuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5yb3RhdGlvblJhZGlhbnMoIGFuZ2xlLCBheGlzICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFF1YXRlcm5pb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiLCBcIiArIHRoaXMueiArIFwiLCBcIiArIHRoaXMudztcclxuICAgIH07XHJcblxyXG4gICAgUXVhdGVybmlvbi5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBbIHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFF1YXRlcm5pb247XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgdmFyIFZlYzMgPSByZXF1aXJlKCAnLi9WZWMzJyApLFxyXG4gICAgICAgIE1hdDMzID0gcmVxdWlyZSggJy4vTWF0MzMnICksXHJcbiAgICAgICAgTWF0NDQgPSByZXF1aXJlKCAnLi9NYXQ0NCcgKSxcclxuICAgICAgICBERUZBVUxUX1VQID0gbmV3IFZlYzMoIDAsIDEsIDAgKSxcclxuICAgICAgICBERUZBVUxUX0ZPUldBUkQgPSBuZXcgVmVjMyggMCwgMCwgMSApLFxyXG4gICAgICAgIERFRkFVTFRfTEVGVCA9IG5ldyBWZWMzKCAxLCAwLCAwICksXHJcbiAgICAgICAgREVGQVVMVF9PUklHSU4gPSBuZXcgVmVjMyggMCwgMCwgMCApLFxyXG4gICAgICAgIERFRkFVTFRfU0NBTEUgPSBuZXcgVmVjMyggMSwgMSwgMSApO1xyXG5cclxuICAgIGZ1bmN0aW9uIFRyYW5zZm9ybSggc3BlYyApIHtcclxuICAgICAgICBzcGVjID0gc3BlYyB8fCB7fTtcclxuICAgICAgICBpZiAoIHNwZWMgaW5zdGFuY2VvZiBUcmFuc2Zvcm0gKSB7XHJcbiAgICAgICAgICAgIC8vIGNvcHkgdHJhbnNmb3JtIGJ5IHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMuX3VwID0gc3BlYy51cCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mb3J3YXJkID0gc3BlYy5mb3J3YXJkKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQgPSBzcGVjLmxlZnQoKTtcclxuICAgICAgICAgICAgdGhpcy5fb3JpZ2luID0gc3BlYy5vcmlnaW4oKTtcclxuICAgICAgICAgICAgdGhpcy5fc2NhbGUgPSBzcGVjLnNjYWxlKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICggc3BlYyBpbnN0YW5jZW9mIE1hdDQ0IHx8IHNwZWMgaW5zdGFuY2VvZiBNYXQzMyApIHtcclxuICAgICAgICAgICAgLy8gZXh0cmFjdCB0cmFuc2Zvcm0gY29tcG9uZW50cyBmcm9tIE1hdDQ0XHJcbiAgICAgICAgICAgIHNwZWMgPSBzcGVjLmRlY29tcG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl91cCA9IHNwZWMudXA7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcndhcmQgPSBzcGVjLmZvcndhcmQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQgPSBzcGVjLmxlZnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjYWxlID0gc3BlYy5zY2FsZTtcclxuICAgICAgICAgICAgdGhpcy5fb3JpZ2luID0gc3BlYy5vcmlnaW4gfHwgREVGQVVMVF9PUklHSU47XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZGVmYXVsdCB0byBpZGVudGl0eVxyXG4gICAgICAgICAgICB0aGlzLl91cCA9IHNwZWMudXAgPyBuZXcgVmVjMyggc3BlYy51cCApLm5vcm1hbGl6ZSgpIDogREVGQVVMVF9VUDtcclxuICAgICAgICAgICAgdGhpcy5fZm9yd2FyZCA9IHNwZWMuZm9yd2FyZCA/IG5ldyBWZWMzKCBzcGVjLmZvcndhcmQgKS5ub3JtYWxpemUoKSA6IERFRkFVTFRfRk9SV0FSRDtcclxuICAgICAgICAgICAgdGhpcy5fbGVmdCA9IHNwZWMubGVmdCA/IG5ldyBWZWMzKCBzcGVjLmxlZnQgKS5ub3JtYWxpemUoKSA6IHRoaXMuX3VwLmNyb3NzKCB0aGlzLl9mb3J3YXJkICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luKCBzcGVjLm9yaWdpbiB8fCBERUZBVUxUX09SSUdJTiApO1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlKCBzcGVjLnNjYWxlIHx8IERFRkFVTFRfU0NBTEUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgVHJhbnNmb3JtLmlkZW50aXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oe1xyXG4gICAgICAgICAgICB1cDogREVGQVVMVF9VUCxcclxuICAgICAgICAgICAgZm9yd2FyZDogREVGQVVMVF9GT1JXQVJELFxyXG4gICAgICAgICAgICBsZWZ0OiBERUZBVUxUX0xFRlQsXHJcbiAgICAgICAgICAgIG9yaWdpbjogREVGQVVMVF9PUklHSU4sXHJcbiAgICAgICAgICAgIHNjYWxlOiBERUZBVUxUX1NDQUxFXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUub3JpZ2luID0gZnVuY3Rpb24oIG9yaWdpbiApIHtcclxuICAgICAgICBpZiAoIG9yaWdpbiApIHtcclxuICAgICAgICAgICAgdGhpcy5fb3JpZ2luID0gbmV3IFZlYzMoIG9yaWdpbiApO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLl9vcmlnaW4gKTtcclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5mb3J3YXJkID0gZnVuY3Rpb24oIGZvcndhcmQgKSB7XHJcbiAgICAgICAgaWYgKCBmb3J3YXJkICkge1xyXG4gICAgICAgICAgICBmb3J3YXJkID0gKCBmb3J3YXJkIGluc3RhbmNlb2YgQXJyYXkgKSA/IG5ldyBWZWMzKCBmb3J3YXJkICkubm9ybWFsaXplKCkgOiBmb3J3YXJkLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgICAgICB2YXIgcm90ID0gTWF0MzMucm90YXRpb25Gcm9tVG8oIHRoaXMuX2ZvcndhcmQsIGZvcndhcmQgKTtcclxuICAgICAgICAgICAgdGhpcy5fZm9yd2FyZCA9IGZvcndhcmQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwID0gcm90Lm11bHQoIHRoaXMuX3VwICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQgPSByb3QubXVsdCggdGhpcy5fbGVmdCApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLl9mb3J3YXJkICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudXAgPSBmdW5jdGlvbiggdXAgKSB7XHJcbiAgICAgICAgaWYgKCB1cCApIHtcclxuICAgICAgICAgICAgdXAgPSAoIHVwIGluc3RhbmNlb2YgQXJyYXkgKSA/IG5ldyBWZWMzKCB1cCApLm5vcm1hbGl6ZSgpIDogdXAubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHZhciByb3QgPSBNYXQzMy5yb3RhdGlvbkZyb21UbyggdGhpcy5fdXAsIHVwICk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcndhcmQgPSByb3QubXVsdCggdGhpcy5fZm9yd2FyZCApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl91cCA9IHVwO1xyXG4gICAgICAgICAgICB0aGlzLl9sZWZ0ID0gcm90Lm11bHQoIHRoaXMuX2xlZnQgKS5ub3JtYWxpemUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy5fdXAgKTtcclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5sZWZ0ID0gZnVuY3Rpb24oIGxlZnQgKSB7XHJcbiAgICAgICAgaWYgKCBsZWZ0ICkge1xyXG4gICAgICAgICAgICBsZWZ0ID0gKCBsZWZ0IGluc3RhbmNlb2YgQXJyYXkgKSA/IG5ldyBWZWMzKCBsZWZ0ICkubm9ybWFsaXplKCkgOiBsZWZ0Lm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgICAgICB2YXIgcm90ID0gTWF0MzMucm90YXRpb25Gcm9tVG8oIHRoaXMuX2xlZnQsIGxlZnQgKTtcclxuICAgICAgICAgICAgdGhpcy5fZm9yd2FyZCA9IHJvdC5tdWx0KCB0aGlzLl9mb3J3YXJkICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwID0gcm90Lm11bHQoIHRoaXMuX3VwICkubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQgPSBsZWZ0O1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLl9sZWZ0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbiggc2NhbGUgKSB7XHJcbiAgICAgICAgaWYgKCBzY2FsZSApIHtcclxuICAgICAgICAgICAgaWYgKCB0eXBlb2Ygc2NhbGUgPT09IFwibnVtYmVyXCIgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zY2FsZSA9IG5ldyBWZWMzKCBzY2FsZSwgc2NhbGUsIHNjYWxlICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zY2FsZSA9IG5ldyBWZWMzKCBzY2FsZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NhbGU7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUubXVsdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIFRyYW5zZm9ybSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oIHRoaXMubWF0cml4KCkubXVsdCggdGhhdC5tYXRyaXgoKSApICk7XHJcbiAgICAgICAgfSBlbHNlIGlmICggdGhhdCBpbnN0YW5jZW9mIE1hdDMzIHx8IHRoYXQgaW5zdGFuY2VvZiBNYXQ0NCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oIHRoaXMubWF0cml4KCkubXVsdCggdGhhdCApICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybS5pZGVudGl0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5zY2FsZU1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC5zY2FsZSggdGhpcy5fc2NhbGUgKTtcclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5yb3RhdGlvbk1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoIFsgdGhpcy5fbGVmdC54LCB0aGlzLl9sZWZ0LnksIHRoaXMuX2xlZnQueiwgMCxcclxuICAgICAgICAgICAgdGhpcy5fdXAueCwgdGhpcy5fdXAueSwgdGhpcy5fdXAueiwgMCxcclxuICAgICAgICAgICAgdGhpcy5fZm9yd2FyZC54LCB0aGlzLl9mb3J3YXJkLnksIHRoaXMuX2ZvcndhcmQueiwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMSBdICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNsYXRpb25NYXRyaXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gTWF0NDQudHJhbnNsYXRpb24oIHRoaXMuX29yaWdpbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VTY2FsZU1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBNYXQ0NC5zY2FsZSggbmV3IFZlYzMoIDEvdGhpcy5fc2NhbGUueCwgMS90aGlzLl9zY2FsZS55LCAxL3RoaXMuX3NjYWxlLnogKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLmludmVyc2VSb3RhdGlvbk1hdHJpeCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NDQoIFsgdGhpcy5fbGVmdC54LCB0aGlzLl91cC54LCB0aGlzLl9mb3J3YXJkLngsIDAsXHJcbiAgICAgICAgICAgIHRoaXMuX2xlZnQueSwgdGhpcy5fdXAueSwgdGhpcy5fZm9yd2FyZC55LCAwLFxyXG4gICAgICAgICAgICB0aGlzLl9sZWZ0LnosIHRoaXMuX3VwLnosIHRoaXMuX2ZvcndhcmQueiwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMSBdICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUuaW52ZXJzZVRyYW5zbGF0aW9uTWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdDQ0LnRyYW5zbGF0aW9uKCBuZXcgVmVjMyggLXRoaXMuX29yaWdpbi54LCAtdGhpcy5fb3JpZ2luLnksIC10aGlzLl9vcmlnaW4ueiApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUubWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVCAqIFIgKiBTXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRpb25NYXRyaXgoKS5tdWx0KCB0aGlzLnJvdGF0aW9uTWF0cml4KCkgKS5tdWx0KCB0aGlzLnNjYWxlTWF0cml4KCkgKTtcclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5pbnZlcnNlTWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gU14tMSAqIFJeLTEgKiBUXi0xXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52ZXJzZVNjYWxlTWF0cml4KCkubXVsdCggdGhpcy5pbnZlcnNlUm90YXRpb25NYXRyaXgoKSApLm11bHQoIHRoaXMuaW52ZXJzZVRyYW5zbGF0aW9uTWF0cml4KCkgKTtcclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS52aWV3TWF0cml4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5PcmlnaW4gPSBuZXcgVmVjMyggLXRoaXMuX29yaWdpbi54LCAtdGhpcy5fb3JpZ2luLnksIC10aGlzLl9vcmlnaW4ueiApLFxyXG4gICAgICAgICAgICByaWdodCA9IG5ldyBWZWMzKCAtdGhpcy5fbGVmdC54LCAtdGhpcy5fbGVmdC55LCAtdGhpcy5fbGVmdC56ICksXHJcbiAgICAgICAgICAgIGJhY2t3YXJkID0gbmV3IFZlYzMoIC10aGlzLl9mb3J3YXJkLngsIC10aGlzLl9mb3J3YXJkLnksIC10aGlzLl9mb3J3YXJkLnogKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdDQ0KCBbIC10aGlzLl9sZWZ0LngsIHRoaXMuX3VwLngsIC10aGlzLl9mb3J3YXJkLngsIDAsXHJcbiAgICAgICAgICAgIC10aGlzLl9sZWZ0LnksIHRoaXMuX3VwLnksIC10aGlzLl9mb3J3YXJkLnksIDAsXHJcbiAgICAgICAgICAgIC10aGlzLl9sZWZ0LnosIHRoaXMuX3VwLnosIC10aGlzLl9mb3J3YXJkLnosIDAsXHJcbiAgICAgICAgICAgIG5PcmlnaW4uZG90KCByaWdodCApLCBuT3JpZ2luLmRvdCggdGhpcy5fdXAgKSwgbk9yaWdpbi5kb3QoIGJhY2t3YXJkICksIDEgXSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnRyYW5zbGF0ZVdvcmxkID0gZnVuY3Rpb24oIHRyYW5zbGF0aW9uICkge1xyXG4gICAgICAgIHRoaXMuX29yaWdpbiA9IHRoaXMuX29yaWdpbi5hZGQoIHRyYW5zbGF0aW9uICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudHJhbnNsYXRlTG9jYWwgPSBmdW5jdGlvbiggdHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgdHJhbnNsYXRpb24gPSAoIHRyYW5zbGF0aW9uIGluc3RhbmNlb2YgQXJyYXkgKSA/IG5ldyBWZWMzKCB0cmFuc2xhdGlvbiApIDogdHJhbnNsYXRpb247XHJcbiAgICAgICAgdGhpcy5fb3JpZ2luID0gdGhpcy5fb3JpZ2luLmFkZCggdGhpcy5fbGVmdC5tdWx0KCB0cmFuc2xhdGlvbi54ICkgKTtcclxuICAgICAgICB0aGlzLl9vcmlnaW4gPSB0aGlzLl9vcmlnaW4uYWRkKCB0aGlzLl91cC5tdWx0KCB0cmFuc2xhdGlvbi55ICkgKTtcclxuICAgICAgICB0aGlzLl9vcmlnaW4gPSB0aGlzLl9vcmlnaW4uYWRkKCB0aGlzLl9mb3J3YXJkLm11bHQoIHRyYW5zbGF0aW9uLnogKSApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZVdvcmxkRGVncmVlcyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3RhdGVXb3JsZFJhZGlhbnMoIGFuZ2xlICogTWF0aC5QSSAvIDE4MCwgYXhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZVdvcmxkUmFkaWFucyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICB2YXIgcm90ID0gTWF0MzMucm90YXRpb25SYWRpYW5zKCBhbmdsZSwgYXhpcyApO1xyXG4gICAgICAgIHRoaXMuX3VwID0gcm90Lm11bHQoIHRoaXMuX3VwICk7XHJcbiAgICAgICAgdGhpcy5fZm9yd2FyZCA9IHJvdC5tdWx0KCB0aGlzLl9mb3J3YXJkICk7XHJcbiAgICAgICAgdGhpcy5fbGVmdD0gcm90Lm11bHQoIHRoaXMuX2xlZnQgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5yb3RhdGVMb2NhbERlZ3JlZXMgPSBmdW5jdGlvbiggYW5nbGUsIGF4aXMgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRlV29ybGREZWdyZWVzKCBhbmdsZSwgdGhpcy5yb3RhdGlvbk1hdHJpeCgpLm11bHQoIGF4aXMgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLnJvdGF0ZUxvY2FsUmFkaWFucyA9IGZ1bmN0aW9uKCBhbmdsZSwgYXhpcyApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3RhdGVXb3JsZFJhZGlhbnMoIGFuZ2xlLCB0aGlzLnJvdGF0aW9uTWF0cml4KCkubXVsdCggYXhpcyApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUubG9jYWxUb1dvcmxkID0gZnVuY3Rpb24oIHRoYXQsIGlnbm9yZVNjYWxlLCBpZ25vcmVSb3RhdGlvbiwgaWdub3JlVHJhbnNsYXRpb24gKSB7XHJcbiAgICAgICAgdmFyIG1hdCA9IG5ldyBNYXQ0NCgpO1xyXG4gICAgICAgIGlmICggIWlnbm9yZVNjYWxlICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLnNjYWxlTWF0cml4KCkubXVsdCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIWlnbm9yZVJvdGF0aW9uICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLnJvdGF0aW9uTWF0cml4KCkubXVsdCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIWlnbm9yZVRyYW5zbGF0aW9uICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLnRyYW5zbGF0aW9uTWF0cml4KCkubXVsdCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXQubXVsdCggdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBUcmFuc2Zvcm0ucHJvdG90eXBlLndvcmxkVG9Mb2NhbCA9IGZ1bmN0aW9uKCB0aGF0LCBpZ25vcmVTY2FsZSwgaWdub3JlUm90YXRpb24sIGlnbm9yZVRyYW5zbGF0aW9uICkge1xyXG4gICAgICAgIHZhciBtYXQgPSBuZXcgTWF0NDQoKTtcclxuICAgICAgICBpZiAoICFpZ25vcmVUcmFuc2xhdGlvbiApIHtcclxuICAgICAgICAgICAgbWF0ID0gdGhpcy5pbnZlcnNlVHJhbnNsYXRpb25NYXRyaXgoKS5tdWx0KCBtYXQgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhaWdub3JlUm90YXRpb24gKSB7XHJcbiAgICAgICAgICAgIG1hdCA9IHRoaXMuaW52ZXJzZVJvdGF0aW9uTWF0cml4KCkubXVsdCggbWF0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIWlnbm9yZVNjYWxlICkge1xyXG4gICAgICAgICAgICBtYXQgPSB0aGlzLmludmVyc2VTY2FsZU1hdHJpeCgpLm11bHQoIG1hdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0Lm11bHQoIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3JpZ2luLmVxdWFscyggdGhhdC5vcmlnaW4oKSwgZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcndhcmQuZXF1YWxzKCB0aGF0LmZvcndhcmQoKSwgZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgIHRoaXMuX3VwLmVxdWFscyggdGhhdC51cCgpLCBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgdGhpcy5fbGVmdC5lcXVhbHMoIHRoYXQubGVmdCgpLCBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgdGhpcy5fc2NhbGUuZXF1YWxzKCB0aGF0LnNjYWxlKCksIGVwc2lsb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgVHJhbnNmb3JtLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVHJhbnNmb3JtKClcclxuICAgICAgICAgICAgLm9yaWdpbiggVmVjMy5yYW5kb20oKSApXHJcbiAgICAgICAgICAgIC5mb3J3YXJkKCBWZWMzLnJhbmRvbSgpIClcclxuICAgICAgICAgICAgLnNjYWxlKCBWZWMzLnJhbmRvbSgpICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFRyYW5zZm9ybS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaXgoKS50b1N0cmluZygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICBmdW5jdGlvbiBWZWMyKCkge1xyXG4gICAgICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIC8vIGFycmF5IG9yIFZlY04gYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIHZhciBhcmd1bWVudCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50LnggfHwgYXJndW1lbnRbMF0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gYXJndW1lbnQueSB8fCBhcmd1bWVudFsxXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCBjb21wb25lbnQgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIFZlYzIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCArIHRoYXRbMF0sIHRoaXMueSArIHRoYXRbMV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggKyB0aGF0LngsIHRoaXMueSArIHRoYXQueSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMyLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMyKCB0aGlzLnggLSB0aGF0WzBdLCB0aGlzLnkgLSB0aGF0WzFdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMiggdGhpcy54IC0gdGhhdC54LCB0aGlzLnkgLSB0aGF0LnkgKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjMi5wcm90b3R5cGUubXVsdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMiggdGhpcy54ICogdGhhdCwgdGhpcy55ICogdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMyLnByb3RvdHlwZS5kaXYgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIoIHRoaXMueCAvIHRoYXQsIHRoaXMueSAvIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjMi5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXRbMF0gKSArICggdGhpcy55ICogdGhhdFsxXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0LnggKSArICggdGhpcy55ICogdGhhdC55ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzIucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKCBsZW5ndGggKSB7XHJcbiAgICAgICAgaWYgKCBsZW5ndGggPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5kb3QoIHRoaXMgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoKS5tdWx0KCBsZW5ndGggKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjMi5wcm90b3R5cGUubGVuZ3RoU3F1YXJlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRvdCggdGhpcyApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMyLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiggdGhhdCwgZXBzaWxvbiApIHtcclxuICAgICAgICBlcHNpbG9uID0gZXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMCA6IGVwc2lsb247XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy54ID09PSB0aGF0LnggfHwgTWF0aC5hYnMoIHRoaXMueCAtIHRoYXQueCApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueSA9PT0gdGhhdC55IHx8IE1hdGguYWJzKCB0aGlzLnkgLSB0aGF0LnkgKSA8PSBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzIucHJvdG90eXBlLmNyb3NzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXRbMV0gKSAtICggdGhpcy55ICogdGhhdFswXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdC55ICkgLSAoIHRoaXMueSAqIHRoYXQueCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMyLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWFnID0gdGhpcy5sZW5ndGgoKTtcclxuICAgICAgICBpZiAoIG1hZyAhPT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMyKFxyXG4gICAgICAgICAgICAgICAgdGhpcy54IC8gbWFnLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55IC8gbWFnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMigpO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMyLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMihcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgICAgTWF0aC5yYW5kb20oKSApLm5vcm1hbGl6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzIucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gWyB0aGlzLngsIHRoaXMueSBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlYzI7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgZnVuY3Rpb24gVmVjMygpIHtcclxuICAgICAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBvciBRdWF0ZXJuaW9uIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJndW1lbnQgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudC54IHx8IGFyZ3VtZW50WzBdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50LnkgfHwgYXJndW1lbnRbMV0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gYXJndW1lbnQueiB8fCBhcmd1bWVudFsyXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaXZpZHVhbCBjb21wb25lbnQgYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSBhcmd1bWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnogPSBhcmd1bWVudHNbMl07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBWZWMzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggKyB0aGF0WzBdLCB0aGlzLnkgKyB0aGF0WzFdLCB0aGlzLnogKyB0aGF0WzJdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54ICsgdGhhdC54LCB0aGlzLnkgKyB0aGF0LnksIHRoaXMueiArIHRoYXQueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMzLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggLSB0aGF0WzBdLCB0aGlzLnkgLSB0aGF0WzFdLCB0aGlzLnogLSB0aGF0WzJdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54IC0gdGhhdC54LCB0aGlzLnkgLSB0aGF0LnksIHRoaXMueiAtIHRoYXQueiApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMzLnByb3RvdHlwZS5tdWx0ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKCB0aGlzLnggKiB0aGF0LCB0aGlzLnkgKiB0aGF0LCB0aGlzLnogKiB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzMucHJvdG90eXBlLmRpdiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyggdGhpcy54IC8gdGhhdCwgdGhpcy55IC8gdGhhdCwgdGhpcy56IC8gdGhhdCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMzLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICBpZiAoIHRoYXQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdFswXSApICsgKCB0aGlzLnkgKiB0aGF0WzFdICkgKyAoIHRoaXMueiAqIHRoYXRbMl0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICggdGhpcy54ICogdGhhdC54ICkgKyAoIHRoaXMueSAqIHRoYXQueSApICsgKCB0aGlzLnogKiB0aGF0LnogKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjMy5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oIGxlbmd0aCApIHtcclxuICAgICAgICBpZiAoIGxlbmd0aCA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLmRvdCggdGhpcyApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpLm11bHQoIGxlbmd0aCApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMzLnByb3RvdHlwZS5sZW5ndGhTcXVhcmVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZG90KCB0aGlzICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzMucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKCB0aGF0LCBlcHNpbG9uICkge1xyXG4gICAgICAgIGVwc2lsb24gPSBlcHNpbG9uID09PSB1bmRlZmluZWQgPyAwIDogZXBzaWxvbjtcclxuICAgICAgICByZXR1cm4gKCB0aGlzLnggPT09IHRoYXQueCB8fCBNYXRoLmFicyggdGhpcy54IC0gdGhhdC54ICkgPD0gZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgICggdGhpcy55ID09PSB0aGF0LnkgfHwgTWF0aC5hYnMoIHRoaXMueSAtIHRoYXQueSApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAoIHRoaXMueiA9PT0gdGhhdC56IHx8IE1hdGguYWJzKCB0aGlzLnogLSB0aGF0LnogKSA8PSBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzMucHJvdG90eXBlLmNyb3NzID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGF0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgICAgICggdGhpcy55ICogdGhhdFsyXSApIC0gKCB0aGF0WzFdICogdGhpcy56ICksXHJcbiAgICAgICAgICAgICAgICAoLXRoaXMueCAqIHRoYXRbMl0gKSArICggdGhhdFswXSAqIHRoaXMueiApLFxyXG4gICAgICAgICAgICAgICAgKCB0aGlzLnggKiB0aGF0WzFdICkgLSAoIHRoYXRbMF0gKiB0aGlzLnkgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgICggdGhpcy55ICogdGhhdC56ICkgLSAoIHRoYXQueSAqIHRoaXMueiApLFxyXG4gICAgICAgICAgICAoLXRoaXMueCAqIHRoYXQueiApICsgKCB0aGF0LnggKiB0aGlzLnogKSxcclxuICAgICAgICAgICAgKCB0aGlzLnggKiB0aGF0LnkgKSAtICggdGhhdC54ICogdGhpcy55ICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjMy5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1hZyA9IHRoaXMubGVuZ3RoKCk7XHJcbiAgICAgICAgaWYgKCBtYWcgIT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgICAgIHRoaXMueCAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueSAvIG1hZyxcclxuICAgICAgICAgICAgICAgIHRoaXMueiAvIG1hZyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjMy5yYW5kb20gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCksXHJcbiAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKS5ub3JtYWxpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjMy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIsIFwiICsgdGhpcy56O1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWMzLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFsgdGhpcy54LCB0aGlzLnksIHRoaXMueiBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlYzM7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgZnVuY3Rpb24gVmVjNCgpIHtcclxuICAgICAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBvciBRdWF0ZXJuaW9uIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJndW1lbnQgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSBhcmd1bWVudC54IHx8IGFyZ3VtZW50WzBdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50LnkgfHwgYXJndW1lbnRbMV0gfHwgMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gYXJndW1lbnQueiB8fCBhcmd1bWVudFsyXSB8fCAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLncgPSBhcmd1bWVudC53IHx8IGFyZ3VtZW50WzNdIHx8IDAuMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpbmRpdmlkdWFsIGNvbXBvbmVudCBhcmd1bWVudHNcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IGFyZ3VtZW50c1sxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMueiA9IGFyZ3VtZW50c1syXTtcclxuICAgICAgICAgICAgICAgIHRoaXMudyA9IGFyZ3VtZW50c1szXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ID0gMC4wO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIFZlYzQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggKyB0aGF0WzBdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55ICsgdGhhdFsxXSxcclxuICAgICAgICAgICAgICAgIHRoaXMueiArIHRoYXRbMl0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLncgKyB0aGF0WzNdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy54ICsgdGhhdC54LFxyXG4gICAgICAgICAgICB0aGlzLnkgKyB0aGF0LnksXHJcbiAgICAgICAgICAgIHRoaXMueiArIHRoYXQueixcclxuICAgICAgICAgICAgdGhpcy53ICsgdGhhdC53ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzQucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggLSB0aGF0WzBdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55IC0gdGhhdFsxXSxcclxuICAgICAgICAgICAgICAgIHRoaXMueiAtIHRoYXRbMl0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLncgLSB0aGF0WzNdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjNChcclxuICAgICAgICAgICAgdGhpcy54IC0gdGhhdC54LFxyXG4gICAgICAgICAgICB0aGlzLnkgLSB0aGF0LnksXHJcbiAgICAgICAgICAgIHRoaXMueiAtIHRoYXQueixcclxuICAgICAgICAgICAgdGhpcy53IC0gdGhhdC53ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzQucHJvdG90eXBlLm11bHQgPSBmdW5jdGlvbiggdGhhdCApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHRoaXMueCAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMueSAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMueiAqIHRoYXQsXHJcbiAgICAgICAgICAgIHRoaXMudyAqIHRoYXQgKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjNC5wcm90b3R5cGUuZGl2ID0gZnVuY3Rpb24oIHRoYXQgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICB0aGlzLnggLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLnkgLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLnogLyB0aGF0LFxyXG4gICAgICAgICAgICB0aGlzLncgLyB0aGF0ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzQucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKCB0aGF0ICkge1xyXG4gICAgICAgIGlmICggdGhhdCBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCB0aGlzLnggKiB0aGF0WzBdICkgK1xyXG4gICAgICAgICAgICAgICAgKCB0aGlzLnkgKiB0aGF0WzFdICkgK1xyXG4gICAgICAgICAgICAgICAgKCB0aGlzLnogKiB0aGF0WzJdICkgK1xyXG4gICAgICAgICAgICAgICAgKCB0aGlzLncgKiB0aGF0WzNdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCAqIHRoYXQueCApICtcclxuICAgICAgICAgICAgKCB0aGlzLnkgKiB0aGF0LnkgKSArXHJcbiAgICAgICAgICAgICggdGhpcy56ICogdGhhdC56ICkgK1xyXG4gICAgICAgICAgICAoIHRoaXMudyAqIHRoYXQudyApO1xyXG4gICAgfTtcclxuXHJcbiAgICBWZWM0LnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiggbGVuZ3RoICkge1xyXG4gICAgICAgIGlmICggbGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoIHRoaXMuZG90KCB0aGlzICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKCkubXVsdCggbGVuZ3RoICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzQucHJvdG90eXBlLmxlbmd0aFNxdWFyZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kb3QoIHRoaXMgKTtcclxuICAgIH07XHJcblxyXG4gICAgVmVjNC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oIHRoYXQsIGVwc2lsb24gKSB7XHJcbiAgICAgICAgZXBzaWxvbiA9IGVwc2lsb24gPT09IHVuZGVmaW5lZCA/IDAgOiBlcHNpbG9uO1xyXG4gICAgICAgIHJldHVybiAoIHRoaXMueCA9PT0gdGhhdC54IHx8IE1hdGguYWJzKCB0aGlzLnggLSB0aGF0LnggKSA8PSBlcHNpbG9uICkgJiZcclxuICAgICAgICAgICAgICAgKCB0aGlzLnkgPT09IHRoYXQueSB8fCBNYXRoLmFicyggdGhpcy55IC0gdGhhdC55ICkgPD0gZXBzaWxvbiApICYmXHJcbiAgICAgICAgICAgICAgICggdGhpcy56ID09PSB0aGF0LnogfHwgTWF0aC5hYnMoIHRoaXMueiAtIHRoYXQueiApIDw9IGVwc2lsb24gKSAmJlxyXG4gICAgICAgICAgICAgICAoIHRoaXMudyA9PT0gdGhhdC53IHx8IE1hdGguYWJzKCB0aGlzLncgLSB0aGF0LncgKSA8PSBlcHNpbG9uICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzQucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtYWcgPSB0aGlzLmxlbmd0aCgpO1xyXG4gICAgICAgIGlmICggbWFnICE9PSAwICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnggLyBtYWcsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgLyBtYWcsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnogLyBtYWcsXHJcbiAgICAgICAgICAgICAgICB0aGlzLncgLyBtYWcgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzQucmFuZG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWM0KFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgICBNYXRoLnJhbmRvbSgpICkubm9ybWFsaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIFZlYzQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiLCBcIiArIHRoaXMueiArIFwiLCBcIiArIHRoaXMudztcclxuICAgIH07XHJcblxyXG4gICAgVmVjNC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBbIHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyBdO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlYzQ7XHJcblxyXG59KCkpO1xyXG4iXX0=
