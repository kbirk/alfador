(function() {

    'use strict';

    var assert = require('assert');
    var Vec2 = require('../src/Vec2');
    var Vec3 = require('../src/Vec3');
    var Vec4 = require('../src/Vec4');
    var EPSILON = require('../src/Epsilon');

    describe('Vec4', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var v = new Vec4(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert( v.equals( v ) );
                assert( !v.equals( new Vec4( -v.x, v.y, v.z, v.w ) ) );
                assert( !v.equals( new Vec4( v.x, v.y+5, v.z, v.w ) ) );
                assert( !v.equals( new Vec4( v.x, v.y, v.z-1.2345, v.w ) ) );
                assert( !v.equals( new Vec4( v.x, v.y, v.z, v.w*3 ) ) );
                assert( v.equals( new Vec4( v.x, v.y, v.z, v.w ) ) );
            });
            it('should return true if all components match', function() {
                var v = new Vec4(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert( v.equals( new Vec4( v.x, v.y, v.z, v.w ) ) );
            });
            it('should accept and array of input', function() {
                var v = new Vec4(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert( v.equals( [ v.x, v.y, v.z, v.w ] ) );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var r = Math.random();
                var v = new Vec4( r, r, r, r );
                assert( v.equals( new Vec4( r/2, r/2, r/2, r/2 ), r/2 ) );
            });
        });

        describe('#random()', function() {
            it('should return a Vec4 with 4 random components', function() {
                var r0 = Vec4.random();
                var r1 = Vec4.random();
                assert( !r0.equals( new Vec4( 0, 0, 0, 0 ) ) );
                assert( !r1.equals( new Vec4( 0, 0, 0, 0 ) ) );
            });
        });

        describe('#constructor()', function() {
            it('should return a zero vector when supplied no arguments', function() {
                var vEmpty = new Vec4();
                assert( vEmpty.equals( new Vec4( 0, 0, 0 ) ) );
            });
            it('should return a vector from four numerical arguments', function() {
                var p = Math.random();
                var q = Math.random();
                var r = Math.random();
                var s = Math.random();
                var t = new Vec4( p, q, r, s );
                assert( t.x === p && t.y === q && t.z === r && t.w === s );
            });
            it('should return a vector from an array of four numerical arguments', function() {
                var p = Math.random();
                var q = Math.random();
                var r = Math.random();
                var s = Math.random();
                var t = new Vec4([ p, q, r, s ]);
                assert( t.x === p && t.y === q && t.z === r && t.w === s );
            });
            it('should return deep copy when supplied another Vec4', function() {
                var p = Vec4.random(),
                    q = new Vec4( p );
                assert( p.equals( q ) );
            });
            it('should return a deep copy when supplied another Vec2, last components set to 0', function() {
                var p = Vec2.random();
                var q = new Vec4( p );
                var s = new Vec4( p.x, p.y, 0, 0 );
                assert( q.equals( s ) );
            });
            it('should return a deep copy when supplied another Vec3, last component set to 0', function() {
                var p = Vec3.random();
                var q = new Vec4( p );
                var s = new Vec4( p.x, p.y, p.z, 0 );
                assert( q.equals( s ) );
            });
            it('should return a zero vector when given invalid input', function() {
                var p = new Vec4( NaN, 4 );
                var r = new Vec4( {} );
                var s = new Vec4( function() {});
                var t = new Vec4( [] );
                assert( p.equals( new Vec4( 0, 0, 0, 0 ) ) );
                assert( r.equals( new Vec4( 0, 0, 0, 0 ) ) );
                assert( s.equals( new Vec4( 0, 0, 0, 0 ) ) );
                assert( t.equals( new Vec4( 0, 0, 0, 0 ) ) );
            });
        });

        describe('#negate', function() {
            it('should return a Vec4 with each component negated', function() {
                var v = Vec4.random();
                assert( v.negate().equals( new Vec4( -v.x, -v.y, -v.z, -v.w ) ) );
            });
        });

        describe('#add', function() {
            it('should return a value of self + argument', function() {
                var v0 = Vec4.random();
                var v1 = Vec4.random();
                var v2 = [ Math.random(), Math.random(), Math.random(), Math.random() ];
                assert( v0.add( v1 ).equals( new Vec4( v0.x + v1.x, v0.y + v1.y, v0.z + v1.z, v0.w + v1.w ) ) );
                assert( v0.add( v2 ).equals( new Vec4( v0.x + v2[0], v0.y + v2[1], v0.z + v2[2], v0.w + v2[3] ) ) );
            });
        });

        describe('#sub', function() {
            it('should return a value of self - argument', function() {
                var v0 = Vec4.random();
                var v1 = Vec4.random();
                var v2 = [ Math.random(), Math.random(), Math.random(), Math.random() ];
                assert( v0.sub( v1 ).equals( new Vec4( v0.x - v1.x, v0.y - v1.y, v0.z - v1.z, v0.w - v1.w ) ) );
                assert( v0.sub( v2 ).equals( new Vec4( v0.x - v2[0], v0.y - v2[1], v0.z - v2[2], v0.w - v2[3] ) ) );
            });
        });

        describe('#divScalar', function() {
            it('should return a value of self / argument', function() {
                var v = Vec4.random();
                var r = Math.random();
                assert( v.divScalar( r ).equals( new Vec4( v.x / r, v.y / r, v.z / r, v.w / r ) ) );
            });
        });

        describe('#multScalar', function() {
            it('should return a value of self * argument', function() {
                var v = Vec4.random();
                var r = Math.random();
                assert( v.multScalar( r ).equals( new Vec4( v.x * r, v.y * r, v.z * r, v.w * r ) ) );
            });
        });

        describe('#dot', function() {
            it('should return the dot product', function() {
                var v0 = Vec4.random();
                var v1 = Vec4.random();
                var v2 = [ Math.random(), Math.random(), Math.random(), Math.random() ];
                assert( v0.dot( v1 ) === v0.x * v1.x + v0.y * v1.y + v0.z * v1.z + v0.w * v1.w );
                assert( v0.dot( v2 ) === v0.x * v2[0] + v0.y * v2[1] + v0.z * v2[2] + v0.w * v2[3] );
            });
        });

        describe('#length', function() {
            it('with no argument, should return the length of the vector', function() {
                var v0 = new Vec4( 1, 1, 1, 1 );
                var r = Math.random();
                var v1 = new Vec4( r, 0, 0 );
                var v2 = Vec4.random().normalize();
                assert( v0.length() - 2 < EPSILON  );
                assert( v1.length() - r < EPSILON  );
                assert( v2.length() - 1.0 < EPSILON );
            });
            it('when passed an argument, should return an equivolent vector with the specified length', function() {
                var v = Vec4.random();
                var l = Math.random();
                assert( v.length( l ).length() - 1 < EPSILON );
            });
        });

        describe('#lengthSquared', function() {
            it('should return the squared length of the vector', function() {
                var v0 = new Vec4( 1, 1, 1, 1 );
                var r = Math.random();
                var v1 = new Vec4( r, 0, 0 );
                var v2 = Vec4.random().normalize();
                assert( v0.lengthSquared() - 4 < EPSILON  );
                assert( v1.lengthSquared() - r*r < EPSILON  );
                assert( v2.lengthSquared() - 1.0 < EPSILON );
            });
        });

        describe('#normalize', function() {
            it('should return an equivolent vector of unit length', function() {
                var v = Vec4.random();
                v.x += 1;
                v.y += 1;
                v.z += 1;
                v.z += 1;
                assert( v.normalize().length() - 1 < EPSILON );
            });
            it('should throw an exception if length is zero', function() {
                var v = new Vec4( 0, 0, 0, 0 );
                var result = false;
                try {
                    v.normalize();
                } catch( err ) {
                    result = true;
                }
                assert( result );
            });
        });

        describe('#toString', function() {
            it('should return a string of comma separated component values', function() {
                var v = Vec4.random();
                var s = v.toString();
                var a = s.split(',');
                assert( parseFloat( a[0] ) === v.x );
                assert( parseFloat( a[1] ) === v.y );
                assert( parseFloat( a[2] ) === v.z );
                assert( parseFloat( a[3] ) === v.w );
            });
        });

        describe('#toArray', function() {
            it('should return an Array with four matching components', function() {
                var v = Vec4.random();
                var a = v.toArray();
                assert( a instanceof Array );
                assert( a.length === 4 );
                assert( a[0] - v.x < EPSILON );
                assert( a[1] - v.y < EPSILON );
                assert( a[2] - v.z < EPSILON );
                assert( a[3] - v.w < EPSILON );
            });
        });

    });

}());
