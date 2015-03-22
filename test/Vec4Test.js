"use strict";

var EPSILON = 0.00001,
    assert = require( 'assert' ),
    Vec2 = require( '../src/Vec2' ),
    Vec3 = require( '../src/Vec3' ),
    Vec4 = require( '../src/Vec4' );

describe('Vec4', function() {

    describe('#equals()', function() {
        it('should return false if any components do not match', function() {
            var v = new Vec4( Math.random(),
                              Math.random(),
                              Math.random(),
                              Math.random() );
            assert.equal( v.equals( v ), true );
            assert.equal( v.equals( new Vec4( -v.x, v.y, v.z, v.w ) ), false );
            assert.equal( v.equals( new Vec4( v.x, v.y+5, v.z, v.w ) ), false );
            assert.equal( v.equals( new Vec4( v.x, v.y, v.z-1.2345, v.w ) ), false );
            assert.equal( v.equals( new Vec4( v.x, v.y, v.z, v.w*3 ) ), false );
            assert.equal( v.equals( new Vec4( v.x, v.y, v.z, v.w ) ), true );
        });
        it('should return true if all components match', function() {
            var v = new Vec4( Math.random(),
                              Math.random(),
                              Math.random(),
                              Math.random() );
            assert.equal( v.equals( new Vec4( v.x, v.y, v.z, v.w ) ), true );
        });
        it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
            var r = Math.random(),
                v = new Vec4( r, r, r, r );
            assert.equal( v.equals( new Vec4( r/2, r/2, r/2, r/2 ), r/2 ), true );
        });
    });

    describe('#random()', function() {
        it('should return a Vec4 with 4 random components', function() {
            var r0 = Vec4.random(),
                r1 = Vec4.random();
            assert.equal( r0.equals( new Vec4( 0, 0, 0, 0 ) ), false );
            assert.equal( r1.equals( new Vec4( 0, 0, 0, 0 ) ), false );
        })
    });

    describe('#constructor()', function() {
        it('should return a zero vector when supplied no arguments', function() {
            var vEmpty = new Vec4();
            assert.equal( vEmpty.equals( new Vec4( 0, 0, 0 ) ), true );
        });
        it('should return a vector from four numerical arguments', function() {
            var p = Math.random(),
                q = Math.random(),
                r = Math.random(),
                s = Math.random(),
                t = new Vec4( p, q, r, s );
            assert.equal( t.x === p && t.y === q && t.z === r && t.w === s, true );
        });
        it('should return a vector from an array of four numerical arguments', function() {
            var p = Math.random(),
                q = Math.random(),
                r = Math.random(),
                s = Math.random(),
                t = new Vec4([ p, q, r, s ]);
            assert.equal( t.x === p && t.y === q && t.z === r && t.w === s, true );
        });
        it('should return deep copy when supplied another Vec4', function() {
            var p = Vec4.random(),
                q = new Vec4( p );
            assert.equal( p.equals( q ), true );
        });
        it('should return a deep copy when supplied another Vec2, last components set to 0', function() {
            var p = Vec2.random(),
                q = new Vec4( p ),
                s = new Vec4( p.x, p.y, 0, 0 );
            assert.equal( q.equals( s ), true );
        });
        it('should return a deep copy when supplied another Vec3, last component set to 0', function() {
            var p = Vec3.random(),
                q = new Vec4( p ),
                s = new Vec4( p.x, p.y, p.z, 0 );
            assert.equal( q.equals( s ), true );
        });
        it('should return a zero vector when given invalid input', function() {
            var p = new Vec4( NaN, 4 ),
                q = new Vec4( {"random":Math.random()} ),
                r = new Vec4( {} ),
                s = new Vec4( function() {
                    return false;
                }),
                t = new Vec4( [] );
            assert.equal( p.equals( new Vec4( 0, 0, 0, 0 ) ), true );
            assert.equal( q.equals( new Vec4( 0, 0, 0, 0 ) ), true );
            assert.equal( r.equals( new Vec4( 0, 0, 0, 0 ) ), true );
            assert.equal( s.equals( new Vec4( 0, 0, 0, 0 ) ), true );
            assert.equal( t.equals( new Vec4( 0, 0, 0, 0 ) ), true );
        });
    });

    describe('#add', function() {
        it('should return a value of self + VecN argument, returning Vec4', function() {
            var v0 = Vec4.random(),
                v1 = Vec4.random();
            assert.equal( v0.add( v1 ).equals( new Vec4( v0.x + v1.x, v0.y + v1.y, v0.z + v1.z, v0.w + v1.w ) ), true );
        });
        it('should return a value of self + Array argument, returning Vec4', function() {
            var v0 = Vec4.random(),
                v1 = [ Math.random(), Math.random(), Math.random(), Math.random() ];
            assert.equal( v0.add( v1 ).equals( new Vec4( v0.x + v1[0], v0.y + v1[1], v0.z + v1[2], v0.w + v1[3] ) ), true );
        });
    });

    describe('#sub', function() {
        it('should return a value of self - VecN argument, returning Vec4', function() {
            var v0 = Vec4.random(),
                v1 = Vec4.random();
            assert.equal( v0.sub( v1 ).equals( new Vec4( v0.x - v1.x, v0.y - v1.y, v0.z - v1.z, v0.w - v1.w ) ), true );
        });
        it('should return a value of self - Array argument, returning Vec4', function() {
            var v0 = Vec4.random(),
                v1 = [ Math.random(), Math.random(), Math.random(), Math.random() ];
            assert.equal( v0.sub( v1 ).equals( new Vec4( v0.x - v1[0], v0.y - v1[1], v0.z - v1[2], v0.w - v1[3] ) ), true );
        });
    });

    describe('#div', function() {
        it('should return a value of self / argument', function() {
            var v = Vec4.random(),
                r = Math.random();
            assert.equal( v.div( r ).equals( new Vec4( v.x / r, v.y / r, v.z / r, v.w / r ) ), true );
        });
    });

    describe('#mult', function() {
        it('should return a value of self * argument', function() {
            var v = Vec4.random(),
                r = Math.random();
            assert.equal( v.mult( r ).equals( new Vec4( v.x * r, v.y * r, v.z * r, v.w * r ) ), true );
        });
    });

    describe('#dot', function() {
        it('should return the dot product from a VecN argument', function() {
            var v0 = Vec4.random(),
                v1 = Vec4.random();
            assert.equal( v0.dot( v1 ) === v0.x * v1.x + v0.y * v1.y + v0.z * v1.z + v0.w * v1.w, true );
        });
        it('should return the dot product from an Array argument', function() {
            var v0 = Vec4.random(),
                v1 = [ Math.random(), Math.random(), Math.random(), Math.random() ];
            assert.equal( v0.dot( v1 ) === v0.x * v1[0] + v0.y * v1[1] + v0.z * v1[2] + v0.w * v1[3], true );
        });
    });

    describe('#length', function() {
        it('with no argument, should return the length of the vector', function() {
            var v0 = new Vec4( 1, 1, 1, 1 ),
                r = Math.random(),
                v1 = new Vec4( r, 0, 0 ),
                v2 = Vec4.random().normalize();
            assert.equal( v0.length() - 2 < EPSILON , true );
            assert.equal( v1.length() - r < EPSILON , true );
            assert.equal( v2.length() - 1.0 < EPSILON, true );
        });
        it('when passed an argument, should return an equivolent vector with the specified length', function() {
            var v = Vec4.random(),
                l = Math.random();
            assert( v.length( l ).length() - 1 < EPSILON, true );
        });
    });

    describe('#lengthSquared', function() {
        it('should return the squared length of the vector', function() {
            var v0 = new Vec4( 1, 1, 1, 1 ),
                r = Math.random(),
                v1 = new Vec4( r, 0, 0 ),
                v2 = Vec4.random().normalize();
            assert.equal( v0.lengthSquared() - 4 < EPSILON , true );
            assert.equal( v1.lengthSquared() - r*r < EPSILON , true );
            assert.equal( v2.lengthSquared() - 1.0 < EPSILON, true );
        });
    });

    describe('#normalize', function() {
        it('should return an equivolent vector of unit length', function() {
            var v = Vec4.random();
            v.x += 1;
            v.y += 1;
            v.z += 1;
            v.z += 1;
            assert.equal( v.normalize().length() - 1 < EPSILON, true );
        });
        it('should return a zero vector if the original length is zero', function() {
            var v = new Vec4( 0, 0, 0, 0 );
            assert.equal( v.normalize().equals( new Vec4( 0, 0, 0, 0 ) ), true );
        });
    });

    describe('#toString', function() {
        it('should return a string of comma separated component values', function() {
            var v = Vec4.random(),
                s = v.toString(),
                a = s.split(',');
            assert.equal( parseFloat( a[0] ) === v.x, true );
            assert.equal( parseFloat( a[1] ) === v.y, true );
            assert.equal( parseFloat( a[2] ) === v.z, true );
            assert.equal( parseFloat( a[3] ) === v.w, true );
        });
    });

    describe('#toArray', function() {
        it('should return an Array with four matching components', function() {
            var v = Vec4.random(),
                a = v.toArray();
            assert.equal( a instanceof Array, true );
            assert.equal( a.length === 4, true );
            assert.equal( a[0] - v.x < EPSILON, true );
            assert.equal( a[1] - v.y < EPSILON, true );
            assert.equal( a[2] - v.z < EPSILON, true );
            assert.equal( a[3] - v.w < EPSILON, true );
        });
    });

});
