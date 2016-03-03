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
