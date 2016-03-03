(function() {

    'use strict';

    var assert = require('assert');
    var Vec2 = require('../src/Vec2');
    var Vec3 = require('../src/Vec3');
    var Vec4 = require('../src/Vec4');
    var Mat33 = require('../src/Mat33');
    var EPSILON = require('../src/Epsilon');

    describe('Vec3', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var v = new Vec3(
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert.equal( v.equals( v ), true );
                assert.equal( v.equals( new Vec3( -v.x, v.y, v.z ) ), false );
                assert.equal( v.equals( new Vec3( v.x, v.y+5, v.z ) ), false );
                assert.equal( v.equals( new Vec3( v.x, v.y, v.z-1.2345 ) ), false );
            });
            it('should return true if all components match', function() {
                var v = new Vec3(
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert.equal( v.equals( new Vec3( v.x, v.y, v.z) ), true );
            });
            it('should accept an array of input', function() {
                var v = new Vec3(
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert.equal( v.equals( [ v.x, v.y, v.z ] ), true );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var r = Math.random(),
                    v = new Vec3( r, r, r );
                assert.equal( v.equals( new Vec3( r/2, r/2, r/2 ), r/2 ), true );
            });
        });

        describe('#random()', function() {
            it('should return a Vec3 with 3 random components', function() {
                var r0 = Vec3.random(),
                    r1 = Vec3.random();
                assert.equal( r0.equals( new Vec3( 0, 0, 0 ) ), false );
                assert.equal( r1.equals( new Vec3( 0, 0, 0 ) ), false );
            });
        });

        describe('#constructor()', function() {
            it('should return a zero vector when supplied no arguments', function() {
                var vEmpty = new Vec3();
                assert.equal( vEmpty.equals( new Vec3( 0, 0, 0 ) ), true );
            });
            it('should return a vector from three numerical arguments', function() {
                var p = Math.random(),
                    q = Math.random(),
                    r = Math.random(),
                    s = new Vec3( p, q, r );
                assert.equal( s.x === p && s.y === q && s.z === r, true );
            });
            it('should return a vector from an array of three numerical arguments', function() {
                var p = Math.random(),
                    q = Math.random(),
                    r = Math.random(),
                    s = new Vec3([ p, q, r ]);
                assert.equal( s.x === p && s.y === q && s.z === r, true );
            });
            it('should return deep copy when supplied another Vec2, last component set to 0', function() {
                var p = Vec2.random(),
                    q = new Vec3( p ),
                    s = new Vec3( p.x, p.y, 0 );
                assert.equal( q.equals( s ), true );
            });
            it('should return deep copy when supplied another Vec3', function() {
                var p = Vec3.random(),
                    q = new Vec3( p );
                assert.equal( p.equals( q ), true );
            });
            it('should return a truncated deep copy when supplied another Vec4', function() {
                var p = Vec4.random(),
                    q = new Vec3( p ),
                    s = new Vec3( p.x, p.y, p.z );
                assert.equal( q.equals( s ), true );
            });
            it('should return a zero vector when given invalid input', function() {
                var p = new Vec3( NaN, 4 ),
                    q = new Vec3( {'random':Math.random()} ),
                    r = new Vec3( {} ),
                    s = new Vec3( function() {
                        return false;
                    }),
                    t = new Vec3( [] );
                assert.equal( p.equals( new Vec3( 0, 0, 0 ) ), true );
                assert.equal( q.equals( new Vec3( 0, 0, 0 ) ), true );
                assert.equal( r.equals( new Vec3( 0, 0, 0 ) ), true );
                assert.equal( s.equals( new Vec3( 0, 0, 0 ) ), true );
                assert.equal( t.equals( new Vec3( 0, 0, 0 ) ), true );
            });
        });

        describe('#negate', function() {
            it('should return a Vec3 with each component negated', function() {
                var v = Vec3.random();
                assert( v.negate().equals( new Vec3( -v.x, -v.y, -v.z ) ) );
            });
        });

        describe('#add', function() {
            it('should return a value of self + VecN argument, returning Vec3', function() {
                var v0 = Vec3.random(),
                    v1 = Vec3.random();
                assert.equal( v0.add( v1 ).equals( new Vec3( v0.x + v1.x, v0.y + v1.y, v0.z + v1.z ) ), true );
            });
            it('should return a value of self + VecN argument, returning Vec3', function() {
                var v0 = Vec3.random(),
                    v1 = [ Math.random(), Math.random(), Math.random() ];
                assert.equal( v0.add( v1 ).equals( new Vec3( v0.x + v1[0], v0.y + v1[1], v0.z + v1[2] ) ), true );
            });
        });

        describe('#sub', function() {
            it('should return a value of self - VecN argument, returning Vec3', function() {
                var v0 = Vec3.random(),
                    v1 = Vec3.random();
                assert.equal( v0.sub( v1 ).equals( new Vec3( v0.x - v1.x, v0.y - v1.y, v0.z - v1.z ) ), true );
            });
            it('should return a value of self - VecN argument, returning Vec3', function() {
                var v0 = Vec3.random(),
                    v1 = [ Math.random(), Math.random(), Math.random() ];
                assert.equal( v0.sub( v1 ).equals( new Vec3( v0.x - v1[0], v0.y - v1[1], v0.z - v1[2] ) ), true );
            });
        });

        describe('#divScalar', function() {
            it('should return a value of self / scalar argument', function() {
                var v = Vec3.random(),
                    r = Math.random();
                assert.equal( v.divScalar( r ).equals( new Vec3( v.x / r, v.y / r, v.z / r ) ), true );
            });
        });

        describe('#multScalar', function() {
            it('should return a value of self * scalar argument', function() {
                var v = Vec3.random(),
                    r = Math.random();
                assert.equal( v.multScalar( r ).equals( new Vec3( v.x * r, v.y * r, v.z * r ) ), true );
            });
        });

        describe('#dot', function() {
            it('should return the dot product from a VecN argument', function() {
                var v0 = Vec3.random(),
                    v1 = Vec3.random();
                assert.equal( v0.dot( v1 ) === v0.x * v1.x + v0.y * v1.y + v0.z * v1.z, true );
            });
            it('should return the dot product from an Array argument', function() {
                var v0 = Vec3.random(),
                    v1 = [ Math.random(), Math.random(), Math.random() ];
                assert.equal( v0.dot( v1 ) === v0.x * v1[0] + v0.y * v1[1] + v0.z * v1[2], true );
            });
        });

        describe('#cross', function() {
            it('should return the cross product from a VecN argument', function() {
                var v0 = Vec3.random(),
                    v1 = Vec3.random(),
                    c = new Vec3(
                        ( v0.y * v1.z ) - ( v1.y * v0.z ),
                        (-v0.x * v1.z ) + ( v1.x * v0.z ),
                        ( v0.x * v1.y ) - ( v1.x * v0.y ) );
                assert.equal( v0.cross( v1 ).equals( c ), true );
            });
            it('should return the cross product from an Array argument', function() {
                var v0 = Vec3.random(),
                    v1 = [ Math.random(), Math.random(), Math.random() ],
                    c = new Vec3(
                        ( v0.y * v1[2] ) - ( v1[1] * v0.z ),
                        (-v0.x * v1[2] ) + ( v1[0] * v0.z ),
                        ( v0.x * v1[1] ) - ( v1[0] * v0.y ) );
                assert.equal( v0.cross( v1 ).equals( c ), true );
            });
        });

        describe('#length', function() {
            it('with no argument, should return the length of the vector', function() {
                var v0 = new Vec3( 1, 1, 1),
                    r = Math.random(),
                    v1 = new Vec3( r, 0, 0 ),
                    v2 = Vec3.random().normalize();
                assert.equal( v0.length() - Math.sqrt(3) < EPSILON , true );
                assert.equal( v1.length() - r < EPSILON , true );
                assert.equal( v2.length() - 1.0 < EPSILON, true );
            });
            it('when passed an argument, should return an equivolent vector with the specified length', function() {
                var v = Vec3.random(),
                    l = Math.random();
                assert( v.length( l ).length() - 1 < EPSILON, true );
            });
        });

        describe('#lengthSquared', function() {
            it('should return the squared length of the vector', function() {
                var v0 = new Vec3( 1, 1, 1),
                    r = Math.random(),
                    v1 = new Vec3( r, 0, 0 ),
                    v2 = Vec3.random().normalize();
                assert.equal( v0.lengthSquared() - 3 < EPSILON , true );
                assert.equal( v1.lengthSquared() - r*r < EPSILON , true );
                assert.equal( v2.lengthSquared() - 1.0 < EPSILON, true );
            });
        });

        describe('#normalize', function() {
            it('should return an equivolent vector of unit length', function() {
                var v = Vec3.random();
                v.x += 1;
                v.y += 1;
                v.z += 1;
                assert.equal( v.normalize().length() - 1 < EPSILON, true );
            });
            it('should return a zero vector if the original length is zero', function() {
                var v = new Vec3( 0, 0, 0 );
                assert.equal( v.normalize().equals( new Vec3( 0, 0, 0 ) ), true );
            });
        });

        describe('#unsignedAngleRadians', function() {
            it('should the unsigned angle in radians', function() {
                var n = Vec3.random();

                function getRot( v, n ) {
                    var rot0 = Mat33.rotationFromTo( [ 0, 0, 1 ], n );
                    var rv = rot0.multVec3( v );
                    var cross = n.cross( rv );
                    var rot1 = Mat33.rotationDegrees( 90 * Math.random(), cross );
                    return rot1.multVec3( rot0.multVec3( v ) );
                }

                var a = getRot([ 1, 0, 0 ], n);
                var b = getRot([ 1, 1, 0 ], n);
                var c = getRot([ 0, 1, 0 ], n);
                var d = getRot([ -1, 1, 0 ], n);
                var e = getRot([ -1, 0, 0 ], n);
                var f = getRot([ -1, -1, 0 ], n);
                var g = getRot([ 0, -1, 0 ], n);
                var h = getRot([ 1, -1, 0 ], n);

                assert( Math.abs( a.unsignedAngleRadians( b, n ) - Math.PI/4 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( c, n ) - Math.PI/2 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( d, n ) - Math.PI*0.75 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( e, n ) - Math.PI ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( f, n ) - ( Math.PI + Math.PI/4 ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( g, n ) - ( Math.PI + Math.PI/2 ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( h, n ) - ( Math.PI + Math.PI*0.75 ) ) < EPSILON );
            });
            it('should return an angle in the range 0 to 2PI', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 0.0001, 0 );
                var c = new Vec3( 1, -0.0001, 0 );
                var d = new Vec3( -1, -0.0001, 0 );
                var n = [ 0, 0, 1 ];
                assert( a.unsignedAngleRadians( b, n ) < 0.001 );
                assert( Math.abs( a.unsignedAngleRadians( c, n ) - Math.PI*2 ) < 0.001 );
                assert( Math.abs( a.unsignedAngleRadians( d, n ) - Math.PI ) < 0.001 );
            });
            it('should measure the rotation counter-clockwise', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 1, 0 );
                var c = new Vec3( 0, -1, 0 );
                var n = new Vec3( 0, 0, 1 );
                assert( Math.abs( a.unsignedAngleRadians( b, n ) - Math.PI/4 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( c, n ) - Math.PI*1.5 ) < EPSILON );
            });
            it('should use a.cross(b) as the reference vector if no normal is supplied', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 1, 0 );
                var c = new Vec3( 0, -1, 0 );
                assert( Math.abs( a.unsignedAngleRadians( b, [ 0, 0, 1 ] ) - a.unsignedAngleRadians( b ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( c, [ 0, 0, -1 ] ) - a.unsignedAngleRadians( c ) ) < EPSILON );
            });
        });

        describe('#unsignedAngleDegrees', function() {
            it('should the unsigned angle in degrees', function() {
                var n = Vec3.random();
                var rotation = Mat33.rotationFromTo( [ 0, 0, 1 ], n );
                var a = rotation.multVec3([ 1, 0, 0 ]);
                var b = rotation.multVec3([ 1, 1, 0 ]);
                var c = rotation.multVec3([ 0, 1, 0 ]);
                var d = rotation.multVec3([ -1, 1, 0 ]);
                var e = rotation.multVec3([ -1, 0, 0 ]);
                var f = rotation.multVec3([ -1, -1, 0 ]);
                var g = rotation.multVec3([ 0, -1, 0 ]);
                var h = rotation.multVec3([ 1, -1, 0 ]);
                assert( Math.abs( a.unsignedAngleDegrees( [ b.x, b.y, b.z ], n ) - 45 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( c, n ) - 90 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( d, n ) - 135 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( e, n ) - 180 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( f, n ) - 225 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( g, n ) - 270 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( h, n ) - 315 ) < EPSILON );
            });
            it('should return an angle in the range 0 to 2PI', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 0.0001, 0 );
                var c = new Vec3( 1, -0.0001, 0 );
                var d = new Vec3( -1, -0.0001, 0 );
                var n = [ 0, 0, 1 ];
                assert( a.unsignedAngleDegrees( b, n ) < 0.01 );
                assert( Math.abs( a.unsignedAngleDegrees( c, n ) - 360 ) < 0.01 );
                assert( Math.abs( a.unsignedAngleDegrees( d, n ) - 180 ) < 0.01 );
            });
            it('should measure the rotation counter-clockwise', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 1, 0 );
                var c = new Vec3( 0, -1, 0 );
                var n = new Vec3( 0, 0, 1 );
                assert( Math.abs( a.unsignedAngleDegrees( b, n ) - 45 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( c, n ) - 270 ) < EPSILON );
            });
            it('should use a.cross(b) as the reference vector if no normal is supplied', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 1, 0 );
                var c = new Vec3( 0, -1, 0 );
                assert( Math.abs( a.unsignedAngleDegrees( b, [ 0, 0, 1 ] ) - a.unsignedAngleDegrees( b ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( c, [ 0, 0, -1 ] ) - a.unsignedAngleDegrees( c ) ) < EPSILON );
            });
        });

        describe('#toString', function() {
            it('should return a string of comma separated component values', function() {
                var v = Vec3.random(),
                    s = v.toString(),
                    a = s.split(',');
                assert.equal( parseFloat( a[0] ) === v.x, true );
                assert.equal( parseFloat( a[1] ) === v.y, true );
                assert.equal( parseFloat( a[2] ) === v.z, true );
            });
        });

        describe('#toArray', function() {
            it('should return an Array with three matching components', function() {
                var v = Vec3.random(),
                    a = v.toArray();
                assert.equal( a instanceof Array, true );
                assert.equal( a.length === 3, true );
                assert.equal( a[0] - v.x < EPSILON, true );
                assert.equal( a[1] - v.y < EPSILON, true );
                assert.equal( a[2] - v.z < EPSILON, true );
            });
        });

    });

}());
