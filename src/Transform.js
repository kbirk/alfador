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
