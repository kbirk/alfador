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
        if ( that.data && that.data instanceof Array ) {
            // Mat33 or Mat44, extract transform components from Mat44
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
