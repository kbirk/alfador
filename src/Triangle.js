(function () {

    "use strict";

    var Vec3 = require('./Vec3');

    /**
     * Instantiates a Triangle object.
     * @class Triangle
     * @classdesc A triangle object.
     */
    function Triangle( spec ) {
        this.positions = [
            new Vec3( spec.positions[0] || spec[0] ),
            new Vec3( spec.positions[1] || spec[1] ),
            new Vec3( spec.positions[2] || spec[2] )
        ];
    }

    /**
     * Returns the radius of the bounding sphere of the triangle.
     *
     * @returns {number} The radius of the bounding sphere.
     */
    Triangle.prototype.getRadius = function() {
        if ( !this.radius ) {
            var positions = this.positions,
                centroid = this.getCentroid(),
                aDist = positions[0].sub( centroid ).length(),
                bDist = positions[1].sub( centroid ).length(),
                cDist = positions[2].sub( centroid ).length();
            this.radius = Math.max( aDist, Math.max( bDist, cDist ) );
        }
        return this.radius;
    };

    /**
     * Returns the centroid of the triangle.
     *
     * @returns {number} The centroid of the triangle.
     */
    Triangle.prototype.getCentroid = function() {
        if ( !this.centroid ) {
            var positions = this.positions;
            this.centroid = positions[0]
                .add( positions[1] )
                .add( positions[2] )
                .div( 3 );
        }
        return this.centroid;
    };

    /**
     * Returns the normal of the triangle.
     *
     * @returns {number} The normal of the triangle.
     */
    Triangle.prototype.getNormal = function() {
        if ( !this.normal ) {
            var positions = this.positions,
                ab = positions[0].sub( positions[1] ),
                ac = positions[0].sub( positions[2] );
            this.normal = ab.cross( ac ).normalize();
        }
        return this.normal;
    };

    module.exports = Triangle;

}());
