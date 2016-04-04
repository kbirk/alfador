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
