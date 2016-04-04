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
                assert( v.equals( v ) );
                assert( !v.equals( new Vec3( -v.x, v.y, v.z ) ) );
                assert( !v.equals( new Vec3( v.x, v.y+5, v.z ) ) );
                assert( !v.equals( new Vec3( v.x, v.y, v.z-1.2345 ) ) );
            });
            it('should return true if all components match', function() {
                var v = new Vec3(
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert( v.equals( new Vec3( v.x, v.y, v.z) ) );
            });
            it('should accept an array of input', function() {
                var v = new Vec3(
                    Math.random(),
                    Math.random(),
                    Math.random() );
                assert( v.equals( [ v.x, v.y, v.z ] ) );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var r = Math.random();
                var v = new Vec3( r, r, r );
                assert( v.equals( new Vec3( r/2, r/2, r/2 ), r/2 ) );
            });
        });

        describe('#random()', function() {
            it('should return a Vec3 with 3 random components', function() {
                var r0 = Vec3.random();
                var r1 = Vec3.random();
                assert( !r0.equals( new Vec3( 0, 0, 0 ) ) );
                assert( !r1.equals( new Vec3( 0, 0, 0 ) ) );
            });
        });

        describe('#constructor()', function() {
            it('should return a zero vector when supplied no arguments', function() {
                var vEmpty = new Vec3();
                assert( vEmpty.equals( new Vec3( 0, 0, 0 ) ) );
            });
            it('should return a vector from three numerical arguments', function() {
                var p = Math.random();
                var q = Math.random();
                var r = Math.random();
                var s = new Vec3( p, q, r );
                assert( s.x === p && s.y === q && s.z === r );
            });
            it('should return a vector from an array of three numerical arguments', function() {
                var p = Math.random();
                var q = Math.random();
                var r = Math.random();
                var s = new Vec3([ p, q, r ]);
                assert( s.x === p && s.y === q && s.z === r );
            });
            it('should return deep copy when supplied another Vec2, last component set to 0', function() {
                var p = Vec2.random();
                var q = new Vec3( p );
                var s = new Vec3( p.x, p.y, 0 );
                assert( q.equals( s ) );
            });
            it('should return deep copy when supplied another Vec3', function() {
                var p = Vec3.random();
                var q = new Vec3( p );
                assert( p.equals( q ) );
            });
            it('should return a truncated deep copy when supplied another Vec4', function() {
                var p = Vec4.random();
                var q = new Vec3( p );
                var s = new Vec3( p.x, p.y, p.z );
                assert( q.equals( s ) );
            });
            it('should return a zero vector when given invalid input', function() {
                var p = new Vec3( NaN, 4 );
                var r = new Vec3( {} );
                var s = new Vec3( function() {} );
                var t = new Vec3( [] );
                assert( p.equals( new Vec3( 0, 0, 0 ) ) );
                assert( r.equals( new Vec3( 0, 0, 0 ) ) );
                assert( s.equals( new Vec3( 0, 0, 0 ) ) );
                assert( t.equals( new Vec3( 0, 0, 0 ) ) );
            });
        });

        describe('#negate', function() {
            it('should return a Vec3 with each component negated', function() {
                var v = Vec3.random();
                assert( v.negate().equals( new Vec3( -v.x, -v.y, -v.z ) ) );
            });
        });

        describe('#add', function() {
            it('should return a value of self + argument', function() {
                var v0 = Vec3.random();
                var v1 = Vec3.random();
                var v2 = [ Math.random(), Math.random(), Math.random() ];
                assert( v0.add( v1 ).equals( new Vec3( v0.x + v1.x, v0.y + v1.y, v0.z + v1.z ) ) );
                assert( v0.add( v2 ).equals( new Vec3( v0.x + v2[0], v0.y + v2[1], v0.z + v2[2] ) ) );
            });
        });

        describe('#sub', function() {
            it('should return a value of self - argument', function() {
                var v0 = Vec3.random();
                var v1 = Vec3.random();
                var v2 = [ Math.random(), Math.random(), Math.random() ];
                assert( v0.sub( v1 ).equals( new Vec3( v0.x - v1.x, v0.y - v1.y, v0.z - v1.z ) ) );
                assert( v0.sub( v2 ).equals( new Vec3( v0.x - v2[0], v0.y - v2[1], v0.z - v2[2] ) ) );
            });
        });

        describe('#divScalar', function() {
            it('should return a value of self / scalar argument', function() {
                var v = Vec3.random();
                var r = Math.random();
                assert( v.divScalar( r ).equals( new Vec3( v.x / r, v.y / r, v.z / r ) ) );
            });
        });

        describe('#multScalar', function() {
            it('should return a value of self * scalar argument', function() {
                var v = Vec3.random();
                var r = Math.random();
                assert( v.multScalar( r ).equals( new Vec3( v.x * r, v.y * r, v.z * r ) ) );
            });
        });

        describe('#dot', function() {
            it('should return the dot product', function() {
                var v0 = Vec3.random();
                var v1 = Vec3.random();
                var v2 = [ Math.random(), Math.random(), Math.random() ];
                assert( v0.dot( v1 ) === v0.x * v1.x + v0.y * v1.y + v0.z * v1.z );
                assert( v0.dot( v2 ) === v0.x * v2[0] + v0.y * v2[1] + v0.z * v2[2] );
            });
        });

        describe('#cross', function() {
            it('should return the cross product', function() {
                var v0 = Vec3.random();
                var v1 = Vec3.random();
                var v2 = [ Math.random(), Math.random(), Math.random() ];
                var c0 = new Vec3(
                    ( v0.y * v1.z ) - ( v1.y * v0.z ),
                    (-v0.x * v1.z ) + ( v1.x * v0.z ),
                    ( v0.x * v1.y ) - ( v1.x * v0.y ) );
                var c1 = new Vec3(
                    ( v0.y * v2[2] ) - ( v2[1] * v0.z ),
                    (-v0.x * v2[2] ) + ( v2[0] * v0.z ),
                    ( v0.x * v2[1] ) - ( v2[0] * v0.y ) );
                assert( v0.cross( v1 ).equals( c0 ) );
                assert( v0.cross( v2 ).equals( c1 ) );
            });
        });

        describe('#length', function() {
            it('with no argument, should return the length of the vector', function() {
                var v0 = new Vec3( 1, 1, 1);
                var r = Math.random();
                var v1 = new Vec3( r, 0, 0 );
                var v2 = Vec3.random().normalize();
                assert( v0.length() - Math.sqrt(3) < EPSILON  );
                assert( v1.length() - r < EPSILON  );
                assert( v2.length() - 1.0 < EPSILON );
            });
            it('when passed an argument, should return an equivolent vector with the specified length', function() {
                var v = Vec3.random();
                var l = Math.random();
                assert( v.length( l ).length() - 1 < EPSILON );
            });
        });

        describe('#lengthSquared', function() {
            it('should return the squared length of the vector', function() {
                var v0 = new Vec3( 1, 1, 1);
                var r = Math.random();
                var v1 = new Vec3( r, 0, 0 );
                var v2 = Vec3.random().normalize();
                assert( v0.lengthSquared() - 3 < EPSILON  );
                assert( v1.lengthSquared() - r*r < EPSILON  );
                assert( v2.lengthSquared() - 1.0 < EPSILON );
            });
        });

        describe('#normalize', function() {
            it('should return an equivolent vector of unit length', function() {
                var v = Vec3.random();
                v.x += 1;
                v.y += 1;
                v.z += 1;
                assert( v.normalize().length() - 1 < EPSILON );
            });
            it('should throw an exception if length is zero', function() {
                var v = new Vec3( 0, 0, 0 );
                var result = false;
                try {
                    v.normalize();
                } catch( err ) {
                    result = true;
                }
                assert( result );
            });
        });

        describe('#unsignedAngle', function() {
            it('should return the unsigned angle between the provided vector, in radians', function() {
                var n = Vec3.random();

                function getRot( v, n ) {
                    var rot0 = Mat33.rotationFromTo( [ 0, 0, 1 ], n );
                    var rv = rot0.multVec3( v );
                    var cross = n.cross( rv );
                    var rot1 = Mat33.rotation( Math.PI / 2 * Math.random(), cross );
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

                assert( Math.abs( a.unsignedAngle( b, n ) - Math.PI/4 ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( c, n ) - Math.PI/2 ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( d, n ) - Math.PI*0.75 ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( e, n ) - Math.PI ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( f, n ) - ( Math.PI + Math.PI/4 ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( g, n ) - ( Math.PI + Math.PI/2 ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( h, n ) - ( Math.PI + Math.PI*0.75 ) ) < EPSILON );
            });
            it('should return an angle in the range 0 to 2PI', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 0.0001, 0 );
                var c = new Vec3( 1, -0.0001, 0 );
                var d = new Vec3( -1, -0.0001, 0 );
                var n = [ 0, 0, 1 ];
                assert( a.unsignedAngle( b, n ) < 0.001 );
                assert( Math.abs( a.unsignedAngle( c, n ) - Math.PI*2 ) < 0.001 );
                assert( Math.abs( a.unsignedAngle( d, n ) - Math.PI ) < 0.001 );
            });
            it('should measure the rotation counter-clockwise', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 1, 0 );
                var c = new Vec3( 0, -1, 0 );
                var n = new Vec3( 0, 0, 1 );
                assert( Math.abs( a.unsignedAngle( b, n ) - Math.PI/4 ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( c, n ) - Math.PI*1.5 ) < EPSILON );
            });
            it('should use a.cross(b) as the reference vector if no normal is supplied', function() {
                var a = new Vec3( 1, 0, 0 );
                var b = new Vec3( 1, 1, 0 );
                var c = new Vec3( 0, -1, 0 );
                assert( Math.abs( a.unsignedAngle( b, [ 0, 0, 1 ] ) - a.unsignedAngle( b ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngle( c, [ 0, 0, -1 ] ) - a.unsignedAngle( c ) ) < EPSILON );
            });
        });

        describe('#toString', function() {
            it('should return a string of comma separated component values', function() {
                var v = Vec3.random();
                var s = v.toString();
                var a = s.split(',');
                assert( parseFloat( a[0] ) === v.x );
                assert( parseFloat( a[1] ) === v.y );
                assert( parseFloat( a[2] ) === v.z );
            });
        });

        describe('#toArray', function() {
            it('should return an Array with three matching components', function() {
                var v = Vec3.random();
                var a = v.toArray();
                assert( a instanceof Array );
                assert( a.length === 3 );
                assert( a[0] - v.x < EPSILON );
                assert( a[1] - v.y < EPSILON );
                assert( a[2] - v.z < EPSILON );
            });
        });

    });

}());
