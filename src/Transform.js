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
