(function() {

    'use strict';

    var assert = require('assert');
    var Vec2 = require('../src/Vec2');
    var Vec3 = require('../src/Vec3');
    var Vec4 = require('../src/Vec4');
    var EPSILON = require('../src/Epsilon');

    describe('Vec2', function() {

        describe('#equals()', function() {
            it('should return false if any components do not match', function() {
                var v = new Vec2( Math.random(), Math.random() );
                assert.equal( v.equals( v ), true );
                assert.equal( v.equals( new Vec2( -v.x, v.y ) ), false );
                assert.equal( v.equals( new Vec2( v.x, v.y+5 ) ), false );
            });
            it('should return true if all components match', function() {
                var v = new Vec2(
                    Math.random(),
                    Math.random() );
                assert.equal( v.equals( new Vec2( v.x, v.y ) ), true );
            });
            it('should accept an array of input', function() {
                var v = new Vec2(
                    Math.random(),
                    Math.random() );
                assert.equal( v.equals( [v.x, v.y ] ), true );
            });
            it('should accept a second epsilon parameter, return true if each component is <= epsilon', function() {
                var r = Math.random(),
                    v = new Vec2( r, r );
                assert.equal( v.equals( new Vec2( r/2, r/2 ), r/2 ), true );
            });
        });

        describe('#random()', function() {
            it('should return a Vec2 with 2 random components', function() {
                var r0 = Vec2.random(),
                    r1 = Vec2.random();
                assert.equal( r0.equals( new Vec2( 0, 0 ) ), false );
                assert.equal( r1.equals( new Vec2( 0, 0 ) ), false );
            });
        });

        describe('#constructor()', function() {
            it('should return a zero vector when supplied no arguments', function() {
                var vEmpty = new Vec2();
                assert.equal( vEmpty.equals( new Vec2( 0, 0 ) ), true );
            });
            it('should return a vector from two numerical arguments', function() {
                var p = Math.random(),
                    q = Math.random(),
                    s = new Vec2( p, q );
                assert.equal( s.x === p && s.y === q, true );
            });
            it('should return a vector from an array of numerical arguments', function() {
                var p = Math.random(),
                    q = Math.random(),
                    s = new Vec2([ p, q ]);
                assert.equal( s.x === p && s.y === q, true );
            });
            it('should return deep copy when supplied another Vec2', function() {
                var p = Vec2.random(),
                    q = new Vec2( p );
                assert.equal( p.equals( q ), true );
            });
            it('should return a truncated deep copy when supplied another Vec3', function() {
                var p = Vec3.random(),
                    q = new Vec2( p ),
                    s = new Vec2( p.x, p.y );
                assert.equal( q.equals( s ), true );
            });
            it('should return a truncated deep copy when supplied another Vec4', function() {
                var p = Vec4.random(),
                    q = new Vec2( p ),
                    s = new Vec2( p.x, p.y );
                assert.equal( q.equals( s ), true );
            });
            it('should return a zero vector when given invalid input', function() {
                var p = new Vec2( NaN, 4, 3 ),
                    q = new Vec2( {'random':Math.random()} ),
                    r = new Vec2( {} ),
                    s = new Vec2( function() {
                        return false;
                    }),
                    t = new Vec2( [] );
                assert.equal( p.equals( new Vec2( 0, 0 ) ), true );
                assert.equal( q.equals( new Vec2( 0, 0 ) ), true );
                assert.equal( r.equals( new Vec2( 0, 0 ) ), true );
                assert.equal( s.equals( new Vec2( 0, 0 ) ), true );
                assert.equal( t.equals( new Vec2( 0, 0 ) ), true );
            });
        });

        describe('#negate', function() {
            it('should return a Vec2 with each component negated', function() {
                var v = Vec2.random();
                assert( v.negate().equals( new Vec2( -v.x, -v.y ) ) );
            });
        });

        describe('#add', function() {
            it('should return a value of self + VecN argument, returning Vec2', function() {
                var v0 = Vec2.random(),
                    v1 = Vec2.random();
                assert.equal( v0.add( v1 ).equals( new Vec2( v0.x + v1.x, v0.y + v1.y ) ), true );
            });
            it('should return a value of self + Array argument, returning Vec2', function() {
                var v0 = Vec2.random(),
                    v1 = [ Math.random(), Math.random() ];
                assert.equal( v0.add( v1 ).equals( new Vec2( v0.x + v1[0], v0.y + v1[1] ) ), true );
            });
        });

        describe('#sub', function() {
            it('should return a value of self - VecN argument, returning Vec2', function() {
                var v0 = Vec2.random(),
                    v1 = Vec2.random();
                assert.equal( v0.sub( v1 ).equals( new Vec2( v0.x - v1.x, v0.y - v1.y ) ), true );
            });
            it('should return a value of self - Array argument, returning Vec2', function() {
                var v0 = Vec2.random(),
                    v1 = [ Math.random(), Math.random() ];
                assert.equal( v0.sub( v1 ).equals( new Vec2( v0.x - v1[0], v0.y - v1[1] ) ), true );
            });
        });

        describe('#div', function() {
            it('should return a value of self / scalar argument, returning Vec2', function() {
                var v = Vec2.random(),
                    r = Math.random();
                assert.equal( v.div( r ).equals( new Vec2( v.x / r, v.y / r ) ), true );
            });
        });

        describe('#mult', function() {
            it('should return a value of self * scalar argument, returning Vec2', function() {
                var v = Vec2.random(),
                    r = Math.random();
                assert.equal( v.mult( r ).equals( new Vec2( v.x * r, v.y * r ) ), true );
            });
        });

        describe('#dot', function() {
            it('should return the dot product from a VecN argument', function() {
                var v0 = Vec2.random(),
                    v1 = Vec2.random();
                assert.equal( v0.dot( v1 ) === v0.x * v1.x + v0.y * v1.y, true );
            });
            it('should return the dot product from an Array argument', function() {
                var v0 = Vec2.random(),
                    v1 = [ Math.random(), Math.random() ];
                assert.equal( v0.dot( v1 ) === v0.x * v1[0] + v0.y * v1[1], true );
            });
        });

        describe('#cross', function() {
            it('should return the scalar cross product from a VecN argument', function() {
                var v0 = Vec2.random(),
                    v1 = Vec2.random(),
                    c = ( v0.x * v1.y ) - ( v0.y * v1.x );
                assert.equal( v0.cross( v1 ) === c, true );
            });
            it('should return the dot product from an Array argument', function() {
                var v0 = Vec2.random(),
                    v1 = [ Math.random(), Math.random() ],
                    c = ( v0.x * v1[1] ) - ( v0.y * v1[0] );
                assert.equal( v0.cross( v1 ) === c, true );
            });
        });

        describe('#length', function() {
            it('with no argument, should return the length of the vector', function() {
                var v0 = new Vec2( 1, 1 ),
                    r = Math.random(),
                    v1 = new Vec2( r, 0  ),
                    v2 = Vec2.random().normalize();
                assert.equal( v0.length() - Math.sqrt(2) < EPSILON , true );
                assert.equal( v1.length() - r < EPSILON , true );
                assert.equal( v2.length() - 1.0 < EPSILON, true );
            });
            it('when passed an argument, should return an equivolent vector with the specified length', function() {
                var v = Vec2.random(),
                    l = Math.random();
                assert( v.length( l ).length() - 1 < EPSILON, true );
            });
        });

        describe('#lengthSquared', function() {
            it('should return the squared length of the vector', function() {
                var v0 = new Vec2( 1, 1 ),
                    r = Math.random(),
                    v1 = new Vec2( r, 0 ),
                    v2 = Vec2.random().normalize();
                assert.equal( v0.lengthSquared() - 2 < EPSILON , true );
                assert.equal( v1.lengthSquared() - r*r < EPSILON , true );
                assert.equal( v2.lengthSquared() - 1.0 < EPSILON, true );
            });
        });

        describe('#normalize', function() {
            it('should return an equivolent vector of unit length', function() {
                var v = Vec2.random();
                v.x += 1;
                v.y += 1;
                assert.equal( v.normalize().length() - 1 < EPSILON, true );
            });
            it('should return a zero vector if the original length is zero', function() {
                var v = new Vec2( 0, 0 );
                assert.equal( v.normalize().equals( new Vec2( 0, 0 ) ), true );
            });
        });

        describe('#unsignedAngleRadians', function() {
            it('should the unsigned angle in radians', function() {
                var a = new Vec2( 1, 0 );
                var b = [ 1, 1 ];
                var c = new Vec2( 0, 1 );
                var d = new Vec2( -1, 1 );
                var e = new Vec2( -1, 0 );
                var f = new Vec2( -1, -1 );
                var g = new Vec2( 0, -1 );
                var h = new Vec2( 1, -1 );
                assert( Math.abs( a.unsignedAngleRadians( b ) - Math.PI/4 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( c ) - Math.PI/2 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( d ) - Math.PI*0.75 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( e ) - Math.PI ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( f ) - ( Math.PI + Math.PI/4 ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( g ) - ( Math.PI + Math.PI/2 ) ) < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( h ) - ( Math.PI + Math.PI*0.75 ) ) < EPSILON );
            });
            it('should return an angle in the range 0 to 2PI', function() {
                var a = new Vec2( 1, 0 );
                var b = new Vec2( 1, 0.0001 );
                var c = new Vec2( 1, -0.0001 );
                var d = new Vec2( -1, -0.0001 );
                assert( Math.abs( a.unsignedAngleRadians( b ) )  < 0.0001 );
                assert( Math.abs( a.unsignedAngleRadians( c ) - Math.PI*2 ) < 0.0001 );
                assert( Math.abs( a.unsignedAngleRadians( d ) - Math.PI ) < 0.0001 );
            });
            it('should measure the rotation counter-clockwise', function() {
                var a = new Vec2( 1, 0 );
                var b = new Vec2( 1, 1 );
                var c = new Vec2( 0, -1 );
                assert( Math.abs( a.unsignedAngleRadians( b ) ) - Math.PI/4 < EPSILON );
                assert( Math.abs( a.unsignedAngleRadians( c ) ) - Math.PI*1.5 < EPSILON );
            });
        });

        describe('#unsignedAngleDegrees', function() {
            it('should the unsigned angle in degrees', function() {
                var a = new Vec2( 1, 0 );
                var b = new Vec2( 1, 1 );
                var c = new Vec2( 0, 1 );
                var d = new Vec2( -1, 1 );
                var e = new Vec2( -1, 0 );
                var f = new Vec2( -1, -1 );
                var g = new Vec2( 0, -1 );
                var h = new Vec2( 1, -1 );
                assert( Math.abs( a.unsignedAngleDegrees( b ) - 45 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( c ) - 90 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( d ) - 135 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( e ) - 180 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( f ) - 225 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( g ) - 270 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( h ) - 315 ) < EPSILON );
            });
            it('should return an angle in the range 0 to 360', function() {
                var a = new Vec2( 1, 0 );
                var b = new Vec2( 1, 0.0001 );
                var c = new Vec2( 1, -0.0001 );
                var d = new Vec2( -1, -0.0001 );
                assert( a.unsignedAngleDegrees( b ) < 0.01 );
                assert( Math.abs( a.unsignedAngleDegrees( c ) - 360 ) < 0.01 );
                assert( Math.abs( a.unsignedAngleDegrees( d ) - 180 ) < 0.01 );
            });
            it('should measure the rotation counter-clockwise', function() {
                var a = new Vec2( 1, 0 );
                var b = new Vec2( 1, 1 );
                var c = new Vec2( 0, -1 );
                assert( Math.abs( a.unsignedAngleDegrees( b ) - 45 ) < EPSILON );
                assert( Math.abs( a.unsignedAngleDegrees( c ) - 270 ) < EPSILON );
            });
        });

        describe('#toString', function() {
            it('should return a string of comma separated component values', function() {
                var v = Vec2.random(),
                    s = v.toString(),
                    a = s.split(',');
                assert.equal( parseFloat( a[0] ) === v.x, true );
                assert.equal( parseFloat( a[1] ) === v.y, true );
            });
        });

        describe('#toArray', function() {
            it('should return an Array with two matching components', function() {
                var v = Vec2.random(),
                    a = v.toArray();
                assert.equal( a instanceof Array, true );
                assert.equal( a.length === 2, true );
                assert.equal( a[0] - v.x < EPSILON, true );
                assert.equal( a[1] - v.y < EPSILON, true );
            });
        });

    });

}());
