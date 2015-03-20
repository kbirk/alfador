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
